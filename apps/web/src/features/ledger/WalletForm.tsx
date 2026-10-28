import { Plus } from "lucide-react";
import { useState } from "react";
import { Button, Field, Modal } from "../../components";
import { api } from "../../types";
export function WalletForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  return (
    <Modal
      title="Thêm một chiếc ví"
      description="Tập hợp tài chính của bạn về cùng một nơi."
      onClose={onClose}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          try {
            await api("/wallets", {
              method: "POST",
              body: JSON.stringify(
                Object.fromEntries(new FormData(e.currentTarget)),
              ),
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
            placeholder="Ví dụ: Tài khoản Vietcombank"
            maxLength={60}
            required
            autoFocus
          />
        </Field>
        <Field label="Loại ví">
          <select name="kind">
            <option value="BANK">Tài khoản ngân hàng</option>
            <option value="CASH">Tiền mặt</option>
            <option value="EWALLET">Ví điện tử</option>
          </select>
        </Field>
        <Field
          label="Số dư ban đầu (VND)"
          hint="Số tiền bạn có trước khi bắt đầu ghi nhận giao dịch; không tính là thu nhập."
        >
          <input
            type="number"
            name="openingBalance"
            defaultValue="0"
            min="0"
            step="1"
            max="9999999999999"
            required
          />
        </Field>
        <Field label="Màu đại diện">
          <input name="color" type="color" defaultValue="#39745d" />
        </Field>
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
            <Plus size={17} />
            Tạo ví
          </Button>
        </div>
      </form>
    </Modal>
  );
}
