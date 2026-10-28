import { useState } from "react";
import { Button, Field, Modal, Tip } from "../../components";
import { api, type Category } from "../../types";
export function CategoryEdit({
  category,
  onClose,
  onSaved,
}: {
  category: Category;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  return (
    <Modal title="Điều chỉnh danh mục" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setLoading(true);
          setError("");
          try {
            await api("/categories/" + category.id, {
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
        <Field label="Tên danh mục">
          <input
            name="name"
            defaultValue={category.name}
            required
            maxLength={40}
          />
        </Field>
        <label className="checkbox-field">
          <input
            name="archived"
            type="checkbox"
            defaultChecked={category.archived}
          />
          Lưu trữ danh mục này
        </label>
        <Tip>
          Lịch sử giao dịch và ngân sách cũ vẫn được giữ. Danh mục đã lưu trữ
          không xuất hiện khi tạo giao dịch hoặc lập ngân sách mới.
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
