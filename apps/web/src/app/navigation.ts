import {
  ArrowUpRight,
  ChartNoAxesCombined,
  FolderOpen,
  LayoutDashboard,
  Wallet as WalletIcon,
} from "lucide-react";
export const navigation = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "transactions", label: "Giao dịch", icon: ArrowUpRight },
  { id: "wallets", label: "Ví của tôi", icon: WalletIcon },
  { id: "budgets", label: "Ngân sách", icon: ChartNoAxesCombined },
  { id: "reports", label: "Báo cáo", icon: FolderOpen },
];
