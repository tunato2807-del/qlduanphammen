import Welcome from "./features/welcome/Welcome";
import BlueLandscape from "./shared/BlueLandscape";
import RecoveryForm from "./features/identity/RecoveryForm";
import {
  ArrowRight,
  ArrowUpRight,
  ChartNoAxesCombined,
  Check,
  Eye,
  EyeOff,
  Leaf,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { Button, Field } from "./components";
import { MotionToggle, useExperience } from "./Experience";
import { api, type User } from "./types";
export function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">
        <ChartNoAxesCombined size={25} strokeWidth={2.7} />
      </span>
      finora<span className="brand-dot">.</span>
    </span>
  );
}
export default function Auth({ onLogin }: { onLogin: (user: User) => void }) {
  const { reduced } = useExperience();
  const [resetToken, setResetToken] = useState(() => {
    const token = location.hash.startsWith("#reset-password?")
      ? new URLSearchParams(location.hash.split("?")[1]).get("token") || ""
      : "";
    return token;
  });
  useEffect(() => {
    const read = () => {
      if (location.hash.startsWith("#reset-password?")) {
        const token = new URLSearchParams(location.hash.split("?")[1]).get(
          "token",
        );
        if (token) setResetToken(token);
      }
    };
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, []);
  useEffect(() => {
    if (resetToken)
      history.replaceState(null, "", location.pathname + location.search);
  }, [resetToken]);
  const [forgot, setForgot] = useState(false);
  const recovery = forgot || !!resetToken;
  const [register, setRegister] = useState(false),
    [loading, setLoading] = useState(""),
    [error, setError] = useState(""),
    [show, setShow] = useState(false),
    [demo, setDemo] = useState(false);
  useEffect(() => {
    api<{ demoEnabled: boolean }>("/auth/config")
      .then((c) => setDemo(c.demoEnabled))
      .catch(() => setError("Chưa kết nối được API. Hãy kiểm tra máy chủ."));
  }, []);
  const run = async (kind: string, data?: unknown) => {
    setLoading(kind);
    setError("");
    try {
      onLogin(
        await api<User>("/auth/" + kind, {
          method: "POST",
          body: JSON.stringify(data || {}),
        }),
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading("");
    }
  };
  return (
    <div className="auth-layout">
      {!recovery && <Welcome />}
      <div className="auth-story">
        <Brand />
        <div className="auth-copy">
          <span className="pill">
            <span className="live-dot" />
            TÍCH LŨY AN TÂM · NUÔI DƯỠNG DỰ ĐỊNH
          </span>
          <h1>
            An tâm hôm nay.
            <br />
            <span>Thảnh thơi ngày mai.</span>
          </h1>
          <p>
            Từ ly cà phê hôm nay đến chuyến đi bạn mơ ước.
            <br />
            Cùng Finora dành chỗ cho những điều quan trọng.
          </p>
          <div className="auth-landscape">
            <BlueLandscape />
          </div>
          <motion.div
            className="auth-preview"
            initial={reduced ? false : { opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduced ? 0 : 0.6 }}
          >
            <div className="preview-label">
              <span>MỘT THÁNG CÓ KẾ HOẠCH</span>
              <Sparkles size={20} />
            </div>
            <strong>
              15.000.000 <small>₫</small>
            </strong>
            <span className="preview-growth">Thu nhập dự kiến · Minh họa</span>
            <div className="auth-allocation">
              <i />
              <i />
              <i />
            </div>
            <div className="preview-bottom">
              <span>
                CHI THIẾT YẾU<b>9 triệu</b>
              </span>
              <span>
                CHO BẢN THÂN<b>3 triệu</b>
              </span>
              <span>
                DỰ TRÙ TIẾT KIỆM<b>3 triệu</b>
              </span>
            </div>
            <div className="auth-card-foot">
              <Check size={16} /> Mỗi đồng tiền có một mục đích.
            </div>
          </motion.div>
          <div className="auth-float">
            <span>
              <Leaf size={19} />
            </span>
            <div>
              Từng bước nhỏ<small>Cho một tương lai rộng mở</small>
            </div>
            <ArrowUpRight size={20} />
          </div>
        </div>
        <div className="auth-foot">
          <span>
            <ShieldCheck size={17} />
            Dữ liệu riêng theo tài khoản
          </span>
          <span>
            <Sparkles size={17} />
            Có thể giảm chuyển động
          </span>
        </div>
      </div>
      <main className="auth-form-panel" id="finora-access" tabIndex={-1}>
        <div className="auth-motion">
          <MotionToggle />
        </div>
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <div className="auth-form">
          <span className="eyebrow">TÀI CHÍNH TRONG TẦM TAY</span>
          <h2>
            {recovery
              ? resetToken
                ? "Đặt lại mật khẩu"
                : "Khôi phục tài khoản"
              : register
                ? "Bắt đầu hành trình của bạn"
                : "Chào mừng bạn trở lại"}
            <span className="dot">.</span>
          </h2>
          <p>
            {register
              ? "Một nơi dành riêng cho tài chính và những dự định của bạn."
              : "Một chút quan tâm hôm nay, một tương lai vững vàng hơn."}
          </p>
          {recovery ? (
            <RecoveryForm token={resetToken} onBack={() => setForgot(false)} />
          ) : (
            <>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  void run(
                    register ? "register" : "login",
                    Object.fromEntries(f),
                  );
                }}
              >
                {register && (
                  <Field label="Tên của bạn">
                    <input
                      name="name"
                      placeholder="Nguyễn Minh Anh"
                      required
                      minLength={2}
                      maxLength={60}
                      autoComplete="name"
                    />
                  </Field>
                )}
                <Field label="Địa chỉ email">
                  <input
                    name="email"
                    type="email"
                    placeholder="ban@email.com"
                    required
                    autoComplete="email"
                    maxLength={200}
                  />
                </Field>
                <Field label="Mật khẩu">
                  <span className="password-input">
                    <input
                      name="password"
                      type={show ? "text" : "password"}
                      placeholder={
                        register ? "Tối thiểu 8 ký tự" : "Nhập mật khẩu của bạn"
                      }
                      required
                      minLength={register ? 8 : 1}
                      maxLength={128}
                      autoComplete={
                        register ? "new-password" : "current-password"
                      }
                    />
                    <button
                      type="button"
                      aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                      onClick={() => setShow(!show)}
                    >
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </span>
                </Field>
                {error && (
                  <div className="form-error" role="alert">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={!!loading} className="full">
                  {loading && loading !== "demo" ? (
                    <LoaderCircle className="spin" size={18} />
                  ) : null}
                  {register ? "Tạo tài khoản" : "Đăng nhập"}
                  <ArrowRight size={18} />
                </Button>
              </form>
              {!register && (
                <p className="auth-switch">
                  <button onClick={() => setForgot(true)}>
                    Quên mật khẩu?
                  </button>
                </p>
              )}
              <p className="auth-switch">
                {register ? "Đã có tài khoản?" : "Bạn chưa có tài khoản?"}{" "}
                <button
                  onClick={() => {
                    setRegister(!register);
                    setError("");
                  }}
                >
                  {register ? "Đăng nhập" : "Đăng ký miễn phí"}
                </button>
              </p>
              {demo && (
                <>
                  <div className="or-divider">
                    <span>HOẶC KHÁM PHÁ TRƯỚC</span>
                  </div>
                  <Button
                    secondary
                    className="full demo-button"
                    disabled={!!loading}
                    onClick={() => void run("demo")}
                  >
                    {loading === "demo" ? (
                      <LoaderCircle size={18} className="spin" />
                    ) : (
                      <Sparkles size={18} />
                    )}
                    Trải nghiệm với dữ liệu mẫu
                    <ArrowUpRight size={16} />
                  </Button>
                  <small className="demo-note">
                    Một không gian trải nghiệm riêng, không cần đăng ký.
                  </small>
                </>
              )}
            </>
          )}
        </div>
        <span className="auth-copyright">
          © {new Date().getFullYear()} Finora. Từng bước đến tự do tài chính.
        </span>
      </main>
    </div>
  );
}
