import { CalendarDays, ChevronDown, Leaf, LoaderCircle } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import AppDialogs from "./app/AppDialogs";
import { navigation } from "./app/navigation";
import Sidebar from "./app/Sidebar";
import Topbar from "./app/Topbar";
import Auth, { Brand } from "./Auth";
import { Button, Toast } from "./components";
import Dashboard from "./Dashboard";
import BudgetsPage from "./features/budgeting/BudgetsPage";
import SettingsPage from "./features/identity/SettingsPage";
import { useSession } from "./features/identity/useSession";
import TransactionsPage from "./features/ledger/TransactionsPage";
import WalletsPage from "./features/ledger/WalletsPage";
import ReportsPage from "./features/reporting/ReportsPage";
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

export default function App() {
  const { user, setUser, initializing, sessionError, retrySession } =
    useSession();
  const [page, setPage] = useState(() => location.hash.slice(1) || "overview");
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
    const expired = () => {
      request.current++;
      setUser(null);
      setTxs(null);
      setModal("");
      setEdit(undefined);
      setDeleting(null);
      setWalletEdit(null);
      setCategoryEdit(null);
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
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      api<Summary>("/reports/summary?month=" + month, {
        signal: controller.signal,
      }),
      api<Category[]>("/categories", { signal: controller.signal }),
    ])
      .then(([s, c]) => {
        if (!controller.signal.aborted && request.current === id) {
          setSummary(s);
          setCategories(c);
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted && request.current === id)
          setError(e.message);
      })
      .finally(() => {
        if (!controller.signal.aborted && request.current === id)
          setLoading(false);
      });
    return () => controller.abort();
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
      <Sidebar
        mobile={mobile}
        user={user}
        page={page}
        navigate={navigate}
        setModal={setModal}
      />
      <div className="main-shell">
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
                <TransactionsPage
                  summary={summary}
                  month={month}
                  kind={kind}
                  setKind={setKind}
                  search={search}
                  setSearch={setSearch}
                  txs={txs}
                  txError={txError}
                  txLoading={txLoading}
                  txPage={txPage}
                  setTxPage={setTxPage}
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
                <BudgetsPage summary={summary} setModal={setModal} />
              )}
              {page === "reports" && (
                <ReportsPage summary={summary} month={month} />
              )}
              {page === "settings" && (
                <SettingsPage
                  user={user}
                  categories={categories}
                  setModal={setModal}
                  setCategoryEdit={setCategoryEdit}
                />
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
      <AppDialogs
        toast={toast}
        closeToast={closeToast}
        modal={modal}
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
