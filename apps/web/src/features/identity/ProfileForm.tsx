import { useState } from "react";
import { Button, Field } from "../../components";
import { api, type User } from "../../types";
export default function ProfileForm({
  user,
  onSaved,
}: {
  user: User;
  onSaved: (user: User) => void;
}) {
  const [name, setName] = useState(user.name),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  return (
    <form
      className="profile-form"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        setMessage("");
        try {
          const next = await api<User>("/auth/profile", {
            method: "PATCH",
            body: JSON.stringify({ name }),
          });
          onSaved(next);
          setName(next.name);
          setMessage("Đã cập nhật hồ sơ.");
        } catch (e) {
          setError((e as Error).message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <Field label="Tên hiển thị">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          minLength={2}
          maxLength={60}
          autoComplete="name"
          required
        />
      </Field>
      <Field label="Email đăng nhập">
        <input value={user.email} readOnly type="email" />
      </Field>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <p className="positive" role="status">
          {message}
        </p>
      )}
      <Button
        type="submit"
        secondary
        disabled={busy || name.trim() === user.name}
      >
        {busy ? "Đang lưu…" : "Lưu hồ sơ"}
      </Button>
    </form>
  );
}
