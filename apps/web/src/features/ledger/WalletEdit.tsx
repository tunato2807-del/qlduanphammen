import { useState } from "react";
import { Button, Field, Modal, Tip } from "../../components";
import { api, type Wallet } from "../../types";
export function WalletEdit({
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
