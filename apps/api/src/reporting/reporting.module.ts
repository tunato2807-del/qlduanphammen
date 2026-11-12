import { Module } from "@nestjs/common";
import { Reports } from "../reports";
import { ReportController } from "./report.controller";
import { IdentityModule } from "../identity/identity.module";
import { LedgerModule } from "../ledger/ledger.module";
import { BudgetingModule } from "../budgeting/budgeting.module";
@Module({
  imports: [IdentityModule, LedgerModule, BudgetingModule],
  providers: [Reports],
  controllers: [ReportController],
  exports: [Reports],
})
export class ReportingModule {}
