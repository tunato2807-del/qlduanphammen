import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import { createServer, type Server } from "node:net";
import { setTimeout as delay } from "node:timers/promises";
import type { INestApplication } from "@nestjs/common";
import { createApp } from "../src/main";
import { Database } from "../src/database";
process.env.NODE_ENV = "test";
let app: INestApplication, db: Database, url: string, smtp: Server;
const mails: string[] = [];
const users: string[] = [];
class Client {
  cookie = "";
  id = "";
  email = "";
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
    this.email = `ext-${randomUUID()}@finora.test`;
    const r = await this.request<{ id: string }>("/auth/register", "POST", {
      name: "Kiểm thử mở rộng",
      email: this.email,
      password: "initial-password123",
    });
    assert.equal(r.status, 201);
    this.id = r.data.id;
    users.push(this.id);
  }
}
const a = new Client(),
  b = new Client();
let wallet: string, food: string, salary: string, goal: string, draft: string;
const tx = (overrides: Record<string, unknown> = {}) => ({
  kind: "EXPENSE",
  amount: "12345",
  walletId: wallet,
  categoryId: food,
  occurredAt: "2026-02-10T12:00:00+07:00",
  note: "chi kiểm thử",
  ...overrides,
});
before(async () => {
  smtp = createServer((socket) => {
    socket.setEncoding("utf8");
    socket.write("220 local test smtp\r\n");
    let buffer = "",
      data = false,
      body = "";
    socket.on("data", (chunk) => {
      buffer += chunk;
      let pos: number;
      while ((pos = buffer.indexOf("\r\n")) >= 0) {
        const line = buffer.slice(0, pos);
        buffer = buffer.slice(pos + 2);
        if (data) {
          if (line === ".") {
            mails.push(body);
            body = "";
            data = false;
            socket.write("250 accepted\r\n");
          } else body += line + "\r\n";
        } else if (line.startsWith("EHLO"))
          socket.write("250-localhost\r\n250 8BITMIME\r\n");
        else if (line === "DATA") {
          data = true;
          socket.write("354 continue\r\n");
        } else if (line === "QUIT") {
          socket.end("221 bye\r\n");
        } else socket.write("250 ok\r\n");
      }
    });
  });
  await new Promise<void>((resolve) => smtp.listen(0, "127.0.0.1", resolve));
  const address = smtp.address();
  assert(address && typeof address === "object");
  Object.assign(process.env, {
    SMTP_HOST: "127.0.0.1",
    SMTP_PORT: String(address.port),
    MAIL_FROM: "Finora <noreply@finora.test>",
    PUBLIC_URL: "http://localhost:5173",
  });
  app = await createApp();
  await app.listen(0, "127.0.0.1");
  url = await app.getUrl();
  db = app.get(Database);
  await a.register();
  await b.register();
  const w = await a.request<{ id: string }>("/wallets", "POST", {
    name: "Tiền mặt",
    kind: "CASH",
    openingBalance: "10000000",
    color: "#6840c6",
  });
  wallet = w.data.id;
  const cats = await a.request<{ id: string; icon: string }[]>("/categories");
  food = cats.data.find((c) => c.icon === "food")!.id;
  salary = cats.data.find((c) => c.icon === "salary")!.id;
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
  if (smtp) await new Promise<void>((resolve) => smtp.close(() => resolve()));
});
test("transaction request replay and concurrent retry write once; altered body conflicts; key is account scoped", async () => {
  const key = randomUUID();
  const responses = await Promise.all([
    a.request<{ id: string }>("/transactions", "POST", tx(), key),
    a.request<{ id: string }>("/transactions", "POST", tx(), key),
  ]);
  assert.equal(responses[0].status, 201);
  assert.equal(responses[0].data.id, responses[1].data.id);
  assert.equal(
    (await a.request("/transactions", "POST", tx({ amount: "1" }), key)).status,
    409,
  );
  assert.equal(
    (await b.request("/transactions", "POST", tx(), key)).status,
    404,
  );
  assert.equal(await db.transaction.count({ where: { userId: a.id } }), 1);
});
test("historical budget suggestion includes empty months; history retains plans and compares live actual", async () => {
  await a.request(
    "/transactions",
    "POST",
    tx({
      kind: "INCOME",
      categoryId: salary,
      amount: "30000001",
      occurredAt: "2026-01-15T12:00:00+07:00",
    }),
  );
  const s = await a.request<{
    income: string;
    savings: string;
    hasIncome: boolean;
  }>("/budget-plans/suggestion?month=2026-03");
  assert.equal(s.data.income, "10000000");
  assert.equal(s.data.savings, "2000000");
  assert(s.data.hasIncome);
  const payload = {
    month: "2026-02",
    income: "1000000",
    savings: "100000",
    mode: "AUTO",
    items: [{ categoryId: food, fixed: "0", weight: 1 }],
  };
  const key = randomUUID();
  const p = await a.request<{ id: string }>(
    "/budget-plans",
    "POST",
    payload,
    key,
  );
  const replay = await a.request<{ id: string }>(
    "/budget-plans",
    "POST",
    payload,
    key,
  );
  assert.equal(p.data.id, replay.data.id);
  await a.request(`/categories/${food}`, "PATCH", { archived: true });
  assert.equal(
    (await a.request<{ id: string }>("/budget-plans", "POST", payload, key))
      .data.id,
    p.data.id,
  );
  await a.request(`/categories/${food}`, "PATCH", { archived: false });
  await a.request("/budget-plans", "POST", { ...payload, savings: "200000" });
  const history = await a.request<{
    plans: { revision: number; items: { spent: string; limit: string }[] }[];
  }>("/budget-plans/history?month=2026-02");
  assert.equal(history.data.plans.length, 2);
  assert.equal(history.data.plans[0].items[0].spent, "12345");
  assert.equal(history.data.plans[1].items[0].limit, "900000");
  const foreign = await b.request<{ plans: unknown[] }>(
    "/budget-plans/history?month=2026-02",
  );
  assert.equal(foreign.data.plans.length, 0);
});
test("recurring drafts do not post until confirmation; concurrent confirmation and deletion do not repost", async () => {
  const r = await a.request<{ id: string }>("/recurring", "POST", {
    name: "Tiền nhà",
    kind: "EXPENSE",
    amount: "200000",
    walletId: wallet,
    categoryId: food,
    day: 31,
    startMonth: "2026-02",
    endMonth: "2026-02",
  });
  assert.equal(r.status, 201);
  const count = await db.transaction.count({ where: { userId: a.id } });
  const loads = await Promise.all([
    a.request<{ drafts: { id: string; dueAt: string }[] }>(
      "/recurring?month=2026-02",
    ),
    a.request<{ drafts: { id: string; dueAt: string }[] }>(
      "/recurring?month=2026-02",
    ),
  ]);
  assert.equal(loads[0].status, 200);
  assert.equal(loads[1].status, 200);
  assert.equal(loads[0].data.drafts[0].id, loads[1].data.drafts[0].id);
  const list = loads[0];
  draft = list.data.drafts[0].id;
  assert.equal(list.data.drafts[0].dueAt, "2026-02-27T17:00:00.000Z");
  assert.equal(await db.transaction.count({ where: { userId: a.id } }), count);
  assert.equal(
    (
      await b.request(`/recurring-drafts/${draft}/action`, "POST", {
        action: "CONFIRM",
      })
    ).status,
    404,
  );
  const result = await Promise.all([
    a.request<{ transactionId: string }>(
      `/recurring-drafts/${draft}/action`,
      "POST",
      { action: "CONFIRM" },
      randomUUID(),
    ),
    a.request<{ transactionId: string }>(
      `/recurring-drafts/${draft}/action`,
      "POST",
      { action: "CONFIRM" },
      randomUUID(),
    ),
  ]);
  assert.equal(result[0].status, 201);
  assert.equal(result[0].data.transactionId, result[1].data.transactionId);
  assert.equal(
    await db.transaction.count({ where: { userId: a.id } }),
    count + 1,
  );
  assert.equal(
    (
      await a.request(`/recurring-drafts/${draft}/action`, "POST", {
        action: "SKIP",
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await a.request(
        `/transactions/${result[0].data.transactionId}`,
        "DELETE",
        {},
      )
    ).status,
    200,
  );
  await a.request(`/recurring-drafts/${draft}/action`, "POST", {
    action: "CONFIRM",
  });
  assert.equal(await db.transaction.count({ where: { userId: a.id } }), count);
});
test("paused or archived references cannot confirm drafts; skips and ownership are enforced", async () => {
  const r = await a.request<{ id: string }>("/recurring", "POST", {
    name: "Nhắc lương",
    kind: "INCOME",
    amount: "10",
    walletId: wallet,
    categoryId: salary,
    day: 1,
    startMonth: "2026-02",
  });
  await a.request("/recurring?month=2026-02");
  const d = await db.recurringDraft.findUniqueOrThrow({
    where: { ruleId_month: { ruleId: r.data.id, month: "2026-02" } },
  });
  assert.equal(
    (await b.request(`/recurring/${r.data.id}`, "PATCH", { active: false }))
      .status,
    404,
  );
  await a.request(`/recurring/${r.data.id}`, "PATCH", { active: false });
  assert.equal(
    (
      await a.request(`/recurring-drafts/${d.id}/action`, "POST", {
        action: "CONFIRM",
      })
    ).status,
    400,
  );
  await a.request(`/recurring/${r.data.id}`, "PATCH", { active: true });
  await a.request(`/categories/${salary}`, "PATCH", { archived: true });
  assert.equal(
    (
      await a.request(`/recurring-drafts/${d.id}/action`, "POST", {
        action: "CONFIRM",
      })
    ).status,
    400,
  );
  await a.request(`/categories/${salary}`, "PATCH", { archived: false });
  assert.equal(
    (
      await a.request(`/recurring-drafts/${d.id}/action`, "POST", {
        action: "SKIP",
      })
    ).status,
    201,
  );
});
test("goal allocation is real earmarking, conserves ledger and disallows overspending, overwithdrawal, foreign access", async () => {
  const g = await a.request<{ id: string }>("/goals", "POST", {
    name: "Laptop",
    target: "2000000",
    targetDate: "2027-12-31T23:59:59+07:00",
  });
  goal = g.data.id;
  const before = await db.transaction.count({ where: { userId: a.id } });
  const payload = { action: "ADD", walletId: wallet, amount: "1500000" };
  const key = randomUUID();
  const added = await a.request<{ id: string }>(
    `/goals/${goal}/contributions`,
    "POST",
    payload,
    key,
  );
  assert.equal(added.status, 201);
  assert.equal(
    (
      await a.request<{ id: string }>(
        `/goals/${goal}/contributions`,
        "POST",
        payload,
        key,
      )
    ).data.id,
    added.data.id,
  );
  assert.equal(
    (await b.request(`/goals/${goal}/contributions`, "POST", payload)).status,
    404,
  );
  assert.equal(
    (
      await a.request(`/goals/${goal}/contributions`, "POST", {
        ...payload,
        amount: "9999999999999",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a.request(`/goals/${goal}/contributions`, "POST", {
        ...payload,
        action: "WITHDRAW",
        amount: "1500001",
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await a.request(`/goals/${goal}/contributions`, "POST", {
        ...payload,
        action: "WITHDRAW",
        amount: "500000",
      })
    ).status,
    201,
  );
  const goals = await a.request<{ saved: string }[]>("/goals");
  assert.equal(goals.data[0].saved, "1000000");
  assert.equal(await db.transaction.count({ where: { userId: a.id } }), before);
});
test("CSV preview validates line errors, quoted Unicode and duplicates; commit is atomic and repeat-safe", async () => {
  const header =
    "occurredAt,kind,category,wallet,destinationWallet,amount,note\r\n";
  const row =
    '2026-02-12T12:00:00+07:00,EXPENSE,Ăn uống,Tiền mặt,,50000,"Cà phê, cùng bạn"';
  const csv = header + row + "\r\n" + row;
  const preview = await a.request<{
    valid: number;
    duplicates: number;
    errors: number;
  }>("/transactions/import/preview", "POST", { csv });
  assert.equal(preview.status, 201);
  assert.deepEqual(
    [preview.data.valid, preview.data.duplicates, preview.data.errors],
    [1, 1, 0],
  );
  const invalid = csv + "\r\n2026-02-13,EXPENSE,Ăn uống,Ví không có,,50,Sai ví";
  const count = await db.transaction.count({ where: { userId: a.id } });
  assert.equal(
    (await a.request("/transactions/import", "POST", { csv: invalid })).status,
    400,
  );
  assert.equal(await db.transaction.count({ where: { userId: a.id } }), count);
  const imports = await Promise.all([
    a.request<{ imported: number }>("/transactions/import", "POST", { csv }),
    a.request<{ imported: number }>("/transactions/import", "POST", { csv }),
  ]);
  assert.equal(imports[0].data.imported + imports[1].data.imported, 1);
  assert.equal(
    (
      await b.request<{ errors: number }>(
        "/transactions/import/preview",
        "POST",
        { csv },
      )
    ).data.errors,
    2,
  );
  assert.equal(
    (
      await a.request("/transactions/import/preview", "POST", {
        csv: "bad,header\n1,2",
      })
    ).status,
    400,
  );
});
test("monthly comparison and PDF match exact account data and exclude transfers/reserves", async () => {
  const r = await a.request<{
    income: string;
    expense: string;
    comparison: { income: string; incomeDelta: string; expenseDelta: string };
  }>("/reports/summary?month=2026-02");
  assert.equal(r.data.income, "0");
  assert.equal(r.data.expense, "62345");
  assert.equal(r.data.comparison.income, "30000001");
  assert.equal(r.data.comparison.incomeDelta, "-30000001");
  assert.equal(r.data.comparison.expenseDelta, "62345");
  const pdf = await fetch(url + "/api/reports/pdf?month=2026-02", {
    headers: { Cookie: a.cookie },
  });
  assert.equal(pdf.status, 200);
  assert.match(pdf.headers.get("content-type")!, /pdf/);
  const bytes = Buffer.from(await pdf.arrayBuffer());
  assert.equal(bytes.subarray(0, 5).toString(), "%PDF-");
  assert(bytes.length > 10000);
});
test("email recovery sends generic response, stores hash, expires, consumes once and revokes all sessions", async () => {
  const c = new Client();
  await c.request("/auth/login", "POST", {
    email: a.email,
    password: "initial-password123",
  });
  const known = await new Client().request("/auth/forgot-password", "POST", {
    email: a.email,
  });
  const unknown = await new Client().request("/auth/forgot-password", "POST", {
    email: "unknown@finora.test",
  });
  assert.equal(known.status, 201);
  assert.deepEqual(known.data, unknown.data);
  for (let i = 0; i < 60 && !mails.length; i++) await delay(50);
  assert.equal(mails.length, 1);
  const decoded = mails[0]
    .replace(/=\r\n/g, "")
    .replace(/=([a-f0-9]{2})/gi, (_m, hex) =>
      String.fromCharCode(parseInt(hex, 16)),
    );
  const token = decoded.match(/token=([a-f0-9]{64})/)?.[1];
  assert(token);
  const stored = await db.passwordReset.findFirstOrThrow({
    where: { userId: a.id },
  });
  assert.equal(stored.id, createHash("sha256").update(token).digest("hex"));
  assert.notEqual(stored.id, token);
  await db.passwordReset.update({
    where: { id: stored.id },
    data: { expiresAt: new Date(Date.now() - 1) },
  });
  assert.equal(
    (
      await new Client().request("/auth/reset-password", "POST", {
        token,
        password: "new-password123",
      })
    ).status,
    400,
  );
  await db.passwordReset.update({
    where: { id: stored.id },
    data: { expiresAt: new Date(Date.now() + 60000) },
  });
  const results = await Promise.all([
    new Client().request("/auth/reset-password", "POST", {
      token,
      password: "new-password123",
    }),
    new Client().request("/auth/reset-password", "POST", {
      token,
      password: "new-password123",
    }),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 400]);
  assert.equal((await a.request("/auth/me")).status, 401);
  assert.equal((await c.request("/auth/me")).status, 401);
  assert.equal(
    (
      await a.request("/auth/login", "POST", {
        email: a.email,
        password: "new-password123",
      })
    ).status,
    201,
  );
});

test("wallet opening balances are not duplicated by repeated creation requests", async () => {
  const payload = {
      name: "Ví phụ",
      kind: "CASH",
      openingBalance: "0",
      color: "#6840c6",
    },
    key = randomUUID();
  const results = await Promise.all([
    a.request<{ id: string }>("/wallets", "POST", payload, key),
    a.request<{ id: string }>("/wallets", "POST", payload, key),
  ]);
  assert.equal(results[0].status, 201);
  assert.equal(results[0].data.id, results[1].data.id);
});
test("concurrent goal allocations cannot reserve the same available money twice", async () => {
  const g = await a.request<{ id: string }>("/goals", "POST", {
    name: "Quỹ lớn",
    target: "50000000",
    targetDate: "2028-12-31T23:59:59+07:00",
  });
  const payload = { action: "ADD", walletId: wallet, amount: "25000000" };
  const results = await Promise.all([
    a.request(
      `/goals/${g.data.id}/contributions`,
      "POST",
      payload,
      randomUUID(),
    ),
    a.request(
      `/goals/${g.data.id}/contributions`,
      "POST",
      payload,
      randomUUID(),
    ),
  ]);
  assert.deepEqual(results.map((r) => r.status).sort(), [201, 400]);
});

test("changing the current password invalidates outstanding reset links", async () => {
  const id = createHash("sha256").update("c".repeat(64)).digest("hex");
  await db.passwordReset.create({
    data: { id, userId: a.id, expiresAt: new Date(Date.now() + 60000) },
  });
  assert.equal(
    (
      await a.request("/auth/password", "POST", {
        currentPassword: "new-password123",
        newPassword: "new-password123",
      })
    ).status,
    201,
  );
  assert.equal(await db.passwordReset.count({ where: { userId: a.id } }), 0);
});

test("current CSV export/import roundtrip preserves formula-like and literal apostrophe notes", async () => {
  for (const note of ["=SUM(1,1)", "'=literal", "+55"]) {
    assert.equal(
      (
        await a.request(
          "/transactions",
          "POST",
          tx({ note, amount: "1", occurredAt: "2026-04-01T12:00:00+07:00" }),
        )
      ).status,
      201,
    );
  }
  const exported = await fetch(url + "/api/transactions/export?month=2026-04", {
    headers: { Cookie: a.cookie },
  });
  assert.equal(exported.status, 200);
  const result = await a.request<{
    valid: number;
    duplicates: number;
    errors: number;
  }>("/transactions/import/preview", "POST", { csv: await exported.text() });
  assert.equal(result.status, 201);
  assert.deepEqual(
    [result.data.valid, result.data.duplicates, result.data.errors],
    [0, 3, 0],
  );
});

test(
  "concurrent independent ledger writes validate on the held connection without starving the pool",
  { timeout: 15000 },
  async () => {
    const results = await Promise.all(
      Array.from({ length: 12 }, (_, i) =>
        a.request(
          "/transactions",
          "POST",
          tx({
            amount: String(i + 1),
            note: `Pool concurrency ${i}`,
            occurredAt: "2026-05-01T12:00:00+07:00",
          }),
          randomUUID(),
        ),
      ),
    );
    assert(
      results.every((r) => r.status === 201),
      results.map((r) => r.status).join(","),
    );
    assert.equal(
      await db.transaction.count({
        where: { userId: a.id, note: { startsWith: "Pool concurrency " } },
      }),
      12,
    );
  },
);
