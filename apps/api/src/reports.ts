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
import { Wallets } from "./wallets";
import { Transactions } from "./transactions";
import { Budgets } from "./budgets";
@Injectable()
export class Reports {
  constructor(
    @Inject(Database) public db: Database,
    @Inject(Wallets) private walletsService: Wallets,
    @Inject(Transactions) private transactionsService: Transactions,
    @Inject(Budgets) private budgetsService: Budgets,
  ) {}
  async summary(userId: string, month: string) {
    const [wallets, txs, plan, recent] = await Promise.all([
      this.walletsService.wallets(userId),
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
      this.budgetsService.activeBudget(userId, month),
      this.transactionsService.transactions(userId, { month }),
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
