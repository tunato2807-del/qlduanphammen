import { useEffect, useState } from "react";
import { Button } from "../../components";
import { api, money, type Budget } from "../../types";
export default function BudgetHistory({
  month,
  revision,
}: {
  month: string;
  revision?: number;
}) {
  const [result, setResult] = useState<{
      comparedAt: string;
      plans: (Budget & { active: boolean; createdAt: string })[];
    } | null>(null),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  useEffect(() => {
    const abort = new AbortController();
    setResult(null);
    setError("");
    api<typeof result>("/budget-plans/history?month=" + month, {
      signal: abort.signal,
    })
      .then((value) => {
        if (!abort.signal.aborted) setResult(value);
      })
      .catch((e) => {
        if (!abort.signal.aborted) setError(e.message);
      });
    return () => abort.abort();
  }, [month, revision, retry]);
  return (
    <section className="panel planning-section">
      <h2>Lịch sử ngân sách</h2>
      <p className="muted small">
        Hạn mức được giữ theo từng phiên bản. Chi thực tế lấy từ sổ hiện tại,
        không phải ảnh chụp số chi lúc lập kế hoạch.
      </p>
      {error ? (
        <div role="alert" className="form-error">
          {error}
          <Button secondary onClick={() => setRetry((v) => v + 1)}>
            Thử lại
          </Button>
        </div>
      ) : !result ? (
        <p role="status">Đang tải lịch sử…</p>
      ) : !result.plans.length ? (
        <p>Chưa có phiên bản ngân sách.</p>
      ) : (
        <>
          <p className="muted small">
            Đối chiếu lúc {new Date(result.comparedAt).toLocaleString("vi-VN")}
          </p>
          {result.plans.map((p) => (
            <details className="budget-history" key={p.id}>
              <summary>
                Phiên bản {p.revision} ·{" "}
                {p.active ? "Đang áp dụng" : "Đã thay thế"} ·{" "}
                {new Date(p.createdAt).toLocaleString("vi-VN")}
              </summary>
              <p>
                Thu dự kiến {money(p.income)} · Tiết kiệm dự kiến{" "}
                {money(p.savings)}
              </p>
              <div className="table-scroll">
                <table>
                  <caption className="sr-only">
                    Đối chiếu phiên bản {p.revision}
                  </caption>
                  <thead>
                    <tr>
                      <th>Danh mục</th>
                      <th>Hạn mức</th>
                      <th>Đã chi</th>
                      <th>Còn / vượt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {p.items.map((i) => (
                      <tr key={i.categoryId}>
                        <td>{i.category.name}</td>
                        <td>{money(i.limit)}</td>
                        <td>{money(i.spent)}</td>
                        <td>{money(BigInt(i.limit) - BigInt(i.spent))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </>
      )}
    </section>
  );
}
