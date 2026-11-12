import { Module } from "@nestjs/common";
import { Budgets } from "../budgets";
import { BudgetController } from "./budget.controller";
import { IdentityModule } from "../identity/identity.module";
@Module({
  imports: [IdentityModule],
  providers: [Budgets],
  controllers: [BudgetController],
  exports: [Budgets],
})
export class BudgetingModule {}
