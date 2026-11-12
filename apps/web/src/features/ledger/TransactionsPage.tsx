import { useState } from "react";
import {
  ArrowDownToLine,
  ArrowLeft,
  ArrowRight,
  Plus,
  Search,
  Upload,
  SlidersHorizontal,
} from "lucide-react";
import { Button, Empty, Field, TransactionTable } from "../../components";
import { PageHeading } from "../../shared/PageHeading";
import { type Summary, type Category, type Transaction } from "../../types";
import type { LedgerState } from "./useLedger";
import ImportDialog from "./ImportDialog";
export default function TransactionsPage({
  summary,
  categories,
  ledger: l,
  addTransaction,
  editTransaction,
  setDeleting,
  refresh,
}: {
  summary: Summary;
  categories: Category[];
  ledger: LedgerState;
  addTransaction: () => void;
  editTransaction: (t: Transaction) => void;
  setDeleting: (t: Transaction) => void;
  refresh: () => void;
}) {
  const [importing, setImporting] = useState(false);
  const filtered = !!(
    l.search ||
    l.kind ||
    l.walletId ||
    l.categoryId ||
    l.sort !== "desc"
  );
  return (
    <>
      <PageHeading
        kicker="SỔ GIAO DỊCH"
        title="Dòng tiền hằng ngày"
        description="Mỗi khoản thu chi đều có một câu chuyện. Giữ chúng gọn gàng ở đây."
        action={
          <div className="inline-actions">
            <Button secondary onClick={() => setImporting(true)}>
              <Upload size={16} />
              Nhập CSV
            </Button>
            <Button onClick={addTransaction}>
              <Plus size={17} />
              Thêm giao dịch
            </Button>
          </div>
        }
      />
      {importing && (
        <ImportDialog onClose={() => setImporting(false)} onSaved={refresh} />
      )}
      <section className="panel ledger-panel">
        <div className="transactions-toolbar">
          <div className="filter-tabs" role="group" aria-label="Loại giao dịch">
            {[
              ["", "Tất cả"],
              ["EXPENSE", "Chi tiêu"],
              ["INCOME", "Thu nhập"],
              ["TRANSFER", "Chuyển ví"],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={l.kind === id}
                className={l.kind === id ? "active" : ""}
                onClick={() => l.setKind(id)}
              >
                {label}
              </button>
            ))}
          </div>
          <a
            className="button secondary small-button"
            href={"/api/transactions/export?" + new URLSearchParams(l.query)}
            download
          >
            <ArrowDownToLine size={16} />
            Xuất CSV
          </a>
        </div>
        <div className="ledger-filters">
          <div className="table-search">
            <Search size={18} />
            <input
              id="ledger-search"
              aria-label="Lọc giao dịch theo ghi chú hoặc danh mục"
              placeholder="Ghi chú hoặc danh mục…"
              value={l.search}
              onChange={(e) => l.setSearch(e.target.value)}
            />
          </div>
          <Field label="Lọc theo ví">
            <select
              value={l.walletId}
              onChange={(e) => l.setWalletId(e.target.value)}
            >
              <option value="">Tất cả ví</option>
              {summary.wallets.map((w) => (
                <option value={w.id} key={w.id}>
                  {w.name}
                  {w.archived ? " · Lưu trữ" : ""}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Lọc theo danh mục">
            <select
              value={l.categoryId}
              disabled={l.kind === "TRANSFER"}
              onChange={(e) => l.setCategoryId(e.target.value)}
            >
              <option value="">Tất cả danh mục</option>
              {categories
                .filter((c) => !l.kind || c.kind === l.kind)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label="Thứ tự giao dịch">
            <select value={l.sort} onChange={(e) => l.setSort(e.target.value)}>
              <option value="desc">Mới nhất trước</option>
              <option value="asc">Cũ nhất trước</option>
            </select>
          </Field>
        </div>
        <div className="ledger-count">
          <span>
            <SlidersHorizontal size={14} />
            {l.txs?.total || 0} giao dịch
            {l.walletId ? " · gồm chuyển đến và chuyển đi" : ""}
          </span>
          {filtered && (
            <button className="text-button" onClick={l.clear}>
              Xóa bộ lọc
            </button>
          )}
        </div>
        {l.error ? (
          <div className="form-error" role="alert">
            {l.error}
            <Button secondary onClick={refresh}>
              Thử lại
            </Button>
          </div>
        ) : l.loading ? (
          <div
            className="table-skeleton"
            role="status"
            aria-label="Đang tải giao dịch"
          >
            <i />
            <i />
            <i />
          </div>
        ) : l.txs?.items.length ? (
          <TransactionTable
            items={l.txs.items}
            onEdit={editTransaction}
            onDelete={setDeleting}
          />
        ) : (
          <Empty
            title="Chưa tìm thấy giao dịch"
            description={
              filtered
                ? "Thử thay đổi bộ lọc hoặc tháng báo cáo."
                : "Tạo giao dịch đầu tiên hoặc nhập file CSV để bắt đầu."
            }
            action={
              <Button secondary onClick={filtered ? l.clear : addTransaction}>
                {filtered ? "Xóa bộ lọc" : "Thêm giao dịch"}
              </Button>
            }
          />
        )}
        <div className="pagination">
          <span>
            Trang {l.txs?.page || 1} / {l.txs?.pages || 1}
          </span>
          <div>
            <button
              className="icon-button"
              aria-label="Trang trước"
              disabled={l.page <= 1 || l.loading}
              onClick={() => l.setPage(l.page - 1)}
            >
              <ArrowLeft size={17} />
            </button>
            <button
              className="icon-button"
              aria-label="Trang sau"
              disabled={l.page >= (l.txs?.pages || 1) || l.loading}
              onClick={() => l.setPage(l.page + 1)}
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
