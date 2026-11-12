import { useState } from "react";
import { Button, Field, Modal, Tip } from "../../components";
import { type Wallet, type Category, today } from "../../types";
import { useWrite } from "../../shared/useWrite";
import type { Rule } from "./models";
export function nextMonth() {
  const [y, m] = today().slice(0, 7).split("-").map(Number);
  return new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
}
export function replacementMonth(rule: Rule) {
  const [y, m] = rule.startMonth.split("-").map(Number);
  const nextStart = new Date(Date.UTC(y, m, 1)).toISOString().slice(0, 7);
  return nextStart > nextMonth() ? nextStart : nextMonth();
}
export function RuleForm({
  rule,
  month,
  wallets,
  categories,
  onClose,
  onSaved,
}: {
  rule?: Rule;
  month: string;
  wallets: Wallet[];
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const write = useWrite(),
    [kind, setKind] = useState(rule?.kind || "EXPENSE"),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      title={rule ? "Thay đổi lịch định kỳ" : "Tạo giao dịch định kỳ"}
      description={
        rule
          ? "Thay đổi từ tháng tương lai, giữ nguyên các khoản cũ."
          : "Để những khoản quen thuộc không bị bỏ quên."
      }
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = Object.fromEntries(new FormData(e.currentTarget));
          setBusy(true);
          setError("");
          try {
            await write(rule ? `/recurring/${rule.id}/replace` : "/recurring", {
              name: f.name,
              amount: f.amount,
              kind,
              walletId: f.walletId,
              categoryId: f.categoryId,
              day: Number(f.day),
              startMonth: f.startMonth,
              ...(f.endMonth ? { endMonth: f.endMonth } : {}),
              note: f.note,
            });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {rule && (
          <Tip>
            Quy tắc cũ kết thúc ngay trước tháng hiệu lực mới. Nháp và giao dịch
            cũ giữ số tiền, ngày và ghi chú trước đây.
          </Tip>
        )}
        <Field label="Tên kế hoạch">
          <input
            name="name"
            required
            maxLength={60}
            defaultValue={rule?.name}
            placeholder="Ví dụ: Tiền nhà"
          />
        </Field>
        <div className="form-grid">
          <Field label="Loại giao dịch">
            <select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="EXPENSE">Khoản chi</option>
              <option value="INCOME">Khoản thu</option>
            </select>
          </Field>
          <Field label="Số tiền (VND)">
            <input
              name="amount"
              type="number"
              min="1"
              max="9999999999999"
              step="1"
              required
              defaultValue={rule?.amount}
            />
          </Field>
        </div>
        <div className="form-grid">
          <Field label="Ví">
            <select name="walletId" required defaultValue={rule?.walletId}>
              {wallets
                .filter((w) => !w.archived)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Danh mục">
            <select
              name="categoryId"
              key={kind}
              required
              defaultValue={rule?.kind === kind ? rule.categoryId : undefined}
            >
              {categories
                .filter((c) => !c.archived && c.kind === kind)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>
        </div>
        <Field label="Ngày hằng tháng">
          <input
            name="day"
            type="number"
            min="1"
            max="31"
            defaultValue={rule?.day || 1}
            required
          />
        </Field>
        <p className="muted small">Tháng ngắn hơn sẽ dùng ngày cuối tháng.</p>
        <div className="form-grid">
          <Field label={rule ? "Tháng hiệu lực mới" : "Từ tháng"}>
            <input
              name="startMonth"
              type="month"
              min={rule ? replacementMonth(rule) : undefined}
              defaultValue={rule ? replacementMonth(rule) : month}
              required
            />
          </Field>
          <Field label="Đến tháng (tùy chọn)">
            <input
              name="endMonth"
              type="month"
              defaultValue={rule?.endMonth || undefined}
            />
          </Field>
        </div>
        <Field label="Ghi chú">
          <input name="note" maxLength={250} defaultValue={rule?.note} />
        </Field>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <Button secondary disabled={busy} onClick={onClose}>
            Hủy
          </Button>
          <Button type="submit" disabled={busy}>
            {busy
              ? "Đang lưu…"
              : rule
                ? "Lưu thay đổi tương lai"
                : "Lưu kế hoạch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
