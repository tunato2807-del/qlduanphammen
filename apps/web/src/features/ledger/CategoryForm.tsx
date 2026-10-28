import { Plus } from "lucide-react";
import { useState } from "react";
import { Button, Field, Modal } from "../../components";
import { api } from "../../types";
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
