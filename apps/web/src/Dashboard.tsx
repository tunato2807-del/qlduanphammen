import { motion } from "motion/react";
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
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Button,
  CategoryIcon,
  Empty,
  Progress,
  SectionLink,
  TransactionTable,
} from "./components";
import {
  compact,
  money,
  monthLabel,
  type Summary,
  type Transaction,
} from "./types";
export function FlowChart({ data }: { data: Summary["history"] }) {
  const chart = data.map((i) => ({
    name: `T${Number(i.month.slice(5))}`,
    income: Number(i.income),
    expense: Number(i.expense),
  }));
  return (
    <div
      className="flow-chart"
      role="img"
      aria-label="Biểu đồ thu nhập và chi tiêu trong sáu tháng"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chart}
          margin={{ top: 15, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="income-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#438167" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#438167" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expense-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8aa80" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#e8aa80" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#edf0ed"
            strokeDasharray="4 5"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#949c98", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            tickFormatter={compact}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#949c98", fontSize: 11 }}
            width={42}
          />
          <Tooltip
            formatter={(value) => money(Number(value))}
            contentStyle={{
              border: "1px solid #e8ece9",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="income"
            name="Thu nhập"
            stroke="#3c7a5e"
            strokeWidth={2.5}
            fill="url(#income-fill)"
          />
          <Area
            type="monotone"
            dataKey="expense"
            name="Chi tiêu"
            stroke="#e4a278"
            strokeWidth={2.5}
            fill="url(#expense-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function SpendingChart({
  data,
  total,
}: {
  data: Summary["spending"];
  total: string;
}) {
  if (!data.length)
    return (
      <Empty
        title="Chưa có khoản chi"
        description="Biểu đồ sẽ xuất hiện khi bạn ghi nhận chi tiêu."
      />
    );
  return (
    <div className="spending-content">
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height={185}>
          <PieChart>
            <Pie
              data={data.map((i) => ({ ...i, value: Number(i.amount) }))}
              dataKey="value"
              innerRadius={62}
              outerRadius={82}
              paddingAngle={3}
              cornerRadius={4}
              stroke="none"
            >
              {data.map((i) => (
                <Cell key={i.id} fill={i.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => money(Number(value))}
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <small>Tổng chi tiêu</small>
          <strong>
            {compact(Number(total))}
            <span> ₫</span>
          </strong>
        </div>
      </div>
      <div className="spending-legend">
        {data.slice(0, 4).map((i) => (
          <div key={i.id}>
            <span>
              <i style={{ background: i.color }} />
              {i.name}
            </span>
            <strong>
              {Number(total)
                ? Math.round((Number(i.amount) / Number(total)) * 100)
                : 0}
              %
            </strong>
          </div>
        ))}
        {data.length > 4 && (
          <small className="muted">Và {data.length - 4} danh mục khác</small>
        )}
      </div>
    </div>
  );
}
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
      <div className="page-heading">
        <div>
          <div className="greeting">
            KHÔNG GIAN TÀI CHÍNH CỦA BẠN <span>✦</span>
          </div>
          <h1>
            Chào {userName.split(" ").slice(-2).join(" ")}, ngày mới tốt lành{" "}
            <span className="wave">☀</span>
          </h1>
          <p>Cùng chăm chút cho những kế hoạch lớn, từ những điều nhỏ.</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={18} />
          Thêm giao dịch
        </Button>
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
