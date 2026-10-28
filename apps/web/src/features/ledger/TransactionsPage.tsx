import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  LoaderCircle,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { Button, Empty, TransactionTable } from "../../components";
import { PageHeading } from "../../shared/PageHeading";
import {
  type Summary,
  type Transaction,
  type TransactionPage,
} from "../../types";
export default function TransactionsPage({
  summary,
  month,
  kind,
  setKind,
  search,
  setSearch,
  txs,
  txError,
  txLoading,
  txPage,
  setTxPage,
  addTransaction,
  editTransaction,
  setDeleting,
  refresh,
}: {
  summary: Summary;
  month: string;
  kind: string;
  setKind: (value: string) => void;
  search: string;
  setSearch: (value: string) => void;
  txs: TransactionPage | null;
  txError: string;
  txLoading: boolean;
  txPage: number;
  setTxPage: (value: number) => void;
  addTransaction: () => void;
  editTransaction: (value: Transaction) => void;
  setDeleting: (value: Transaction) => void;
  refresh: () => void;
}) {
  return (
    <>
      <PageHeading
        kicker="MỖI GIAO DỊCH, MỘT CÂU CHUYỆN"
        title="Dòng tiền hằng ngày"
        description="Những con số nhỏ tạo nên bức tranh lớn."
        action={
          <Button onClick={addTransaction}>
            <Plus size={18} />
            Thêm giao dịch
          </Button>
        }
      />
      <section className="panel">
        <div className="transactions-toolbar">
          <div className="filter-tabs">
            {[
              ["", "Tất cả"],
              ["EXPENSE", "Chi tiêu"],
              ["INCOME", "Thu nhập"],
              ["TRANSFER", "Chuyển ví"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={kind === id ? "active" : ""}
                onClick={() => setKind(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <a
            className="button secondary small-button"
            href={
              "/api/transactions/export?" +
              new URLSearchParams({ month, kind, search })
            }
            download
          >
            <ArrowDownToLine size={16} />
            Xuất CSV
          </a>
        </div>
        <div className="table-search">
          <Search size={17} />
          <input
            aria-label="Lọc giao dịch theo ghi chú hoặc danh mục"
            placeholder="Tìm theo ghi chú, danh mục…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span>
            <SlidersHorizontal size={15} />
            {txs?.total || 0} giao dịch
          </span>
        </div>
        {txError ? (
          <div className="form-error" role="alert">
            {txError}
            <button onClick={refresh}>Thử lại</button>
          </div>
        ) : txLoading ? (
          <div className="loading-panel">
            <LoaderCircle className="spin" size={24} />
          </div>
        ) : txs?.items.length ? (
          <TransactionTable
            items={txs.items}
            onEdit={editTransaction}
            onDelete={setDeleting}
          />
        ) : (
          <Empty
            title="Chưa tìm thấy giao dịch"
            description={
              search
                ? "Thử một từ khóa khác hoặc thay đổi tháng."
                : "Thêm một khoản thu hoặc chi để bắt đầu."
            }
            action={
              <Button secondary onClick={addTransaction}>
                <Plus size={16} />
                Thêm giao dịch
              </Button>
            }
          />
        )}
        <div className="pagination">
          <span>
            Trang {txs?.page || 1} / {txs?.pages || 1}
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Trang trước"
              disabled={txPage <= 1 || txLoading}
              onClick={() => setTxPage(txPage - 1)}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Trang sau"
              disabled={txPage >= (txs?.pages || 1) || txLoading}
              onClick={() => setTxPage(txPage + 1)}
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
