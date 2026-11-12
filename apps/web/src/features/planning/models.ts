export type Rule = {
  id: string;
  name: string;
  kind: string;
  amount: string;
  walletId: string;
  categoryId: string;
  note: string;
  day: number;
  startMonth: string;
  endMonth: string | null;
  active: boolean;
  wallet: { name: string };
  category: { name: string };
};
export type Draft = {
  id: string;
  state: string;
  dueAt: string;
  transactionId: string | null;
  rule: Rule;
};
export type Contribution = {
  id: string;
  amount: string;
  note: string;
  createdAt: string;
  walletId: string;
  wallet: { name: string };
};
export type Goal = {
  id: string;
  name: string;
  target: string;
  targetDate: string;
  saved: string;
  monthlyNeeded: string;
  overdue: boolean;
  archived: boolean;
  contributions: Contribution[];
};
export type PlanningData = { rules: Rule[]; drafts: Draft[]; goals: Goal[] };
