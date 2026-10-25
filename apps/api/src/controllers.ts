import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import {
  Accounts,
  AuthRequest,
  demoEnabled,
  safeUser,
  SessionGuard,
} from "./auth";
import {
  BudgetDto,
  CategoryDto,
  CategoryPatchDto,
  LoginDto,
  parse,
  PasswordDto,
  RegisterDto,
  TransactionDto,
  WalletDto,
  WalletPatchDto,
} from "./dto";
import { Finance, validMonth } from "./finance";
import { Database } from "./database";
import { Demo } from "./demo";
@Controller("api/auth")
export class AuthController {
  constructor(
    @Inject(Accounts) private accounts: Accounts,
    @Inject(Database) private db: Database,
    @Inject(Demo) private demo: Demo,
  ) {}
  private async signIn(
    user: Awaited<ReturnType<Accounts["login"]>>,
    res: Response,
  ) {
    const token = await this.accounts.session(user);
    res.cookie("finora_session", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 86400000,
      path: "/",
    });
    return safeUser(user);
  }
  @Get("config") config() {
    return { demoEnabled: demoEnabled() };
  }
  @Post("register") async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.signIn(
      await this.accounts.register(parse(RegisterDto, body)),
      res,
    );
  }
  @Post("login") async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = parse(LoginDto, body);
    return this.signIn(await this.accounts.login(dto.email, dto.password), res);
  }
  @Post("demo") async experience(@Res({ passthrough: true }) res: Response) {
    if (!demoEnabled())
      throw new ForbiddenException("Chế độ trải nghiệm đang tắt.");
    return this.signIn(await this.demo.create(), res);
  }
  @Get("me") @UseGuards(SessionGuard) me(@Req() req: AuthRequest) {
    return safeUser(req.user);
  }
  @Post("logout") @UseGuards(SessionGuard) async logout(
    @Req() req: AuthRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.db.session.deleteMany({ where: { id: req.sessionId } });
    res.clearCookie("finora_session", { path: "/" });
    return { ok: true };
  }
  @Post("password") @UseGuards(SessionGuard) password(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const dto = parse(PasswordDto, body);
    return this.accounts.changePassword(
      req,
      dto.currentPassword,
      dto.newPassword,
    );
  }
}
@Controller("api")
@UseGuards(SessionGuard)
export class FinanceController {
  constructor(@Inject(Finance) private finance: Finance) {}
  @Get("wallets") wallets(@Req() req: AuthRequest) {
    return this.finance.wallets(req.user.id);
  }
  @Post("wallets") createWallet(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.finance.createWallet(req.user.id, parse(WalletDto, body));
  }
  @Patch("wallets/:id") updateWallet(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.finance.updateWallet(
      req.user.id,
      id,
      parse(WalletPatchDto, body),
    );
  }
  @Get("categories") categories(@Req() req: AuthRequest) {
    return this.finance.db.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: "asc" },
    });
  }
  @Post("categories") createCategory(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const dto = parse(CategoryDto, body);
    return this.finance.db.category.create({
      data: { ...dto, name: dto.name.trim(), userId: req.user.id },
    });
  }
  @Patch("categories/:id") async updateCategory(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    const dto = parse(CategoryPatchDto, body);
    if (
      !(await this.finance.db.category.findFirst({
        where: { id, userId: req.user.id },
      }))
    )
      throw new NotFoundException("Không tìm thấy danh mục.");
    return this.finance.db.category.update({ where: { id }, data: dto });
  }
  @Get("transactions") transactions(
    @Req() req: AuthRequest,
    @Query() query: Record<string, string>,
  ) {
    return this.finance.transactions(req.user.id, query);
  }
  @Post("transactions") createTransaction(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.finance.createTransaction(
      req.user.id,
      parse(TransactionDto, body),
    );
  }
  @Patch("transactions/:id") updateTransaction(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.finance.updateTransaction(
      req.user.id,
      id,
      parse(TransactionDto, body),
    );
  }
  @Delete("transactions/:id") deleteTransaction(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.finance.deleteTransaction(req.user.id, id);
  }
  @Get("budget-plans") async budget(
    @Req() req: AuthRequest,
    @Query("month") month: string,
    @Res() res: Response,
  ) {
    return res.json(
      await this.finance.activeBudget(req.user.id, validMonth(month)),
    );
  }
  @Post("budget-plans/preview") preview(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.finance.budgetPreview(req.user.id, parse(BudgetDto, body));
  }
  @Post("budget-plans") saveBudget(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.finance.saveBudget(req.user.id, parse(BudgetDto, body));
  }
  @Get("reports/summary") summary(
    @Req() req: AuthRequest,
    @Query("month") month: string,
  ) {
    return this.finance.summary(req.user.id, validMonth(month));
  }
  @Get("transactions/export") async export(
    @Req() req: AuthRequest,
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const month = validMonth(query.month);
    const { items, total } = await this.finance.transactions(
      req.user.id,
      { ...query, month },
      true,
    );
    // Neutralize spreadsheet formulas, quotes and line breaks in user-provided strings.
    const cell = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@\-\t\r]/, "'$&")
        .replace(/"/g, '""') +
      '"';
    const rows = [
      ["Ngày", "Loại", "Danh mục", "Ví", "Ví đích", "Số tiền (VND)", "Ghi chú"],
      ...items.map((t) => [
        t.occurredAt.toISOString(),
        t.kind,
        t.category?.name || "Chuyển ví",
        t.wallet.name,
        t.destinationWallet?.name || "",
        t.amount.toString(),
        t.note,
      ]),
    ];
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="finora-${month}.csv"`,
    );
    res.setHeader("X-Export-Total", String(total));
    res.send(
      "\uFEFF" + rows.map((row) => row.map(cell).join(",")).join("\r\n"),
    );
  }
}
