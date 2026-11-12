import { Body, Controller, Inject, Post } from "@nestjs/common";
import { Recovery } from "../recovery";
import { parse, ForgotDto, ResetDto } from "../dto";
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
