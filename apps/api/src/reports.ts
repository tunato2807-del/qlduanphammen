import { dueDate } from "./planning-rules";
import { Inject, Injectable } from "@nestjs/common";
import { Database } from "./database";
import { monthOffset, monthRange } from "./budget";
import { Wallets } from "./wallets";
import { Transactions } from "./transactions";
import { Budgets } from "./budgets";
import PDFDocument from "pdfkit";
import { resolve } from "node:path";
@Injectable()
export class Reports {
  constructor(
    @Inject(Database) public db: Database,
    @Inject(Wallets) private walletsService: Wallets,
    @Inject(Transactions) private transactionsService: Transactions,
    @Inject(Budgets) private budgetsService: Budgets,
  ) {}
  async summary(userId: string, month: string) {
    return this.db.$transaction(
      async (tx) => {
        const range = monthRange(month);
        const wallets = await this.walletsService.wallets(userId, tx);
        const totals = await tx.$queryRaw<
          { month: string; income: bigint; expense: bigint; count: number }[]
        >`
        SELECT to_char("occurredAt" AT TIME ZONE 'Asia/Ho_Chi_Minh','YYYY-MM') AS month,
        COALESCE(SUM("amount") FILTER (WHERE "kind"='INCOME'),0)::bigint AS income,
        COALESCE(SUM("amount") FILTER (WHERE "kind"='EXPENSE'),0)::bigint AS expense,
        COUNT(*)::integer AS count FROM "Transaction"
        WHERE "userId"=${userId}::uuid AND "occurredAt">=${monthRange(monthOffset(month, -5)).gte} AND "occurredAt"<${range.lt} GROUP BY 1`;
        const spending = await tx.$queryRaw<
          {
            id: string;
            name: string;
            icon: string;
            color: string;
            amount: bigint;
          }[]
        >`
        SELECT c.id,c.name,c.icon,c.color,SUM(t.amount)::bigint AS amount
        FROM "Transaction" t JOIN "Category" c ON c.id=t."categoryId"
        WHERE t."userId"=${userId}::uuid AND t.kind='EXPENSE' AND t."occurredAt">=${range.gte} AND t."occurredAt"<${range.lt}
        GROUP BY c.id ORDER BY amount DESC`;
        const plan = await this.budgetsService.activeBudget(userId, month, tx);
        const recent = await this.transactionsService.transactions(
          userId,
          { month },
          false,
          tx,
        );
        const goalCount = await tx.savingsGoal.count({
          where: { userId, archived: false },
        });
        const saved = await tx.goalContribution.aggregate({
          where: { goal: { userId } },
          _sum: { amount: true },
        });
        const rules = await tx.recurringRule.findMany({
          where: {
            userId,
            active: true,
            startMonth: { lte: month },
            OR: [{ endMonth: null }, { endMonth: { gte: month } }],
          },
          include: {
            drafts: { where: { month } },
            wallet: { select: { name: true } },
          },
        });
        const due = rules.filter(
          (r) =>
            dueDate(month, r.day) <= new Date() &&
            (!r.drafts[0] || r.drafts[0].state === "PENDING"),
        );
        const history = Array.from({ length: 6 }, (_, i) => {
          const m = monthOffset(month, i - 5),
            t = totals.find((t) => t.month === m);
          return {
            month: m,
            income: t?.income || 0n,
            expense: t?.expense || 0n,
          };
        });
        const current = history[5],
          previous = history[4];
        return {
          month,
          asOf: new Date(),
          balance: wallets.reduce((s, w) => s + w.balance, 0n),
          income: current.income,
          expense: current.expense,
          net: current.income - current.expense,
          wallets,
          history,
          spending,
          budget: plan,
          recent: recent.items.slice(0, 5),
          transactionCount: totals.find((t) => t.month === month)?.count || 0,
          planning: {
            goalCount,
            saved: saved._sum.amount || 0n,
            dueCount: due.length,
            due: due.slice(0, 3).map((r) => ({
              id: r.id,
              name: r.name,
              amount: r.amount,
              dueAt: dueDate(month, r.day),
              wallet: r.wallet.name,
            })),
          },
          comparison: {
            month: previous.month,
            income: previous.income,
            expense: previous.expense,
            net: previous.income - previous.expense,
            incomeDelta: current.income - previous.income,
            expenseDelta: current.expense - previous.expense,
            netDelta:
              current.income -
              current.expense -
              previous.income +
              previous.expense,
          },
        };
      },
      { isolationLevel: "RepeatableRead", timeout: 15000 },
    );
  }
  async pdf(userId: string, month: string): Promise<Buffer> {
    const s = await this.summary(userId, month);
    const money = (v: bigint) =>
      new Intl.NumberFormat("vi-VN").format(v) + " VND";
    return new Promise((resolveBuffer, reject) => {
      const doc = new PDFDocument({
        size: "A4",
        margin: 48,
        info: { Title: `Finora - Báo cáo ${month}` },
      });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("error", reject);
      doc.on("end", () => resolveBuffer(Buffer.concat(chunks)));
      doc.font(resolve(__dirname, "../assets/LiberationSans-Regular.ttf"));
      const title = (text: string) => {
        if (doc.y > 700) doc.addPage();
        doc
          .moveDown()
          .fontSize(15)
          .fillColor("#6840c6")
          .text(text)
          .moveDown(0.5)
          .fillColor("#222820")
          .fontSize(11);
      };
      doc.fontSize(27).fillColor("#6840c6").text("FINORA");
      doc
        .fontSize(20)
        .fillColor("#222820")
        .text(`Báo cáo tài chính · ${month}`);
      doc
        .fontSize(10)
        .text("Múi giờ Việt Nam · Tiền tệ VND")
        .text(
          `Xuất lúc ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`,
        );
      title("Kết quả trong tháng");
      for (const [label, amount] of [
        ["Thu nhập", s.income],
        ["Chi tiêu", s.expense],
        ["Chênh lệch thu − chi", s.net],
        ["Số dư ví hiện tại (mọi thời điểm)", s.balance],
      ] as const)
        doc.text(`${label}: ${money(amount)}`).moveDown(0.4);
      title(`So với tháng ${s.comparison.month}`);
      doc
        .text(`Thu nhập thay đổi: ${money(s.comparison.incomeDelta)}`)
        .text(`Chi tiêu thay đổi: ${money(s.comparison.expenseDelta)}`)
        .text(`Chênh lệch thay đổi: ${money(s.comparison.netDelta)}`);
      title("Chi tiêu theo danh mục");
      if (!s.spending.length) doc.text("Chưa có chi tiêu trong tháng.");
      s.spending.forEach((c) => {
        if (doc.y > 720) doc.addPage();
        doc.text(`${c.name}: ${money(c.amount)}`).moveDown(0.3);
      });
      title("Ngân sách và thực tế");
      if (s.budget) {
        doc
          .text(
            `Phiên bản ${s.budget.revision} · Thu nhập dự kiến ${money(s.budget.income)}`,
          )
          .text(`Dự trù tiết kiệm: ${money(s.budget.savings)}`);
        s.budget.items.forEach((i) => {
          if (doc.y > 710) doc.addPage();
          doc
            .text(
              `${i.category.name}: hạn mức ${money(i.limit)} · đã chi ${money(i.spent)}`,
            )
            .moveDown(0.3);
        });
      } else doc.text("Chưa lập ngân sách cho tháng này.");
      doc
        .moveDown()
        .fontSize(9)
        .text(
          "Chuyển ví và phân bổ mục tiêu không được tính là thu/chi. Dự trù tiết kiệm là kế hoạch; số dư ví là số dư tại lúc xuất. Dữ liệu thực tế thay đổi khi giao dịch được sửa hoặc xóa.",
        );
      doc.end();
    });
  }
}
