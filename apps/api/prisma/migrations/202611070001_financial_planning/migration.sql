-- Additive migration. Existing ledger, accounts and budget revisions are preserved.
CREATE TABLE "PasswordReset" (
 "id" TEXT PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");
CREATE TABLE "IdempotencyRecord" (
 "id" UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "key" TEXT NOT NULL, "hash" TEXT NOT NULL, "response" JSONB NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE UNIQUE INDEX "IdempotencyRecord_userId_key_key" ON "IdempotencyRecord"("userId","key");
CREATE TABLE "RecurringRule" (
 "id" UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "name" TEXT NOT NULL, "kind" TEXT NOT NULL CHECK ("kind" IN ('INCOME','EXPENSE')),
 "amount" BIGINT NOT NULL CHECK ("amount" > 0), "walletId" UUID NOT NULL REFERENCES "Wallet"("id"),
 "categoryId" UUID NOT NULL REFERENCES "Category"("id"), "note" TEXT NOT NULL DEFAULT '',
 "day" INTEGER NOT NULL CHECK ("day" BETWEEN 1 AND 31), "startMonth" TEXT NOT NULL,
 "endMonth" TEXT, "active" BOOLEAN NOT NULL DEFAULT true,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CHECK ("endMonth" IS NULL OR "endMonth" >= "startMonth"));
CREATE INDEX "RecurringRule_userId_idx" ON "RecurringRule"("userId");
CREATE TABLE "RecurringDraft" (
 "id" UUID PRIMARY KEY, "ruleId" UUID NOT NULL REFERENCES "RecurringRule"("id") ON DELETE CASCADE,
 "month" TEXT NOT NULL, "dueAt" TIMESTAMPTZ(3) NOT NULL,
 "state" TEXT NOT NULL DEFAULT 'PENDING' CHECK ("state" IN ('PENDING','CONFIRMED','SKIPPED')),
 "transactionId" UUID REFERENCES "Transaction"("id") ON DELETE SET NULL);
CREATE UNIQUE INDEX "RecurringDraft_transactionId_key" ON "RecurringDraft"("transactionId");
CREATE UNIQUE INDEX "RecurringDraft_ruleId_month_key" ON "RecurringDraft"("ruleId","month");
CREATE TABLE "SavingsGoal" (
 "id" UUID PRIMARY KEY, "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
 "name" TEXT NOT NULL, "target" BIGINT NOT NULL CHECK ("target" > 0),
 "targetDate" TIMESTAMPTZ(3) NOT NULL, "archived" BOOLEAN NOT NULL DEFAULT false,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "SavingsGoal_userId_idx" ON "SavingsGoal"("userId");
CREATE TABLE "GoalContribution" (
 "id" UUID PRIMARY KEY, "goalId" UUID NOT NULL REFERENCES "SavingsGoal"("id") ON DELETE CASCADE,
 "walletId" UUID NOT NULL REFERENCES "Wallet"("id"), "amount" BIGINT NOT NULL CHECK ("amount" <> 0),
 "note" TEXT NOT NULL DEFAULT '', "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);
CREATE INDEX "GoalContribution_goalId_idx" ON "GoalContribution"("goalId");
CREATE INDEX "GoalContribution_walletId_idx" ON "GoalContribution"("walletId");
