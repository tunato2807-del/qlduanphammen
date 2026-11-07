import "reflect-metadata";
import "dotenv/config";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { Database } from "../src/database";
import { Wallets } from "../src/wallets";
import { Transactions } from "../src/transactions";
import { Budgets } from "../src/budgets";
import { Idempotency } from "../src/idempotency";
import { Reports } from "../src/reports";
async function main() {
  const root = resolve(__dirname, "../../..");
  const temp = resolve(root, ".local/benchmark");
  const baseline = "27e9f72";
  await mkdir(temp, { recursive: true });
  await writeFile(
    resolve(temp, "tsconfig.json"),
    JSON.stringify({ compilerOptions: { experimentalDecorators: true } }),
  );
  for (const name of ["wallets", "reports"]) {
    let code = execFileSync(
      "git",
      ["show", `${baseline}:apps/api/src/${name}.ts`],
      { cwd: root, encoding: "utf8" },
    );
    code = code
      .replace(/@Inject\(\w+\)\s*/g, "")
      .replace(/@Injectable\(\)\s*/g, "");
    code = code.replace(
      /from "\.\/(\w+)"/g,
      (_m, module) =>
        `from ${JSON.stringify(module === "wallets" ? resolve(temp, "wallets") : resolve(root, "apps/api/src", module))}`,
    );
    await writeFile(resolve(temp, name + ".ts"), code);
  }
  const { Reports: LegacyReports } = await import(resolve(temp, "reports.ts"));
  const { Wallets: LegacyWallets } = await import(resolve(temp, "wallets.ts"));
  const db = new Database();
  await db.$connect();
  const userId = randomUUID();
  try {
    await db.user.create({
      data: {
        id: userId,
        name: "Performance fixture",
        email: `benchmark-${userId}@finora.test`,
        passwordHash: "fixture-no-login",
      },
    });
    const wallet = await db.wallet.create({
      data: { userId, name: "Benchmark wallet", openingBalance: 100000000n },
    });
    const expense = await db.category.create({
      data: { userId, name: "Fixture expense", kind: "EXPENSE" },
    });
    const income = await db.category.create({
      data: { userId, name: "Fixture income", kind: "INCOME" },
    });
    const rows = Array.from({ length: 10000 }, (_, i) => ({
      userId,
      walletId: wallet.id,
      kind: i % 5 === 0 ? "INCOME" : "EXPENSE",
      categoryId: i % 5 === 0 ? income.id : expense.id,
      amount: BigInt(1000 + i),
      note: "Synthetic benchmark fixture",
      occurredAt: new Date(Date.UTC(2026, 5 + (i % 6), 1 + (i % 27), 5)),
    }));
    for (let i = 0; i < rows.length; i += 1000)
      await db.transaction.createMany({ data: rows.slice(i, i + 1000) });
    const requests = new Idempotency(db),
      wallets = new Wallets(db, requests),
      ledger = new Transactions(db, wallets, requests),
      budgets = new Budgets(db, requests);
    const current = new Reports(db, wallets, ledger, budgets),
      legacy = new LegacyReports(db, new LegacyWallets(db), ledger, budgets);
    const old = await legacy.summary(userId, "2026-11"),
      now = await current.summary(userId, "2026-11");
    for (const field of [
      "balance",
      "income",
      "expense",
      "net",
      "transactionCount",
    ] as const)
      assert.equal(now[field], old[field]);
    assert.deepEqual(now.history, old.history);
    assert.equal(now.spending[0].amount, old.spending[0].amount);
    const samples: { baseline: number[]; current: number[] } = {
      baseline: [],
      current: [],
    };
    for (let i = 0; i < 23; i++) {
      for (const [name, service] of [
        ["baseline", legacy],
        ["current", current],
      ] as const) {
        const start = performance.now();
        await service.summary(userId, "2026-11");
        if (i >= 3) samples[name].push(performance.now() - start);
      }
    }
    const stats = (values: number[]) => {
      const s = [...values].sort((a, b) => a - b);
      return {
        medianMs: +s[Math.floor(s.length / 2)].toFixed(2),
        p95Ms: +s[Math.ceil(s.length * 0.95) - 1].toFixed(2),
        samples: s.length,
      };
    };
    const result = {
      date: new Date().toISOString(),
      node: process.version,
      baselineCommit: baseline,
      rows: 10000,
      months: 6,
      protocol:
        "Provider summary; 3 warmups, 20 sequential alternating samples. Exact totals/history checked. Synthetic account deleted in finally.",
      baseline: stats(samples.baseline),
      current: stats(samples.current),
      transportRows: {
        baselineLedgerReads: 20000,
        currentMonthlyAggregate: 6,
        currentSpendingAggregate: 1,
        currentWalletAggregate: 2,
      },
      limits:
        "Single local PostgreSQL environment; not a load test, concurrency test or production SLA.",
    };
    await writeFile(
      resolve(root, "specs/002-financial-planning/performance.json"),
      JSON.stringify(result, null, 2) + "\n",
    );
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await db.transaction.deleteMany({ where: { userId } });
    await db.wallet.deleteMany({ where: { userId } });
    await db.category.deleteMany({ where: { userId } });
    await db.user.deleteMany({ where: { id: userId } });
    await db.$disconnect();
  }
}
main().catch((error: unknown) => {
  console.error(
    "Benchmark thất bại; kiểm tra DB và commit baseline.",
    error instanceof Error ? error.name : "UnknownError",
  );
  process.exitCode = 1;
});
