import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { AuthRequest, SessionGuard } from "../auth";
import { parse, BudgetDto } from "../dto";
import { Budgets } from "../budgets";
import { validMonth } from "../month";
@Controller("api")
@UseGuards(SessionGuard)
export class BudgetController {
  constructor(@Inject(Budgets) private budgetsService: Budgets) {}
  @Get("budget-plans") async budget(
    @Req() req: AuthRequest,
    @Query("month") month: string,
    @Res() res: Response,
  ) {
    return res.json(
      await this.budgetsService.activeBudget(req.user.id, validMonth(month)),
    );
  }
  @Post("budget-plans/preview") preview(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.budgetsService.budgetPreview(
      req.user.id,
      parse(BudgetDto, body),
    );
  }
  @Post("budget-plans") saveBudget(
    @Req() req: AuthRequest,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.budgetsService.saveBudget(
      req.user.id,
      parse(BudgetDto, body),
      key,
    );
  }
  @Get("budget-plans/suggestion") suggestion(
    @Req() req: AuthRequest,
    @Query("month") month: string,
  ) {
    return this.budgetsService.suggestion(req.user.id, validMonth(month));
  }
  @Get("budget-plans/history") history(
    @Req() req: AuthRequest,
    @Query("month") month: string,
  ) {
    return this.budgetsService.history(req.user.id, validMonth(month));
  }
}
