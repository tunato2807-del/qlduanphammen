import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Empty } from "../components";
import { useExperience } from "../Experience";
import { compact, money, type Summary } from "../types";
export function FlowChart({ data }: { data: Summary["history"] }) {
  const { reduced } = useExperience();
  const chart = data.map((i) => ({
    name: `T${Number(i.month.slice(5))}`,
    income: Number(i.income),
    expense: Number(i.expense),
  }));
  return (
    <div
      className="flow-chart"
      role="img"
      aria-label="Biểu đồ thu nhập và chi tiêu trong sáu tháng"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chart}
          margin={{ top: 15, right: 12, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="income-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#438167" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#438167" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expense-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#e8aa80" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#e8aa80" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={false}
            stroke="#edf0ed"
            strokeDasharray="4 5"
          />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#949c98", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            tickFormatter={compact}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#949c98", fontSize: 11 }}
            width={42}
          />
          <Tooltip
            formatter={(value) => money(Number(value))}
            contentStyle={{
              border: "1px solid #e8ece9",
              borderRadius: 12,
              fontSize: 12,
            }}
          />
          <Area
            isAnimationActive={!reduced}
            type="monotone"
            dataKey="income"
            name="Thu nhập"
            stroke="#3c7a5e"
            strokeWidth={2.5}
            fill="url(#income-fill)"
          />
          <Area
            isAnimationActive={!reduced}
            type="monotone"
            dataKey="expense"
            name="Chi tiêu"
            stroke="#e4a278"
            strokeWidth={2.5}
            fill="url(#expense-fill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
export function SpendingChart({
  data,
  total,
}: {
  data: Summary["spending"];
  total: string;
}) {
  const { reduced } = useExperience();
  if (!data.length)
    return (
      <Empty
        title="Chưa có khoản chi"
        description="Biểu đồ sẽ xuất hiện khi bạn ghi nhận chi tiêu."
      />
    );
  return (
    <div className="spending-content">
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height={185}>
          <PieChart>
            <Pie
              isAnimationActive={!reduced}
              data={data.map((i) => ({ ...i, value: Number(i.amount) }))}
              dataKey="value"
              innerRadius={62}
              outerRadius={82}
              paddingAngle={3}
              cornerRadius={4}
              stroke="none"
            >
              {data.map((i) => (
                <Cell key={i.id} fill={i.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => money(Number(value))}
              contentStyle={{ borderRadius: 12, fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-center">
          <small>Tổng chi tiêu</small>
          <strong>
            {compact(Number(total))}
            <span> ₫</span>
          </strong>
        </div>
      </div>
      <div className="spending-legend">
        {data.slice(0, 4).map((i) => (
          <div key={i.id}>
            <span>
              <i style={{ background: i.color }} />
              {i.name}
            </span>
            <strong>
              {Number(total)
                ? Math.round((Number(i.amount) / Number(total)) * 100)
                : 0}
              %
            </strong>
          </div>
        ))}
        {data.length > 4 && (
          <small className="muted">Và {data.length - 4} danh mục khác</small>
        )}
      </div>
    </div>
  );
}
