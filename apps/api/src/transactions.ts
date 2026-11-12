import { isUUID } from "class-validator";
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
import { Idempotency } from "./idempotency";
import { validMonth } from "./month";
@Injectable()
export class Transactions {
  constructor(
    @Inject(Database) public db: Database,
    @Inject(Wallets) private walletsService: Wallets,
    @Inject(Idempotency) private idempotency: Idempotency,
  ) {}
  async transactionData(
    userId: string,
    dto: TransactionDto,
    client: Prisma.TransactionClient = this.db,
  ) {
    await this.walletsService.ownedWallet(userId, dto.walletId, true, client);
    if (dto.kind === "TRANSFER") {
      if (
        !dto.destinationWalletId ||
        dto.destinationWalletId === dto.walletId ||
        dto.categoryId
      )
        throw new BadRequestException(
          "Chuyển tiền cần hai ví khác nhau và không có danh mục.",
        );
      await this.walletsService.ownedWallet(
        userId,
        dto.destinationWalletId,
        true,
        client,
      );
    } else {
      if (!dto.categoryId || dto.destinationWalletId)
        throw new BadRequestException(
          "Giao dịch thu/chi cần danh mục phù hợp.",
        );
      if (
        !(await client.category.findFirst({
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
  async createTransaction(userId: string, dto: TransactionDto, key?: string) {
    return this.idempotency.run(
      userId,
      key,
      "transaction.create",
      dto,
      async (tx) =>
        tx.transaction.create({
          data: await this.transactionData(userId, dto, tx),
        }),
    );
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
    client?: Prisma.TransactionClient,
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
    const filters: Prisma.TransactionWhereInput[] = [];
    if (query.walletId) {
      if (!isUUID(query.walletId))
        throw new BadRequestException("Ví lọc không hợp lệ.");
      await this.walletsService.ownedWallet(
        userId,
        query.walletId,
        false,
        client || this.db,
      );
      filters.push({
        OR: [
          { walletId: query.walletId },
          { destinationWalletId: query.walletId },
        ],
      });
    }
    if (query.categoryId) {
      if (!isUUID(query.categoryId))
        throw new BadRequestException("Danh mục lọc không hợp lệ.");
      if (
        !(await (client || this.db).category.findFirst({
          where: { id: query.categoryId, userId },
        }))
      )
        throw new NotFoundException("Không tìm thấy danh mục.");
      filters.push({ categoryId: query.categoryId });
    }
    if (query.search)
      filters.push({
        OR: [
          {
            note: { contains: query.search.slice(0, 100), mode: "insensitive" },
          },
          {
            category: {
              name: {
                contains: query.search.slice(0, 100),
                mode: "insensitive",
              },
            },
          },
        ],
      });
    where.AND = filters;
    if (query.sort && !["asc", "desc"].includes(query.sort))
      throw new BadRequestException("Thứ tự không hợp lệ.");
    const direction = query.sort === "asc" ? "asc" : "desc";
    const read = async (tx: Prisma.TransactionClient) => {
      const items = await tx.transaction.findMany({
        where,
        include: { category: true, wallet: true, destinationWallet: true },
        orderBy: [
          { occurredAt: direction },
          { createdAt: direction },
          { id: direction },
        ],
        take: all ? 10000 : 12,
        skip: all ? 0 : (page - 1) * 12,
      });
      const total = await tx.transaction.count({ where });
      return [items, total] as const;
    };
    const [items, total] = client
      ? await read(client)
      : await this.db.$transaction(read, { isolationLevel: "RepeatableRead" });
    if (all && total > 10000)
      throw new BadRequestException(
        "Có hơn 10.000 giao dịch. Hãy lọc dữ liệu trước khi xuất CSV.",
      );
    return { items, total, page, pages: Math.max(1, Math.ceil(total / 12)) };
  }
}
