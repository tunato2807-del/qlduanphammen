import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { Response } from "express";
import { AuthRequest, SessionGuard } from "../auth";
import {
  parse,
  CategoryDto,
  CategoryPatchDto,
  TransactionDto,
  WalletDto,
  WalletPatchDto,
} from "../dto";
import { Wallets } from "../wallets";
import { Transactions } from "../transactions";
import { Database } from "../database";
import { validMonth } from "../month";
@Controller("api")
@UseGuards(SessionGuard)
export class LedgerController {
  constructor(
    @Inject(Wallets) private walletsService: Wallets,
    @Inject(Transactions) private transactionsService: Transactions,
    @Inject(Database) private db: Database,
  ) {}
  @Get("wallets") wallets(@Req() req: AuthRequest) {
    return this.walletsService.wallets(req.user.id);
  }
  @Post("wallets") createWallet(
    @Req() req: AuthRequest,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.walletsService.createWallet(
      req.user.id,
      parse(WalletDto, body),
      key,
    );
  }
  @Patch("wallets/:id") updateWallet(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.walletsService.updateWallet(
      req.user.id,
      id,
      parse(WalletPatchDto, body),
    );
  }
  @Get("categories") categories(@Req() req: AuthRequest) {
    return this.db.category.findMany({
      where: { userId: req.user.id },
      orderBy: { name: "asc" },
    });
  }
  @Post("categories") createCategory(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const dto = parse(CategoryDto, body);
    return this.db.category.create({
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
      !(await this.db.category.findFirst({
        where: { id, userId: req.user.id },
      }))
    )
      throw new NotFoundException("Không tìm thấy danh mục.");
    return this.db.category.update({ where: { id }, data: dto });
  }
  @Get("transactions") transactions(
    @Req() req: AuthRequest,
    @Query() query: Record<string, string>,
  ) {
    return this.transactionsService.transactions(req.user.id, query);
  }
  @Post("transactions") createTransaction(
    @Req() req: AuthRequest,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.transactionsService.createTransaction(
      req.user.id,
      parse(TransactionDto, body),
      key,
    );
  }
  @Patch("transactions/:id") updateTransaction(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.transactionsService.updateTransaction(
      req.user.id,
      id,
      parse(TransactionDto, body),
    );
  }
  @Delete("transactions/:id") deleteTransaction(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.deleteTransaction(req.user.id, id);
  }
  @Get("transactions/export") async export(
    @Req() req: AuthRequest,
    @Query() query: Record<string, string>,
    @Res() res: Response,
  ) {
    const month = validMonth(query.month);
    const { items, total } = await this.transactionsService.transactions(
      req.user.id,
      { ...query, month },
      true,
    );
    // Neutralize spreadsheet formulas, quotes and line breaks in user-provided strings.
    const cell = (v: unknown) =>
      '"' +
      String(v ?? "")
        .replace(/^[=+@\-\t\r']/, "'$&")
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
