import { Plus, Settings, ShieldCheck } from "lucide-react";
import { Button, CategoryIcon, Field, Tip } from "../../components";
import { PageHeading } from "../../shared/PageHeading";
import { type Category, type User } from "../../types";
export default function SettingsPage({
  user,
  categories,
  setModal,
  setCategoryEdit,
}: {
  user: User;
  categories: Category[];
  setModal: (value: string) => void;
  setCategoryEdit: (value: Category) => void;
}) {
  return (
    <>
      <PageHeading
        kicker="THIẾT KẾ KHÔNG GIAN CỦA BẠN"
        title="Cài đặt cá nhân"
        description="Những điều nhỏ giúp Finora phù hợp với bạn hơn."
      />
      <div className="settings-grid">
        <section className="panel settings-panel">
          <h2>Tài khoản & bảo mật</h2>
          <div className="profile-detail">
            <span className="avatar">{user.name.slice(0, 1)}</span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
          </div>
          <Field label="Đơn vị tiền tệ">
            <input value="VND · Việt Nam Đồng" readOnly />
          </Field>
          <Field label="Múi giờ báo cáo">
            <input value="Asia/Ho_Chi_Minh · UTC+7" readOnly />
          </Field>
          <Button secondary onClick={() => setModal("password")}>
            <ShieldCheck size={16} />
            Đổi mật khẩu
          </Button>
          <Tip>
            Mỗi tài khoản có dữ liệu riêng. Các phiên đăng nhập khác sẽ bị thu
            hồi khi bạn đổi mật khẩu.
          </Tip>
        </section>
        <section className="panel settings-panel">
          <div className="section-row">
            <h2>Danh mục thu chi</h2>
            <Button secondary onClick={() => setModal("category")}>
              <Plus size={16} />
              Thêm
            </Button>
          </div>
          <div className="settings-categories">
            {categories.map((c) => (
              <div key={c.id}>
                <CategoryIcon icon={c.icon} color={c.color} small />
                <strong>{c.name}</strong>
                <span>
                  {c.archived
                    ? "Đã lưu trữ"
                    : c.kind === "EXPENSE"
                      ? "Chi tiêu"
                      : "Thu nhập"}
                </span>
                <button
                  className="icon-button"
                  aria-label={`Chỉnh sửa danh mục ${c.name}`}
                  onClick={() => setCategoryEdit(c)}
                >
                  <Settings size={15} />
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
