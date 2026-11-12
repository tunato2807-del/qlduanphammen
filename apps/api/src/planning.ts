import { GoalPatchDto } from "./dto";
import { monthOffset } from "./budget";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { Database } from "./database";
import { Idempotency } from "./idempotency";
import { Transactions } from "./transactions";
import { RecurringDto, ContributionDto, GoalDto } from "./dto";
import { currentMonth } from "./budget";
import { dueDate } from "./planning-rules";
@Injectable()
export class Planning {
  constructor(
    @Inject(Database) private db: Database,
    @Inject(Idempotency) private requests: Idempotency,
    @Inject(Transactions) private ledger: Transactions,
  ) {}
  async createRule(userId: string, dto: RecurringDto, key?: string) {
    if (dto.endMonth && dto.endMonth < dto.startMonth)
      throw new BadRequestException("Tháng kết thúc phải từ tháng bắt đầu.");
    return this.requests.run(userId, key, "rule.create", dto, async (tx) => {
      await this.ledger.transactionData(
        userId,
        {
          kind: dto.kind,
          amount: dto.amount,
          walletId: dto.walletId,
          categoryId: dto.categoryId,
          occurredAt: dueDate(dto.startMonth, dto.day).toISOString(),
          note: dto.note,
        },
        tx,
      );
      return tx.recurringRule.create({
        data: { ...dto, userId, amount: BigInt(dto.amount) },
      });
    });
  }

  async replaceRule(
    userId: string,
    id: string,
    dto: RecurringDto,
    key?: string,
  ) {
    if (dto.startMonth < monthOffset(currentMonth(), 1))
      throw new BadRequestException(
        "Thay đổi phải có hiệu lực từ tháng sau trở đi.",
      );
    if (dto.endMonth && dto.endMonth < dto.startMonth)
      throw new BadRequestException("Tháng kết thúc phải từ tháng bắt đầu.");
    return this.requests.run(
      userId,
      key,
      "recurring.replace",
      { id, ...dto },
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"rule" + id}))`;
        const rule = await tx.recurringRule.findFirst({
          where: { id, userId },
        });
        if (!rule) throw new NotFoundException("Không tìm thấy quy tắc.");
        if (dto.startMonth <= rule.startMonth)
          throw new BadRequestException(
            "Tháng hiệu lực mới phải sau tháng bắt đầu của quy tắc cũ. Quy tắc chưa bắt đầu có thể tạm dừng và tạo mới.",
          );
        if (rule.endMonth && rule.endMonth < dto.startMonth)
          throw new ConflictException(
            "Quy tắc đã kết thúc hoặc đã được thay thế. Hãy tải lại danh sách.",
          );
        if (!rule.active)
          throw new BadRequestException(
            "Bật lại quy tắc trước khi thiết lập thay đổi.",
          );
        await this.ledger.transactionData(
          userId,
          {
            kind: dto.kind,
            amount: dto.amount,
            walletId: dto.walletId,
            categoryId: dto.categoryId,
            note: dto.note,
            occurredAt: dueDate(dto.startMonth, dto.day).toISOString(),
          },
          tx,
        );
        const previous = await tx.recurringRule.update({
          where: { id },
          data: { endMonth: monthOffset(dto.startMonth, -1) },
        });
        const replacement = await tx.recurringRule.create({
          data: { ...dto, userId, amount: BigInt(dto.amount) },
        });
        return { previous, replacement };
      },
    );
  }
  async updateGoal(userId: string, id: string, dto: GoalPatchDto) {
    const goal = await this.db.savingsGoal.findFirst({ where: { id, userId } });
    if (!goal) throw new NotFoundException("Không tìm thấy mục tiêu.");
    return this.db.savingsGoal.update({
      where: { id },
      data: {
        name: dto.name,
        archived: dto.archived,
        target: dto.target ? BigInt(dto.target) : undefined,
        targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
      },
    });
  }

  async setActive(userId: string, id: string, active: boolean) {
    if (!(await this.db.recurringRule.findFirst({ where: { id, userId } })))
      throw new NotFoundException("Không tìm thấy quy tắc.");
    return this.db.recurringRule.update({ where: { id }, data: { active } });
  }
  async recurring(userId: string, month: string) {
    // On-demand synchronization never posts money. Each rule/month has one immutable draft.
    const rules = await this.db.recurringRule.findMany({
      where: { userId },
      include: { wallet: true, category: true },
      orderBy: { createdAt: "desc" },
    });
    const due = rules.flatMap((rule) => {
      const dueAt = dueDate(month, rule.day);
      return rule.active &&
        month >= rule.startMonth &&
        (!rule.endMonth || month <= rule.endMonth) &&
        dueAt <= new Date()
        ? [{ ruleId: rule.id, month, dueAt }]
        : [];
    });
    // Native INSERT ON CONFLICT keeps concurrent first reads (including StrictMode) safe.
    if (due.length)
      await this.db.recurringDraft.createMany({
        data: due,
        skipDuplicates: true,
      });
    const drafts = await this.db.recurringDraft.findMany({
      where: { month, rule: { userId } },
      include: { rule: { include: { wallet: true, category: true } } },
      orderBy: { dueAt: "asc" },
    });
    return { rules, drafts };
  }
  async act(userId: string, id: string, action: string, key?: string) {
    return this.requests.run(
      userId,
      key,
      "draft.action",
      { id, action },
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"draft" + id}))`;
        const draft = await tx.recurringDraft.findFirst({
          where: { id, rule: { userId } },
          include: { rule: true },
        });
        if (!draft) throw new NotFoundException("Không tìm thấy bản nháp.");
        const desired = action === "CONFIRM" ? "CONFIRMED" : "SKIPPED";
        if (draft.state !== "PENDING") {
          if (draft.state === desired) return draft;
          throw new ConflictException("Bản nháp đã được xử lý.");
        }
        let transactionId: string | undefined;
        if (action === "CONFIRM") {
          if (!draft.rule.active)
            throw new BadRequestException(
              "Quy tắc đang tạm dừng. Bật lại trước khi xác nhận.",
            );
          if (draft.dueAt > new Date())
            throw new BadRequestException("Khoản định kỳ chưa đến hạn.");
          const r = draft.rule;
          const data = await this.ledger.transactionData(
            userId,
            {
              kind: r.kind,
              amount: r.amount.toString(),
              walletId: r.walletId,
              categoryId: r.categoryId,
              note: r.note,
              occurredAt: draft.dueAt.toISOString(),
            },
            tx,
          );
          transactionId = (await tx.transaction.create({ data })).id;
        }
        return tx.recurringDraft.update({
          where: { id },
          data: { state: desired, transactionId },
        });
      },
    );
  }
  async goals(userId: string) {
    const goals = await this.db.savingsGoal.findMany({
      where: { userId },
      include: {
        contributions: {
          include: { wallet: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return goals.map((g) => {
      const saved = g.contributions.reduce((s, c) => s + c.amount, 0n);
      const now = new Date();
      const [year, month] = currentMonth().split("-").map(Number);
      const [targetYear, targetMonth] = new Intl.DateTimeFormat("sv-SE", {
        timeZone: "Asia/Ho_Chi_Minh",
      })
        .format(g.targetDate)
        .slice(0, 7)
        .split("-")
        .map(Number);
      const months = Math.max(
        1,
        (targetYear - year) * 12 + targetMonth - month + 1,
      );
      const remaining = g.target > saved ? g.target - saved : 0n;
      return {
        ...g,
        saved,
        monthlyNeeded: (remaining + BigInt(months) - 1n) / BigInt(months),
        overdue: g.targetDate < now && remaining > 0n,
      };
    });
  }
  createGoal(userId: string, dto: GoalDto, key?: string) {
    return this.requests.run(userId, key, "goal.create", dto, (tx) =>
      tx.savingsGoal.create({
        data: {
          ...dto,
          userId,
          target: BigInt(dto.target),
          targetDate: new Date(dto.targetDate),
        },
      }),
    );
  }
  async contribute(
    userId: string,
    id: string,
    dto: ContributionDto,
    key?: string,
  ) {
    return this.requests.run(
      userId,
      key,
      "goal.contribute",
      { id, ...dto },
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"reserve" + userId}))`;
        const goal = await tx.savingsGoal.findFirst({ where: { id, userId } });
        const wallet = await tx.wallet.findFirst({
          where: {
            id: dto.walletId,
            userId,
            ...(dto.action === "ADD" ? { archived: false } : {}),
          },
        });
        if (!goal || !wallet)
          throw new NotFoundException(
            "Không tìm thấy mục tiêu hoặc ví phù hợp.",
          );
        if (goal.archived && dto.action === "ADD")
          throw new BadRequestException(
            "Mục tiêu đã lưu trữ. Khôi phục trước khi dành thêm tiền.",
          );
        const amount = BigInt(dto.amount);
        const allocations = await tx.goalContribution.aggregate({
          where: { goalId: id, walletId: wallet.id },
          _sum: { amount: true },
        });
        if (
          dto.action === "WITHDRAW" &&
          amount > (allocations._sum.amount || 0n)
        )
          throw new BadRequestException(
            "Không thể rút vượt phần đã dành trong ví này.",
          );
        if (dto.action === "ADD") {
          const out = await tx.transaction.groupBy({
            by: ["kind"],
            where: { userId, walletId: wallet.id },
            _sum: { amount: true },
          });
          const inc = await tx.transaction.aggregate({
            where: { userId, destinationWalletId: wallet.id, kind: "TRANSFER" },
            _sum: { amount: true },
          });
          const reserved = await tx.goalContribution.aggregate({
            where: { walletId: wallet.id, goal: { userId } },
            _sum: { amount: true },
          });
          const balance =
            out.reduce(
              (s, t) =>
                s + (t.kind === "INCOME" ? 1n : -1n) * (t._sum.amount || 0n),
              wallet.openingBalance,
            ) + (inc._sum.amount || 0n);
          if (amount > balance - (reserved._sum.amount || 0n))
            throw new BadRequestException(
              "Số dư ví chưa đủ sau khi trừ phần đã dành cho các mục tiêu.",
            );
        }
        return tx.goalContribution.create({
          data: {
            goalId: id,
            walletId: wallet.id,
            amount: dto.action === "ADD" ? amount : -amount,
            note: dto.note?.trim() || "",
          },
        });
      },
    );
  }
}
