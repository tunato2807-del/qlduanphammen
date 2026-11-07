import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { parse as csvParse } from "csv-parse/sync";
import { Database } from "./database";
import { Idempotency } from "./idempotency";
import { parse, TransactionDto } from "./dto";
import { Transactions } from "./transactions";
import { fingerprint } from "./planning-rules";
import type { Prisma } from "@prisma/client";
type ImportRow = {
  line: number;
  data: TransactionDto | null;
  error: string | null;
  duplicate: boolean;
};
@Injectable()
export class Imports {
  constructor(
    @Inject(Database) private db: Database,
    @Inject(Transactions) private ledger: Transactions,
    @Inject(Idempotency) private requests: Idempotency,
  ) {}
  async preview(
    userId: string,
    csv: string,
    client: Prisma.TransactionClient = this.db,
  ) {
    if (Buffer.byteLength(csv, "utf8") > 51200)
      throw new BadRequestException("CSV tối đa 50 KB.");
    let records: string[][];
    try {
      records = csvParse(csv, {
        bom: true,
        skip_empty_lines: true,
        max_record_size: 8192,
      });
    } catch {
      throw new BadRequestException(
        "CSV sai cấu trúc dấu nháy hoặc số cột. Hãy dùng mẫu tải xuống.",
      );
    }
    if (records.length < 2 || records.length > 201)
      throw new BadRequestException("CSV cần từ 1 đến 200 dòng dữ liệu.");
    const header = records.shift()!;
    const standard = [
      "occurredAt",
      "kind",
      "category",
      "wallet",
      "destinationWallet",
      "amount",
      "note",
    ];
    const exported = [
      "Ngày",
      "Loại",
      "Danh mục",
      "Ví",
      "Ví đích",
      "Số tiền (VND)",
      "Ghi chú",
    ];
    const isExport = header.join("|") === exported.join("|");
    if (!isExport && header.join("|") !== standard.join("|"))
      throw new BadRequestException("Tiêu đề CSV không khớp mẫu Finora.");
    const [wallets, categories] = await Promise.all([
      client.wallet.findMany({ where: { userId, archived: false } }),
      client.category.findMany({ where: { userId, archived: false } }),
    ]);
    const rows: ImportRow[] = [];
    for (let i = 0; i < records.length; i++) {
      try {
        if (records[i].length !== 7) throw new Error("Cần đúng 7 cột.");
        const [
          occurredAt,
          kind,
          category,
          wallet,
          destinationWallet,
          amount,
          note,
        ] = records[i].map((v) =>
          isExport ? v.replace(/^'(?=[=+@\-\t\r'])/, "") : v,
        );
        const source = wallets.filter((w) => w.name === wallet),
          dest = wallets.filter((w) => w.name === destinationWallet),
          cat = categories.filter(
            (c) => c.name === category && c.kind === kind,
          );
        if (
          source.length !== 1 ||
          (kind === "TRANSFER" ? dest.length !== 1 : cat.length !== 1)
        )
          throw new Error(
            "Tên ví/danh mục không tồn tại, đã lưu trữ hoặc không duy nhất.",
          );
        const dto = parse(TransactionDto, {
          occurredAt,
          kind,
          amount,
          walletId: source[0].id,
          ...(kind === "TRANSFER"
            ? { destinationWalletId: dest[0].id }
            : { categoryId: cat[0].id }),
          note,
        });
        await this.ledger.transactionData(userId, dto, client);
        rows.push({ line: i + 2, data: dto, error: null, duplicate: false });
      } catch (e) {
        rows.push({
          line: i + 2,
          data: null,
          error: e instanceof Error ? e.message : "Dòng không hợp lệ.",
          duplicate: false,
        });
      }
    }
    const valid = rows.flatMap((r) => (r.data ? [r.data] : []));
    const dates = valid.map((r) => new Date(r.occurredAt).getTime());
    const existing = dates.length
      ? await client.transaction.findMany({
          where: {
            userId,
            occurredAt: {
              gte: new Date(Math.min(...dates)),
              lte: new Date(Math.max(...dates)),
            },
          },
          select: {
            kind: true,
            amount: true,
            walletId: true,
            destinationWalletId: true,
            categoryId: true,
            occurredAt: true,
            note: true,
          },
        })
      : [];
    const seen = new Set(existing.map(fingerprint));
    rows.forEach((r) => {
      if (r.data) {
        const hash = fingerprint(r.data);
        r.duplicate = seen.has(hash);
        seen.add(hash);
      }
    });
    return {
      rows,
      valid: rows.filter((r) => r.data && !r.duplicate).length,
      duplicates: rows.filter((r) => r.duplicate).length,
      errors: rows.filter((r) => r.error).length,
    };
  }
  async commit(userId: string, csv: string, key?: string) {
    return this.requests.run(userId, key, "csv.import", { csv }, async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"import" + userId}))`;
      const preview = await this.preview(userId, csv, tx);
      if (preview.errors)
        throw new BadRequestException(
          "Hãy sửa tất cả dòng lỗi trước khi nhập.",
        );
      for (const row of preview.rows)
        if (row.data && !row.duplicate)
          await tx.transaction.create({
            data: await this.ledger.transactionData(userId, row.data, tx),
          });
      return { imported: preview.valid, duplicates: preview.duplicates };
    });
  }
}
