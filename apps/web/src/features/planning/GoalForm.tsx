import { useState } from "react";
import { Button, Field, Modal } from "../../components";
import { today } from "../../types";
import { useWrite } from "../../shared/useWrite";
import type { Goal } from "./models";
export function GoalForm({
  goal,
  onClose,
  onSaved,
}: {
  goal?: Goal;
  onClose: () => void;
  onSaved: () => void;
}) {
  const write = useWrite(),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return (
    <Modal
      title={goal ? "Chỉnh sửa mục tiêu" : "Tạo mục tiêu tiết kiệm"}
      description="Một mục tiêu rõ ràng, một bước gần hơn mỗi ngày."
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
            await write(
              goal ? `/goals/${goal.id}` : "/goals",
              {
                name: f.get("name"),
                target: f.get("amount"),
                targetDate: f.get("date") + "T23:59:59+07:00",
              },
              goal ? "PATCH" : "POST",
            );
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Tên kế hoạch">
          <input
            name="name"
            required
            maxLength={60}
            defaultValue={goal?.name}
            placeholder="Ví dụ: Chiếc laptop mới"
          />
        </Field>
        <Field label="Số tiền (VND)">
          <input
            type="number"
            name="amount"
            min="1"
            max="9999999999999"
            step="1"
            required
            defaultValue={goal?.target}
            placeholder="0"
          />
        </Field>
        <Field label="Ngày hoàn thành">
          <input
            type="date"
            name="date"
            min={goal ? undefined : today()}
            required
            defaultValue={
              goal
                ? new Intl.DateTimeFormat("sv-SE", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  }).format(new Date(goal.targetDate))
                : undefined
            }
          />
        </Field>
        {goal && (
          <p className="muted small">
            Thay đổi kế hoạch không sửa số tiền đã dành hay lịch sử phân bổ.
          </p>
        )}
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
            {busy ? "Đang lưu…" : "Lưu kế hoạch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
