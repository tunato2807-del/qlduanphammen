import { useFinanceData } from "./app/useFinanceData";
import { useLedger } from "./features/ledger/useLedger";
import { ErrorBoundary } from "./shared/ErrorBoundary";
import { type Budget } from "./types";
import { CalendarDays, ChevronDown, Leaf, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import AppDialogs from "./app/AppDialogs";
import { navigation } from "./app/navigation";
import Sidebar from "./app/Sidebar";
import Topbar from "./app/Topbar";
import Auth, { Brand } from "./Auth";
import { useExperience } from "./Experience";
import { Button, Toast } from "./components";
const PlanningPage = lazy(() => import("./features/planning/PlanningPage"));
const Dashboard = lazy(() => import("./Dashboard"));
const BudgetsPage = lazy(() => import("./features/budgeting/BudgetsPage"));
const SettingsPage = lazy(() => import("./features/identity/SettingsPage"));
import { useSession } from "./features/identity/useSession";
const TransactionsPage = lazy(
  () => import("./features/ledger/TransactionsPage"),
);
const WalletsPage = lazy(() => import("./features/ledger/WalletsPage"));
const ReportsPage = lazy(() => import("./features/reporting/ReportsPage"));
import {
  api,
  monthLabel,
  today,
  type Category,
  type Summary,
  type Transaction,
  type TransactionPage,
  type Wallet,
} from "./types";

function readPage() {
  const id = location.hash.slice(1).split("?")[0];
  return [...navigation.map((n) => n.id), "settings"].includes(id)
    ? id
    : "overview";
}

export default function App() {
  const { reduced } = useExperience();
  const [recoveryLink, setRecoveryLink] = useState(() =>
    location.hash.startsWith("#reset-password?"),
  );
  const { user, setUser, initializing, sessionError, retrySession } =
    useSession();
  const [page, setPage] = useState(readPage);
  const [month, setMonth] = useState(today().slice(0, 7)),
    [version, setVersion] = useState(0);
  const { summary, setSummary, categories, setCategories, error, loading } =
    useFinanceData(user?.id, month, version);
  const ledger = useLedger(user?.id, page === "transactions", month, version);
  const { search, setSearch, txs, setTxs } = ledger;
  const [budgetSource, setBudgetSource] = useState<Budget | null>(null);
  const [modal, setModal] = useState(""),
    [edit, setEdit] = useState<Transaction | undefined>(),
    [deleting, setDeleting] = useState<Transaction | null>(null),
    [walletEdit, setWalletEdit] = useState<Wallet | null>(null),
    [categoryEdit, setCategoryEdit] = useState<Category | null>(null),
    [mobile, setMobile] = useState(false),
    [notifications, setNotifications] = useState(false),
    [hidden, setHidden] = useState(false),
    [toast, setToast] = useState("");
  const [mutationLoading, setMutationLoading] = useState(false);
  useEffect(() => {
    if (modal !== "budget") setBudgetSource(null);
  }, [modal]);
  useEffect(() => {
    const expired = () => {
      setUser(null);
      setTxs(null);
      setModal("");
      setEdit(undefined);
      setBudgetSource(null);
      setDeleting(null);
      setWalletEdit(null);
      setCategoryEdit(null);
      setSummary(null);
      setCategories([]);
      setToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    };
    const hash = () => {
      if (location.hash.startsWith("#reset-password?")) setRecoveryLink(true);
      setPage(readPage());
    };
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
    requestAnimationFrame(() =>
      document.getElementById("main-content")?.focus(),
    );
  };
  const refresh = () => setVersion((v) => v + 1);
  const closeToast = useCallback(() => setToast(""), []);
  const saved = (message: string) => {
    setModal("");
    setEdit(undefined);
    setBudgetSource(null);
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
        BigInt(i.spent) > 0n &&
        (BigInt(i.limit) === 0n ||
          BigInt(i.spent) * 5n >= BigInt(i.limit) * 4n),
    ) || [];
  if (initializing)
    return (
      <div className="boot-screen">
        <Brand />
        <LoaderCircle className="spin" size={24} />
        <span>Đang mở không gian của bạn…</span>
      </div>
    );
  if (sessionError)
    return (
      <div className="boot-screen">
        <Brand />
        <div className="form-error" role="alert">
          {sessionError}
        </div>
        <Button onClick={retrySession}>Thử kết nối lại</Button>
      </div>
    );
  if (!user || recoveryLink)
    return (
      <>
        <Auth
          onLogin={(u) => {
            setRecoveryLink(false);
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
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Bỏ qua điều hướng
      </a>
      {mobile && (
        <button
          className="sidebar-overlay"
          aria-label="Đóng menu"
          onClick={() => setMobile(false)}
        />
      )}
      <Sidebar
        mobile={mobile}
        setMobile={setMobile}
        user={user}
        page={page}
        navigate={navigate}
        setModal={setModal}
      />
      <div className="main-shell" inert={mobile}>
        <Topbar
          user={user}
          title={title}
          page={page}
          search={search}
          setSearch={setSearch}
          navigate={navigate}
          setMobile={setMobile}
          notifications={notifications}
          setNotifications={setNotifications}
          alerts={alerts}
        />
        <main className="content" id="main-content" tabIndex={-1}>
          <div className="content-toolbar">
            <span className="section-kicker">
              <span className="live-dot" /> YOUR MONEY, YOUR WAY
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
            <ErrorBoundary key={page}>
              <Suspense
                fallback={
                  <div
                    className="page-skeleton"
                    role="status"
                    aria-label="Đang tải màn hình"
                  >
                    <i />
                    <i />
                    <i />
                  </div>
                }
              >
                <motion.div
                  key={page}
                  initial={reduced ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.25 }}
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
                    <TransactionsPage
                      summary={summary}
                      categories={categories}
                      ledger={ledger}
                      addTransaction={addTransaction}
                      editTransaction={editTransaction}
                      setDeleting={setDeleting}
                      refresh={refresh}
                    />
                  )}
                  {page === "wallets" && (
                    <WalletsPage
                      summary={summary}
                      setModal={setModal}
                      setWalletEdit={setWalletEdit}
                    />
                  )}
                  {page === "budgets" && (
                    <BudgetsPage
                      summary={summary}
                      setModal={(id) => {
                        setBudgetSource(null);
                        setModal(id);
                      }}
                      onUseVersion={(budget) => {
                        setBudgetSource(budget);
                        setModal("budget");
                      }}
                    />
                  )}
                  {page === "planning" && (
                    <PlanningPage
                      summary={summary}
                      categories={categories}
                      onChanged={refresh}
                    />
                  )}
                  {page === "reports" && (
                    <ReportsPage summary={summary} month={month} />
                  )}
                  {page === "settings" && (
                    <SettingsPage
                      user={user}
                      onProfileSaved={setUser}
                      categories={categories}
                      setModal={setModal}
                      setCategoryEdit={setCategoryEdit}
                    />
                  )}
                </motion.div>
              </Suspense>
            </ErrorBoundary>
          )}
          <footer className="main-footer">
            <span>
              <Leaf size={13} />
              Từng bước đến tự do tài chính.
            </span>
            <span>
              VND · Giờ Việt Nam <span className="footer-spark">✦</span>
            </span>
          </footer>
        </main>
      </div>
      <AppDialogs
        toast={toast}
        closeToast={closeToast}
        modal={modal}
        budgetSource={budgetSource}
        summary={summary}
        categories={categories}
        edit={edit}
        setModal={setModal}
        saved={saved}
        month={month}
        mutationLoading={mutationLoading}
        setMutationLoading={setMutationLoading}
        setUser={setUser}
        setSummary={setSummary}
        setCategories={setCategories}
        setTxs={setTxs}
        setToast={setToast}
        deleting={deleting}
        setDeleting={setDeleting}
        refresh={refresh}
        walletEdit={walletEdit}
        setWalletEdit={setWalletEdit}
        categoryEdit={categoryEdit}
        setCategoryEdit={setCategoryEdit}
      />
    </div>
  );
}
