import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import type { INestApplication } from "@nestjs/common";
import { Database } from "../src/database";
import { createApp } from "../src/main";
process.env.NODE_ENV = "test";
let app: INestApplication, db: Database, url: string;
const ids: string[] = [];
class Client {
  cookie = "";
  user: any;
  async request(
    path: string,
    method = "GET",
    body?: unknown,
    extra: Record<string, string> = {},
  ) {
    const response = await fetch(url + "/api" + path, {
      method,
      headers: {
        "Content-Type": "application/json",
        Cookie: this.cookie,
        ...extra,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
    const cookie = response.headers.get("set-cookie");
    if (cookie) this.cookie = cookie.split(";")[0];
    const data = response.headers.get("content-type")?.includes("json")
      ? await response.json()
      : await response.text();
    return { status: response.status, data, headers: response.headers };
  }
  async register() {
    const r = await this.request("/auth/register", "POST", {
      email: `test-${randomUUID()}@finora.test`,
      name: "Kiểm thử",
      password: "correct-password-123",
    });
    assert.equal(r.status, 201, JSON.stringify(r.data));
    this.user = r.data;
    ids.push(r.data.id);
    return this;
  }
}
const a = new Client(),
  b = new Client();
let bank: any, cash: any, food: any, salary: any, expense: any;
before(async () => {
  app = await createApp();
  await app.listen(0, "127.0.0.1");
  url = await app.getUrl();
  db = app.get(Database);
  await a.register();
  await b.register();
  const c = await a.request("/categories");
  food = c.data.find((c: any) => c.icon === "food");
  salary = c.data.find((c: any) => c.icon === "salary");
});
after(async () => {
  if (db)
    await db.$transaction(async (tx) => {
      const where = { userId: { in: ids } };
      await tx.transaction.deleteMany({ where });
      await tx.budgetPlan.deleteMany({ where });
      await tx.wallet.deleteMany({ where });
      await tx.category.deleteMany({ where });
      await tx.session.deleteMany({ where });
      await tx.user.deleteMany({ where: { id: { in: ids } } });
    });
  if (app) await app.close();
});
test("unauthenticated requests fail; session cookie is HttpOnly and user data is sanitized", async () => {
  assert.equal((await new Client().request("/wallets")).status, 401);
  const r = await a.request("/auth/me");
  assert.equal(r.status, 200);
  assert.equal(r.data.passwordHash, undefined);
  assert.equal(r.data.id, a.user.id);
  const bad = await new Client().request("/auth/login", "POST", {
    email: a.user.email,
    password: "wrong",
  });
  assert.equal(bad.status, 401);
  const c = new Client();
  const good = await c.request("/auth/login", "POST", {
    email: a.user.email,
    password: "correct-password-123",
  });
  assert.equal(good.status, 201);
  assert.match(good.headers.get("set-cookie")!, /HttpOnly/);
});
test("validation rejects extra fields and blank names; cross-origin mutations fail", async () => {
  assert.equal(
    (
      await a.request("/wallets", "POST", {
        name: "  ",
        kind: "CASH",
        openingBalance: "0",
        color: "#000000",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a.request("/wallets", "POST", {
        name: "Ví",
        kind: "CASH",
        openingBalance: "0",
        color: "#000000",
        userId: b.user.id,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a.request(
        "/wallets",
        "POST",
        {},
        { Origin: "https://evil.example" },
      )
    ).status,
    403,
  );
});
test("create wallets and ledger entries; transfers conserve total assets and are excluded from income/expense", async () => {
  bank = (
    await a.request("/wallets", "POST", {
      name: "Ngân hàng",
      kind: "BANK",
      openingBalance: "1000000",
      color: "#39745d",
    })
  ).data;
  cash = (
    await a.request("/wallets", "POST", {
      name: "Tiền mặt",
      kind: "CASH",
      openingBalance: "0",
      color: "#dba673",
    })
  ).data;
  const base = { walletId: bank.id, occurredAt: "2026-10-12T12:00:00+07:00" };
  assert.equal(
    (
      await a.request("/transactions", "POST", {
        ...base,
        kind: "INCOME",
        amount: "10000000",
        categoryId: salary.id,
        note: "Lương",
      })
    ).status,
    201,
  );
  expense = (
    await a.request("/transactions", "POST", {
      ...base,
      kind: "EXPENSE",
      amount: "300000",
      categoryId: food.id,
      note: "=SUM(1,1)",
    })
  ).data;
  assert.equal(
    (
      await a.request("/transactions", "POST", {
        ...base,
        kind: "TRANSFER",
        amount: "2000000",
        destinationWalletId: cash.id,
      })
    ).status,
    201,
  );
  const s = (await a.request("/reports/summary?month=2026-10")).data;
  assert.equal(s.balance, "10700000");
  assert.equal(s.income, "10000000");
  assert.equal(s.expense, "300000");
  assert.equal(s.wallets.find((w: any) => w.id === bank.id).balance, "8700000");
  assert.equal(s.wallets.find((w: any) => w.id === cash.id).balance, "2000000");
});
test("wallets, categories and transactions cannot be accessed through another owner", async () => {
  assert.equal(
    (
      await b.request("/categories/" + food.id, "PATCH", {
        name: "Không được sửa",
      })
    ).status,
    404,
  );
  assert.equal(
    (await b.request("/wallets/" + bank.id, "PATCH", { name: "Stolen" }))
      .status,
    404,
  );
  assert.equal(
    (await b.request("/transactions/" + expense.id, "DELETE", {})).status,
    404,
  );
  assert.equal(
    (
      await b.request("/transactions", "POST", {
        kind: "EXPENSE",
        walletId: bank.id,
        amount: "1",
        categoryId: food.id,
        occurredAt: "2026-10-12",
      })
    ).status,
    404,
  );
  assert.equal((await b.request("/transactions?month=2026-10")).data.total, 0);
  assert.equal(
    (await b.request("/reports/summary?month=2026-10")).data.balance,
    "0",
  );
});
test("invalid amounts, transfer shapes, category types and archived wallets are rejected", async () => {
  const base = {
    kind: "EXPENSE",
    walletId: bank.id,
    categoryId: food.id,
    amount: "100",
    occurredAt: "2026-10-12",
  };
  for (const amount of ["0", "-1", "1.5", "99999999999999"])
    assert.equal(
      (await a.request("/transactions", "POST", { ...base, amount })).status,
      400,
    );
  assert.equal(
    (
      await a.request("/transactions", "POST", {
        ...base,
        categoryId: salary.id,
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a.request("/transactions", "POST", {
        ...base,
        kind: "TRANSFER",
        categoryId: undefined,
        destinationWalletId: bank.id,
      })
    ).status,
    400,
  );
  await a.request("/wallets/" + cash.id, "PATCH", { archived: true });
  assert.equal(
    (await a.request("/transactions", "POST", { ...base, walletId: cash.id }))
      .status,
    404,
  );
  await a.request("/wallets/" + cash.id, "PATCH", { archived: false });
  await a.request("/categories/" + food.id, "PATCH", { archived: true });
  assert.equal((await a.request("/transactions", "POST", base)).status, 400);
  assert.equal(
    (
      await a.request("/budget-plans/preview", "POST", {
        month: "2026-10",
        income: "100",
        savings: "0",
        mode: "AUTO",
        items: [{ categoryId: food.id, fixed: "0", weight: 1 }],
      })
    ).status,
    400,
  );
  await a.request("/categories/" + food.id, "PATCH", { archived: false });
});
test("budget preview has no side effects; application preserves exact totals and active revisions", async () => {
  const payload = {
    month: "2026-10",
    income: "10000000",
    savings: "2000000",
    mode: "AUTO",
    items: [{ categoryId: food.id, fixed: "1000000", weight: 1 }],
  };
  assert.equal(
    (await a.request("/budget-plans/preview", "POST", payload)).data.items[0]
      .limit,
    "8000000",
  );
  assert.equal((await a.request("/budget-plans?month=2026-10")).data, null);
  const r = await a.request("/budget-plans", "POST", payload);
  assert.equal(r.status, 201);
  assert.equal(r.data.revision, 1);
  await Promise.all([
    a.request("/budget-plans", "POST", payload),
    a.request("/budget-plans", "POST", payload),
  ]);
  const plan = (await a.request("/budget-plans?month=2026-10")).data;
  assert.equal(plan.revision, 3);
  assert.equal(plan.items[0].spent, "300000");
  assert.equal(
    await db.budgetPlan.count({
      where: { userId: a.user.id, month: "2026-10", active: true },
    }),
    1,
  );
  assert.equal(
    (await b.request("/budget-plans/preview", "POST", payload)).status,
    400,
  );
  assert.equal(
    (
      await a.request("/budget-plans/preview", "POST", {
        ...payload,
        savings: "10000000",
      })
    ).status,
    400,
  );
});
test("editing and deleting transactions updates wallet balances, reports and budget spending", async () => {
  const r = await a.request("/transactions/" + expense.id, "PATCH", {
    kind: "EXPENSE",
    amount: "500000",
    walletId: bank.id,
    categoryId: food.id,
    occurredAt: "2026-10-12T12:00:00+07:00",
    note: "=SUM(1,1)",
  });
  assert.equal(r.status, 200);
  const s = (await a.request("/reports/summary?month=2026-10")).data;
  assert.equal(s.expense, "500000");
  assert.equal(s.balance, "10500000");
  assert.equal(s.budget.items[0].spent, "500000");
  const csv = await a.request("/transactions/export?month=2026-10");
  assert.equal(csv.status, 200);
  assert.match(csv.data, /'=SUM/);
  assert.match(csv.headers.get("content-type")!, /text\/csv/);
  assert.equal(
    (await a.request("/transactions/" + expense.id, "DELETE", {})).status,
    200,
  );
  const after = (await a.request("/reports/summary?month=2026-10")).data;
  assert.equal(after.expense, "0");
  assert.equal(after.budget.items[0].spent, "0");
});
test("month reporting uses Vietnam calendar boundaries and CSV filters match listing", async () => {
  await a.request("/transactions", "POST", {
    kind: "EXPENSE",
    amount: "1",
    walletId: bank.id,
    categoryId: food.id,
    occurredAt: "2026-09-30T17:00:00.000Z",
    note: "Đầu tháng",
  });
  await a.request("/transactions", "POST", {
    kind: "EXPENSE",
    amount: "2",
    walletId: bank.id,
    categoryId: food.id,
    occurredAt: "2026-10-31T17:00:00.000Z",
    note: "Tháng sau",
  });
  assert.equal(
    (await a.request("/reports/summary?month=2026-10")).data.expense,
    "1",
  );
  assert.equal(
    (
      await a.request(
        "/transactions?month=2026-10&kind=EXPENSE&search=" +
          encodeURIComponent("Đầu tháng"),
      )
    ).data.total,
    1,
  );
  assert.equal((await a.request("/reports/summary?month=2026-13")).status, 400);
});
test("password change revokes other sessions; logout invalidates the current session", async () => {
  const c = new Client();
  await c.request("/auth/login", "POST", {
    email: a.user.email,
    password: "correct-password-123",
  });
  assert.equal(
    (
      await a.request("/auth/password", "POST", {
        currentPassword: "correct-password-123",
        newPassword: "new-password-123",
      })
    ).status,
    201,
  );
  assert.equal((await c.request("/auth/me")).status, 401);
  assert.equal((await a.request("/auth/me")).status, 200);
  await a.request("/auth/logout", "POST", {});
  assert.equal((await a.request("/auth/me")).status, 401);
});

test("responses carry generated request IDs and structured safe errors", async () => {
  const response = await new Client().request("/wallets", "GET", undefined, {
    "X-Request-Id": "untrusted-input",
  });
  assert.equal(response.status, 401);
  assert.match(response.headers.get("x-request-id") ?? "", /^[a-f0-9-]{36}$/);
  assert.equal(response.data.code, "UNAUTHENTICATED");
  assert.equal(response.data.requestId, response.headers.get("x-request-id"));
  assert.equal(typeof response.data.message, "string");
  assert.equal(response.data.stack, undefined);
});
