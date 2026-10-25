import { test } from "node:test";
import assert from "node:assert/strict";
import { allocateBudget, monthOffset, monthRange } from "../src/budget";
test("automatic budget preserves every VND after fixed expenses and savings", () => {
  const items = [
    { categoryId: "home", fixed: "5000000", weight: 0 },
    { categoryId: "food", fixed: "0", weight: 40 },
    { categoryId: "travel", fixed: "0", weight: 20 },
    { categoryId: "shopping", fixed: "0", weight: 15 },
    { categoryId: "fun", fixed: "0", weight: 15 },
    { categoryId: "other", fixed: "0", weight: 10 },
  ];
  const result = allocateBudget(15000000n, 3000000n, items);
  assert.equal(
    result.reduce((s, i) => s + i.limit, 3000000n),
    15000000n,
  );
  assert.equal(result[1].limit, 2800000n);
  assert.equal(result[0].limit, 5000000n);
});
test("largest remainder rounding is exact and deterministic", () => {
  const result = allocateBudget(
    100n,
    0n,
    ["a", "b", "c"].map((categoryId) => ({
      categoryId,
      fixed: "0",
      weight: 1,
    })),
  );
  assert.deepEqual(
    result.map((i) => i.limit),
    [34n, 33n, 33n],
  );
});
test("insufficient funds and missing priorities are rejected", () => {
  assert.throws(
    () =>
      allocateBudget(100n, 50n, [{ categoryId: "a", fixed: "60", weight: 1 }]),
    /thiếu 10/,
  );
  assert.throws(
    () =>
      allocateBudget(100n, 0n, [{ categoryId: "a", fixed: "0", weight: 0 }]),
    /trọng số/,
  );
});
test("a zero-flexible budget does not require positive weights", () => {
  assert.equal(
    allocateBudget(100n, 20n, [{ categoryId: "a", fixed: "80", weight: 0 }])[0]
      .limit,
    80n,
  );
});
test("manual allocations may leave money unallocated but cannot exceed funds", () => {
  assert.equal(
    allocateBudget(
      100n,
      10n,
      [{ categoryId: "a", fixed: "0", weight: 0, limit: "70" }],
      "MANUAL",
    )[0].limit,
    70n,
  );
  assert.throws(
    () =>
      allocateBudget(
        100n,
        10n,
        [{ categoryId: "a", fixed: "0", weight: 0, limit: "91" }],
        "MANUAL",
      ),
    /vượt/,
  );
});
test("duplicate categories and negative allocations cannot pass", () => {
  assert.throws(
    () =>
      allocateBudget(100n, 0n, [
        { categoryId: "a", fixed: "0", weight: 1 },
        { categoryId: "a", fixed: "0", weight: 1 },
      ]),
    /trùng/,
  );
  assert.throws(
    () =>
      allocateBudget(100n, 0n, [{ categoryId: "a", fixed: "-1", weight: 1 }]),
    /không âm/,
  );
});
test("large allocations preserve precision", () => {
  const result = allocateBudget(9999999999999n, 3333333333333n, [
    { categoryId: "a", fixed: "1", weight: 7 },
    { categoryId: "b", fixed: "3", weight: 11 },
  ]);
  assert.equal(
    result.reduce((s, i) => s + i.limit, 3333333333333n),
    9999999999999n,
  );
});
test("report month boundaries follow Vietnam time, including leap years", () => {
  assert.equal(
    monthRange("2024-02").gte.toISOString(),
    "2024-01-31T17:00:00.000Z",
  );
  assert.equal(
    monthRange("2024-02").lt.toISOString(),
    "2024-02-29T17:00:00.000Z",
  );
  assert.equal(monthOffset("2026-01", -1), "2025-12");
});
