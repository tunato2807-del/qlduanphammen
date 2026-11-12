import type { Prisma } from "@prisma/client";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Database } from "./database";
import { WalletDto, WalletPatchDto } from "./dto";
import { Idempotency } from "./idempotency";
@Injectable()
export class Wallets {
  constructor(
    @Inject(Database) public db: Database,
    @Inject(Idempotency) private requests: Idempotency,
  ) {}
  wallets(userId: string, client?: Prisma.TransactionClient) {
    return client
      ? this.readWallets(userId, client)
      : this.db.$transaction((tx) => this.readWallets(userId, tx), {
          isolationLevel: "RepeatableRead",
        });
  }
  private async readWallets(userId: string, client: Prisma.TransactionClient) {
    const wallets = await client.wallet.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    const outgoing = await client.transaction.groupBy({
      by: ["walletId", "kind"],
      where: { userId },
      _sum: { amount: true },
    });
    const incoming = await client.transaction.groupBy({
      by: ["destinationWalletId"],
      where: { userId, kind: "TRANSFER" },
      _sum: { amount: true },
    });
    return wallets.map((w) => ({
      ...w,
      balance:
        outgoing
          .filter((t) => t.walletId === w.id)
          .reduce(
            (s, t) =>
              s + (t.kind === "INCOME" ? 1n : -1n) * (t._sum.amount || 0n),
            w.openingBalance,
          ) +
        (incoming.find((t) => t.destinationWalletId === w.id)?._sum.amount ||
          0n),
    }));
  }

  createWallet(userId: string, dto: WalletDto, key?: string) {
    return this.requests.run(userId, key, "wallet.create", dto, (tx) =>
      tx.wallet.create({
        data: {
          ...dto,
          name: dto.name.trim(),
          userId,
          openingBalance: BigInt(dto.openingBalance),
        },
      }),
    );
  }
  async updateWallet(userId: string, id: string, dto: WalletPatchDto) {
    await this.ownedWallet(userId, id);
    return this.db.wallet.update({ where: { id }, data: dto });
  }
  async ownedWallet(
    userId: string,
    id: string,
    active = false,
    client: Prisma.TransactionClient = this.db,
  ) {
    const w = await client.wallet.findFirst({
      where: { id, userId, ...(active ? { archived: false } : {}) },
    });
    if (!w) throw new NotFoundException("Không tìm thấy ví.");
    return w;
  }
}
