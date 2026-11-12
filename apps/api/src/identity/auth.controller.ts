import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  Res,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { Response } from "express";
import {
  Accounts,
  AuthRequest,
  demoEnabled,
  safeUser,
  SessionGuard,
} from "../auth";
import { Database } from "../database";
import { parse, LoginDto, PasswordDto, RegisterDto, ProfileDto } from "../dto";
import { recoveryEnabled } from "../recovery";
import { signIn } from "./session-cookie";
@Controller("api/auth")
export class AuthController {
  constructor(
    @Inject(Accounts) private accounts: Accounts,
    @Inject(Database) private db: Database,
  ) {}
  @Get("config") config() {
    return { demoEnabled: demoEnabled(), recoveryEnabled: recoveryEnabled() };
  }
  @Post("register") async register(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    return signIn(
      this.accounts,
      await this.accounts.register(parse(RegisterDto, body)),
      res,
    );
  }
  @Post("login") async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ) {
    const dto = parse(LoginDto, body);
    return signIn(
      this.accounts,
      await this.accounts.login(dto.email, dto.password),
      res,
    );
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
  @Patch("profile") @UseGuards(SessionGuard) async profile(
    @Req() req: AuthRequest,
    @Body() body: unknown,
  ) {
    const dto = parse(ProfileDto, body);
    return safeUser(
      await this.db.user.update({
        where: { id: req.user.id },
        data: { name: dto.name },
      }),
    );
  }
}
