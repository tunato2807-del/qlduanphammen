import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRight,
  Eye,
  EyeOff,
  Plus,
  Sparkles,
  Wallet,
  Target,
  CalendarClock,
  CheckCircle2,
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
  setHidden: (v: boolean) => void;
  onAdd: () => void;
  onBudget: () => void;
  onPage: (page: string) => void;
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
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
  const { reduced } = useExperience(),
    display = (v: string | bigint) => (hidden ? "••••••••" : money(v));
  const allocated =
      s.budget?.items.reduce((sum, i) => sum + BigInt(i.limit), 0n) || 0n,
    spent = s.budget?.items.reduce((sum, i) => sum + BigInt(i.spent), 0n) || 0n,
    remaining = allocated - spent;
  const usage =
    allocated > 0n ? Number((spent * 100n) / allocated) : spent > 0n ? 100 : 0;
  const hasWallet = s.wallets.some((w) => !w.archived),
    due = s.planning?.dueCount || 0;
  const next = !hasWallet
    ? {
        title: "Mọi hành trình bắt đầu bằng một chiếc ví",
        description:
          "Thêm số tiền đang có để Finora giúp bạn theo dõi từ hôm nay.",
        label: "Tạo ví đầu tiên",
        action: onAdd,
      }
    : !s.budget
      ? {
          title: "Cho tháng này một kế hoạch",
          description:
            "Bắt đầu từ thu nhập dự kiến, dành phần cho tiết kiệm và điều bạn ưu tiên.",
          label: "Thiết kế ngân sách",
          action: onBudget,
        }
      : due
        ? {
            title: `Bạn có ${due} khoản định kỳ cần xem`,
            description:
              "Kiểm tra bản nháp và xác nhận khi khoản thu/chi đã thực sự xảy ra.",
            label: "Xem kế hoạch",
            action: () => onPage("planning"),
          }
        : s.transactionCount === 0
          ? {
              title: "Một phút ghi chép, thêm một chút an tâm",
              description:
                "Ghi một khoản thu hoặc chi để bức tranh tháng này rõ ràng hơn.",
              label: "Ghi giao dịch đầu tiên",
              action: onAdd,
            }
          : {
              title: "Bạn đang làm tốt từng bước nhỏ",
              description:
                "Nhìn lại dòng tiền, dành tiền cho mục tiêu và điều chỉnh kế hoạch khi cần.",
              label: "Khám phá mục tiêu",
              action: () => onPage("planning"),
            };
  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <div className="greeting">
            HÔM NAY, BẠN MUỐN TIẾN XA HƠN MỘT CHÚT?
          </div>
          <h1>
            Chào {userName.split(" ").slice(-2).join(" ")}
            <span className="wave" aria-hidden="true">
              {" "}
              ✦
            </span>
          </h1>
          <p>Một góc nhìn rõ ràng. Một kế hoạch dành riêng cho bạn.</p>
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
            <span>
              <span className="balance-label-dot" />
              TỔNG TÀI SẢN HIỆN TẠI
            </span>
            <button
              className="icon-button"
              aria-label={hidden ? "Hiện số dư" : "Ẩn số dư"}
              onClick={() => setHidden(!hidden)}
            >
              {hidden ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>
          <strong className="balance-value">{display(s.balance)}</strong>
          <p className="balance-subtitle">Mọi nguồn tiền. Một nơi để an tâm.</p>
          <div className="balance-bottom">
            <span>
              <Wallet size={15} />
              {s.wallets.length} ví tài chính
            </span>
            <span>Số dư toàn thời gian</span>
          </div>
          <MoneyOrbit />
        </motion.section>
        <section className="plan-spotlight">
          <div className="stat-top">
            <span className="greeting">KẾ HOẠCH THÁNG NÀY</span>
            <Sparkles size={21} />
          </div>
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
                color={remaining < 0n ? "#b34845" : "#326655"}
              />
              <div className="budget-caption">
                <span>Đã dùng {usage}% hạn mức</span>
                <SectionLink onClick={() => onPage("budgets")}>
                  Xem kế hoạch
                </SectionLink>
              </div>
              <small>
                Hạn mức các danh mục của tháng · Phiên bản {s.budget.revision}
              </small>
            </>
          ) : (
            <>
              <h2>Để tiền có một kế hoạch riêng.</h2>
              <p>Điều cần thiết, điều bạn yêu và những dự định phía trước.</p>
              <Button secondary onClick={onBudget}>
                <Sparkles size={16} />
                Lập ngân sách
              </Button>
            </>
          )}
        </section>
      </div>
      <div className="stat-grid">
        {[
          {
            label: "Thu nhập trong tháng",
            value: s.income,
            caption: "Tiền đã nhận trong kỳ",
            Icon: ArrowDownLeft,
            tone: "positive",
          },
          {
            label: "Chi tiêu trong tháng",
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
          {
            label: "Đã dành cho mục tiêu",
            value: s.planning?.saved || "0",
            caption: `${s.planning?.goalCount || 0} mục tiêu đang theo đuổi`,
            Icon: Target,
            tone: "purple-text",
          },
        ].map(({ label, value, caption, Icon, tone }) => (
          <section className="stat-card" key={label}>
            <span className={`stat-icon ${tone}`}>
              <Icon size={19} />
            </span>
            <span className="stat-label">{label}</span>
            <strong className={`stat-value ${tone}`}>{display(value)}</strong>
            <small>{caption}</small>
          </section>
        ))}
      </div>
      <section className="next-step">
        <span className="next-step-icon">
          {due ? <CalendarClock size={23} /> : <CheckCircle2 size={23} />}
        </span>
        <div>
          <h2>{next.title}</h2>
          <p>{next.description}</p>
        </div>
        <Button secondary onClick={next.action}>
          {next.label}
          <ArrowRight size={16} />
        </Button>
      </section>
      <div className="dashboard-main">
        <section className="panel flow-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">NHÌN LẠI ĐỂ TIẾN XA</span>
              <h2>Dòng tiền của bạn</h2>
              <p>Sáu tháng đến {monthLabel(s.month).toLowerCase()}</p>
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
              <span className="eyebrow">CHI TIÊU THEO DANH MỤC</span>
              <h2>Điều bạn đã chọn</h2>
            </div>
            <button
              className="icon-button"
              aria-label="Xem báo cáo chi tiết"
              onClick={() => onPage("reports")}
            >
              <ArrowUpRight size={20} />
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
        <section className="panel wallet-peek">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">TIỀN ĐANG Ở ĐÂU?</span>
              <h2>Ví của bạn</h2>
            </div>
            <Wallet size={20} />
          </div>
          {s.wallets.length ? (
            s.wallets.slice(0, 4).map((w) => (
              <button
                className="wallet-peek-row"
                key={w.id}
                onClick={() => onPage("wallets")}
              >
                <span className="wallet-peek-icon" style={{ color: w.color }}>
                  <Wallet size={19} />
                </span>
                <span>
                  <strong>{w.name}</strong>
                  <small>{w.archived ? "Đã lưu trữ" : "Số dư hiện tại"}</small>
                </span>
                <b>{display(w.balance)}</b>
              </button>
            ))
          ) : (
            <p className="muted">Tạo ví đầu tiên để tập hợp các nguồn tiền.</p>
          )}
          <SectionLink onClick={() => onPage("wallets")}>
            Quản lý ví của tôi
          </SectionLink>
        </section>
      </div>
      <p className="snapshot-note">
        {s.asOf
          ? `Dữ liệu cập nhật lúc ${new Date(s.asOf).toLocaleTimeString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", hour: "2-digit", minute: "2-digit" })}. `
          : ""}
        Phần dành riêng cho mục tiêu nằm trong số dư ví, không cộng thêm vào tài
        sản.
      </p>
    </>
  );
}
