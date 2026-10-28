import { Sparkles } from "lucide-react";
import { Button, CategoryIcon, Empty, Progress, Tip } from "../../components";
import { PageHeading } from "../../shared/PageHeading";
import { money, type Summary } from "../../types";
export default function BudgetsPage({
  summary,
  setModal,
}: {
  summary: Summary;
  setModal: (value: string) => void;
}) {
  return (
    <>
      <PageHeading
        kicker="MỖI ĐỒNG TIỀN, MỘT MỤC ĐÍCH"
        title="Chi tiêu có kế hoạch"
        description="Dành chỗ cho điều cần thiết và cả những điều bạn yêu."
        action={
          <Button onClick={() => setModal("budget")}>
            <Sparkles size={18} />
            {summary.budget ? "Điều chỉnh ngân sách" : "Lập ngân sách"}
          </Button>
        }
      />
      {summary.budget ? (
        <>
          <div className="budget-summary-grid">
            <div>
              <span>Thu nhập dự kiến</span>
              <strong>{money(summary.budget.income)}</strong>
            </div>
            <div>
              <span>Ngân sách chi tiêu</span>
              <strong>
                {money(
                  summary.budget.items.reduce(
                    (s, i) => s + BigInt(i.limit),
                    0n,
                  ),
                )}
              </strong>
            </div>
            <div>
              <span>Đã chi theo danh mục</span>
              <strong>
                {money(
                  summary.budget.items.reduce(
                    (s, i) => s + BigInt(i.spent),
                    0n,
                  ),
                )}
              </strong>
            </div>
            <div>
              <span>Dự trù tiết kiệm</span>
              <strong className="positive">
                {money(summary.budget.savings)}
              </strong>
            </div>
          </div>
          <div className="section-row">
            <h2>Ngân sách theo danh mục</h2>
            <span className="period-badge">
              Phiên bản {summary.budget.revision} ·{" "}
              {summary.budget.mode === "AUTO"
                ? "Phân bổ tự động"
                : "Thiết lập thủ công"}
            </span>
          </div>
          <div className="budget-card-grid">
            {summary.budget.items.map((i) => {
              const limit = Number(i.limit),
                spent = Number(i.spent),
                pct = limit ? (spent / limit) * 100 : spent ? 100 : 0;
              const over = spent > limit;
              return (
                <section
                  className="panel budget-category-card"
                  key={i.categoryId}
                >
                  <div className="budget-category-top">
                    <CategoryIcon
                      icon={i.category.icon}
                      color={i.category.color}
                    />
                    <h3>{i.category.name}</h3>
                    <span
                      className={`budget-status ${over ? "over" : pct >= 80 ? "near" : ""}`}
                    >
                      {over
                        ? "Vượt hạn mức"
                        : pct >= 80
                          ? "Gần hạn mức"
                          : "Trong kế hoạch"}
                    </span>
                  </div>
                  <strong className="budget-spent">
                    {money(i.spent)}
                    <small> / {money(i.limit)}</small>
                  </strong>
                  <Progress
                    value={pct}
                    color={
                      over
                        ? "#c66c5a"
                        : pct >= 80
                          ? "#d3a45e"
                          : i.category.color
                    }
                  />
                  <div className="budget-caption">
                    <span>
                      {over
                        ? "Vượt " + money(spent - limit)
                        : "Còn " + money(limit - spent)}
                    </span>
                    <strong>
                      {limit ? Math.round(pct) : spent ? "∞" : 0}%
                    </strong>
                  </div>
                </section>
              );
            })}
          </div>
          <Tip>
            Ngân sách là kế hoạch dựa trên thu nhập dự kiến. Dự trù tiết kiệm
            chưa có nghĩa là bạn đã tiết kiệm thực tế. Giao dịch ngoài các danh
            mục của kế hoạch vẫn được tính trong báo cáo.
          </Tip>
        </>
      ) : (
        <section className="panel">
          <Empty
            title="Một kế hoạch nhỏ, một tháng an tâm"
            description="Nhập thu nhập, chi bắt buộc và mức tiết kiệm. Finora sẽ giúp bạn chia phần còn lại theo ưu tiên."
            action={
              <Button onClick={() => setModal("budget")}>
                <Sparkles size={17} />
                Tạo ngân sách đầu tiên
              </Button>
            }
          />
        </section>
      )}
    </>
  );
}
