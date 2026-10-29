import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Eye,
  EyeOff,
  Plus,
  Sparkles,
  Wallet,
} from "lucide-react";
import { motion } from "motion/react";
import { MoneyOrbit, useExperience } from "./Experience";
import {
  Button,
  Empty,
  Progress,
  SectionLink,
  TransactionTable,
} from "./components";
import { FlowChart, SpendingChart } from "./shared/Charts";
import { money, monthLabel, type Summary, type Transaction } from "./types";

type Props = {
  summary: Summary;
  userName: string;
  hidden: boolean;
  setHidden: (value: boolean) => void;
  onAdd: () => void;
  onBudget: () => void;
  onPage: (page: string) => void;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
};
export default function Dashboard({
  summary: s,
  userName,
  hidden,
  setHidden,
  onAdd,
  onBudget,
  onPage,
  onEdit,
  onDelete,
}: Props) {
  const { reduced } = useExperience();
  const display = (value: string | bigint) =>
    hidden ? "••••••••" : money(value);
  const allocated =
    s.budget?.items.reduce((sum, item) => sum + BigInt(item.limit), 0n) ?? 0n;
  const spent =
    s.budget?.items.reduce((sum, item) => sum + BigInt(item.spent), 0n) ?? 0n;
  const remaining = allocated - spent;
  const usage =
    allocated > 0n ? Number((spent * 100n) / allocated) : spent > 0n ? 100 : 0;
  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <div className="greeting">KHÔNG GIAN TÀI CHÍNH CỦA BẠN</div>
          <h1>
            Chào {userName.split(" ").slice(-2).join(" ")}
            <span className="wave" aria-hidden="true">
              {" "}
              ✳
            </span>
          </h1>
          <p>Một chút chủ động, nhiều điều an tâm.</p>
        </div>
        <Button onClick={onAdd}>
          <Plus size={18} />
          Thêm giao dịch
        </Button>
      </div>
      <div className="overview-focus">
        <motion.section
          className="balance-spotlight"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="stat-top">
            <span>Tổng số dư hiện tại</span>
            <button
              className="icon-button"
              aria-label={hidden ? "Hiện số dư" : "Ẩn số dư"}
              onClick={() => setHidden(!hidden)}
            >
              {hidden ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <strong className="balance-value">{display(s.balance)}</strong>
          <div className="balance-bottom">
            <span>
              <Wallet size={15} /> {s.wallets.length} ví tài chính
            </span>
            <span>Số dư toàn thời gian</span>
          </div>
          <MoneyOrbit />
        </motion.section>
        <section className="plan-spotlight">
          <div className="greeting">MỖI ĐỒNG TIỀN, MỘT MỤC ĐÍCH</div>
          {s.budget ? (
            <>
              <h2>
                {remaining >= 0n ? "Còn trong ngân sách" : "Vượt ngân sách"}
              </h2>
              <strong className="plan-value">
                {display(remaining < 0n ? -remaining : remaining)}
              </strong>
              <Progress
                value={usage}
                color={remaining < 0n ? "#a73e35" : "#345d3e"}
              />
              <div className="budget-caption">
                <span>Đã dùng {usage}% hạn mức</span>
                <SectionLink onClick={() => onPage("budgets")}>
                  Xem kế hoạch
                </SectionLink>
              </div>
              <small>Chỉ tính các danh mục trong kế hoạch tháng.</small>
            </>
          ) : (
            <>
              <h2>Để tiền có một kế hoạch riêng.</h2>
              <p>Chia thu nhập cho điều cần thiết và những dự định của bạn.</p>
              <Button secondary onClick={onBudget}>
                <Sparkles size={17} />
                Lập ngân sách
              </Button>
            </>
          )}
        </section>
      </div>
      <div className="stat-grid">
        {[
          {
            label: "Thu nhập tháng này",
            value: s.income,
            caption: "Tiền đã nhận trong kỳ",
            Icon: ArrowDownLeft,
            tone: "positive",
          },
          {
            label: "Chi tiêu tháng này",
            value: s.expense,
            caption: `${s.transactionCount} giao dịch trong kỳ`,
            Icon: ArrowUpRight,
            tone: "",
          },
          {
            label: "Chênh lệch thu − chi",
            value: s.net,
            caption: "Thu thực tế trừ chi thực tế",
            Icon: ArrowRight,
            tone: BigInt(s.net) >= 0n ? "positive" : "danger-text",
          },
        ].map(({ label, value, caption, Icon, tone }) => (
          <section className="stat-card" key={label}>
            <div className="stat-top">
              <span>{label}</span>
              <Icon size={18} aria-hidden="true" />
            </div>
            <strong className={`stat-value ${tone}`}>{display(value)}</strong>
            <small>{caption}</small>
          </section>
        ))}
      </div>
      <div className="dashboard-main">
        <section className="panel flow-panel">
          <div className="panel-heading">
            <div>
              <h2>Dòng tiền của bạn</h2>
              <p>Sáu tháng kết thúc tại {monthLabel(s.month).toLowerCase()}</p>
            </div>
            <span className="period-badge">6 tháng</span>
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
    </>
  );
}
