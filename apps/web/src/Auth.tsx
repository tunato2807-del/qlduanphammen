import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { MotionToggle } from "./Experience";
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
import { api, type User } from "./types";
import { Button, Field } from "./components";
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
      <div className="auth-story">
        <Brand />
        <div className="auth-copy">
          <span className="pill">
            <span className="live-dot" /> MỘT KHỞI ĐẦU NHẸ NHÀNG HƠN
          </span>
          <h1>
            Tiền của bạn.
            <br />
            Cuộc sống <span>của bạn.</span>
          </h1>
          <p>
            Hiểu dòng tiền hôm nay.
            <br />
            Tự tin với những kế hoạch ngày mai.
          </p>
          <motion.div
            className="auth-preview"
            initial={{ opacity: 0, y: 30, rotate: -3 }}
            animate={{ opacity: 1, y: 0, rotate: -3 }}
            transition={{ duration: 0.8 }}
          >
            <div className="preview-label">
              <span>TỔNG TÀI SẢN</span>
              <Leaf size={20} />
            </div>
            <strong>
              38.555.000 <small>₫</small>
            </strong>
            <span className="preview-growth">
              <TrendingUp size={15} /> Mỗi bước nhỏ, một tương lai lớn
            </span>
            <div className="mini-bars">
              {[35, 50, 44, 66, 56, 78, 72, 92, 86, 100, 94, 115].map(
                (h, i) => (
                  <motion.i
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: h }}
                    transition={{ delay: 0.3 + i * 0.045 }}
                  />
                ),
              )}
            </div>
            <div className="preview-bottom">
              <span>
                THU NHẬP <b>26,5 triệu</b>
              </span>
              <span>
                TIẾT KIỆM DỰ KIẾN <b>8 triệu</b>
              </span>
            </div>
          </motion.div>
          <div className="auth-float">
            <span>
              <Check size={16} />
            </span>
            <div>
              Ngân sách đã sẵn sàng<small>Được thiết kế riêng cho bạn</small>
            </div>
            <Sparkles size={20} />
          </div>
        </div>
        <div className="auth-foot">
          <ShieldCheck size={16} /> Dữ liệu riêng tư. Quyền kiểm soát thuộc về
          bạn.
        </div>
      </div>
      <main className="auth-form-panel">
        <div className="auth-motion">
          <MotionToggle />
        </div>
        <div className="auth-mobile-brand">
          <Brand />
        </div>
        <div className="auth-form">
          <span className="eyebrow">TÀI CHÍNH TRONG TẦM TAY</span>
          <h2>
            {register ? "Bắt đầu hành trình của bạn" : "Chào mừng bạn trở lại"}
            <span className="dot">.</span>
          </h2>
          <p>
            {register
              ? "Một nơi dành riêng cho tài chính và những dự định của bạn."
              : "Một chút quan tâm hôm nay, một tương lai vững vàng hơn."}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              void run(register ? "register" : "login", Object.fromEntries(f));
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
                  autoComplete={register ? "new-password" : "current-password"}
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
        </div>
        <span className="auth-copyright">
          © {new Date().getFullYear()} Finora. Từng bước đến tự do tài chính.
        </span>
      </main>
    </div>
  );
}
