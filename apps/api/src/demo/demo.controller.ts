import {
  Controller,
  Post,
  Inject,
  Res,
  ForbiddenException,
} from "@nestjs/common";
import { Response } from "express";
import { Accounts, demoEnabled } from "../auth";
import { Demo } from "../demo";
import { signIn } from "../identity/session-cookie";
@Controller("api/auth")
export class DemoController {
  constructor(
    @Inject(Accounts) private accounts: Accounts,
    @Inject(Demo) private demo: Demo,
  ) {}
  @Post("demo") async experience(@Res({ passthrough: true }) res: Response) {
    if (!demoEnabled())
      throw new ForbiddenException("Chế độ trải nghiệm đang tắt.");
    return signIn(this.accounts, await this.demo.create(), res);
  }
}
