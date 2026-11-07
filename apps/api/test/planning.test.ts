import { test } from "node:test";
import assert from "node:assert/strict";
import { dueDate, fingerprint, monthlySuggestion } from "../src/planning-rules";
test("monthly due dates clamp month end in Vietnam, including leap years", () => {
  assert.equal(
    dueDate("2028-02", 31).toISOString(),
    "2028-02-28T17:00:00.000Z",
  );
  assert.equal(
    dueDate("2027-02", 31).toISOString(),
    "2027-02-27T17:00:00.000Z",
  );
  assert.equal(dueDate("2026-11", 1).toISOString(), "2026-10-31T17:00:00.000Z");
});
test("suggestion uses three completed months including zero months, exact integer money", () => {
  const result = monthlySuggestion(30000001n, [
    { categoryId: "food", amount: 300n },
    { categoryId: "home", amount: 100n },
  ]);
  assert.equal(result.income, 10000000n);
  assert.equal(result.savings, 2000000n);
  assert.deepEqual(result.weights, [
    { categoryId: "food", weight: 750 },
    { categoryId: "home", weight: 250 },
  ]);
});
test("import fingerprint ignores JSON property ordering but distinguishes source and note", () => {
  const a = {
    kind: "EXPENSE",
    amount: "10",
    walletId: "a",
    categoryId: "c",
    occurredAt: "2026-11-01T00:00:00Z",
    note: "ăn, uống",
  };
  assert.equal(
    fingerprint(a),
    fingerprint({ ...a, occurredAt: "2026-11-01T07:00:00+07:00" }),
  );
  assert.notEqual(fingerprint(a), fingerprint({ ...a, walletId: "b" }));
  assert.notEqual(fingerprint(a), fingerprint({ ...a, note: "khác" }));
});
