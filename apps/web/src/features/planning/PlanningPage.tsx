import { useEffect, useState } from "react";
import { CalendarClock, Plus, Target } from "lucide-react";
import { Button, Empty, Tip } from "../../components";
import { PageHeading } from "../../shared/PageHeading";
import { money, type Summary, type Category } from "../../types";
import { useWrite } from "../../shared/useWrite";
import { usePlanning } from "./usePlanning";
import { GoalCard } from "./GoalCard";
import { RecurringPanel } from "./RecurringPanel";
import { GoalForm } from "./GoalForm";
import { ContributionForm } from "./ContributionForm";
import { RuleForm } from "./RuleForm";
import type { Goal, Rule } from "./models";
type Dialog =
  | { kind: "goal"; goal?: Goal }
  | { kind: "contribute"; goal: Goal }
  | { kind: "rule"; rule?: Rule }
  | null;
function readTab() {
  return new URLSearchParams(location.hash.split("?")[1] || "").get("tab") ===
    "recurring"
    ? "recurring"
    : "goals";
}
export default function PlanningPage({
  summary,
  categories,
  onChanged,
}: {
  summary: Summary;
  categories: Category[];
  onChanged: () => void;
}) {
  const {
      data,
      loading,
      error: loadError,
      reload,
    } = usePlanning(summary.month),
    write = useWrite();
  const [tab, setTab] = useState(readTab),
    [archived, setArchived] = useState(false),
    [dialog, setDialog] = useState<Dialog>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  useEffect(() => {
    const sync = () => setTab(readTab());
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  const changeTab = (value: "goals" | "recurring") => {
    setTab(value);
    history.replaceState(null, "", `#planning?tab=${value}`);
  };
  const refresh = () => {
    setDialog(null);
    reload();
    onChanged();
  };
  const mutate = async (path: string, payload: unknown, method = "POST") => {
    setBusy(true);
    setError("");
    try {
      await write(path, payload, method);
      refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const goals = data?.goals || [],
    saved = goals.reduce((s, g) => s + BigInt(g.saved), 0n),
    visible = goals.filter((g) => g.archived === archived);
  const warning = summary.wallets.some(
    (w) =>
      goals
        .flatMap((g) => g.contributions)
        .filter((c) => c.walletId === w.id)
        .reduce((s, c) => s + BigInt(c.amount), 0n) > BigInt(w.balance),
  );
  return (
    <>
      <PageHeading
        kicker="BIẾN DỰ ĐỊNH THÀNH THÓI QUEN"
        title="Kế hoạch của bạn"
        description="Một mục tiêu để hướng đến. Những khoản quen thuộc để an tâm."
        action={
          <Button
            onClick={() =>
              setDialog(tab === "goals" ? { kind: "goal" } : { kind: "rule" })
            }
          >
            <Plus size={18} />
            {tab === "goals" ? "Tạo mục tiêu" : "Tạo quy tắc"}
          </Button>
        }
      />
      <div
        className="segmented planning-tabs"
        role="group"
        aria-label="Loại kế hoạch"
      >
        <button
          aria-pressed={tab === "goals"}
          className={tab === "goals" ? "active" : ""}
          onClick={() => changeTab("goals")}
        >
          <Target size={17} />
          Mục tiêu tiết kiệm
        </button>
        <button
          aria-pressed={tab === "recurring"}
          className={tab === "recurring" ? "active" : ""}
          onClick={() => changeTab("recurring")}
        >
          <CalendarClock size={17} />
          Giao dịch định kỳ
        </button>
      </div>
      {(error || loadError) && (
        <div className="form-error" role="alert">
          {error || loadError}
          <Button
            secondary
            onClick={() => {
              setError("");
              reload();
            }}
          >
            Thử lại
          </Button>
        </div>
      )}
      {loading && !data && <p role="status">Đang tải kế hoạch…</p>}
      {tab === "goals" && data && (
        <>
          <div className="goals-intro">
            <div>
              <span className="eyebrow">ĐIỀU BẠN ĐANG DÀNH DỤM</span>
              <strong>{money(saved)}</strong>
              <p>
                Tổng phần dành riêng từ tiền có trong ví, gồm cả mục tiêu lưu
                trữ.
              </p>
            </div>
            <div
              className="filter-tabs"
              role="group"
              aria-label="Trạng thái mục tiêu"
            >
              <button
                aria-pressed={!archived}
                className={!archived ? "active" : ""}
                onClick={() => setArchived(false)}
              >
                Đang theo đuổi
              </button>
              <button
                aria-pressed={archived}
                className={archived ? "active" : ""}
                onClick={() => setArchived(true)}
              >
                Đã lưu trữ
              </button>
            </div>
          </div>
          <Tip>
            Tiền dành cho mục tiêu không phải khoản thu mới hoặc dự trù ngân
            sách. Lưu trữ giữ lịch sử và phần dành riêng; bạn vẫn có thể rút
            hoặc khôi phục mục tiêu.
          </Tip>
          {warning && (
            <div className="form-error" role="status">
              Có ví đã chi xuống thấp hơn phần dành riêng. Hãy kiểm tra và điều
              chỉnh phân bổ mục tiêu.
            </div>
          )}
          <div className="planning-grid">
            {visible.map((g) => (
              <GoalCard
                key={g.id}
                goal={g}
                busy={busy}
                onEdit={() => setDialog({ kind: "goal", goal: g })}
                onContribute={() => setDialog({ kind: "contribute", goal: g })}
                onArchive={() =>
                  void mutate(
                    `/goals/${g.id}`,
                    { archived: !g.archived },
                    "PATCH",
                  )
                }
              />
            ))}
          </div>
          {!visible.length && (
            <section className="panel">
              <Empty
                title={
                  archived
                    ? "Chưa có mục tiêu lưu trữ"
                    : "Một ước mơ, một mục tiêu"
                }
                description={
                  archived
                    ? "Mục tiêu được lưu trữ vẫn giữ toàn bộ lịch sử."
                    : "Quỹ dự phòng, một chuyến đi hay chiếc laptop mới — bắt đầu từ một mục tiêu nhỏ."
                }
                action={
                  !archived ? (
                    <Button onClick={() => setDialog({ kind: "goal" })}>
                      Tạo mục tiêu đầu tiên
                    </Button>
                  ) : undefined
                }
              />
            </section>
          )}
        </>
      )}
      {tab === "recurring" && data && (
        <RecurringPanel
          rules={data.rules}
          drafts={data.drafts}
          busy={busy}
          onAction={(id, action) =>
            void mutate(`/recurring-drafts/${id}/action`, { action })
          }
          onToggle={(r) =>
            void mutate(`/recurring/${r.id}`, { active: !r.active }, "PATCH")
          }
          onReplace={(r) => setDialog({ kind: "rule", rule: r })}
        />
      )}
      {dialog?.kind === "goal" && (
        <GoalForm
          goal={dialog.goal}
          onClose={() => setDialog(null)}
          onSaved={refresh}
        />
      )}
      {dialog?.kind === "contribute" && (
        <ContributionForm
          goal={dialog.goal}
          wallets={summary.wallets}
          onClose={() => setDialog(null)}
          onSaved={refresh}
        />
      )}
      {dialog?.kind === "rule" && (
        <RuleForm
          rule={dialog.rule}
          month={summary.month}
          wallets={summary.wallets}
          categories={categories}
          onClose={() => setDialog(null)}
          onSaved={refresh}
        />
      )}
    </>
  );
}
