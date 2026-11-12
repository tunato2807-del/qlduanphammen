import { Module } from "@nestjs/common";
import { Accounts } from "../auth";
import { SessionGuard } from "../auth";
import { Recovery } from "../recovery";
import { AuthController } from "./auth.controller";
import { RecoveryController } from "./recovery.controller";
@Module({
  imports: [],
  providers: [Accounts, SessionGuard, Recovery],
  controllers: [AuthController, RecoveryController],
  exports: [Accounts, SessionGuard],
})
export class IdentityModule {}
