import { useState } from "react";
import { Button, Field, Modal, Tip } from "../../components";
import { api, money } from "../../types";
import { useWrite } from "../../shared/useWrite";
type Preview = {
  valid: number;
  duplicates: number;
  errors: number;
  rows: {
    line: number;
    error: string | null;
    duplicate: boolean;
    data: {
      kind: string;
      amount: string;
      note: string;
      occurredAt: string;
    } | null;
  }[];
};
export default function ImportDialog({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [csv, setCsv] = useState(""),
    [preview, setPreview] = useState<Preview | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState<{ imported: number; duplicates: number } | null>(
      null,
    );
  const write = useWrite();
  const run = async (commit: boolean) => {
    setBusy(true);
    setError("");
    try {
      if (commit) {
        setDone(await write("/transactions/import", { csv }));
        onSaved();
      } else
        setPreview(
          await api<Preview>("/transactions/import/preview", {
            method: "POST",
            body: JSON.stringify({ csv }),
          }),
        );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal
      wide
      title="Nhập giao dịch từ CSV"
      description="Xem trước, sửa lỗi rồi xác nhận lưu vào sổ."
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      {done ? (
        <>
          <div className="budget-preview" role="status">
            <h3>Đã nhập {done.imported} giao dịch</h3>
            <p>
              Bỏ qua {done.duplicates} dòng trùng. Chọn tháng phù hợp trong sổ
              để xem dữ liệu vừa nhập.
            </p>
          </div>
          <div className="modal-actions">
            <Button onClick={onClose}>Hoàn tất</Button>
          </div>
        </>
      ) : (
        <>
          <Tip>
            Giới hạn 50 KB và 200 dòng. Dùng đúng tên ví/danh mục đang hoạt
            động; ngày ISO có múi giờ, loại INCOME / EXPENSE / TRANSFER, tiền
            nguyên VND. Dữ liệu trùng được bỏ qua. File xuất từ Finora cũng được
            hỗ trợ.
          </Tip>
          <a
            className="button secondary small-button"
            href="/api/transactions/import/template"
            download
          >
            Tải mẫu CSV
          </a>
          <Field label="Chọn file CSV">
            <input
              type="file"
              accept=".csv,text/csv"
              disabled={busy}
              onChange={async (e) => {
                setError("");
                setPreview(null);
                setCsv("");
                const file = e.target.files?.[0];
                if (!file) return;
                if (file.size > 51200) {
                  setError("File tối đa 50 KB.");
                  return;
                }
                try {
                  setCsv(await file.text());
                } catch {
                  setError("Không đọc được file. Hãy chọn lại.");
                }
              }}
            />
          </Field>
          <Field label="Nội dung CSV">
            <textarea
              value={csv}
              onChange={(e) => {
                setCsv(e.target.value);
                setPreview(null);
              }}
              rows={5}
              maxLength={51200}
              placeholder={
                "occurredAt,kind,category,wallet,destinationWallet,amount,note\n2026-11-07T12:00:00+07:00,EXPENSE,Ăn uống,Tiền mặt,,50000,Bữa trưa"
              }
            />
          </Field>
          {preview && (
            <>
              <p role="status">
                <strong>{preview.valid}</strong> dòng mới · {preview.duplicates}{" "}
                trùng · {preview.errors} lỗi
              </p>
              <div className="table-scroll import-preview">
                <table>
                  <caption className="sr-only">
                    Kết quả kiểm tra từng dòng CSV
                  </caption>
                  <thead>
                    <tr>
                      <th>Dòng</th>
                      <th>Giao dịch</th>
                      <th>Kết quả</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.rows.map((r) => (
                      <tr key={r.line}>
                        <td>{r.line}</td>
                        <td>
                          {r.data
                            ? `${r.data.kind} · ${money(r.data.amount)} · ${r.data.note || "Không ghi chú"}`
                            : "—"}
                        </td>
                        <td>
                          {r.error ||
                            (r.duplicate ? "Trùng — bỏ qua" : "Hợp lệ")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}
          <div className="modal-actions">
            <Button secondary disabled={busy} onClick={onClose}>
              Hủy
            </Button>
            <Button
              disabled={busy || !csv.trim()}
              onClick={() => void run(false)}
            >
              {busy ? "Đang kiểm tra…" : "Kiểm tra dữ liệu"}
            </Button>
            {preview && (
              <Button
                disabled={busy || preview.errors > 0 || preview.valid === 0}
                onClick={() => void run(true)}
              >
                Xác nhận nhập {preview.valid} dòng
              </Button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
