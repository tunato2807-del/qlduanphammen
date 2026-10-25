import {
  BadRequestException,
  CanActivate,
  ConflictException,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { randomBytes, scrypt, createHash, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { Request } from "express";
import { User } from "@prisma/client";
import { Database } from "./database";
import { RegisterDto } from "./dto";
const derive = promisify(scrypt);
export const safeUser = (user: User) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});
export const demoEnabled = () =>
  process.env.NODE_ENV !== "production" || process.env.ALLOW_DEMO === "true";
export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  return (
    salt + ":" + ((await derive(password, salt, 64)) as Buffer).toString("hex")
  );
}
export async function verifyPassword(password: string, hash: string) {
  const [salt, saved] = hash.split(":");
  const computed = (await derive(password, salt, 64)) as Buffer;
  const expected = Buffer.from(saved, "hex");
  return (
    expected.length === computed.length && timingSafeEqual(expected, computed)
  );
}
export type AuthRequest = Request & { user: User; sessionId: string };
export const defaultCategories = [
  { name: "Ăn uống", kind: "EXPENSE", icon: "food", color: "#ec9869" },
  { name: "Nhà ở", kind: "EXPENSE", icon: "home", color: "#8b83cf" },
  { name: "Di chuyển", kind: "EXPENSE", icon: "transport", color: "#6aa9c5" },
  { name: "Mua sắm", kind: "EXPENSE", icon: "shopping", color: "#e6bd65" },
  { name: "Giải trí", kind: "EXPENSE", icon: "fun", color: "#d78da4" },
  { name: "Sức khỏe", kind: "EXPENSE", icon: "health", color: "#7eaf94" },
  { name: "Học tập", kind: "EXPENSE", icon: "education", color: "#91a4d5" },
  { name: "Chi khác", kind: "EXPENSE", icon: "other", color: "#9ba6a6" },
  { name: "Tiền lương", kind: "INCOME", icon: "salary", color: "#36795d" },
  { name: "Thu nhập khác", kind: "INCOME", icon: "gift", color: "#71a994" },
];
@Injectable()
export class Accounts {
  constructor(@Inject(Database) private db: Database) {}
  async register(dto: RegisterDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.db.user.findUnique({ where: { email } }))
      throw new ConflictException("Email đã được sử dụng.");
    return this.db.user.create({
      data: {
        email,
        name: dto.name.trim(),
        passwordHash: await hashPassword(dto.password),
        categories: { create: defaultCategories },
      },
    });
  }
  async login(email: string, password: string) {
    const user = await this.db.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });
    // A dummy derivation keeps missing-account requests on the same expensive path.
    const valid = await verifyPassword(
      password,
      user?.passwordHash ??
        "00000000000000000000000000000000:" + "00".repeat(64),
    );
    if (!user || !valid)
      throw new UnauthorizedException("Email hoặc mật khẩu chưa đúng.");
    return user;
  }
  async session(user: User) {
    const token = randomBytes(32).toString("hex");
    await this.db.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
    await this.db.session.create({
      data: {
        id: createHash("sha256").update(token).digest("hex"),
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 86400000),
      },
    });
    return token;
  }
  async changePassword(
    req: AuthRequest,
    oldPassword: string,
    newPassword: string,
  ) {
    if (!(await verifyPassword(oldPassword, req.user.passwordHash)))
      throw new BadRequestException("Mật khẩu hiện tại chưa đúng.");
    const passwordHash = await hashPassword(newPassword);
    await this.db.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: req.user.id },
        data: { passwordHash },
      });
      await tx.session.deleteMany({
        where: { userId: req.user.id, id: { not: req.sessionId } },
      });
    });
    return { ok: true };
  }
}
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(@Inject(Database) private db: Database) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<AuthRequest>();
    const token = req.cookies?.finora_session;
    if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token))
      throw new UnauthorizedException("Vui lòng đăng nhập.");
    const session = await this.db.session.findUnique({
      where: { id: createHash("sha256").update(token).digest("hex") },
      include: { user: true },
    });
    if (!session || session.expiresAt < new Date())
      throw new UnauthorizedException("Phiên đăng nhập đã hết hạn.");
    req.user = session.user;
    req.sessionId = session.id;
    return true;
  }
}
