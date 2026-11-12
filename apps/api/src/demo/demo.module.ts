import { Module } from "@nestjs/common";
import { Demo } from "../demo";
import { DemoController } from "./demo.controller";
import { IdentityModule } from "../identity/identity.module";
import { LedgerModule } from "../ledger/ledger.module";
import { BudgetingModule } from "../budgeting/budgeting.module";
@Module({
  imports: [IdentityModule, LedgerModule, BudgetingModule],
  providers: [Demo],
  controllers: [DemoController],
  exports: [],
})
export class DemoModule {}
