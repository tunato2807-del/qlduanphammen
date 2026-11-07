import {
  Body,
  Controller,
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
} from "@nestjs/common";
import { Response } from "express";
import { AuthRequest, SessionGuard } from "./auth";
import { Planning } from "./planning";
import { Imports } from "./imports";
import { Reports } from "./reports";
import { Budgets } from "./budgets";
import { Recovery } from "./recovery";
import {
  parse,
  RecurringDto,
  ActiveDto,
  DraftActionDto,
  GoalDto,
  ContributionDto,
  ImportDto,
  ForgotDto,
  ResetDto,
} from "./dto";
import { validMonth } from "./month";
@Controller("api")
@UseGuards(SessionGuard)
export class PlanningController {
  constructor(
    @Inject(Planning) private planning: Planning,
    @Inject(Imports) private imports: Imports,
    @Inject(Budgets) private budgets: Budgets,
    @Inject(Reports) private reports: Reports,
  ) {}
  @Get("recurring") recurring(
    @Req() req: AuthRequest,
    @Query("month") month: string,
  ) {
    return this.planning.recurring(req.user.id, validMonth(month));
  }
  @Post("recurring") create(
    @Req() req: AuthRequest,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.planning.createRule(
      req.user.id,
      parse(RecurringDto, body),
      key,
    );
  }
  @Patch("recurring/:id") active(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.planning.setActive(
      req.user.id,
      id,
      parse(ActiveDto, body).active,
    );
  }
  @Post("recurring-drafts/:id/action") act(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.planning.act(
      req.user.id,
      id,
      parse(DraftActionDto, body).action,
      key,
    );
  }
  @Get("goals") goals(@Req() req: AuthRequest) {
    return this.planning.goals(req.user.id);
  }
  @Post("goals") createGoal(
    @Req() req: AuthRequest,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.planning.createGoal(req.user.id, parse(GoalDto, body), key);
  }
  @Post("goals/:id/contributions") contribute(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.planning.contribute(
      req.user.id,
      id,
      parse(ContributionDto, body),
      key,
    );
  }
  @Post("transactions/import/preview") preview(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    return this.imports.preview(req.user.id, parse(ImportDto, body).csv);
  }
  @Post("transactions/import") commit(
    @Req() req: AuthRequest,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.imports.commit(req.user.id, parse(ImportDto, body).csv, key);
  }
  @Get("transactions/import/template") template(@Res() res: Response) {
    res
      .type("text/csv")
      .attachment("finora-import-template.csv")
      .send(
        "\uFEFFoccurredAt,kind,category,wallet,destinationWallet,amount,note\r\n",
      );
  }
  @Get("budget-plans/suggestion") suggestion(
    @Req() req: AuthRequest,
    @Query("month") month: string,
  ) {
    return this.budgets.suggestion(req.user.id, validMonth(month));
  }
  @Get("budget-plans/history") history(
    @Req() req: AuthRequest,
    @Query("month") month: string,
  ) {
    return this.budgets.history(req.user.id, validMonth(month));
  }
  @Get("reports/pdf") async pdf(
    @Req() req: AuthRequest,
    @Query("month") month: string,
    @Res() res: Response,
  ) {
    const m = validMonth(month);
    res
      .type("application/pdf")
      .attachment(`finora-report-${m}.pdf`)
      .send(await this.reports.pdf(req.user.id, m));
  }
}
@Controller("api/auth")
export class RecoveryController {
  constructor(@Inject(Recovery) private recovery: Recovery) {}
  @Post("forgot-password") forgot(@Body() body: unknown) {
    return this.recovery.forgot(parse(ForgotDto, body).email);
  }
  @Post("reset-password") reset(@Body() body: unknown) {
    const dto = parse(ResetDto, body);
    return this.recovery.reset(dto.token, dto.password);
  }
}
