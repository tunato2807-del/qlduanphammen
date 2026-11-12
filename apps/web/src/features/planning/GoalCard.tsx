import { Archive, RotateCcw, Settings2, Target } from "lucide-react";
import { Button, Progress } from "../../components";
import { money } from "../../types";
import type { Goal } from "./models";
export function GoalCard({
  goal: g,
  busy,
  onEdit,
  onContribute,
  onArchive,
}: {
  goal: Goal;
  busy: boolean;
  onEdit: () => void;
  onContribute: () => void;
  onArchive: () => void;
}) {
  const achieved = BigInt(g.saved) >= BigInt(g.target);
  return (
    <section className={`panel goal-card ${g.archived ? "archived" : ""}`}>
      <div className="goal-card-heading">
        <span className="goal-symbol">
          <Target size={23} />
        </span>
        <span className={`period-badge ${achieved ? "success-badge" : ""}`}>
          {g.archived
            ? "Đã lưu trữ"
            : achieved
              ? "Đã đạt mục tiêu"
              : g.overdue
                ? "Đã qua hạn"
                : "Đang theo đuổi"}
        </span>
        <button
          className="icon-button"
          aria-label={`Chỉnh sửa mục tiêu ${g.name}`}
          onClick={onEdit}
        >
          <Settings2 size={17} />
        </button>
      </div>
      <h2>{g.name}</h2>
      <strong className="goal-amount">
        {money(g.saved)}
        <small> / {money(g.target)}</small>
      </strong>
      <Progress
        value={(Number(g.saved) / Number(g.target)) * 100}
        color="#7965d7"
      />
      <p className="muted small">
        Đến{" "}
        {new Date(g.targetDate).toLocaleDateString("vi-VN", {
          timeZone: "Asia/Ho_Chi_Minh",
        })}
      </p>
      <p>
        {achieved
          ? "Một cột mốc đáng nhớ. Bạn đã làm được!"
          : g.overdue
            ? "Bạn có thể tiếp tục dành tiền hoặc điều chỉnh ngày hoàn thành."
            : `Cần dành khoảng ${money(g.monthlyNeeded)} mỗi tháng.`}
      </p>
      <div className="inline-actions">
        <Button secondary onClick={onContribute}>
          Phân bổ / rút tiền
        </Button>
        <button className="text-button" disabled={busy} onClick={onArchive}>
          {g.archived ? <RotateCcw size={15} /> : <Archive size={15} />}{" "}
          {g.archived ? "Khôi phục" : "Lưu trữ"}
        </button>
      </div>
      <details>
        <summary>Lịch sử phân bổ ({g.contributions.length})</summary>
        {g.contributions.length ? (
          g.contributions.map((c) => (
            <div className="planning-row" key={c.id}>
              <span>
                {c.wallet.name}
                <small>
                  {new Date(c.createdAt).toLocaleDateString("vi-VN")} ·{" "}
                  {c.note || "Phân bổ mục tiêu"}
                </small>
              </span>
              <strong>{money(c.amount)}</strong>
            </div>
          ))
        ) : (
          <p className="muted">Chưa có khoản phân bổ.</p>
        )}
      </details>
    </section>
  );
}
