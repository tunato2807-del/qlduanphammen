import { useState } from "react";
import { Button, Field, Modal } from "../../components";
import { api } from "../../types";
export function PasswordForm({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState(""),
    [loading, setLoading] = useState(false);
  return (
    <Modal title="Đổi mật khẩu" onClose={onClose}>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setLoading(true);
          setError("");
          try {
            await api("/auth/password", {
              method: "POST",
              body: JSON.stringify(Object.fromEntries(f)),
            });
            onSaved();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setLoading(false);
          }
        }}
      >
        <Field label="Mật khẩu hiện tại">
          <input
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            maxLength={128}
          />
        </Field>
        <Field label="Mật khẩu mới">
          <input
            name="newPassword"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            maxLength={128}
          />
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
            Đổi mật khẩu
          </Button>
        </div>
      </form>
    </Modal>
  );
}
