import {
  ArrowUpRight,
  CircleHelp,
  House,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Brand } from "../Auth";
import { type User } from "../types";
import { navigation } from "./navigation";
export default function Sidebar({
  mobile,
  setMobile,
  user,
  page,
  navigate,
  setModal,
}: {
  mobile: boolean;
  setMobile: (value: boolean) => void;
  user: User;
  page: string;
  navigate: (id: string) => void;
  setModal: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!mobile) return;
    const previous = document.activeElement as HTMLElement | null;
    const sidebar = ref.current!;
    const focusable = () =>
      Array.from(
        sidebar.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)"),
      );
    focusable()[0]?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMobile(false);
      }
      if (event.key === "Tab") {
        const items = focusable(),
          first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    sidebar.addEventListener("keydown", keydown);
    return () => {
      sidebar.removeEventListener("keydown", keydown);
      previous?.focus();
    };
  }, [mobile, setMobile]);
  return (
    <aside
      ref={ref}
      role={mobile ? "dialog" : undefined}
      aria-modal={mobile || undefined}
      aria-label="Menu Finora"
      className={`sidebar ${mobile ? "open" : ""}`}
    >
      <a
        className="brand-link"
        href="#overview"
        onClick={() => navigate("overview")}
        aria-label="Finora - Tổng quan"
      >
        <Brand />
      </a>
      <div className="workspace-select">
        <span className="workspace-avatar">
          <House size={17} />
        </span>
        <div>
          <strong>Tài chính cá nhân</strong>
          <small>Không gian của bạn</small>
        </div>
        <ShieldCheck size={15} />
      </div>
      <span className="nav-label">QUẢN LÝ TÀI CHÍNH</span>
      <nav aria-label="Điều hướng chính">
        {navigation.map((n) => (
          <button
            key={n.id}
            aria-current={page === n.id ? "page" : undefined}
            className={page === n.id ? "active" : ""}
            onClick={() => navigate(n.id)}
          >
            <n.icon size={19} strokeWidth={1.7} />
            {n.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <span className="note-flower">✳</span>
          <strong>
            Thói quen nhỏ.
            <br />
            Tương lai lớn.
          </strong>
          <p>Mỗi giao dịch được ghi lại là một bước hiểu mình hơn.</p>
          <button onClick={() => setModal("help")}>
            Bắt đầu từ hôm nay
            <ArrowUpRight size={15} />
          </button>
        </div>
        <button
          className={`sidebar-setting ${page === "settings" ? "selected" : ""}`}
          onClick={() => navigate("settings")}
        >
          <Settings size={19} />
          Cài đặt
        </button>
        <button className="sidebar-setting" onClick={() => setModal("help")}>
          <CircleHelp size={19} />
          Hướng dẫn sử dụng
        </button>
        <div className="sidebar-profile">
          <span className="avatar">{user.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user.name}</strong>
            <small>Tài khoản cá nhân</small>
          </div>
          <button
            className="icon-button"
            aria-label="Đăng xuất"
            onClick={() => setModal("logout")}
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}
