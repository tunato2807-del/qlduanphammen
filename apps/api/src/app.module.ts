import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { InfrastructureModule } from "./infrastructure/infrastructure.module";
import { IdentityModule } from "./identity/identity.module";
import { LedgerModule } from "./ledger/ledger.module";
import { BudgetingModule } from "./budgeting/budgeting.module";
import { PlanningModule } from "./planning/planning.module";
import { ReportingModule } from "./reporting/reporting.module";
import { DemoModule } from "./demo/demo.module";
@Module({
  imports: [
    InfrastructureModule,
    IdentityModule,
    LedgerModule,
    BudgetingModule,
    PlanningModule,
    ReportingModule,
    DemoModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
