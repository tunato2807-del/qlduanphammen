import { useEffect, useRef, type ReactNode, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Car,
  Check,
  ChevronRight,
  CircleHelp,
  Coffee,
  GraduationCap,
  HeartPulse,
  House,
  ShoppingBag,
  Sparkles,
  Utensils,
  Wallet,
  X,
} from "lucide-react";
import type { Transaction } from "./types";
import { dateLabel, money } from "./types";
export const icons: Record<string, typeof Wallet> = {
  food: Utensils,
  home: House,
  transport: Car,
  shopping: ShoppingBag,
  health: HeartPulse,
  fun: Coffee,
  education: GraduationCap,
  salary: BriefcaseBusiness,
  gift: Sparkles,
  other: Wallet,
};
export function CategoryIcon({
  icon = "other",
  color = "#7c8b9b",
  small = false,
}: {
  icon?: string;
  color?: string;
  small?: boolean;
}) {
  const Icon = icons[icon] || Wallet;
  return (
    <span
      className={`category-icon ${small ? "small" : ""}`}
      style={{ color, background: color + "18" }}
    >
      <Icon size={small ? 16 : 20} strokeWidth={1.7} />
    </span>
  );
}
export function Button({
  children,
  onClick,
  secondary = false,
  disabled = false,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  secondary?: boolean;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      className={`button ${secondary ? "secondary" : ""} ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty">
      <span className="empty-icon">
        <Wallet size={28} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
export function Modal({
  title,
  description,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${wide ? "wide" : ""}`}
      onCancel={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="modal-content"
      >
        <div className="modal-top">
          <div>
            <span className="eyebrow">FINORA · KHÔNG GIAN CỦA BẠN</span>
            <h2 id="modal-title">{title}</h2>
            {description && <p>{description}</p>}
          </div>
          <button className="icon-button" aria-label="Đóng" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        {children}
      </motion.div>
    </dialog>
  );
}
export function Progress({
  value,
  color = "#39745d",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div
      className="progress-track"
      role="progressbar"
      aria-label="Mức sử dụng ngân sách"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={Math.max(100, Math.round(value))}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: Math.min(100, Math.max(0, value)) + "%" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{ background: color }}
      />
    </div>
  );
}
export function Toast({
  message,
  onClose,
}: {
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          role="status"
          className="toast"
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
        >
          <Check size={18} />
          {message}
          <button aria-label="Đóng thông báo" onClick={onClose}>
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
export function TransactionTable({
  items,
  onEdit,
  onDelete,
  brief = false,
}: {
  items: Transaction[];
  onEdit: (t: Transaction) => void;
  onDelete: (t: Transaction) => void;
  brief?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Giao dịch</th>
            <th>Danh mục</th>
            <th>Ngày</th>
            <th className="align-right">Số tiền</th>
            {!brief && <th className="align-right">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {items.map((t) => (
            <tr key={t.id}>
              <td>
                <button className="transaction-name" onClick={() => onEdit(t)}>
                  <CategoryIcon
                    icon={t.kind === "TRANSFER" ? "other" : t.category?.icon}
                    color={t.category?.color || "#7c8b9b"}
                  />
                  <span>
                    <strong>
                      {t.note || t.category?.name || "Chuyển tiền giữa ví"}
                    </strong>
                    <small>
                      {t.wallet.name}
                      {t.destinationWallet && ` → ${t.destinationWallet.name}`}
                    </small>
                  </span>
                </button>
              </td>
              <td>
                <span className="category-tag">
                  {t.category?.name || "Chuyển ví"}
                </span>
              </td>
              <td className="muted nowrap">{dateLabel(t.occurredAt)}</td>
              <td
                className={`amount align-right nowrap ${t.kind === "INCOME" ? "positive" : ""}`}
              >
                {t.kind === "INCOME" ? "+" : t.kind === "EXPENSE" ? "−" : ""}
                {money(t.amount)}
              </td>
              {!brief && (
                <td className="align-right">
                  <div className="row-actions">
                    <button onClick={() => onEdit(t)}>Sửa</button>
                    <button className="danger-text" onClick={() => onDelete(t)}>
                      Xóa
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Tip({ children }: { children: ReactNode }) {
  return (
    <div className="tip">
      <CircleHelp size={17} />
      <span>{children}</span>
    </div>
  );
}
export function KindIcon({ kind }: { kind: string }) {
  return kind === "INCOME" ? (
    <ArrowDownLeft size={18} />
  ) : kind === "EXPENSE" ? (
    <ArrowUpRight size={18} />
  ) : (
    <ArrowLeftRight size={18} />
  );
}
export function SectionLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-button" onClick={onClick}>
      {children}
      <ChevronRight size={16} />
    </button>
  );
}
export type SubmitEvent = FormEvent<HTMLFormElement>;
