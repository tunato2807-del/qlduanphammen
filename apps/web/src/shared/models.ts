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
