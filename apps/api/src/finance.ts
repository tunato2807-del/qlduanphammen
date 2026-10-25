import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Database } from "./database";
import { BudgetDto, TransactionDto, WalletDto, WalletPatchDto } from "./dto";
import {
  allocateBudget,
  currentMonth,
  monthOffset,
  monthRange,
} from "./budget";
export function validMonth(value?: string) {
  const month = value || currentMonth();
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
    throw new BadRequestException("Tháng không hợp lệ.");
  return month;
}
@Injectable()
export class Finance {
  constructor(@Inject(Database) public db: Database) {}
  async wallets(userId: string) {
    const [wallets, transactions] = await Promise.all([
      this.db.wallet.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
      }),
      this.db.transaction.findMany({
        where: { userId },
        select: {
          walletId: true,
          destinationWalletId: true,
          kind: true,
          amount: true,
        },
      }),
    ]);
    return wallets.map((w) => ({
      ...w,
      balance: transactions.reduce(
        (sum, t) =>
          sum +
          (t.walletId === w.id
            ? t.kind === "INCOME"
              ? t.amount
              : -t.amount
            : 0n) +
          (t.destinationWalletId === w.id ? t.amount : 0n),
        w.openingBalance,
      ),
    }));
  }
  createWallet(userId: string, dto: WalletDto) {
    return this.db.wallet.create({
      data: {
        ...dto,
        name: dto.name.trim(),
        userId,
        openingBalance: BigInt(dto.openingBalance),
      },
    });
  }
  async updateWallet(userId: string, id: string, dto: WalletPatchDto) {
    await this.ownedWallet(userId, id);
    return this.db.wallet.update({ where: { id }, data: dto });
  }
  async ownedWallet(userId: string, id: string, active = false) {
    const w = await this.db.wallet.findFirst({
      where: { id, userId, ...(active ? { archived: false } : {}) },
    });
    if (!w) throw new NotFoundException("Không tìm thấy ví.");
    return w;
  }
  async transactionData(userId: string, dto: TransactionDto) {
    await this.ownedWallet(userId, dto.walletId, true);
    if (dto.kind === "TRANSFER") {
      if (
        !dto.destinationWalletId ||
        dto.destinationWalletId === dto.walletId ||
        dto.categoryId
      )
        throw new BadRequestException(
          "Chuyển tiền cần hai ví khác nhau và không có danh mục.",
        );
      await this.ownedWallet(userId, dto.destinationWalletId, true);
    } else {
      if (!dto.categoryId || dto.destinationWalletId)
        throw new BadRequestException(
          "Giao dịch thu/chi cần danh mục phù hợp.",
        );
      if (
        !(await this.db.category.findFirst({
          where: {
            id: dto.categoryId,
            userId,
            kind: dto.kind,
            archived: false,
          },
        }))
      )
        throw new BadRequestException("Danh mục không hợp lệ.");
    }
    return {
      ...dto,
      userId,
      amount: BigInt(dto.amount),
      occurredAt: new Date(dto.occurredAt),
      note: dto.note?.trim() || "",
      destinationWalletId:
        dto.kind === "TRANSFER" ? dto.destinationWalletId : null,
      categoryId: dto.kind === "TRANSFER" ? null : dto.categoryId,
    };
  }
  async createTransaction(userId: string, dto: TransactionDto) {
    return this.db.transaction.create({
      data: await this.transactionData(userId, dto),
    });
  }
  async updateTransaction(userId: string, id: string, dto: TransactionDto) {
    await this.ownedTransaction(userId, id);
    return this.db.transaction.update({
      where: { id },
      data: await this.transactionData(userId, dto),
    });
  }
  async ownedTransaction(userId: string, id: string) {
    if (!(await this.db.transaction.findFirst({ where: { id, userId } })))
      throw new NotFoundException("Không tìm thấy giao dịch.");
  }
  async deleteTransaction(userId: string, id: string) {
    await this.ownedTransaction(userId, id);
    await this.db.transaction.delete({ where: { id } });
    return { ok: true };
  }
  async transactions(
    userId: string,
    query: Record<string, string>,
    all = false,
  ) {
    const month = validMonth(query.month);
    const page = Math.max(
      1,
      Math.min(100000, Math.floor(Number(query.page)) || 1),
    );
    const where: Prisma.TransactionWhereInput = {
      userId,
      occurredAt: monthRange(month),
    };
    if (query.kind) {
      if (!["INCOME", "EXPENSE", "TRANSFER"].includes(query.kind))
        throw new BadRequestException("Loại giao dịch không hợp lệ.");
      where.kind = query.kind;
    }
    if (query.walletId) where.walletId = query.walletId;
    if (query.search)
      where.OR = [
        { note: { contains: query.search.slice(0, 100), mode: "insensitive" } },
        {
          category: {
            name: { contains: query.search.slice(0, 100), mode: "insensitive" },
          },
        },
      ];
    const [items, total] = await this.db.$transaction(
      async (tx) => {
        const items = await tx.transaction.findMany({
          where,
          include: { category: true, wallet: true, destinationWallet: true },
          orderBy: [{ occurredAt: "desc" }, { createdAt: "desc" }],
          take: all ? 10000 : 12,
          skip: all ? 0 : (page - 1) * 12,
        });
        const total = await tx.transaction.count({ where });
        return [items, total] as const;
      },
      { isolationLevel: "RepeatableRead" },
    );
    if (all && total > 10000)
      throw new BadRequestException(
        "Có hơn 10.000 giao dịch. Hãy lọc dữ liệu trước khi xuất CSV.",
      );
    return { items, total, page, pages: Math.max(1, Math.ceil(total / 12)) };
  }
  async budgetPreview(userId: string, dto: BudgetDto) {
    const categories = await this.db.category.findMany({
      where: {
        userId,
        kind: "EXPENSE",
        archived: false,
        id: { in: dto.items.map((i) => i.categoryId) },
      },
    });
    if (categories.length !== dto.items.length)
      throw new BadRequestException("Danh mục không hợp lệ hoặc bị trùng.");
    try {
      const items = allocateBudget(
        BigInt(dto.income),
        BigInt(dto.savings),
        dto.items,
        dto.mode,
      ).map((i) => ({
        ...i,
        category: categories.find((c) => c.id === i.categoryId),
      }));
      return {
        ...dto,
        items,
        unallocated:
          BigInt(dto.income) -
          BigInt(dto.savings) -
          items.reduce((s, i) => s + i.limit, 0n),
      };
    } catch (e) {
      throw new BadRequestException((e as Error).message);
    }
  }
  async saveBudget(userId: string, dto: BudgetDto) {
    const preview = await this.budgetPreview(userId, dto);
    return this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId + dto.month}))`;
      const latest = await tx.budgetPlan.findFirst({
        where: { userId, month: dto.month },
        orderBy: { revision: "desc" },
      });
      await tx.budgetPlan.updateMany({
        where: { userId, month: dto.month, active: true },
        data: { active: false },
      });
      return tx.budgetPlan.create({
        data: {
          userId,
          month: dto.month,
          revision: (latest?.revision || 0) + 1,
          income: BigInt(dto.income),
          savings: BigInt(dto.savings),
          mode: dto.mode,
          items: {
            create: preview.items.map((i) => ({
              categoryId: i.categoryId,
              fixed: BigInt(i.fixed),
              weight: i.weight,
              limit: i.limit,
            })),
          },
        },
        include: { items: { include: { category: true } } },
      });
    });
  }
  async activeBudget(userId: string, month: string) {
    const plan = await this.db.budgetPlan.findFirst({
      where: { userId, month, active: true },
      include: { items: { include: { category: true } } },
    });
    if (!plan) return null;
    const actual = await this.db.transaction.groupBy({
      by: ["categoryId"],
      where: { userId, kind: "EXPENSE", occurredAt: monthRange(month) },
      _sum: { amount: true },
    });
    return {
      ...plan,
      items: plan.items.map((i) => ({
        ...i,
        spent:
          actual.find((a) => a.categoryId === i.categoryId)?._sum.amount || 0n,
      })),
    };
  }
  async summary(userId: string, month: string) {
    const [wallets, txs, plan, recent] = await Promise.all([
      this.wallets(userId),
      this.db.transaction.findMany({
        where: {
          userId,
          occurredAt: {
            gte: monthRange(monthOffset(month, -5)).gte,
            lt: monthRange(month).lt,
          },
        },
        include: { category: true },
      }),
      this.activeBudget(userId, month),
      this.transactions(userId, { month }),
    ]);
    const start = monthRange(month).gte;
    const current = txs.filter((t) => t.occurredAt >= start);
    const sum = (kind: string) =>
      current.filter((t) => t.kind === kind).reduce((s, t) => s + t.amount, 0n);
    const income = sum("INCOME"),
      expense = sum("EXPENSE");
    const history = Array.from({ length: 6 }, (_, i) => {
      const m = monthOffset(month, i - 5),
        range = monthRange(m);
      const rows = txs.filter(
        (t) => t.occurredAt >= range.gte && t.occurredAt < range.lt,
      );
      return {
        month: m,
        income: rows
          .filter((t) => t.kind === "INCOME")
          .reduce((s, t) => s + t.amount, 0n),
        expense: rows
          .filter((t) => t.kind === "EXPENSE")
          .reduce((s, t) => s + t.amount, 0n),
      };
    });
    const grouped = new Map<
      string,
      { id: string; name: string; color: string; icon: string; amount: bigint }
    >();
    for (const t of current)
      if (t.kind === "EXPENSE" && t.category) {
        const item = grouped.get(t.category.id) || {
          id: t.category.id,
          name: t.category.name,
          color: t.category.color,
          icon: t.category.icon,
          amount: 0n,
        };
        item.amount += t.amount;
        grouped.set(item.id, item);
      }
    return {
      month,
      balance: wallets.reduce((s, w) => s + w.balance, 0n),
      income,
      expense,
      net: income - expense,
      wallets,
      history,
      spending: [...grouped.values()].sort((a, b) =>
        a.amount > b.amount ? -1 : a.amount < b.amount ? 1 : 0,
      ),
      budget: plan,
      recent: recent.items.slice(0, 5),
      transactionCount: current.length,
    };
  }
}
