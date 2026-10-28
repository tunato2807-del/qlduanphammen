type BudgetDraft = {
  categoryId: string;
  fixed: string;
  weight: number;
  limit: string;
};
import { ArrowRight, Check, LoaderCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button, CategoryIcon, Field, Modal, Tip } from "../../components";
import {
  api,
  money,
  monthLabel,
  type Budget,
  type Category,
} from "../../types";
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
