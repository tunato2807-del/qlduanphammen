import { replacementMonth } from "./RuleForm";
import { CalendarClock, ArrowUpRight } from "lucide-react";
import { Button, Tip } from "../../components";
import { money, today } from "../../types";
import type { Rule, Draft } from "./models";
export function RecurringPanel({
  rules,
  drafts,
  busy,
  onAction,
  onToggle,
  onReplace,
}: {
  rules: Rule[];
  drafts: Draft[];
  busy: boolean;
  onAction: (id: string, action: string) => void;
  onToggle: (rule: Rule) => void;
  onReplace: (rule: Rule) => void;
}) {
  const month = today().slice(0, 7);
  return (
    <>
      <Tip>
        Khoản đến hạn là bản nháp. Chỉ khi bạn xác nhận, số dư và báo cáo mới
        thay đổi. Chọn tháng cũ để xem các khoản còn bỏ ngỏ.
      </Tip>
      <section className="panel planning-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">KIỂM TRA TRƯỚC KHI GHI SỔ</span>
            <h2>Các khoản trong tháng</h2>
          </div>
          <CalendarClock size={22} />
        </div>
        {drafts.length ? (
          drafts.map((d) => (
            <div className="planning-row" key={d.id}>
              <span className="draft-symbol">
                <CalendarClock size={19} />
              </span>
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
                    disabled={busy || !d.rule.active}
                    onClick={() => onAction(d.id, "CONFIRM")}
                  >
                    Xác nhận ghi sổ
                  </Button>
                  <Button
                    secondary
                    disabled={busy}
                    onClick={() => onAction(d.id, "SKIP")}
                  >
                    Bỏ qua
                  </Button>
                </div>
              ) : (
                <span className="period-badge">
                  {d.state === "CONFIRMED"
                    ? d.transactionId
                      ? "Đã ghi sổ"
                      : "Đã xử lý · giao dịch đã xóa"
                    : "Đã bỏ qua"}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="planning-empty">
            <CalendarClock size={32} />
            <p>Chưa có khoản đến hạn trong tháng này.</p>
            <small>Quy tắc tương lai sẽ xuất hiện khi đến hạn.</small>
          </div>
        )}
      </section>
      <section className="panel planning-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">NHỮNG KHOẢN QUEN THUỘC</span>
            <h2>Quy tắc hằng tháng</h2>
          </div>
          <span className="period-badge">{rules.length} quy tắc</span>
        </div>
        {rules.length ? (
          rules.map((r) => (
            <div className="rule-card" key={r.id}>
              <div className="rule-date">
                <strong>{r.day}</strong>
                <small>HẰNG THÁNG</small>
              </div>
              <div className="rule-info">
                <h3>{r.name}</h3>
                <p>
                  {r.category.name} · {r.wallet.name}
                </p>
                <small>
                  {r.startMonth}
                  {r.endMonth ? ` → ${r.endMonth}` : " trở đi"} ·{" "}
                  {!r.active
                    ? "Đang tạm dừng"
                    : r.startMonth > month
                      ? "Chưa đến tháng bắt đầu"
                      : r.endMonth && r.endMonth < month
                        ? "Đã kết thúc"
                        : "Đang áp dụng"}
                </small>
              </div>
              <strong className="rule-amount">{money(r.amount)}</strong>
              <div className="inline-actions">
                <Button secondary disabled={busy} onClick={() => onToggle(r)}>
                  {r.active ? "Tạm dừng" : "Bật lại"}
                </Button>
                {r.active &&
                  (!r.endMonth || r.endMonth >= replacementMonth(r)) && (
                    <button
                      className="text-button"
                      onClick={() => onReplace(r)}
                      aria-label={`Đổi quy tắc ${r.name} từ tháng sau`}
                    >
                      Thay đổi
                      <ArrowUpRight size={15} />
                    </button>
                  )}
              </div>
            </div>
          ))
        ) : (
          <p className="muted">
            Thêm lương, tiền nhà hoặc hóa đơn cần nhớ mỗi tháng.
          </p>
        )}
      </section>
    </>
  );
}
