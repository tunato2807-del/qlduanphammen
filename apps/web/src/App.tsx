import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  CreditCard,
  FolderOpen,
  House,
  LayoutDashboard,
  Leaf,
  LoaderCircle,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Wallet as WalletIcon,
  X,
} from "lucide-react";
import { MotionToggle } from "./Experience";
import Auth, { Brand } from "./Auth";
import Dashboard, { FlowChart, SpendingChart } from "./Dashboard";
import {
  Button,
  CategoryIcon,
  Empty,
  Field,
  Modal,
  Progress,
  Tip,
  Toast,
  TransactionTable,
} from "./components";
import { BudgetForm, CategoryForm, TransactionForm, WalletForm } from "./Forms";
import {
  api,
  dateLabel,
  money,
  monthLabel,
  today,
  type Category,
  type Summary,
  type Transaction,
  type TransactionPage,
  type User,
  type Wallet,
} from "./types";
const navigation = [
  { id: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { id: "transactions", label: "Giao dịch", icon: ArrowUpRight },
  { id: "wallets", label: "Ví của tôi", icon: WalletIcon },
  { id: "budgets", label: "Ngân sách", icon: ChartNoAxesCombined },
  { id: "reports", label: "Báo cáo", icon: FolderOpen },
];
export default function App() {
  const [user, setUser] = useState<User | null>(null),
    [initializing, setInitializing] = useState(true),
    [page, setPage] = useState(() => location.hash.slice(1) || "overview");
  const [month, setMonth] = useState(today().slice(0, 7)),
    [summary, setSummary] = useState<Summary | null>(null),
    [categories, setCategories] = useState<Category[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [version, setVersion] = useState(0);
  const [modal, setModal] = useState(""),
    [edit, setEdit] = useState<Transaction | undefined>(),
    [deleting, setDeleting] = useState<Transaction | null>(null),
    [walletEdit, setWalletEdit] = useState<Wallet | null>(null),
    [categoryEdit, setCategoryEdit] = useState<Category | null>(null),
    [mobile, setMobile] = useState(false),
    [notifications, setNotifications] = useState(false),
    [hidden, setHidden] = useState(false),
    [toast, setToast] = useState(""),
    [search, setSearch] = useState("");
  const [txPage, setTxPage] = useState(1),
    [kind, setKind] = useState(""),
    [txs, setTxs] = useState<TransactionPage | null>(null),
    [txLoading, setTxLoading] = useState(false),
    [txError, setTxError] = useState(""),
    [mutationLoading, setMutationLoading] = useState(false);
  const request = useRef(0);
  useEffect(() => {
    api<User>("/auth/me")
      .then(setUser)
      .catch(() => {})
      .finally(() => setInitializing(false));
    const expired = () => {
      setUser(null);
      setSummary(null);
      setCategories([]);
      setToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    };
    const hash = () =>
      setPage(
        navigation.some((n) => n.id === location.hash.slice(1)) ||
          location.hash === "#settings"
          ? location.hash.slice(1)
          : "overview",
      );
    window.addEventListener("session-expired", expired);
    window.addEventListener("hashchange", hash);
    return () => {
      window.removeEventListener("session-expired", expired);
      window.removeEventListener("hashchange", hash);
    };
  }, []);
  const navigate = (id: string) => {
    setPage(id);
    location.hash = id;
    setMobile(false);
    setNotifications(false);
  };
  const refresh = () => setVersion((v) => v + 1);
  useEffect(() => {
    if (!user) return;
    const id = ++request.current;
    setLoading(true);
    setError("");
    Promise.all([
      api<Summary>("/reports/summary?month=" + month),
      api<Category[]>("/categories"),
    ])
      .then(([s, c]) => {
        if (request.current === id) {
          setSummary(s);
          setCategories(c);
        }
      })
      .catch((e) => {
        if (request.current === id) setError(e.message);
      })
      .finally(() => {
        if (request.current === id) setLoading(false);
      });
  }, [user, month, version]);
  useEffect(() => {
    setTxPage(1);
  }, [month, search, kind]);
  useEffect(() => {
    if (!user || page !== "transactions") return;
    const controller = new AbortController();
    setTxLoading(true);
    setTxError("");
    const timer = setTimeout(() => {
      api<TransactionPage>(
        "/transactions?" +
          new URLSearchParams({ month, page: String(txPage), kind, search }),
        { signal: controller.signal },
      )
        .then((data) => {
          setTxs(data);
          if (txPage > data.pages) setTxPage(data.pages);
        })
        .catch((e) => {
          if (!controller.signal.aborted) setTxError(e.message);
        })
        .finally(() => {
          if (!controller.signal.aborted) setTxLoading(false);
        });
    }, 180);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [user, page, month, version, txPage, kind, search]);
  const closeToast = useCallback(() => setToast(""), []);
  const saved = (message: string) => {
    setModal("");
    setEdit(undefined);
    refresh();
    setToast(message);
  };
  const editTransaction = (t: Transaction) => {
    setEdit(t);
    setModal("transaction");
  };
  const addTransaction = () => {
    setEdit(undefined);
    if (!summary?.wallets.some((w) => !w.archived)) {
      setModal("wallet");
      setToast("Hãy tạo ví đầu tiên trước khi thêm giao dịch.");
    } else setModal("transaction");
  };
  const alerts =
    summary?.budget?.items.filter(
      (i) =>
        Number(i.spent) > 0 &&
        (Number(i.limit) === 0 || Number(i.spent) / Number(i.limit) >= 0.8),
    ) || [];
  if (initializing)
    return (
      <div className="boot-screen">
        <Brand />
        <LoaderCircle className="spin" size={24} />
        <span>Đang mở không gian của bạn…</span>
      </div>
    );
  if (!user)
    return (
      <>
        <Auth
          onLogin={(u) => {
            setUser(u);
            setSummary(null);
            setVersion((v) => v + 1);
          }}
        />
        <Toast message={toast} onClose={closeToast} />
      </>
    );
  const title = navigation.find((n) => n.id === page)?.label || "Cài đặt";
  return (
    <div className="app-shell">
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Đóng menu"
          onClick={() => setMobile(false)}
        />
      )}
      <aside className={`sidebar ${mobile ? "open" : ""}`}>
        <a
          className="brand-link"
          href="#overview"
          onClick={() => navigate("overview")}
          aria-label="Finora - Tổng quan"
        >
          <Brand />
        </a>
        <div className="workspace-select">
          <span className="workspace-avatar">
            <House size={17} />
          </span>
          <div>
            <strong>Tài chính cá nhân</strong>
            <small>Không gian của bạn</small>
          </div>
          <ShieldCheck size={15} />
        </div>
        <span className="nav-label">QUẢN LÝ TÀI CHÍNH</span>
        <nav>
          {navigation.map((n) => (
            <button
              key={n.id}
              className={page === n.id ? "active" : ""}
              onClick={() => navigate(n.id)}
            >
              <n.icon size={19} strokeWidth={1.7} />
              {n.label}
              {n.id === "budgets" && <span className="nav-new">MỚI</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-flower">✳</span>
            <strong>
              Thói quen nhỏ.
              <br />
              Tương lai lớn.
            </strong>
            <p>Mỗi giao dịch được ghi lại là một bước hiểu mình hơn.</p>
            <button onClick={() => setModal("help")}>
              Bắt đầu từ hôm nay
              <ArrowUpRight size={15} />
            </button>
          </div>
          <button
            className={`sidebar-setting ${page === "settings" ? "selected" : ""}`}
            onClick={() => navigate("settings")}
          >
            <Settings size={19} />
            Cài đặt
          </button>
          <button className="sidebar-setting" onClick={() => setModal("help")}>
            <CircleHelp size={19} />
            Hướng dẫn sử dụng
          </button>
          <div className="sidebar-profile">
            <span className="avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>Tài khoản cá nhân</small>
            </div>
            <button
              className="icon-button"
              aria-label="Đăng xuất"
              onClick={() => setModal("logout")}
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              onClick={() => setMobile(true)}
              aria-label="Mở menu"
            >
              <Menu size={21} />
            </button>
            <span>Không gian của tôi</span>
            <span className="breadcrumb-divider">/</span>
            <strong>{title}</strong>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={17} />
              <input
                aria-label="Tìm kiếm giao dịch"
                placeholder="Tìm một giao dịch…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  if (page !== "transactions") navigate("transactions");
                }}
              />
              <kbd>⌕</kbd>
            </label>
            <MotionToggle />
            <div className="notification-wrap">
              <button
                className="icon-button bell-button"
                aria-label="Thông báo ngân sách"
                aria-expanded={notifications}
                onClick={() => setNotifications(!notifications)}
              >
                <Bell size={20} />
                {alerts.length > 0 && <i />}
              </button>
              {notifications && (
                <div className="notification-popover">
                  <strong>Nhắc nhở ngân sách</strong>
                  <button
                    className="popover-close"
                    aria-label="Đóng thông báo"
                    onClick={() => setNotifications(false)}
                  >
                    <X size={16} />
                  </button>
                  {alerts.length ? (
                    alerts.map((i) => (
                      <button
                        className="notification-item"
                        key={i.categoryId}
                        onClick={() => navigate("budgets")}
                      >
                        <CategoryIcon
                          icon={i.category.icon}
                          color={i.category.color}
                          small
                        />
                        <span>
                          {i.category.name}
                          <small>
                            {Number(i.spent) > Number(i.limit)
                              ? "Đã vượt ngân sách"
                              : "Đã sử dụng từ 80% ngân sách"}
                          </small>
                        </span>
                      </button>
                    ))
                  ) : (
                    <p>Bạn chưa có cảnh báo ngân sách trong tháng này.</p>
                  )}
                </div>
              )}
            </div>
            <span className="topbar-line" />
            <button
              className="top-avatar"
              onClick={() => navigate("settings")}
              aria-label="Cài đặt tài khoản"
            >
              {user.name.slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="content">
          <div className="content-toolbar">
            <span className="section-kicker">
              <span className="live-dot" /> CHỦ ĐỘNG HÔM NAY, AN TÂM NGÀY MAI
            </span>
            <label className="month-picker">
              <CalendarDays size={16} />
              <span>{monthLabel(month)}</span>
              <input
                aria-label="Tháng báo cáo"
                type="month"
                value={month}
                onChange={(e) => {
                  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(e.target.value))
                    setMonth(e.target.value);
                }}
              />
              <ChevronDown size={14} />
            </label>
          </div>
          {error && (
            <div className="error-banner" role="alert">
              {error}
              <button onClick={refresh}>Thử lại</button>
            </div>
          )}
          {loading && summary && (
            <div className="refresh-indicator" role="status">
              <LoaderCircle className="spin" size={14} />
              Đang cập nhật…
            </div>
          )}
          {!summary ? (
            <div className="loading-panel">
              <LoaderCircle className="spin" size={28} />
              <p>
                {error
                  ? "Dữ liệu chưa tải được. Hãy thử lại."
                  : "Đang sắp xếp không gian tài chính của bạn…"}
              </p>
            </div>
          ) : (
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={loading ? "data-updating" : ""}
            >
              {page === "overview" && (
                <Dashboard
                  summary={summary}
                  userName={user.name}
                  hidden={hidden}
                  setHidden={setHidden}
                  onAdd={addTransaction}
                  onBudget={() => setModal("budget")}
                  onPage={navigate}
                  onEdit={editTransaction}
                  onDelete={setDeleting}
                />
              )}
              {page === "transactions" && (
                <>
                  <PageHeading
                    kicker="MỖI GIAO DỊCH, MỘT CÂU CHUYỆN"
                    title="Dòng tiền hằng ngày"
                    description="Những con số nhỏ tạo nên bức tranh lớn."
                    action={
                      <Button onClick={addTransaction}>
                        <Plus size={18} />
                        Thêm giao dịch
                      </Button>
                    }
                  />
                  <section className="panel">
                    <div className="transactions-toolbar">
                      <div className="filter-tabs">
                        {[
                          ["", "Tất cả"],
                          ["EXPENSE", "Chi tiêu"],
                          ["INCOME", "Thu nhập"],
                          ["TRANSFER", "Chuyển ví"],
                        ].map(([id, label]) => (
                          <button
                            key={id}
                            className={kind === id ? "active" : ""}
                            onClick={() => setKind(id)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <a
                        className="button secondary small-button"
                        href={
                          "/api/transactions/export?" +
                          new URLSearchParams({ month, kind, search })
                        }
                        download
                      >
                        <ArrowDownToLine size={16} />
                        Xuất CSV
                      </a>
                    </div>
                    <div className="table-search">
                      <Search size={17} />
                      <input
                        aria-label="Lọc giao dịch theo ghi chú hoặc danh mục"
                        placeholder="Tìm theo ghi chú, danh mục…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <span>
                        <SlidersHorizontal size={15} />
                        {txs?.total || 0} giao dịch
                      </span>
                    </div>
                    {txError ? (
                      <div className="form-error" role="alert">
                        {txError}
                        <button onClick={refresh}>Thử lại</button>
                      </div>
                    ) : txLoading ? (
                      <div className="loading-panel">
                        <LoaderCircle className="spin" size={24} />
                      </div>
                    ) : txs?.items.length ? (
                      <TransactionTable
                        items={txs.items}
                        onEdit={editTransaction}
                        onDelete={setDeleting}
                      />
                    ) : (
                      <Empty
                        title="Chưa tìm thấy giao dịch"
                        description={
                          search
                            ? "Thử một từ khóa khác hoặc thay đổi tháng."
                            : "Thêm một khoản thu hoặc chi để bắt đầu."
                        }
                        action={
                          <Button secondary onClick={addTransaction}>
                            <Plus size={16} />
                            Thêm giao dịch
                          </Button>
                        }
                      />
                    )}
                    <div className="pagination">
                      <span>
                        Trang {txs?.page || 1} / {txs?.pages || 1}
                      </span>
                      <div>
                        <button
                          className="icon-button"
                          aria-label="Trang trước"
                          disabled={txPage <= 1 || txLoading}
                          onClick={() => setTxPage(txPage - 1)}
                        >
                          <ArrowLeft size={17} />
                        </button>
                        <button
                          className="icon-button"
                          aria-label="Trang sau"
                          disabled={txPage >= (txs?.pages || 1) || txLoading}
                          onClick={() => setTxPage(txPage + 1)}
                        >
                          <ArrowRight size={17} />
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}
              {page === "wallets" && (
                <>
                  <PageHeading
                    kicker="MỌI NGUỒN TIỀN, MỘT NƠI DUY NHẤT"
                    title="Những chiếc ví của bạn"
                    description="Biết tiền đang ở đâu, để chủ động với mọi kế hoạch."
                    action={
                      <Button onClick={() => setModal("wallet")}>
                        <Plus size={18} />
                        Thêm ví mới
                      </Button>
                    }
                  />
                  <div className="wallet-summary">
                    <span>Tổng số dư · Tất cả các ví</span>
                    <strong>{money(summary.balance)}</strong>
                    <small>Số dư hiện tại, bao gồm cả ví đã lưu trữ.</small>
                  </div>
                  <div className="wallet-grid">
                    {summary.wallets.map((w) => (
                      <section
                        className={`wallet-card ${w.archived ? "archived" : ""}`}
                        key={w.id}
                        style={
                          { "--wallet-color": w.color } as React.CSSProperties
                        }
                      >
                        <div className="wallet-top">
                          <span className="wallet-symbol">
                            <CreditCard size={24} />
                          </span>
                          <span>
                            {w.archived
                              ? "Đã lưu trữ"
                              : (
                                  {
                                    BANK: "Ngân hàng",
                                    CASH: "Tiền mặt",
                                    EWALLET: "Ví điện tử",
                                  } as Record<string, string>
                                )[w.kind]}
                          </span>
                          <button
                            className="icon-button"
                            aria-label={`Chỉnh sửa ${w.name}`}
                            onClick={() => setWalletEdit(w)}
                          >
                            <Settings size={17} />
                          </button>
                        </div>
                        <h2>{w.name}</h2>
                        <small>SỐ DƯ HIỆN TẠI</small>
                        <strong>{money(w.balance)}</strong>
                        <div className="wallet-bottom">
                          <span>Số dư đầu: {money(w.openingBalance)}</span>
                          <ShieldCheck size={16} />
                        </div>
                        {BigInt(w.balance) < 0n && (
                          <p className="wallet-warning">
                            Số dư âm. Hãy kiểm tra các giao dịch và số dư ban
                            đầu.
                          </p>
                        )}
                      </section>
                    ))}
                    <button
                      className="add-wallet-card"
                      onClick={() => setModal("wallet")}
                    >
                      <span>
                        <Plus size={25} />
                      </span>
                      <strong>Thêm một chiếc ví</strong>
                      <small>Một góc nhỏ cho nguồn tiền của bạn</small>
                    </button>
                  </div>
                  <Tip>
                    Ví ngân hàng và ví điện tử được theo dõi bằng dữ liệu bạn
                    nhập. Chưa có kết nối trực tiếp với ngân hàng.
                  </Tip>
                </>
              )}
              {page === "budgets" && (
                <>
                  <PageHeading
                    kicker="MỖI ĐỒNG TIỀN, MỘT MỤC ĐÍCH"
                    title="Chi tiêu có kế hoạch"
                    description="Dành chỗ cho điều cần thiết và cả những điều bạn yêu."
                    action={
                      <Button onClick={() => setModal("budget")}>
                        <Sparkles size={18} />
                        {summary.budget
                          ? "Điều chỉnh ngân sách"
                          : "Lập ngân sách"}
                      </Button>
                    }
                  />
                  {summary.budget ? (
                    <>
                      <div className="budget-summary-grid">
                        <div>
                          <span>Thu nhập dự kiến</span>
                          <strong>{money(summary.budget.income)}</strong>
                        </div>
                        <div>
                          <span>Ngân sách chi tiêu</span>
                          <strong>
                            {money(
                              summary.budget.items.reduce(
                                (s, i) => s + BigInt(i.limit),
                                0n,
                              ),
                            )}
                          </strong>
                        </div>
                        <div>
                          <span>Đã chi theo danh mục</span>
                          <strong>
                            {money(
                              summary.budget.items.reduce(
                                (s, i) => s + BigInt(i.spent),
                                0n,
                              ),
                            )}
                          </strong>
                        </div>
                        <div>
                          <span>Dự trù tiết kiệm</span>
                          <strong className="positive">
                            {money(summary.budget.savings)}
                          </strong>
                        </div>
                      </div>
                      <div className="section-row">
                        <h2>Ngân sách theo danh mục</h2>
                        <span className="period-badge">
                          Phiên bản {summary.budget.revision} ·{" "}
                          {summary.budget.mode === "AUTO"
                            ? "Phân bổ tự động"
                            : "Thiết lập thủ công"}
                        </span>
                      </div>
                      <div className="budget-card-grid">
                        {summary.budget.items.map((i) => {
                          const limit = Number(i.limit),
                            spent = Number(i.spent),
                            pct = limit
                              ? (spent / limit) * 100
                              : spent
                                ? 100
                                : 0;
                          const over = spent > limit;
                          return (
                            <section
                              className="panel budget-category-card"
                              key={i.categoryId}
                            >
                              <div className="budget-category-top">
                                <CategoryIcon
                                  icon={i.category.icon}
                                  color={i.category.color}
                                />
                                <h3>{i.category.name}</h3>
                                <span
                                  className={`budget-status ${over ? "over" : pct >= 80 ? "near" : ""}`}
                                >
                                  {over
                                    ? "Vượt hạn mức"
                                    : pct >= 80
                                      ? "Gần hạn mức"
                                      : "Trong kế hoạch"}
                                </span>
                              </div>
                              <strong className="budget-spent">
                                {money(i.spent)}
                                <small> / {money(i.limit)}</small>
                              </strong>
                              <Progress
                                value={pct}
                                color={
                                  over
                                    ? "#c66c5a"
                                    : pct >= 80
                                      ? "#d3a45e"
                                      : i.category.color
                                }
                              />
                              <div className="budget-caption">
                                <span>
                                  {over
                                    ? "Vượt " + money(spent - limit)
                                    : "Còn " + money(limit - spent)}
                                </span>
                                <strong>
                                  {limit ? Math.round(pct) : spent ? "∞" : 0}%
                                </strong>
                              </div>
                            </section>
                          );
                        })}
                      </div>
                      <Tip>
                        Ngân sách là kế hoạch dựa trên thu nhập dự kiến. Dự trù
                        tiết kiệm chưa có nghĩa là bạn đã tiết kiệm thực tế.
                        Giao dịch ngoài các danh mục của kế hoạch vẫn được tính
                        trong báo cáo.
                      </Tip>
                    </>
                  ) : (
                    <section className="panel">
                      <Empty
                        title="Một kế hoạch nhỏ, một tháng an tâm"
                        description="Nhập thu nhập, chi bắt buộc và mức tiết kiệm. Finora sẽ giúp bạn chia phần còn lại theo ưu tiên."
                        action={
                          <Button onClick={() => setModal("budget")}>
                            <Sparkles size={17} />
                            Tạo ngân sách đầu tiên
                          </Button>
                        }
                      />
                    </section>
                  )}
                </>
              )}
              {page === "reports" && (
                <>
                  <PageHeading
                    kicker="HIỂU NHỮNG CON SỐ CỦA BẠN"
                    title="Bức tranh tài chính"
                    description={`Nhìn lại ${monthLabel(month).toLowerCase()} và tìm hướng đi cho tháng tới.`}
                    action={
                      <a
                        className="button secondary"
                        href={"/api/transactions/export?month=" + month}
                        download
                      >
                        <ArrowDownToLine size={17} />
                        Tải dữ liệu CSV
                      </a>
                    }
                  />
                  <div className="report-stats">
                    <section>
                      <span>Thu nhập thực tế</span>
                      <strong className="positive">
                        {money(summary.income)}
                      </strong>
                    </section>
                    <section>
                      <span>Tổng chi tiêu</span>
                      <strong>{money(summary.expense)}</strong>
                    </section>
                    <section>
                      <span>Chênh lệch thu − chi</span>
                      <strong
                        className={
                          BigInt(summary.net) >= 0n ? "positive" : "danger-text"
                        }
                      >
                        {money(summary.net)}
                      </strong>
                    </section>
                  </div>
                  <div className="dashboard-main">
                    <section className="panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Thu nhập & chi tiêu</h2>
                          <p>Sáu tháng kết thúc tại tháng được chọn</p>
                        </div>
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
                      <FlowChart data={summary.history} />
                    </section>
                    <section className="panel">
                      <div className="panel-heading">
                        <h2>Cơ cấu chi tiêu</h2>
                      </div>
                      <SpendingChart
                        data={summary.spending}
                        total={summary.expense}
                      />
                    </section>
                  </div>
                  <section className="panel report-breakdown">
                    <div className="panel-heading">
                      <h2>Chi tiết theo danh mục</h2>
                      <span className="muted small">
                        {summary.spending.length} danh mục phát sinh
                      </span>
                    </div>
                    {summary.spending.length ? (
                      summary.spending.map((c) => (
                        <div className="report-category" key={c.id}>
                          <CategoryIcon icon={c.icon} color={c.color} />
                          <strong>{c.name}</strong>
                          <div>
                            <Progress
                              value={
                                Number(summary.expense)
                                  ? (Number(c.amount) /
                                      Number(summary.expense)) *
                                    100
                                  : 0
                              }
                              color={c.color}
                            />
                          </div>
                          <span>{money(c.amount)}</span>
                        </div>
                      ))
                    ) : (
                      <Empty
                        title="Chưa có dữ liệu chi tiêu"
                        description="Báo cáo sẽ cập nhật khi bạn ghi nhận khoản chi."
                      />
                    )}
                  </section>
                </>
              )}
              {page === "settings" && (
                <>
                  <PageHeading
                    kicker="THIẾT KẾ KHÔNG GIAN CỦA BẠN"
                    title="Cài đặt cá nhân"
                    description="Những điều nhỏ giúp Finora phù hợp với bạn hơn."
                  />
                  <div className="settings-grid">
                    <section className="panel settings-panel">
                      <h2>Tài khoản & bảo mật</h2>
                      <div className="profile-detail">
                        <span className="avatar">{user.name.slice(0, 1)}</span>
                        <div>
                          <strong>{user.name}</strong>
                          <small>{user.email}</small>
                        </div>
                      </div>
                      <Field label="Đơn vị tiền tệ">
                        <input value="VND · Việt Nam Đồng" readOnly />
                      </Field>
                      <Field label="Múi giờ báo cáo">
                        <input value="Asia/Ho_Chi_Minh · UTC+7" readOnly />
                      </Field>
                      <Button secondary onClick={() => setModal("password")}>
                        <ShieldCheck size={16} />
                        Đổi mật khẩu
                      </Button>
                      <Tip>
                        Mỗi tài khoản có dữ liệu riêng. Các phiên đăng nhập khác
                        sẽ bị thu hồi khi bạn đổi mật khẩu.
                      </Tip>
                    </section>
                    <section className="panel settings-panel">
                      <div className="section-row">
                        <h2>Danh mục thu chi</h2>
                        <Button secondary onClick={() => setModal("category")}>
                          <Plus size={16} />
                          Thêm
                        </Button>
                      </div>
                      <div className="settings-categories">
                        {categories.map((c) => (
                          <div key={c.id}>
                            <CategoryIcon icon={c.icon} color={c.color} small />
                            <strong>{c.name}</strong>
                            <span>
                              {c.archived
                                ? "Đã lưu trữ"
                                : c.kind === "EXPENSE"
                                  ? "Chi tiêu"
                                  : "Thu nhập"}
                            </span>
                            <button
                              className="icon-button"
                              aria-label={`Chỉnh sửa danh mục ${c.name}`}
                              onClick={() => setCategoryEdit(c)}
                            >
                              <Settings size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                </>
              )}
            </motion.div>
          )}
          <footer className="main-footer">
            <span>
              <Leaf size={13} />
              Từng bước đến tự do tài chính.
            </span>
            <span>
              Được tạo nên để bạn an tâm <span className="footer-spark">✦</span>
            </span>
          </footer>
        </main>
      </div>
      <Toast message={toast} onClose={closeToast} />
      <AnimatePresence>
        {modal === "transaction" && summary && (
          <TransactionForm
            key="transaction"
            wallets={summary.wallets}
            categories={categories}
            transaction={edit}
            onClose={() => setModal("")}
            onSaved={() =>
              saved(edit ? "Đã cập nhật giao dịch." : "Đã lưu giao dịch mới.")
            }
          />
        )}
        {modal === "wallet" && (
          <WalletForm
            key="wallet"
            onClose={() => setModal("")}
            onSaved={() => saved("Chiếc ví mới đã sẵn sàng.")}
          />
        )}
        {modal === "budget" && summary && (
          <BudgetForm
            key="budget"
            month={month}
            categories={categories}
            budget={summary.budget}
            onClose={() => setModal("")}
            onSaved={() => saved("Ngân sách đã được áp dụng.")}
          />
        )}
        {modal === "category" && (
          <CategoryForm
            key="category"
            onClose={() => setModal("")}
            onSaved={() => saved("Đã thêm danh mục mới.")}
          />
        )}
      </AnimatePresence>
      {modal === "help" && (
        <Modal
          title="Chào bạn, đây là Finora"
          description="Một nơi để hiểu tiền của mình, theo cách nhẹ nhàng hơn."
          onClose={() => setModal("")}
        >
          <div className="help-steps">
            {[
              [
                "01",
                "Tạo ví của bạn",
                "Khai báo số dư ban đầu của tiền mặt, ngân hàng hoặc ví điện tử.",
              ],
              [
                "02",
                "Ghi nhận thu chi",
                "Thêm giao dịch đúng ví, danh mục và ngày phát sinh.",
              ],
              [
                "03",
                "Để tiền có kế hoạch",
                "Tạo ngân sách từ thu nhập dự kiến, chi bắt buộc và ưu tiên.",
              ],
              [
                "04",
                "Nhìn lại và điều chỉnh",
                "Xem báo cáo, theo dõi cảnh báo và điều chỉnh ngân sách khi cần.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <Tip>
            Finora chưa đồng bộ ngân hàng. Dữ liệu phụ thuộc vào thông tin bạn
            nhập. Chế độ trải nghiệm tạo tài khoản mẫu riêng; tài khoản mẫu
            không thể đăng nhập lại nếu không có thông tin đăng nhập.
          </Tip>
          <Button className="full" onClick={() => setModal("")}>
            Tôi đã hiểu
            <ArrowRight size={17} />
          </Button>
        </Modal>
      )}
      {modal === "logout" && (
        <Modal
          title="Đăng xuất khỏi Finora?"
          description="Dữ liệu đã lưu vẫn được giữ trong tài khoản của bạn."
          onClose={() => setModal("")}
        >
          <div className="modal-actions">
            <Button secondary onClick={() => setModal("")}>
              Ở lại
            </Button>
            <Button
              disabled={mutationLoading}
              onClick={async () => {
                setMutationLoading(true);
                try {
                  await api("/auth/logout", { method: "POST", body: "{}" });
                  setUser(null);
                  setSummary(null);
                  setCategories([]);
                  setTxs(null);
                  setModal("");
                } catch (e) {
                  setToast((e as Error).message);
                } finally {
                  setMutationLoading(false);
                }
              }}
            >
              Đăng xuất
            </Button>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Xóa giao dịch này?"
          description={`${deleting.note || deleting.category?.name || "Chuyển ví"} · ${money(deleting.amount)} · ${dateLabel(deleting.occurredAt)}`}
          onClose={() => setDeleting(null)}
        >
          <Tip>
            Số dư, báo cáo và mức sử dụng ngân sách sẽ được tính lại. Thao tác
            này không thể hoàn tác.
          </Tip>
          <div className="modal-actions">
            <Button secondary onClick={() => setDeleting(null)}>
              Giữ lại
            </Button>
            <Button
              className="danger-button"
              disabled={mutationLoading}
              onClick={async () => {
                setMutationLoading(true);
                try {
                  await api("/transactions/" + deleting.id, {
                    method: "DELETE",
                    body: "{}",
                  });
                  setDeleting(null);
                  refresh();
                  setToast("Đã xóa giao dịch.");
                } catch (e) {
                  setToast((e as Error).message);
                } finally {
                  setMutationLoading(false);
                }
              }}
            >
              Xóa giao dịch
            </Button>
          </div>
        </Modal>
      )}
      {walletEdit && (
        <WalletEdit
          wallet={walletEdit}
          onClose={() => setWalletEdit(null)}
          onSaved={() => {
            setWalletEdit(null);
            refresh();
            setToast("Đã cập nhật ví.");
          }}
        />
      )}
      {categoryEdit && (
        <CategoryEdit
          category={categoryEdit}
          onClose={() => setCategoryEdit(null)}
          onSaved={() => {
            setCategoryEdit(null);
            refresh();
            setToast("Đã cập nhật danh mục.");
          }}
        />
      )}
      {modal === "password" && (
        <PasswordForm
          onClose={() => setModal("")}
          onSaved={() =>
            saved("Đã đổi mật khẩu và thu hồi các phiên đăng nhập khác.")
          }
        />
      )}
    </div>
  );
}
function PageHeading({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <div className="greeting">{kicker}</div>
        <h1>
          {title}
          <span className="dot">.</span>
        </h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
function WalletEdit({
  wallet,
  onClose,
  onSaved,
}: {
  wallet: Wallet;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  return (
    <Modal title="Điều chỉnh ví" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setLoading(true);
          setError("");
          try {
            await api("/wallets/" + wallet.id, {
              method: "PATCH",
              body: JSON.stringify({
                name: f.get("name"),
                archived: f.get("archived") === "on",
              }),
            });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Field label="Tên ví">
          <input
            name="name"
            defaultValue={wallet.name}
            required
            maxLength={60}
          />
        </Field>
        <label className="checkbox-field">
          <input
            name="archived"
            type="checkbox"
            defaultChecked={wallet.archived}
          />
          Lưu trữ ví này
        </label>
        <Tip>
          Ví đã lưu trữ vẫn xuất hiện trong lịch sử và tổng số dư, nhưng không
          nhận giao dịch mới. Bạn có thể bỏ lưu trữ bất cứ lúc nào.
        </Tip>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <Button secondary onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
function PasswordForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  return (
    <Modal title="Đổi mật khẩu" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setLoading(true);
          setError("");
          try {
            await api("/auth/password", {
              method: "POST",
              body: JSON.stringify(Object.fromEntries(f)),
            });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Field label="Mật khẩu hiện tại">
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
          />
        </Field>
        <Field label="Mật khẩu mới">
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
          />
        </Field>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <Button secondary onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function CategoryEdit({
  category,
  onClose,
  onSaved,
}: {
  category: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  return (
    <Modal title="Điều chỉnh danh mục" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setLoading(true);
          setError("");
          try {
            await api("/categories/" + category.id, {
              method: "PATCH",
              body: JSON.stringify({
                name: f.get("name"),
                archived: f.get("archived") === "on",
              }),
            });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Field label="Tên danh mục">
          <input
            name="name"
            defaultValue={category.name}
            required
            maxLength={40}
          />
        </Field>
        <label className="checkbox-field">
          <input
            name="archived"
            type="checkbox"
            defaultChecked={category.archived}
          />
          Lưu trữ danh mục này
        </label>
        <Tip>
          Lịch sử giao dịch và ngân sách cũ vẫn được giữ. Danh mục đã lưu trữ
          không xuất hiện khi tạo giao dịch hoặc lập ngân sách mới.
        </Tip>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <Button secondary onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={loading}>
            Lưu thay đổi
          </Button>
        </div>
      </form>
    </Modal>
  );
}
