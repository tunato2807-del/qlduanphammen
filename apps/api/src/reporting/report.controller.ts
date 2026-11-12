import {
  Controller,
  Get,
  Inject,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { AuthRequest, SessionGuard } from "../auth";
import { Reports } from "../reports";
import { validMonth } from "../month";
@Controller("api/reports")
@UseGuards(SessionGuard)
export class ReportController {
  constructor(@Inject(Reports) private reports: Reports) {}
  @Get("summary") summary(
    @Req() req: AuthRequest,
    @Query("month") month: string,
  ) {
    return this.reports.summary(req.user.id, validMonth(month));
  }
  @Get("pdf") async pdf(
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
