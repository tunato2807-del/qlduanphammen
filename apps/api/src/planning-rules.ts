import { createHash } from "node:crypto";
export function dueDate(month: string, day: number) {
  const [year, m] = month.split("-").map(Number);
  const last = new Date(Date.UTC(year, m, 0)).getUTCDate();
  return new Date(
    `${month}-${String(Math.min(day, last)).padStart(2, "0")}T00:00:00+07:00`,
  );
}
export function monthlySuggestion(
  income: bigint,
  spending: { categoryId: string; amount: bigint }[],
) {
  const average = income / 3n;
  const total = spending.reduce((s, c) => s + c.amount, 0n);
  return {
    income: average,
    savings: average / 5n,
    weights: spending.map((c) => ({
      categoryId: c.categoryId,
      weight: total ? Number((c.amount * 1000n) / total) : 0,
    })),
  };
}
export function fingerprint(t: {
  kind: string;
  amount: string | bigint;
  walletId: string;
  destinationWalletId?: string | null;
  categoryId?: string | null;
  occurredAt: string | Date;
  note?: string | null;
}) {
  return createHash("sha256")
    .update(
      JSON.stringify([
        t.kind,
        BigInt(t.amount).toString(),
        t.walletId,
        t.destinationWalletId || null,
        t.categoryId || null,
        new Date(t.occurredAt).toISOString(),
        t.note?.trim() || "",
      ]),
    )
    .digest("hex");
}
