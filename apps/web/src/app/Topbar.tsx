import { Bell, Menu, Search, X } from "lucide-react";
import { CategoryIcon } from "../components";
import { MotionToggle } from "../Experience";
import { type User } from "../types";

export default function Topbar({
  user,
  title,
  page,
  search,
  setSearch,
  navigate,
  setMobile,
  notifications,
  setNotifications,
  alerts,
}: {
  user: User;
  title: string;
  page: string;
  search: string;
  setSearch: (value: string) => void;
  navigate: (id: string) => void;
  setMobile: (value: boolean) => void;
  notifications: boolean;
  setNotifications: (value: boolean) => void;
  alerts: import("../types").BudgetItem[];
}) {
  return (
    <header className="topbar">
      <div className="breadcrumb">
        <button
          className="icon-button mobile-menu"
          onClick={() => setMobile(true)}
          aria-label="Mở menu"
        >
          <Menu size={21} />
        </button>
        <span>Không gian của tôi</span>
        <span className="breadcrumb-divider">/</span>
        <strong>{title}</strong>
      </div>
      <div className="topbar-actions">
        <label className="global-search">
          <Search size={17} />
          <input
            aria-label="Tìm kiếm giao dịch"
            placeholder="Tìm một giao dịch…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (page !== "transactions") navigate("transactions");
            }}
          />
          <kbd>⌕</kbd>
        </label>
        <MotionToggle />
        <div className="notification-wrap">
          <button
            className="icon-button bell-button"
            aria-label="Thông báo ngân sách"
            aria-expanded={notifications}
            onClick={() => setNotifications(!notifications)}
          >
            <Bell size={20} />
            {alerts.length > 0 && <i />}
          </button>
          {notifications && (
            <div className="notification-popover">
              <strong>Nhắc nhở ngân sách</strong>
              <button
                className="popover-close"
                aria-label="Đóng thông báo"
                onClick={() => setNotifications(false)}
              >
                <X size={16} />
              </button>
              {alerts.length ? (
                alerts.map((i) => (
                  <button
                    className="notification-item"
                    key={i.categoryId}
                    onClick={() => navigate("budgets")}
                  >
                    <CategoryIcon
                      icon={i.category.icon}
                      color={i.category.color}
                      small
                    />
                    <span>
                      {i.category.name}
                      <small>
                        {Number(i.spent) > Number(i.limit)
                          ? "Đã vượt ngân sách"
                          : "Đã sử dụng từ 80% ngân sách"}
                      </small>
                    </span>
                  </button>
                ))
              ) : (
                <p>Bạn chưa có cảnh báo ngân sách trong tháng này.</p>
              )}
            </div>
          )}
        </div>
        <span className="topbar-line" />
        <button
          className="top-avatar"
          onClick={() => navigate("settings")}
          aria-label="Cài đặt tài khoản"
        >
          {user.name.slice(0, 1).toUpperCase()}
        </button>
      </div>
    </header>
  );
}
