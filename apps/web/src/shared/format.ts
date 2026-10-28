export const today = () =>
  new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Ho_Chi_Minh" }).format(
    new Date(),
  );
export const money = (value: string | number | bigint) =>
  new Intl.NumberFormat("vi-VN").format(
    typeof value === "string" ? BigInt(value || "0") : value,
  ) + " ₫";
export const compact = (value: number) =>
  Math.abs(value) >= 1000000
    ? (value / 1000000).toLocaleString("vi-VN", { maximumFractionDigits: 1 }) +
      "tr"
    : Math.abs(value) >= 1000
      ? (value / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 0 }) +
        "k"
      : String(value);
export const monthLabel = (month: string) =>
  `Tháng ${Number(month.slice(5))}, ${month.slice(0, 4)}`;
export const dateLabel = (date: string) =>
  new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(date));
