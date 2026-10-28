import {
  ArrowUpRight,
  CircleHelp,
  House,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Brand } from "../Auth";
import { type User } from "../types";
import { navigation } from "./navigation";
export default function Sidebar({
  mobile,
  user,
  page,
  navigate,
  setModal,
}: {
  mobile: boolean;
  user: User;
  page: string;
  navigate: (id: string) => void;
  setModal: (id: string) => void;
}) {
  return (
    <aside className={`sidebar ${mobile ? "open" : ""}`}>
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
      <nav>
        {navigation.map((n) => (
          <button
            key={n.id}
            className={page === n.id ? "active" : ""}
            onClick={() => navigate(n.id)}
          >
            <n.icon size={19} strokeWidth={1.7} />
            {n.label}
            {n.id === "budgets" && <span className="nav-new">MỚI</span>}
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
