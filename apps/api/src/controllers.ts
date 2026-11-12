// Compatibility exports for internal consumers. HTTP routes now belong to capability modules.
export { AuthController } from "./identity/auth.controller";
export { LedgerController as FinanceController } from "./ledger/ledger.controller";
