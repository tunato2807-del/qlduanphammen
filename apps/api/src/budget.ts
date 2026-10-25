export type AllocationInput = {
  categoryId: string;
  fixed: string;
  weight: number;
  limit?: string;
};
export function allocateBudget(
  income: bigint,
  savings: bigint,
  items: AllocationInput[],
  mode = "AUTO",
) {
  if (income < 0n || savings < 0n || items.length === 0)
    throw new Error("Vui lòng nhập nguồn tiền và ít nhất một danh mục.");
  if (new Set(items.map((i) => i.categoryId)).size !== items.length)
    throw new Error("Danh mục ngân sách không được trùng nhau.");
  const fixed = items.reduce((s, i) => s + BigInt(i.fixed), 0n);
  if (
    items.some(
      (i) =>
        BigInt(i.fixed) < 0n || !Number.isInteger(i.weight) || i.weight < 0,
    )
  )
    throw new Error("Khoản bắt buộc và trọng số phải không âm.");
  if (mode === "MANUAL") {
    const result = items.map((i) => ({ ...i, limit: BigInt(i.limit ?? "0") }));
    if (result.some((i) => i.limit < 0n))
      throw new Error("Hạn mức phải không âm.");
    if (result.reduce((s, i) => s + i.limit, savings) > income)
      throw new Error("Tổng ngân sách và tiết kiệm vượt thu nhập dự kiến.");
    return result;
  }
  const remaining = income - fixed - savings;
  if (remaining < 0n)
    throw new Error(
      `Nguồn tiền thiếu ${(-remaining).toLocaleString("vi-VN")} ₫. Hãy giảm chi bắt buộc hoặc tiết kiệm.`,
    );
  const weight = BigInt(items.reduce((s, i) => s + i.weight, 0));
  if (remaining > 0n && weight === 0n)
    throw new Error("Cần ít nhất một danh mục có trọng số lớn hơn 0.");
  const result = items.map((i, index) => {
    const numerator = remaining * BigInt(i.weight);
    return {
      ...i,
      index,
      limit: BigInt(i.fixed) + (weight ? numerator / weight : 0n),
      remainder: weight ? numerator % weight : 0n,
    };
  });
  let residue = income - savings - result.reduce((s, i) => s + i.limit, 0n);
  const ranked = [...result].sort((a, b) =>
    a.remainder === b.remainder
      ? a.index - b.index
      : a.remainder > b.remainder
        ? -1
        : 1,
  );
  for (const item of ranked) {
    if (residue <= 0n) break;
    item.limit += 1n;
    residue--;
  }
  return result.map(({ index: _i, remainder: _r, ...i }) => i);
}
export function currentMonth() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
  })
    .format(new Date())
    .replace("/", "-");
}
export function monthRange(month: string) {
  const [year, m] = month.split("-").map(Number);
  return {
    gte: new Date(`${month}-01T00:00:00+07:00`),
    lt: new Date(Date.UTC(year, m, 1) - 7 * 3600000),
  };
}
export function monthOffset(month: string, delta: number) {
  const [year, m] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, m - 1 + delta, 1));
  return date.toISOString().slice(0, 7);
}
