import { Idempotency } from "./idempotency";
import { monthlySuggestion } from "./planning-rules";
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
@Injectable()
export class Budgets {
  constructor(
    @Inject(Database) public db: Database,
    @Inject(Idempotency) private idempotency: Idempotency,
  ) {}
  async budgetPreview(
    userId: string,
    dto: BudgetDto,
    client: Prisma.TransactionClient = this.db,
  ) {
    const categories = await client.category.findMany({
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
  async saveBudget(userId: string, dto: BudgetDto, key?: string) {
    return this.idempotency.run(userId, key, "budget.save", dto, async (tx) => {
      const preview = await this.budgetPreview(userId, dto, tx);
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
  async suggestion(userId: string, month: string) {
    const from = monthOffset(month, -3),
      to = monthRange(month).gte;
    const where = { userId, occurredAt: { gte: monthRange(from).gte, lt: to } };
    const [income, expenses, categories] = await Promise.all([
      this.db.transaction.aggregate({
        where: { ...where, kind: "INCOME" },
        _sum: { amount: true },
        _count: true,
      }),
      this.db.transaction.groupBy({
        by: ["categoryId"],
        where: { ...where, kind: "EXPENSE" },
        _sum: { amount: true },
      }),
      this.db.category.findMany({
        where: { userId, kind: "EXPENSE", archived: false },
      }),
    ]);
    const values = monthlySuggestion(
      income._sum.amount || 0n,
      expenses
        .filter((e) => e.categoryId)
        .map((e) => ({
          categoryId: e.categoryId!,
          amount: e._sum.amount || 0n,
        })),
    );
    return {
      month,
      from,
      to: monthOffset(month, -1),
      hasIncome: income._count > 0,
      income: values.income,
      savings: values.savings,
      mode: "AUTO",
      explanation:
        "Trung bình thu nhập 3 tháng đã kết thúc (kể cả tháng bằng 0); dự trù tiết kiệm 20%, trọng số theo tỷ lệ chi. Đây là gợi ý, hãy điều chỉnh theo hoàn cảnh.",
      items: categories.map((c) => ({
        categoryId: c.id,
        fixed: "0",
        weight: values.weights.find((w) => w.categoryId === c.id)?.weight || 0,
        limit: "0",
      })),
    };
  }
  async history(userId: string, month: string) {
    const [plans, actual] = await Promise.all([
      this.db.budgetPlan.findMany({
        where: { userId, month },
        include: { items: { include: { category: true } } },
        orderBy: { revision: "desc" },
      }),
      this.db.transaction.groupBy({
        by: ["categoryId"],
        where: { userId, kind: "EXPENSE", occurredAt: monthRange(month) },
        _sum: { amount: true },
      }),
    ]);
    return {
      comparedAt: new Date(),
      plans: plans.map((p) => ({
        ...p,
        items: p.items.map((i) => ({
          ...i,
          spent:
            actual.find((a) => a.categoryId === i.categoryId)?._sum.amount ||
            0n,
        })),
      })),
    };
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
}
