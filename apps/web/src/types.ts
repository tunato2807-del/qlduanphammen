export type User = { id: string; name: string; email: string };
export type Wallet = {
  id: string;
  name: string;
  kind: string;
  openingBalance: string;
  balance: string;
  color: string;
  archived: boolean;
};
export type Category = {
  id: string;
  name: string;
  kind: string;
  color: string;
  icon: string;
  archived: boolean;
};
export type Transaction = {
  id: string;
  kind: string;
  amount: string;
  walletId: string;
  destinationWalletId: string | null;
  categoryId: string | null;
  note: string;
  occurredAt: string;
  category: Category | null;
  wallet: Wallet;
  destinationWallet: Wallet | null;
};
export type BudgetItem = {
  categoryId: string;
  fixed: string;
  weight: number;
  limit: string;
  spent: string;
  category: Category;
};
export type Budget = {
  id: string;
  month: string;
  income: string;
  savings: string;
  mode: string;
  revision: number;
  items: BudgetItem[];
};
export type Summary = {
  month: string;
  balance: string;
  income: string;
  expense: string;
  net: string;
  wallets: Wallet[];
  history: { month: string; income: string; expense: string }[];
  spending: {
    id: string;
    name: string;
    color: string;
    icon: string;
    amount: string;
  }[];
  budget: Budget | null;
  recent: Transaction[];
  transactionCount: number;
};
export type TransactionPage = {
  items: Transaction[];
  total: number;
  page: number;
  pages: number;
};
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
export async function api<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch("/api" + path, {
    ...options,
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  if (!response.ok) {
    const data = await response
      .json()
      .catch(() => ({ message: "Không kết nối được máy chủ." }));
    if (response.status === 401 && path !== "/auth/me")
      window.dispatchEvent(new Event("session-expired"));
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(", ")
        : data.message || "Thao tác chưa thành công.",
    );
  }
  return response.json();
}
