import { useEffect, useState } from "react";
import { CalendarClock, Plus, Target } from "lucide-react";
import { Button, Empty, Field, Modal, Progress, Tip } from "../../components";
import { PageHeading } from "../../shared/PageHeading";
import { api, money, today, type Summary, type Category } from "../../types";
import { useWrite } from "../../shared/useWrite";
type Rule = {
  id: string;
  name: string;
  kind: string;
  amount: string;
  day: number;
  active: boolean;
  wallet: { name: string };
  category: { name: string };
};
type Draft = { id: string; state: string; dueAt: string; rule: Rule };
type Contribution = {
  id: string;
  amount: string;
  note: string;
  createdAt: string;
  walletId: string;
  wallet: { name: string };
};
type Goal = {
  id: string;
  name: string;
  target: string;
  targetDate: string;
  saved: string;
  monthlyNeeded: string;
  overdue: boolean;
  contributions: Contribution[];
};
export default function PlanningPage({
  summary,
  categories,
  onChanged,
}: {
  summary: Summary;
  categories: Category[];
  onChanged: () => void;
}) {
  const [data, setData] = useState<{ rules: Rule[]; drafts: Draft[] } | null>(
      null,
    ),
    [goals, setGoals] = useState<Goal[] | null>(null),
    [version, setVersion] = useState(0),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [modal, setModal] = useState(""),
    [selected, setSelected] = useState<Goal | null>(null),
    [kind, setKind] = useState("EXPENSE"),
    [formError, setFormError] = useState(""),
    [tab, setTab] = useState("goals");
  const write = useWrite();
  useEffect(() => {
    const abort = new AbortController();
    setError("");
    setData(null);
    setGoals(null);
    Promise.all([
      api<{ rules: Rule[]; drafts: Draft[] }>(
        "/recurring?month=" + summary.month,
        { signal: abort.signal },
      ),
      api<Goal[]>("/goals", { signal: abort.signal }),
    ])
      .then(([d, g]) => {
        if (!abort.signal.aborted) {
          setData(d);
          setGoals(g);
        }
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      });
    return () => abort.abort();
  }, [summary.month, version]);
  const mutate = async (
    path: string,
    payload: unknown,
    method = "POST",
    close = false,
  ) => {
    setBusy(true);
    setError("");
    setFormError("");
    try {
      await write(path, payload, method);
      if (close) setModal("");
      setVersion((v) => v + 1);
      onChanged();
    } catch (e) {
      (close ? setFormError : setError)((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  const open = (name: string) => {
    setFormError("");
    setKind("EXPENSE");
    setModal(name);
  };
  const active = summary.wallets.filter((w) => !w.archived);
  const totalSaved = (goals || []).reduce((s, g) => s + BigInt(g.saved), 0n);
  const reserveWarning = summary.wallets.some(
    (w) =>
      (goals || [])
        .flatMap((g) => g.contributions)
        .filter((c) => c.walletId === w.id)
        .reduce((s, c) => s + BigInt(c.amount), 0n) > BigInt(w.balance),
  );
  return (
    <>
      <PageHeading
        kicker="BIẾN DỰ ĐỊNH THÀNH THÓI QUEN"
        title="Kế hoạch của bạn"
        description="Dành tiền cho ước mơ, nhớ những khoản cần thanh toán."
        action={
          <Button onClick={() => open(tab === "goals" ? "goal" : "rule")}>
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
          onClick={() => setTab("goals")}
        >
          <Target size={17} />
          Mục tiêu tiết kiệm
        </button>
        <button
          aria-pressed={tab === "recurring"}
          className={tab === "recurring" ? "active" : ""}
          onClick={() => setTab("recurring")}
        >
          <CalendarClock size={17} />
          Giao dịch định kỳ
        </button>
      </div>
      {error && (
        <div className="form-error" role="alert">
          {error}
          <Button secondary onClick={() => setVersion((v) => v + 1)}>
            Thử lại
          </Button>
        </div>
      )}
      {!error && (!data || !goals) && <p role="status">Đang tải kế hoạch…</p>}
      {tab === "goals" && goals && (
        <>
          <Tip>
            Đã dành riêng {money(totalSaved)} từ tiền hiện có trong ví. Đây là
            phân bổ bạn xác nhận, không phải khoản thu mới hoặc số tiết kiệm dự
            kiến trong ngân sách.
          </Tip>
          {reserveWarning && (
            <div className="form-error" role="status">
              Có ví đã chi xuống thấp hơn phần dành riêng. Hãy kiểm tra số dư và
              điều chỉnh phân bổ mục tiêu.
            </div>
          )}
          <div className="planning-grid">
            {goals.map((g) => (
              <section className="panel goal-card" key={g.id}>
                <div className="section-row">
                  <h2>{g.name}</h2>
                  <Target size={23} />
                </div>
                <strong className="goal-amount">{money(g.saved)}</strong>
                <p className="muted">
                  Mục tiêu {money(g.target)} · đến{" "}
                  {new Date(g.targetDate).toLocaleDateString("vi-VN", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  })}
                </p>
                <Progress
                  value={(Number(g.saved) / Number(g.target)) * 100}
                  color="#6840c6"
                />
                <p>
                  {BigInt(g.saved) >= BigInt(g.target)
                    ? "Đã đạt mục tiêu 🎉"
                    : g.overdue
                      ? "Đã qua hạn — bạn có thể tiếp tục dành tiền."
                      : `Cần dành khoảng ${money(g.monthlyNeeded)} mỗi tháng.`}
                </p>
                <Button
                  secondary
                  onClick={() => {
                    setSelected(g);
                    open("contribute");
                  }}
                >
                  Phân bổ / rút tiền
                </Button>
                <details>
                  <summary>Lịch sử phân bổ ({g.contributions.length})</summary>
                  {g.contributions.length ? (
                    g.contributions.map((c) => (
                      <div className="planning-row" key={c.id}>
                        <span>
                          {c.wallet.name}
                          <small>
                            {new Date(c.createdAt).toLocaleDateString("vi-VN")}{" "}
                            · {c.note || "Phân bổ mục tiêu"}
                          </small>
                        </span>
                        <strong>{money(c.amount)}</strong>
                      </div>
                    ))
                  ) : (
                    <p>Chưa có khoản phân bổ.</p>
                  )}
                </details>
              </section>
            ))}
          </div>
          {!goals.length && (
            <section className="panel">
              <Empty
                title="Một ước mơ, một mục tiêu"
                description="Tạo quỹ dự phòng, kế hoạch du lịch hay chiếc laptop mới."
                action={
                  <Button onClick={() => open("goal")}>
                    Tạo mục tiêu đầu tiên
                  </Button>
                }
              />
            </section>
          )}
        </>
      )}
      {tab === "recurring" && data && (
        <>
          <Tip>
            Finora tạo bản nháp cho các khoản đến hạn trong tháng đang chọn. Chỉ
            khi bạn xác nhận, số dư và báo cáo mới thay đổi. Chọn tháng cũ để xử
            lý khoản còn bỏ ngỏ.
          </Tip>
          <section className="panel planning-section">
            <h2>Các khoản trong tháng</h2>
            {data.drafts.length ? (
              data.drafts.map((d) => (
                <div className="planning-row" key={d.id}>
                  <div>
                    <strong>{d.rule.name}</strong>
                    <small>
                      {new Date(d.dueAt).toLocaleDateString("vi-VN", {
                        timeZone: "Asia/Ho_Chi_Minh",
                      })}{" "}
                      · {d.rule.wallet.name} ·{" "}
                      {d.rule.kind === "INCOME" ? "Thu" : "Chi"}
                    </small>
                  </div>
                  <strong>{money(d.rule.amount)}</strong>
                  {d.state === "PENDING" ? (
                    <div className="inline-actions">
                      <Button
                        disabled={busy}
                        onClick={() =>
                          void mutate(`/recurring-drafts/${d.id}/action`, {
                            action: "CONFIRM",
                          })
                        }
                      >
                        Xác nhận ghi sổ
                      </Button>
                      <Button
                        secondary
                        disabled={busy}
                        onClick={() =>
                          void mutate(`/recurring-drafts/${d.id}/action`, {
                            action: "SKIP",
                          })
                        }
                      >
                        Bỏ qua
                      </Button>
                    </div>
                  ) : (
                    <span className="period-badge">
                      {d.state === "CONFIRMED" ? "Đã ghi sổ" : "Đã bỏ qua"}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="muted">Chưa có khoản đến hạn trong tháng này.</p>
            )}
          </section>
          <section className="panel planning-section">
            <h2>Quy tắc hằng tháng</h2>
            {data.rules.length ? (
              data.rules.map((r) => (
                <div className="planning-row" key={r.id}>
                  <div>
                    <strong>{r.name}</strong>
                    <small>
                      Ngày {r.day} · {r.category.name} · {r.wallet.name}
                      {!r.active ? " · Đang tạm dừng" : ""}
                    </small>
                  </div>
                  <strong>{money(r.amount)}</strong>
                  <Button
                    secondary
                    disabled={busy}
                    onClick={() =>
                      void mutate(
                        `/recurring/${r.id}`,
                        { active: !r.active },
                        "PATCH",
                      )
                    }
                  >
                    {r.active ? "Tạm dừng" : "Bật lại"}
                  </Button>
                </div>
              ))
            ) : (
              <p className="muted">
                Thêm lương, tiền nhà hoặc hóa đơn cần nhớ mỗi tháng.
              </p>
            )}
          </section>
        </>
      )}
      {modal && (
        <Modal
          title={
            modal === "goal"
              ? "Tạo mục tiêu tiết kiệm"
              : modal === "rule"
                ? "Tạo giao dịch định kỳ"
                : "Phân bổ tiền cho mục tiêu"
          }
          description={modal === "contribute" ? selected?.name : undefined}
          onClose={() => {
            if (!busy) setModal("");
          }}
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = Object.fromEntries(new FormData(e.currentTarget));
              if (modal === "goal")
                void mutate(
                  "/goals",
                  {
                    name: f.name,
                    target: f.amount,
                    targetDate: f.date + "T23:59:59+07:00",
                  },
                  "POST",
                  true,
                );
              else if (modal === "rule")
                void mutate(
                  "/recurring",
                  {
                    name: f.name,
                    amount: f.amount,
                    kind,
                    walletId: f.walletId,
                    categoryId: f.categoryId,
                    day: Number(f.day),
                    startMonth: f.startMonth,
                    ...(f.endMonth ? { endMonth: f.endMonth } : {}),
                    note: f.note,
                  },
                  "POST",
                  true,
                );
              else
                void mutate(
                  `/goals/${selected?.id}/contributions`,
                  {
                    action: f.action,
                    amount: f.amount,
                    walletId: f.walletId,
                    note: f.note,
                  },
                  "POST",
                  true,
                );
            }}
          >
            {modal !== "contribute" && (
              <Field label="Tên kế hoạch">
                <input name="name" required maxLength={60} />
              </Field>
            )}
            {modal === "contribute" && (
              <Field label="Thao tác">
                <select name="action">
                  <option value="ADD">Dành tiền từ ví</option>
                  <option value="WITHDRAW">Rút phần đã dành về ví</option>
                </select>
              </Field>
            )}
            {modal === "rule" && (
              <Field label="Loại giao dịch">
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="EXPENSE">Khoản chi</option>
                  <option value="INCOME">Khoản thu</option>
                </select>
              </Field>
            )}
            <Field label="Số tiền (VND)">
              <input
                type="number"
                name="amount"
                min="1"
                max="9999999999999"
                step="1"
                required
              />
            </Field>
            {modal === "goal" ? (
              <Field label="Ngày hoàn thành">
                <input type="date" name="date" min={today()} required />
              </Field>
            ) : (
              <>
                <Field label="Ví">
                  <select name="walletId" required>
                    {(modal === "contribute" ? summary.wallets : active).map(
                      (w) => (
                        <option value={w.id} key={w.id}>
                          {w.name}
                          {w.archived ? " (đã lưu trữ)" : ""}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
                {modal === "rule" && (
                  <>
                    <Field label="Danh mục">
                      <select name="categoryId" key={kind} required>
                        {categories
                          .filter((c) => !c.archived && c.kind === kind)
                          .map((c) => (
                            <option value={c.id} key={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </Field>
                    <Field label="Ngày hằng tháng">
                      <input
                        name="day"
                        type="number"
                        min="1"
                        max="31"
                        defaultValue="1"
                        required
                      />
                    </Field>
                    <p className="muted small">
                      Tháng ngắn hơn sẽ dùng ngày cuối tháng.
                    </p>
                    <div className="form-grid">
                      <Field label="Từ tháng">
                        <input
                          name="startMonth"
                          type="month"
                          defaultValue={summary.month}
                          required
                        />
                      </Field>
                      <Field label="Đến tháng (tùy chọn)">
                        <input name="endMonth" type="month" />
                      </Field>
                    </div>
                  </>
                )}
                <Field label="Ghi chú">
                  <input name="note" maxLength={250} />
                </Field>
              </>
            )}
            {formError && (
              <div className="form-error" role="alert">
                {formError}
              </div>
            )}
            <div className="modal-actions">
              <Button secondary onClick={() => setModal("")} disabled={busy}>
                Hủy
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? "Đang lưu…" : "Lưu kế hoạch"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
