import { Module } from "@nestjs/common";
import { Wallets } from "../wallets";
import { Transactions } from "../transactions";
import { Imports } from "../imports";
import { LedgerController } from "./ledger.controller";
import { ImportController } from "./import.controller";
import { IdentityModule } from "../identity/identity.module";
@Module({
  imports: [IdentityModule],
  providers: [Wallets, Transactions, Imports],
  controllers: [LedgerController, ImportController],
  exports: [Wallets, Transactions],
})
export class LedgerModule {}
