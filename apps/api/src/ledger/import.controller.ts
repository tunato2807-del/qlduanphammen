import {
  Body,
  Controller,
  Get,
  Headers,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import { AuthRequest, SessionGuard } from "../auth";
import { Imports } from "../imports";
import { parse, ImportDto } from "../dto";
@Controller("api")
@UseGuards(SessionGuard)
export class ImportController {
  constructor(@Inject(Imports) private imports: Imports) {}
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
}
