import { Check, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { Button, Field, Modal, Tip } from "../../components";
import {
  api,
  today,
  type Category,
  type Transaction,
  type Wallet,
} from "../../types";
export function TransactionForm({
  wallets,
  categories,
  transaction,
  onClose,
  onSaved,
}: {
  wallets: Wallet[];
  categories: Category[];
  transaction?: Transaction;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [kind, setKind] = useState(transaction?.kind || "EXPENSE"),
    [loading, setLoading] = useState(false),
    [error, setError] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      await api("/transactions" + (transaction ? "/" + transaction.id : ""), {
        method: transaction ? "PATCH" : "POST",
        body: JSON.stringify({
          kind,
          amount: f.get("amount"),
          walletId: f.get("walletId"),
          ...(kind === "TRANSFER"
            ? { destinationWalletId: f.get("destinationWalletId") }
            : { categoryId: f.get("categoryId") }),
          occurredAt: f.get("date") + "T12:00:00+07:00",
          note: f.get("note"),
        }),
      });
      onSaved();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <Modal
      title={transaction ? "Chỉnh sửa giao dịch" : "Một giao dịch mới"}
      description="Ghi lại hôm nay, hiểu rõ dòng tiền ngày mai."
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="segmented">
          {[
            ["EXPENSE", "Khoản chi"],
            ["INCOME", "Khoản thu"],
            ["TRANSFER", "Chuyển ví"],
          ].map(([id, label]) => (
            <button
              type="button"
              key={id}
              className={kind === id ? "active" : ""}
              onClick={() => setKind(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <Field label="Số tiền (VND)">
          <input
            name="amount"
            type="number"
            placeholder="0"
            className="money-input"
            min="1"
            max="9999999999999"
            step="1"
            defaultValue={transaction?.amount}
            required
            autoFocus
          />
        </Field>
        <div className="form-grid">
          <Field label={kind === "TRANSFER" ? "Từ ví" : "Ví giao dịch"}>
            <select
              name="walletId"
              required
              defaultValue={
                transaction?.walletId || wallets.find((w) => !w.archived)?.id
              }
            >
              {wallets
                .filter((w) => !w.archived)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
            </select>
          </Field>
          {kind === "TRANSFER" ? (
            <Field label="Đến ví">
              <select
                name="destinationWalletId"
                required
                defaultValue={
                  transaction?.destinationWalletId ||
                  wallets.filter((w) => !w.archived)[1]?.id
                }
              >
                {wallets
                  .filter((w) => !w.archived)
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
              </select>
            </Field>
          ) : (
            <Field label="Danh mục">
              <select
                key={kind}
                name="categoryId"
                defaultValue={
                  transaction?.kind === kind ? transaction.categoryId || "" : ""
                }
                required
              >
                <option value="" disabled>
                  Chọn danh mục
                </option>
                {categories
                  .filter((c) => c.kind === kind && !c.archived)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </Field>
          )}
        </div>
        <Field label="Ngày giao dịch">
          <input
            type="date"
            name="date"
            defaultValue={
              transaction
                ? new Intl.DateTimeFormat("sv-SE", {
                    timeZone: "Asia/Ho_Chi_Minh",
                  }).format(new Date(transaction.occurredAt))
                : today()
            }
            required
          />
        </Field>
        <Field label="Ghi chú">
          <input
            name="note"
            placeholder="Ví dụ: Cà phê sáng cùng bạn bè"
            maxLength={250}
            defaultValue={transaction?.note}
          />
        </Field>
        {kind === "TRANSFER" && (
          <Tip>
            Chuyển tiền giữa các ví không làm tăng thu nhập hoặc chi tiêu.
          </Tip>
        )}
        {error && (
          <div className="form-error" role="alert">
            {error}
          </div>
        )}
        <div className="modal-actions">
          <Button secondary onClick={onClose}>
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={loading || !wallets.some((w) => !w.archived)}
          >
            {loading ? (
              <LoaderCircle className="spin" size={17} />
            ) : (
              <Check size={17} />
            )}
            Lưu giao dịch
          </Button>
        </div>
      </form>
    </Modal>
  );
}
