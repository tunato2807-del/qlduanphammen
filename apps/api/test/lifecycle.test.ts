import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { createApp } from "../src/main";
import { Database } from "../src/database";
import { Wallets } from "../src/wallets";
import { Transactions } from "../src/transactions";
import { currentMonth, monthOffset } from "../src/budget";
process.env.NODE_ENV = "test";
let app: INestApplication,
  db: Database,
  url: string,
  walletId: string,
  food: string;
const users: string[] = [];
class Client {
  cookie = "";
  id = "";
  async request<T = Record<string, unknown>>(
    path: string,
    method = "GET",
    body?: unknown,
    key?: string,
  ) {
    const r = await fetch(url + "/api" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: this.cookie,
        ...(key ? { "Idempotency-Key": key } : {}),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const cookie = r.headers.get("set-cookie");
    if (cookie) this.cookie = cookie.split(";")[0];
    return { status: r.status, data: (await r.json()) as T };
  }
  async register() {
    const r = await this.request<{ id: string }>("/auth/register", "POST", {
      name: "Renewal fixture",
      email: `renew-${randomUUID()}@finora.test`,
      password: "test-password123",
    });
    assert.equal(r.status, 201);
    this.id = r.data.id;
    users.push(this.id);
  }
}
const a = new Client(),
  b = new Client();
before(async () => {
  app = await createApp();
  await app.listen(0, "127.0.0.1");
  url = await app.getUrl();
  db = app.get(Database);
  await a.register();
  await b.register();
  walletId = (
    await a.request<{ id: string }>("/wallets", "POST", {
      name: "Ví chính",
      kind: "BANK",
      openingBalance: "5000000",
      color: "#635bce",
    })
  ).data.id;
  food = (
    await db.category.findFirstOrThrow({
      where: { userId: a.id, icon: "food" },
    })
  ).id;
});
after(async () => {
  if (db)
    await db.$transaction(async (tx) => {
      const where = { userId: { in: users } };
      await tx.recurringRule.deleteMany({ where });
      await tx.savingsGoal.deleteMany({ where });
      await tx.transaction.deleteMany({ where });
      await tx.budgetPlan.deleteMany({ where });
      await tx.wallet.deleteMany({ where });
      await tx.category.deleteMany({ where });
      await tx.user.deleteMany({ where: { id: { in: users } } });
    });
  if (app) await app.close();
});
const goalPayload = () => ({
  name: "Quỹ dự phòng",
  target: "1000000",
  targetDate: "2030-12-31T23:59:59+07:00",
});
test("goal lifecycle preserves allocations; archived goals may withdraw but cannot add", async () => {
  const g = await a.request<{ id: string }>("/goals", "POST", goalPayload());
  assert.equal(g.status, 201);
  const path = `/goals/${g.data.id}`;
  assert.equal(
    (
      await a.request(path + "/contributions", "POST", {
        action: "ADD",
        amount: "300000",
        walletId,
      })
    ).status,
    201,
  );
  assert.equal(
    (await b.request(path, "PATCH", { name: "Stolen" })).status,
    404,
  );
  const updated = await a.request<{ target: string }>(path, "PATCH", {
    name: "Quỹ gia đình",
    target: "2000000",
    targetDate: "2031-12-31T23:59:59+07:00",
  });
  assert.equal(updated.status, 200);
  assert.equal(updated.data.target, "2000000");
  assert.equal(
    (await a.request(path, "PATCH", { saved: "999999" })).status,
    400,
  );
  for (const field of ["name", "target", "targetDate", "archived"])
    assert.equal(
      (await a.request(path, "PATCH", { [field]: null })).status,
      400,
      `null ${field} must be rejected before reaching the database`,
    );
  assert.equal(
    (await a.request(path, "PATCH", { archived: true })).status,
    200,
  );
  assert.equal(
    (
      await a.request(path + "/contributions", "POST", {
        action: "ADD",
        amount: "1",
        walletId,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a.request(path + "/contributions", "POST", {
        action: "WITHDRAW",
        amount: "100000",
        walletId,
      })
    ).status,
    201,
  );
  const stored = await db.goalContribution.aggregate({
    where: { goalId: g.data.id },
    _sum: { amount: true },
  });
  assert.equal(stored._sum.amount, 200000n);
  assert.equal(
    (await a.request(path, "PATCH", { archived: false })).status,
    200,
  );
});
test("future rule replacement preserves old drafts and is atomic/idempotent", async () => {
  const prior = monthOffset(currentMonth(), -1),
    future = monthOffset(currentMonth(), 1);
  const payload = {
    name: "Tiền nhà cũ",
    kind: "EXPENSE",
    amount: "100000",
    walletId,
    categoryId: food,
    day: 1,
    startMonth: prior,
  };
  const rule = (await a.request<{ id: string }>("/recurring", "POST", payload))
    .data;
  const oldDraft = (
    await a.request<{ drafts: { id: string; rule: { id: string } }[] }>(
      `/recurring?month=${prior}`,
    )
  ).data.drafts.find((d) => d.rule.id === rule.id)!;
  const replacement = {
    ...payload,
    name: "Tiền nhà mới",
    amount: "120000",
    startMonth: future,
  };
  const key = randomUUID();
  const changed = await a.request<{
    previous: { id: string; endMonth: string };
    replacement: { id: string; amount: string };
  }>(`/recurring/${rule.id}/replace`, "POST", replacement, key);
  assert.equal(changed.status, 201);
  assert.equal(changed.data.previous.endMonth, monthOffset(future, -1));
  assert.equal(changed.data.replacement.amount, "120000");
  const replay = await a.request<typeof changed.data>(
    `/recurring/${rule.id}/replace`,
    "POST",
    replacement,
    key,
  );
  assert.equal(replay.data.replacement.id, changed.data.replacement.id);
  assert.equal(
    (await b.request(`/recurring/${rule.id}/replace`, "POST", replacement))
      .status,
    404,
  );
  assert.equal(
    (
      await a.request(`/recurring-drafts/${oldDraft.id}/action`, "POST", {
        action: "CONFIRM",
      })
    ).status,
    201,
  );
  const tx = await db.transaction.findFirstOrThrow({
    where: { recurringDraft: { id: oldDraft.id } },
  });
  assert.equal(tx.amount, 100000n);
});
test("rule replacement rejects current month and concurrent replacements cannot overlap", async () => {
  const payload = {
    name: "Định kỳ",
    kind: "EXPENSE",
    amount: "10",
    walletId,
    categoryId: food,
    day: 1,
    startMonth: currentMonth(),
  };
  const r = (await a.request<{ id: string }>("/recurring", "POST", payload))
    .data;
  assert.equal(
    (await a.request(`/recurring/${r.id}/replace`, "POST", payload)).status,
    400,
  );
  const futurePayload = {
    ...payload,
    startMonth: monthOffset(currentMonth(), 3),
  };
  const futureRule = (
    await a.request<{ id: string }>("/recurring", "POST", futurePayload)
  ).data;
  assert.equal(
    (
      await a.request(`/recurring/${futureRule.id}/replace`, "POST", {
        ...payload,
        startMonth: monthOffset(currentMonth(), 1),
      })
    ).status,
    400,
  );
  assert.equal(
    (await db.recurringRule.findUniqueOrThrow({ where: { id: futureRule.id } }))
      .endMonth,
    null,
  );
  const next = { ...payload, startMonth: monthOffset(currentMonth(), 1) };
  const results = await Promise.all([
    a.request(`/recurring/${r.id}/replace`, "POST", next, randomUUID()),
    a.request(`/recurring/${r.id}/replace`, "POST", next, randomUUID()),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 409]);
});
test("ledger filters include incoming transfers, category and ascending dates without widening search", async () => {
  const cash = (
    await a.request<{ id: string }>("/wallets", "POST", {
      name: "Ví đích",
      kind: "CASH",
      openingBalance: "0",
      color: "#32675d",
    })
  ).data;
  for (const t of [
    {
      kind: "TRANSFER",
      amount: "300",
      destinationWalletId: cash.id,
      note: "lọc ví",
      occurredAt: "2026-10-02T12:00:00+07:00",
    },
    {
      kind: "EXPENSE",
      amount: "100",
      categoryId: food,
      note: "lọc ví",
      occurredAt: "2026-10-03T12:00:00+07:00",
    },
  ])
    assert.equal(
      (await a.request("/transactions", "POST", { ...t, walletId })).status,
      201,
    );
  const incoming = await a.request<{
    total: number;
    items: { kind: string }[];
  }>(`/transactions?month=2026-10&walletId=${cash.id}&search=lọc`);
  assert.equal(incoming.data.total, 1);
  assert.equal(incoming.data.items[0].kind, "TRANSFER");
  const category = await a.request<{ total: number }>(
    `/transactions?month=2026-10&walletId=${cash.id}&categoryId=${food}`,
  );
  assert.equal(category.data.total, 0);
  const sorted = await a.request<{ items: { occurredAt: string }[] }>(
    `/transactions?month=2026-10&search=lọc&sort=asc`,
  );
  assert.equal(sorted.data.items[0].occurredAt, "2026-10-02T05:00:00.000Z");
  const foreign = (
    await db.category.findFirstOrThrow({ where: { userId: b.id } })
  ).id;
  assert.equal(
    (await a.request(`/transactions?categoryId=${foreign}`)).status,
    404,
  );
  assert.equal((await a.request("/transactions?sort=garbage")).status, 400);
  const csv = await fetch(
    url +
      `/api/transactions/export?month=2026-10&walletId=${cash.id}&search=lọc`,
    { headers: { Cookie: a.cookie } },
  );
  assert.equal(csv.status, 200);
  assert.equal(csv.headers.get("x-export-total"), "1");
});
test("profile changes return safe fields and persist for later session reads", async () => {
  const r = await a.request<{ name: string; passwordHash?: string }>(
    "/auth/profile",
    "PATCH",
    { name: "  Tên mới  " },
  );
  assert.equal(r.status, 200);
  assert.equal(r.data.name, "Tên mới");
  assert.equal(r.data.passwordHash, undefined);
  assert.equal(
    (await a.request<{ name: string }>("/auth/me")).data.name,
    "Tên mới",
  );
  assert.equal(
    (await a.request("/auth/profile", "PATCH", { email: "other@finora.test" }))
      .status,
    400,
  );
});
test("report reads one snapshot while a ledger write commits between component queries", async () => {
  const wallets = app.get(Wallets),
    original = wallets.wallets.bind(wallets);
  const ledger = app.get(Transactions),
    originalList = ledger.transactions.bind(ledger);
  let injected: string | undefined, release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  wallets.wallets = async (userId, ...args) => {
    const result = await original(userId, ...args);
    if (userId === a.id && !injected) {
      const tx = await db.transaction.create({
        data: {
          userId: a.id,
          kind: "EXPENSE",
          amount: 123n,
          walletId,
          categoryId: food,
          occurredAt: new Date("2035-01-05T05:00:00Z"),
        },
      });
      injected = tx.id;
      release();
    }
    return result;
  };
  // Force recent/count to run after an independent committed write. Every query is real.
  ledger.transactions = async (...args) => {
    if (args[0] === a.id) await gate;
    return originalList(...args);
  };

  try {
    const report = await a.request<{
      expense: string;
      transactionCount: number;
      balance: string;
      recent: { id: string }[];
    }>("/reports/summary?month=2035-01");
    assert.equal(report.status, 200);
    assert(injected);
    assert.equal(report.data.expense, "0");
    assert.equal(report.data.transactionCount, 0);
    assert.deepEqual(report.data.recent, []);
    assert(await db.transaction.findUnique({ where: { id: injected } }));
    const next = await a.request<typeof report.data>(
      "/reports/summary?month=2035-01",
    );
    assert.equal(next.data.expense, "123");
    assert.equal(next.data.transactionCount, 1);
    assert.equal(next.data.recent[0].id, injected);
    assert.equal(BigInt(next.data.balance), BigInt(report.data.balance) - 123n);
  } finally {
    release();
    wallets.wallets = original;
    ledger.transactions = originalList;
    if (injected) await db.transaction.deleteMany({ where: { id: injected } });
  }
});
