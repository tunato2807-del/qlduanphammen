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
  UseGuards,
} from "@nestjs/common";
import { AuthRequest, SessionGuard } from "../auth";
import { Planning } from "../planning";
import {
  parse,
  RecurringDto,
  ActiveDto,
  DraftActionDto,
  GoalDto,
  ContributionDto,
  GoalPatchDto,
} from "../dto";
import { validMonth } from "../month";
@Controller("api")
@UseGuards(SessionGuard)
export class PlanningController {
  constructor(@Inject(Planning) private planning: Planning) {}
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
  @Patch("goals/:id") updateGoal(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
  ) {
    return this.planning.updateGoal(req.user.id, id, parse(GoalPatchDto, body));
  }
  @Post("recurring/:id/replace") replace(
    @Req() req: AuthRequest,
    @Param("id", ParseUUIDPipe) id: string,
    @Body() body: unknown,
    @Headers("idempotency-key") key?: string,
  ) {
    return this.planning.replaceRule(
      req.user.id,
      id,
      parse(RecurringDto, body),
      key,
    );
  }
}
