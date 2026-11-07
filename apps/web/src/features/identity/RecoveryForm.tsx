import { useState } from "react";
import { Button, Field } from "../../components";
import { api } from "../../types";
export default function RecoveryForm({
  token,
  onBack,
}: {
  token: string;
  onBack: () => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  return (
    <>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          setError("");
          if (token && f.get("password") !== f.get("confirm")) {
            setError("Hai mật khẩu chưa khớp.");
            return;
          }
          setBusy(true);
          try {
            const result = await api<{ message?: string }>(
              token ? "/auth/reset-password" : "/auth/forgot-password",
              {
                method: "POST",
                body: JSON.stringify(
                  token
                    ? { token, password: f.get("password") }
                    : { email: f.get("email") },
                ),
              },
            );
            setMessage(
              token
                ? "Đã đổi mật khẩu và kết thúc các phiên cũ. Hãy đăng nhập lại."
                : result.message || "Hãy kiểm tra email.",
            );
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {message ? (
          <p role="status" className="budget-preview">
            {message}
          </p>
        ) : (
          <>
            {token ? (
              <>
                <Field label="Mật khẩu mới">
                  <input
                    type="password"
                    name="password"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                  />
                </Field>
                <Field label="Nhập lại mật khẩu mới">
                  <input
                    type="password"
                    name="confirm"
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    required
                  />
                </Field>
              </>
            ) : (
              <Field label="Email khôi phục">
                <input
                  type="email"
                  name="email"
                  maxLength={200}
                  autoComplete="email"
                  required
                />
              </Field>
            )}
            {error && (
              <div className="form-error" role="alert">
                {error}
              </div>
            )}
            <Button type="submit" className="full" disabled={busy}>
              {busy
                ? "Đang xử lý…"
                : token
                  ? "Đặt lại mật khẩu"
                  : "Gửi liên kết khôi phục"}
            </Button>
          </>
        )}
      </form>
      <p className="auth-switch">
        <button
          disabled={busy}
          onClick={() => {
            if (token) {
              location.replace(location.pathname);
            } else onBack();
          }}
        >
          Quay lại đăng nhập
        </button>
      </p>
    </>
  );
}
