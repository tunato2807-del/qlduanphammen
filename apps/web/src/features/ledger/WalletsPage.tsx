import { CreditCard, Plus, Settings, ShieldCheck } from "lucide-react";
import { Button, Tip } from "../../components";
import { PageHeading } from "../../shared/PageHeading";
import { money, type Summary, type Wallet } from "../../types";
export default function WalletsPage({
  summary,
  setModal,
  setWalletEdit,
}: {
  summary: Summary;
  setModal: (value: string) => void;
  setWalletEdit: (value: Wallet) => void;
}) {
  return (
    <>
      <PageHeading
        kicker="MỌI NGUỒN TIỀN, MỘT NƠI DUY NHẤT"
        title="Những chiếc ví của bạn"
        description="Biết tiền đang ở đâu, để chủ động với mọi kế hoạch."
        action={
          <Button onClick={() => setModal("wallet")}>
            <Plus size={18} />
            Thêm ví mới
          </Button>
        }
      />
      <div className="wallet-summary">
        <span>Tổng số dư · Tất cả các ví</span>
        <strong>{money(summary.balance)}</strong>
        <small>Số dư hiện tại, bao gồm cả ví đã lưu trữ.</small>
      </div>
      <div className="wallet-grid">
        {summary.wallets.map((w) => (
          <section
            className={`wallet-card ${w.archived ? "archived" : ""}`}
            key={w.id}
            style={{ "--wallet-color": w.color } as React.CSSProperties}
          >
            <div className="wallet-top">
              <span className="wallet-symbol">
                <CreditCard size={24} />
              </span>
              <span>
                {w.archived
                  ? "Đã lưu trữ"
                  : (
                      {
                        BANK: "Ngân hàng",
                        CASH: "Tiền mặt",
                        EWALLET: "Ví điện tử",
                      } as Record<string, string>
                    )[w.kind]}
              </span>
              <button
                className="icon-button"
                aria-label={`Chỉnh sửa ${w.name}`}
                onClick={() => setWalletEdit(w)}
              >
                <Settings size={17} />
              </button>
            </div>
            <h2>{w.name}</h2>
            <small>SỐ DƯ HIỆN TẠI</small>
            <strong>{money(w.balance)}</strong>
            <div className="wallet-bottom">
              <span>Số dư đầu: {money(w.openingBalance)}</span>
              <ShieldCheck size={16} />
            </div>
            {BigInt(w.balance) < 0n && (
              <p className="wallet-warning">
                Số dư âm. Hãy kiểm tra các giao dịch và số dư ban đầu.
              </p>
            )}
          </section>
        ))}
        <button className="add-wallet-card" onClick={() => setModal("wallet")}>
          <span>
            <Plus size={25} />
          </span>
          <strong>Thêm một chiếc ví</strong>
          <small>Một góc nhỏ cho nguồn tiền của bạn</small>
        </button>
      </div>
      <Tip>
        Ví ngân hàng và ví điện tử được theo dõi bằng dữ liệu bạn nhập. Chưa có
        kết nối trực tiếp với ngân hàng.
      </Tip>
    </>
  );
}
