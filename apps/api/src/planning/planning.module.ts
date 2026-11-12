import { Module } from "@nestjs/common";
import { Planning } from "../planning";
import { PlanningController } from "./planning.controller";
import { IdentityModule } from "../identity/identity.module";
import { LedgerModule } from "../ledger/ledger.module";
@Module({
  imports: [IdentityModule, LedgerModule],
  providers: [Planning],
  controllers: [PlanningController],
  exports: [],
})
export class PlanningModule {}
