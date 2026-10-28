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
export class Wallets {
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
}
