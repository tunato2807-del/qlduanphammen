import {
  BadRequestException,
  Inject,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { randomBytes, createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { Database } from "./database";
import { hashPassword } from "./auth";
export function recoveryEnabled() {
  return Boolean(
    process.env.SMTP_HOST && process.env.MAIL_FROM && process.env.PUBLIC_URL,
  );
}
@Injectable()
export class Recovery {
  constructor(@Inject(Database) private db: Database) {}
  async forgot(email: string) {
    if (!recoveryEnabled())
      throw new ServiceUnavailableException(
        "Khôi phục qua email chưa được cấu hình. Vui lòng liên hệ người vận hành.",
      );
    const origin = new URL(process.env.PUBLIC_URL!);
    if (process.env.NODE_ENV === "production" && origin.protocol !== "https:")
      throw new ServiceUnavailableException("Cấu hình email chưa sẵn sàng.");
    // Response is independent of account lookup and SMTP latency. Never log link/address/token.
    setImmediate(() => {
      void this.deliver(email.trim().toLowerCase(), origin.origin).catch(() =>
        console.error(JSON.stringify({ event: "recovery.delivery_failed" })),
      );
    });
    return {
      message:
        "Nếu email có tài khoản, bạn sẽ nhận được liên kết đặt lại mật khẩu. Kiểm tra cả thư rác.",
    };
  }
  private async deliver(email: string, origin: string) {
    const user = await this.db.user.findUnique({ where: { email } });
    if (!user) return;
    const token = randomBytes(32).toString("hex"),
      id = createHash("sha256").update(token).digest("hex");
    const created = await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"reset" + user.id}))`;
      const recent = await tx.passwordReset.findFirst({
        where: {
          userId: user.id,
          createdAt: { gte: new Date(Date.now() - 60000) },
        },
      });
      if (recent) return false;
      await tx.passwordReset.deleteMany({ where: { userId: user.id } });
      await tx.passwordReset.create({
        data: {
          id,
          userId: user.id,
          expiresAt: new Date(Date.now() + 30 * 60000),
        },
      });
      return true;
    });
    if (!created) return;
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      ...(process.env.SMTP_USER
        ? {
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASSWORD,
            },
          }
        : {}),
      connectionTimeout: 10000,
      socketTimeout: 15000,
      ...(process.env.NODE_ENV === "production"
        ? { requireTLS: process.env.SMTP_SECURE !== "true" }
        : {}),
    });
    try {
      await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: "Finora · Đặt lại mật khẩu",
        text: `Bạn đã yêu cầu đặt lại mật khẩu Finora. Mở liên kết trong 30 phút:\n${origin}/#reset-password?token=${token}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này. Liên kết chỉ dùng một lần.`,
      });
    } catch (e) {
      await this.db.passwordReset.deleteMany({ where: { id } });
      throw e;
    } finally {
      transport.close();
    }
  }
  async reset(token: string, password: string) {
    const id = createHash("sha256").update(token).digest("hex");
    const passwordHash = await hashPassword(password);
    await this.db.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"reset-token" + id}))`;
      const reset = await tx.passwordReset.findUnique({ where: { id } });
      if (reset) {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${"reset" + reset.userId}))`;
      }
      const valid =
        reset && (await tx.passwordReset.findUnique({ where: { id } }));
      if (!valid || valid.expiresAt <= new Date())
        throw new BadRequestException(
          "Liên kết đã hết hạn hoặc không còn hợp lệ. Hãy yêu cầu liên kết mới.",
        );
      await tx.user.update({
        where: { id: valid.userId },
        data: { passwordHash },
      });
      await tx.session.deleteMany({ where: { userId: valid.userId } });
      await tx.passwordReset.deleteMany({ where: { userId: valid.userId } });
    });
    return { ok: true };
  }
}
