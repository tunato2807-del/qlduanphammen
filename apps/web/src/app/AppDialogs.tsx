import { ArrowRight } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Button, Modal, Tip, Toast } from "../components";
import { PasswordForm } from "../features/identity/PasswordForm";
import { CategoryEdit } from "../features/ledger/CategoryEdit";
import { WalletEdit } from "../features/ledger/WalletEdit";
import {
  BudgetForm,
  CategoryForm,
  TransactionForm,
  WalletForm,
} from "../Forms";
import {
  api,
  dateLabel,
  money,
  type Category,
  type Summary,
  type Transaction,
  type TransactionPage,
  type User,
  type Wallet,
} from "../types";
export default function AppDialogs({
  toast,
  closeToast,
  modal,
  summary,
  categories,
  edit,
  setModal,
  saved,
  month,
  mutationLoading,
  setMutationLoading,
  setUser,
  setSummary,
  setCategories,
  setTxs,
  setToast,
  deleting,
  setDeleting,
  refresh,
  walletEdit,
  setWalletEdit,
  categoryEdit,
  setCategoryEdit,
}: {
  toast: string;
  closeToast: () => void;
  modal: string;
  summary: Summary | null;
  categories: Category[];
  edit: Transaction | undefined;
  setModal: (id: string) => void;
  saved: (message: string) => void;
  month: string;
  mutationLoading: boolean;
  setMutationLoading: (value: boolean) => void;
  setUser: (value: User | null) => void;
  setSummary: (value: Summary | null) => void;
  setCategories: (value: Category[]) => void;
  setTxs: (value: TransactionPage | null) => void;
  setToast: (value: string) => void;
  deleting: Transaction | null;
  setDeleting: (value: Transaction | null) => void;
  refresh: () => void;
  walletEdit: Wallet | null;
  setWalletEdit: (value: Wallet | null) => void;
  categoryEdit: Category | null;
  setCategoryEdit: (value: Category | null) => void;
}) {
  return (
    <>
      <Toast message={toast} onClose={closeToast} />
      <AnimatePresence>
        {modal === "transaction" && summary && (
          <TransactionForm
            key="transaction"
            wallets={summary.wallets}
            categories={categories}
            transaction={edit}
            onClose={() => setModal("")}
            onSaved={() =>
              saved(edit ? "Đã cập nhật giao dịch." : "Đã lưu giao dịch mới.")
            }
          />
        )}
        {modal === "wallet" && (
          <WalletForm
            key="wallet"
            onClose={() => setModal("")}
            onSaved={() => saved("Chiếc ví mới đã sẵn sàng.")}
          />
        )}
        {modal === "budget" && summary && (
          <BudgetForm
            key="budget"
            month={month}
            categories={categories}
            budget={summary.budget}
            onClose={() => setModal("")}
            onSaved={() => saved("Ngân sách đã được áp dụng.")}
          />
        )}
        {modal === "category" && (
          <CategoryForm
            key="category"
            onClose={() => setModal("")}
            onSaved={() => saved("Đã thêm danh mục mới.")}
          />
        )}
      </AnimatePresence>
      {modal === "help" && (
        <Modal
          title="Chào bạn, đây là Finora"
          description="Một nơi để hiểu tiền của mình, theo cách nhẹ nhàng hơn."
          onClose={() => setModal("")}
        >
          <div className="help-steps">
            {[
              [
                "01",
                "Tạo ví của bạn",
                "Khai báo số dư ban đầu của tiền mặt, ngân hàng hoặc ví điện tử.",
              ],
              [
                "02",
                "Ghi nhận thu chi",
                "Thêm giao dịch đúng ví, danh mục và ngày phát sinh.",
              ],
              [
                "03",
                "Để tiền có kế hoạch",
                "Tạo ngân sách từ thu nhập dự kiến, chi bắt buộc và ưu tiên.",
              ],
              [
                "04",
                "Nhìn lại và điều chỉnh",
                "Xem báo cáo, theo dõi cảnh báo và điều chỉnh ngân sách khi cần.",
              ],
            ].map(([n, t, d]) => (
              <div key={n}>
                <span>{n}</span>
                <div>
                  <strong>{t}</strong>
                  <p>{d}</p>
                </div>
              </div>
            ))}
          </div>
          <Tip>
            Finora chưa đồng bộ ngân hàng. Dữ liệu phụ thuộc vào thông tin bạn
            nhập. Chế độ trải nghiệm tạo tài khoản mẫu riêng; tài khoản mẫu
            không thể đăng nhập lại nếu không có thông tin đăng nhập.
          </Tip>
          <Button className="full" onClick={() => setModal("")}>
            Tôi đã hiểu
            <ArrowRight size={17} />
          </Button>
        </Modal>
      )}
      {modal === "logout" && (
        <Modal
          title="Đăng xuất khỏi Finora?"
          description="Dữ liệu đã lưu vẫn được giữ trong tài khoản của bạn."
          onClose={() => setModal("")}
        >
          <div className="modal-actions">
            <Button secondary onClick={() => setModal("")}>
              Ở lại
            </Button>
            <Button
              disabled={mutationLoading}
              onClick={async () => {
                setMutationLoading(true);
                try {
                  await api("/auth/logout", { method: "POST", body: "{}" });
                  setUser(null);
                  setSummary(null);
                  setCategories([]);
                  setTxs(null);
                  setModal("");
                } catch (e) {
                  setToast((e as Error).message);
                } finally {
                  setMutationLoading(false);
                }
              }}
            >
              Đăng xuất
            </Button>
          </div>
        </Modal>
      )}
      {deleting && (
        <Modal
          title="Xóa giao dịch này?"
          description={`${deleting.note || deleting.category?.name || "Chuyển ví"} · ${money(deleting.amount)} · ${dateLabel(deleting.occurredAt)}`}
          onClose={() => setDeleting(null)}
        >
          <Tip>
            Số dư, báo cáo và mức sử dụng ngân sách sẽ được tính lại. Thao tác
            này không thể hoàn tác.
          </Tip>
          <div className="modal-actions">
            <Button secondary onClick={() => setDeleting(null)}>
              Giữ lại
            </Button>
            <Button
              className="danger-button"
              disabled={mutationLoading}
              onClick={async () => {
                setMutationLoading(true);
                try {
                  await api("/transactions/" + deleting.id, {
                    method: "DELETE",
                    body: "{}",
                  });
                  setDeleting(null);
                  refresh();
                  setToast("Đã xóa giao dịch.");
                } catch (e) {
                  setToast((e as Error).message);
                } finally {
                  setMutationLoading(false);
                }
              }}
            >
              Xóa giao dịch
            </Button>
          </div>
        </Modal>
      )}
      {walletEdit && (
        <WalletEdit
          wallet={walletEdit}
          onClose={() => setWalletEdit(null)}
          onSaved={() => {
            setWalletEdit(null);
            refresh();
            setToast("Đã cập nhật ví.");
          }}
        />
      )}
      {categoryEdit && (
        <CategoryEdit
          category={categoryEdit}
          onClose={() => setCategoryEdit(null)}
          onSaved={() => {
            setCategoryEdit(null);
            refresh();
            setToast("Đã cập nhật danh mục.");
          }}
        />
      )}
      {modal === "password" && (
        <PasswordForm
          onClose={() => setModal("")}
          onSaved={() =>
            saved("Đã đổi mật khẩu và thu hồi các phiên đăng nhập khác.")
          }
        />
      )}
    </>
  );
}
