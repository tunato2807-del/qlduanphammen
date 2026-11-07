import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
} from "@nestjs/common";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { Database } from "./database";
function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object")
    return (
      "{" +
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => JSON.stringify(k) + ":" + canonical(v))
        .join(",") +
      "}"
    );
  return JSON.stringify(value) ?? "null";
}
@Injectable()
export class Idempotency {
  constructor(@Inject(Database) private db: Database) {}
  async run<T>(
    userId: string,
    key: string | undefined,
    scope: string,
    body: unknown,
    write: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    if (key !== undefined && !/^[a-zA-Z0-9_-]{16,100}$/.test(key))
      throw new BadRequestException("Mã yêu cầu không hợp lệ.");
    const hash = createHash("sha256")
      .update(scope + canonical(body))
      .digest("hex");
    return this.db.$transaction(
      async (tx) => {
        if (key) {
          await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId + key}))`;
          const saved = await tx.idempotencyRecord.findUnique({
            where: { userId_key: { userId, key } },
          });
          if (saved) {
            if (saved.hash !== hash)
              throw new ConflictException(
                "Mã yêu cầu đã dùng cho nội dung khác. Hãy mở lại biểu mẫu.",
              );
            return saved.response as T;
          }
        }
        const result = await write(tx);
        if (key)
          await tx.idempotencyRecord.create({
            data: {
              userId,
              key,
              hash,
              response: JSON.parse(
                JSON.stringify(result, (_k, v) =>
                  typeof v === "bigint" ? v.toString() : v,
                ),
              ),
            },
          });
        return result;
      },
      { timeout: 20000 },
    );
  }
}
