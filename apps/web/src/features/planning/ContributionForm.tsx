import { useState } from "react";
import { Button, Field, Modal, Tip } from "../../components";
import { type Wallet } from "../../types";
import { useWrite } from "../../shared/useWrite";
import type { Goal } from "./models";
export function ContributionForm({
  goal,
  wallets,
  onClose,
  onSaved,
}: {
  goal: Goal;
  wallets: Wallet[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const write = useWrite(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [action, setAction] = useState(goal.archived ? "WITHDRAW" : "ADD");
  return (
    <Modal
      title="Phân bổ tiền cho mục tiêu"
      description={goal.name}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setError("");
          try {
            await write(`/goals/${goal.id}/contributions`, {
              action,
              amount: f.get("amount"),
              walletId: f.get("walletId"),
              note: f.get("note"),
            });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Tip>
          Đây là phần dành riêng từ tiền có trong ví, không tạo khoản thu/chi.
          Mục tiêu lưu trữ vẫn có thể rút phần đã dành.
        </Tip>
        <Field label="Thao tác">
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            {!goal.archived && <option value="ADD">Dành tiền từ ví</option>}
            <option value="WITHDRAW">Rút phần đã dành về ví</option>
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
          />
        </Field>
        <Field label="Ví">
          <select name="walletId" required>
            {wallets
              .filter((w) => action === "WITHDRAW" || !w.archived)
              .map((w) => (
                <option value={w.id} key={w.id}>
                  {w.name}
                  {w.archived ? " · Đã lưu trữ" : ""}
                </option>
              ))}
          </select>
        </Field>
        <Field label="Ghi chú">
          <input
            name="note"
            maxLength={250}
            placeholder="Một bước nhỏ cho mục tiêu"
          />
        </Field>
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <Button secondary onClick={onClose} disabled={busy}>
            Hủy
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? "Đang lưu…" : "Lưu kế hoạch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
