import { ArrowDownToLine } from "lucide-react";
import { CategoryIcon, Empty, Progress } from "../../components";
import { FlowChart, SpendingChart } from "../../shared/Charts";
import { PageHeading } from "../../shared/PageHeading";
import { money, monthLabel, type Summary } from "../../types";
export default function ReportsPage({
  summary,
  month,
}: {
  summary: Summary;
  month: string;
}) {
  return (
    <>
      <PageHeading
        kicker="HIỂU NHỮNG CON SỐ CỦA BẠN"
        title="Bức tranh tài chính"
        description={`Nhìn lại ${monthLabel(month).toLowerCase()} và tìm hướng đi cho tháng tới.`}
        action={
          <a
            className="button secondary"
            href={"/api/transactions/export?month=" + month}
            download
          >
            <ArrowDownToLine size={17} />
            Tải dữ liệu CSV
          </a>
        }
      />
      <div className="report-stats">
        <section>
          <span>Thu nhập thực tế</span>
          <strong className="positive">{money(summary.income)}</strong>
        </section>
        <section>
          <span>Tổng chi tiêu</span>
          <strong>{money(summary.expense)}</strong>
        </section>
        <section>
          <span>Chênh lệch thu − chi</span>
          <strong
            className={BigInt(summary.net) >= 0n ? "positive" : "danger-text"}
          >
            {money(summary.net)}
          </strong>
        </section>
      </div>
      <div className="dashboard-main">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Thu nhập & chi tiêu</h2>
              <p>Sáu tháng kết thúc tại tháng được chọn</p>
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i className="green-dot" />
              Thu nhập
            </span>
            <span>
              <i className="orange-dot" />
              Chi tiêu
            </span>
          </div>
          <FlowChart data={summary.history} />
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Cơ cấu chi tiêu</h2>
          </div>
          <SpendingChart data={summary.spending} total={summary.expense} />
        </section>
      </div>
      <section className="panel report-breakdown">
        <div className="panel-heading">
          <h2>Chi tiết theo danh mục</h2>
          <span className="muted small">
            {summary.spending.length} danh mục phát sinh
          </span>
        </div>
        {summary.spending.length ? (
          summary.spending.map((c) => (
            <div className="report-category" key={c.id}>
              <CategoryIcon icon={c.icon} color={c.color} />
              <strong>{c.name}</strong>
              <div>
                <Progress
                  value={
                    Number(summary.expense)
                      ? (Number(c.amount) / Number(summary.expense)) * 100
                      : 0
                  }
                  color={c.color}
                />
              </div>
              <span>{money(c.amount)}</span>
            </div>
          ))
        ) : (
          <Empty
            title="Chưa có dữ liệu chi tiêu"
            description="Báo cáo sẽ cập nhật khi bạn ghi nhận khoản chi."
          />
        )}
      </section>
    </>
  );
}
