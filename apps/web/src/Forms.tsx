import { useState } from "react";
import { ArrowRight, Check, LoaderCircle, Plus, Sparkles } from "lucide-react";
import {
  api,
  money,
  monthLabel,
  today,
  type Budget,
  type Category,
  type Transaction,
  type Wallet,
} from "./types";
import { Button, CategoryIcon, Field, Modal, Tip } from "./components";
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
type BudgetDraft = {
  categoryId: string;
  fixed: string;
  weight: number;
  limit: string;
};
export function BudgetForm({
  month,
  categories,
  budget,
  onClose,
  onSaved,
}: {
  month: string;
  categories: Category[];
  budget: Budget | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [income, setIncome] = useState(budget?.income || "15000000"),
    [savings, setSavings] = useState(budget?.savings || "3000000"),
    [mode, setMode] = useState(budget?.mode || "AUTO");
  const [items, setItems] = useState<BudgetDraft[]>(
    categories
      .filter((c) => c.kind === "EXPENSE" && !c.archived)
      .map((c) => {
        const old = budget?.items.find((i) => i.categoryId === c.id);
        return {
          categoryId: c.id,
          fixed: old?.fixed || "0",
          weight: old?.weight ?? (c.icon === "home" ? 0 : 10),
          limit: old?.limit || "0",
        };
      }),
  );
  const [preview, setPreview] = useState<{
      items: BudgetDraft[];
      unallocated: string;
    } | null>(null),
    [loading, setLoading] = useState(""),
    [error, setError] = useState("");
  const change = (
    index: number,
    key: keyof BudgetDraft,
    value: string | number,
  ) => {
    setItems(items.map((i, n) => (n === index ? { ...i, [key]: value } : i)));
    setPreview(null);
  };
  const payload = { month, income, savings, mode, items };
  const run = async (save: boolean) => {
    setLoading(save ? "save" : "preview");
    setError("");
    try {
      if (save) {
        await api("/budget-plans", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        onSaved();
      } else {
        setPreview(
          await api("/budget-plans/preview", {
            method: "POST",
            body: JSON.stringify(payload),
          }),
        );
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading("");
    }
  };
  return (
    <Modal
      wide
      title={budget ? "Điều chỉnh ngân sách" : "Thiết kế ngân sách của bạn"}
      description={`${monthLabel(month)} · Một kế hoạch phù hợp với cuộc sống của bạn.`}
      onClose={onClose}
    >
      <div className="segmented">
        <button
          className={mode === "AUTO" ? "active" : ""}
          onClick={() => {
            setMode("AUTO");
            setPreview(null);
          }}
        >
          <Sparkles size={15} />
          Phân bổ tự động
        </button>
        <button
          className={mode === "MANUAL" ? "active" : ""}
          onClick={() => {
            setMode("MANUAL");
            setPreview(null);
          }}
        >
          Tự đặt hạn mức
        </button>
      </div>
      <div className="form-grid">
        <Field label="Thu nhập dự kiến (VND)">
          <input
            type="number"
            min="0"
            max="9999999999999"
            step="1"
            value={income}
            onChange={(e) => {
              setIncome(e.target.value);
              setPreview(null);
            }}
          />
        </Field>
        <Field label="Dự trù tiết kiệm (VND)">
          <input
            type="number"
            min="0"
            max="9999999999999"
            step="1"
            value={savings}
            onChange={(e) => {
              setSavings(e.target.value);
              setPreview(null);
            }}
          />
        </Field>
      </div>
      <Tip>
        {mode === "AUTO"
          ? "Sau khi trừ chi bắt buộc và tiết kiệm, phần còn lại được chia theo trọng số. Trọng số càng cao, mức phân bổ càng lớn."
          : "Tổng hạn mức các danh mục và tiết kiệm phải không vượt thu nhập dự kiến."}
      </Tip>
      <div className="budget-editor">
        <div className="budget-editor-head">
          <span>Danh mục</span>
          {mode === "AUTO" ? (
            <>
              <span>Chi bắt buộc (₫)</span>
              <span>Trọng số</span>
            </>
          ) : (
            <span>Hạn mức (₫)</span>
          )}
        </div>
        {items.map((item, index) => {
          const c = categories.find((c) => c.id === item.categoryId)!;
          return (
            <div className="budget-editor-row" key={c.id}>
              <span>
                <CategoryIcon icon={c.icon} color={c.color} small />
                {c.name}
              </span>
              {mode === "AUTO" ? (
                <>
                  <input
                    aria-label={`Chi bắt buộc ${c.name}`}
                    type="number"
                    min="0"
                    max="9999999999999"
                    step="1"
                    value={item.fixed}
                    onChange={(e) => change(index, "fixed", e.target.value)}
                  />
                  <input
                    aria-label={`Trọng số ${c.name}`}
                    type="number"
                    min="0"
                    max="1000"
                    step="1"
                    value={item.weight}
                    onChange={(e) =>
                      change(index, "weight", Number(e.target.value))
                    }
                  />
                </>
              ) : (
                <input
                  aria-label={`Hạn mức ${c.name}`}
                  type="number"
                  min="0"
                  max="9999999999999"
                  step="1"
                  value={item.limit}
                  onChange={(e) => change(index, "limit", e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
      {preview && (
        <div className="budget-preview">
          <h3>
            <Sparkles size={18} />
            Phương án của bạn đã sẵn sàng
          </h3>
          {preview.items.map((i) => (
            <div key={i.categoryId}>
              <span>{categories.find((c) => c.id === i.categoryId)?.name}</span>
              <strong>{money(i.limit)}</strong>
            </div>
          ))}
          <div>
            <span>Dự trù tiết kiệm</span>
            <strong>{money(savings)}</strong>
          </div>
          {BigInt(preview.unallocated) > 0n && (
            <div>
              <span>Chưa phân bổ</span>
              <strong>{money(preview.unallocated)}</strong>
            </div>
          )}
          <p>
            Đây là kế hoạch dựa trên thu nhập dự kiến, không phải xác nhận tiền
            đang có. Chỉ áp dụng khi bạn xác nhận.
          </p>
        </div>
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
        {!preview ? (
          <Button onClick={() => void run(false)} disabled={!!loading}>
            {loading ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Sparkles size={17} />
            )}
            Xem phương án
          </Button>
        ) : (
          <Button onClick={() => void run(true)} disabled={!!loading}>
            {loading ? (
              <LoaderCircle size={17} className="spin" />
            ) : (
              <Check size={17} />
            )}
            Xác nhận áp dụng
            <ArrowRight size={16} />
          </Button>
        )}
      </div>
    </Modal>
  );
}
export function CategoryForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  return (
    <Modal title="Thêm danh mục" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setLoading(true);
          setError("");
          try {
            await api("/categories", {
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
        <Field label="Tên danh mục">
          <input
            name="name"
            maxLength={40}
            placeholder="Ví dụ: Thú cưng"
            required
            autoFocus
          />
        </Field>
        <Field label="Loại">
          <select name="kind">
            <option value="EXPENSE">Chi tiêu</option>
            <option value="INCOME">Thu nhập</option>
          </select>
        </Field>
        <Field label="Biểu tượng">
          <select name="icon">
            {[
              ["other", "Khác"],
              ["food", "Ăn uống"],
              ["home", "Nhà ở"],
              ["transport", "Di chuyển"],
              ["shopping", "Mua sắm"],
              ["health", "Sức khỏe"],
              ["fun", "Giải trí"],
              ["education", "Học tập"],
              ["salary", "Công việc"],
              ["gift", "Quà tặng"],
            ].map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Màu sắc">
          <input name="color" type="color" defaultValue="#8b83cf" />
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
            <Plus size={16} />
            Thêm danh mục
          </Button>
        </div>
      </form>
    </Modal>
  );
}
