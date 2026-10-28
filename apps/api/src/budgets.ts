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
  constructor(@Inject(Database) public db: Database) {}
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
}
