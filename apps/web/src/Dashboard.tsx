import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Leaf,
  Plus,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import {
  Button,
  Empty,
  Progress,
  SectionLink,
  TransactionTable,
} from "./components";
import { MoneyOrbit } from "./Experience";
import { FlowChart, SpendingChart } from "./shared/Charts";
import { money, monthLabel, type Summary, type Transaction } from "./types";

export default function Dashboard({
  summary,
  userName,
  hidden,
  setHidden,
  onAdd,
  onBudget,
  onPage,
  onEdit,
  onDelete,
}: {
  summary: Summary;
  userName: string;
  hidden: boolean;
  setHidden: (value: boolean) => void;
  onAdd: () => void;
  onBudget: () => void;
  onPage: (page: string) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
}) {
  const s = summary;
  const income = Number(s.income),
    expense = Number(s.expense),
    net = income - expense;
  const savingsRate =
    income > 0 ? Math.max(0, Math.round((net / income) * 100)) : 0;
  const display = (v: string) => (hidden ? "••••••••" : money(v));
  const budgetTotal =
    s.budget?.items.reduce((sum, i) => sum + Number(i.limit), 0) || 0;
  const budgetSpent =
    s.budget?.items.reduce((sum, i) => sum + Number(i.spent), 0) || 0;
  return (
    <>
      <div className="page-heading dashboard-hero">
        <div>
          <div className="greeting">
            MAKE MONEY MOVES <span>✦</span>
          </div>
          <h1>
            Chào {userName.split(" ").slice(-2).join(" ")}, ngày mới tốt lành{" "}
            <span className="wave">☀</span>
          </h1>
          <p>Quản lý tiền gọn gàng. Dành chỗ cho những điều bạn thích.</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={18} />
          Thêm giao dịch
        </Button>
        <MoneyOrbit />
      </div>
      <div className="section-row overview-label">
        <h2>Tài chính trong tầm tay</h2>
        <span className="live-label">
          <i /> Bức tranh của bạn, cập nhật mỗi ngày
        </span>
      </div>
      <div className="stat-grid">
        <motion.section
          className="stat-card balance-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="stat-top">
            <span>Tổng số dư hiện tại</span>
            <button
              aria-label={hidden ? "Hiện số dư" : "Ẩn số dư"}
              onClick={() => setHidden(!hidden)}
            >
              {hidden ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <strong className="stat-value">{display(s.balance)}</strong>
          <div className="stat-footer">
            <span className="stat-chip">
              <Wallet size={13} />
              {s.wallets.length} ví tài chính
            </span>
            <span className="balance-decoration">
              <TrendingUp size={45} />
            </span>
          </div>
        </motion.section>
        <motion.section
          className="stat-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
        >
          <div className="stat-top">
            <span>Thu nhập tháng này</span>
            <span className="stat-icon green">
              <ArrowDownLeft size={18} />
            </span>
          </div>
          <strong className="stat-value">{display(s.income)}</strong>
          <div className="stat-footer">
            <span className="positive small">
              <span className="status-dot" />
              Tiền đã nhận trong kỳ
            </span>
            <span className="mini-spark green-spark">▁▂▂▄▃▆▅█</span>
          </div>
        </motion.section>
        <motion.section
          className="stat-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <div className="stat-top">
            <span>Chi tiêu tháng này</span>
            <span className="stat-icon orange">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <strong className="stat-value">{display(s.expense)}</strong>
          <div className="stat-footer">
            <span className="muted small">
              {s.transactionCount} giao dịch trong kỳ
            </span>
            <span className="mini-spark orange-spark">▃▂▄▃▅▄▆▅</span>
          </div>
        </motion.section>
        <motion.section
          className="stat-card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <div className="stat-top">
            <span>Chênh lệch thu − chi</span>
            <span className="stat-icon purple">
              <Leaf size={18} />
            </span>
          </div>
          <strong className="stat-value">{display(s.net)}</strong>
          <div className="stat-footer">
            <span className={net >= 0 ? "positive small" : "danger-text small"}>
              {income > 0
                ? `${savingsRate}% thu nhập còn lại`
                : "Chưa có thu nhập trong kỳ"}
            </span>
            <span className="mini-spark purple-spark">▁▂▃▂▄▅▆█</span>
          </div>
        </motion.section>
      </div>
      <div className="dashboard-main">
        <section className="panel flow-panel">
          <div className="panel-heading">
            <div>
              <h2>Dòng tiền của bạn</h2>
              <p>Nhìn lại hành trình, vững bước phía trước</p>
            </div>
            <span className="period-badge">6 tháng gần nhất</span>
          </div>
          <div className="chart-legend">
            <span>
              <i className="green-dot" />
              Thu nhập
            </span>
            <span>
              <i className="orange-dot" />
              Chi tiêu
            </span>
          </div>
          <FlowChart data={s.history} />
        </section>
        <section className="panel spending-panel">
          <div className="panel-heading">
            <div>
              <h2>Bạn đã chi vào đâu?</h2>
              <p>{monthLabel(s.month)}</p>
            </div>
            <button
              className="icon-button"
              aria-label="Xem báo cáo chi tiết"
              onClick={() => onPage("reports")}
            >
              <ArrowUpRight size={19} />
            </button>
          </div>
          <SpendingChart data={s.spending} total={s.expense} />
        </section>
      </div>
      <div className="dashboard-bottom">
        <section className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <h2>Giao dịch gần đây</h2>
              <p>Những chuyển động nhỏ trong ngày</p>
            </div>
            <SectionLink onClick={() => onPage("transactions")}>
              Xem tất cả
            </SectionLink>
          </div>
          {s.recent.length ? (
            <TransactionTable
              items={s.recent}
              onEdit={onEdit}
              onDelete={onDelete}
              brief
            />
          ) : (
            <Empty
              title="Bắt đầu từ giao dịch đầu tiên"
              description="Một thói quen nhỏ để hiểu rõ tài chính hơn."
              action={
                <Button secondary onClick={onAdd}>
                  <Plus size={16} />
                  Thêm giao dịch
                </Button>
              }
            />
          )}
        </section>
        <div className="right-stack">
          <section className="panel budget-overview">
            <div className="panel-heading">
              <h2>Ngân sách tháng này</h2>
              <span className="tiny-icon">
                <Wallet size={17} />
              </span>
            </div>
            {s.budget ? (
              <>
                <div className="budget-total">
                  <strong>{money(budgetSpent)}</strong>
                  <span>/ {money(budgetTotal)}</span>
                </div>
                <Progress
                  value={
                    budgetTotal
                      ? (budgetSpent / budgetTotal) * 100
                      : budgetSpent
                        ? 100
                        : 0
                  }
                  color={budgetSpent > budgetTotal ? "#c56d58" : "#6c987a"}
                />
                <div className="budget-caption">
                  <span>
                    {budgetSpent <= budgetTotal
                      ? "Bạn đang đi đúng hướng"
                      : "Cần xem lại kế hoạch"}
                  </span>
                  <strong>
                    {budgetTotal
                      ? Math.round((budgetSpent / budgetTotal) * 100)
                      : 0}
                    %
                  </strong>
                </div>
                <SectionLink onClick={() => onPage("budgets")}>
                  Theo dõi ngân sách
                </SectionLink>
              </>
            ) : (
              <>
                <p className="muted">
                  Một kế hoạch nhỏ giúp bạn chủ động hơn mỗi ngày.
                </p>
                <Button secondary onClick={onBudget}>
                  <Sparkles size={16} />
                  Lập ngân sách
                </Button>
              </>
            )}
          </section>
          <section className="insight-card">
            <span className="insight-icon">
              <Sparkles size={20} />
            </span>
            <span className="eyebrow">MỘT CHÚT CẢM HỨNG</span>
            <h3>
              Để tiền có một
              <br />
              kế hoạch riêng.
            </h3>
            <p>
              Phân bổ ngân sách phù hợp với ưu tiên và những dự định của bạn.
            </p>
            <button onClick={onBudget}>
              Khám phá ngay
              <ArrowRight size={17} />
            </button>
            <div className="insight-art">
              <i />
              <i />
              <i />
              <Leaf size={50} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
