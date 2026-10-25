import { Inject, Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Accounts } from "./auth";
import { Finance } from "./finance";
import { currentMonth, monthOffset } from "./budget";
@Injectable()
export class Demo {
  constructor(
    @Inject(Accounts) private accounts: Accounts,
    @Inject(Finance) private finance: Finance,
  ) {}
  async create() {
    const user = await this.accounts.register({
      email: `demo-${randomUUID()}@finora.local`,
      password: randomUUID(),
      name: "Minh Anh",
    });
    const bank = await this.finance.createWallet(user.id, {
      name: "Tài khoản ngân hàng",
      kind: "BANK",
      openingBalance: "8500000",
      color: "#39745d",
    });
    const cash = await this.finance.createWallet(user.id, {
      name: "Tiền mặt",
      kind: "CASH",
      openingBalance: "5500000",
      color: "#dba673",
    });
    const ewallet = await this.finance.createWallet(user.id, {
      name: "Ví điện tử",
      kind: "EWALLET",
      openingBalance: "700000",
      color: "#8580be",
    });
    const cats = await this.finance.db.category.findMany({
      where: { userId: user.id },
    });
    const cat = (name: string) => cats.find((c) => c.name === name)!;
    const month = currentMonth();
    const add = (
      m: string,
      day: number,
      kind: string,
      amount: string,
      category: string,
      walletId = bank.id,
      note = "",
    ) =>
      this.finance.createTransaction(user.id, {
        kind,
        amount,
        categoryId: cat(category).id,
        walletId,
        note,
        occurredAt: `${m}-${String(day).padStart(2, "0")}T12:00:00+07:00`,
      });
    for (let i = -5; i < 0; i++) {
      const m = monthOffset(month, i);
      await add(
        m,
        3,
        "INCOME",
        String(18000000 + (i + 5) * 800000),
        "Tiền lương",
        bank.id,
        "Lương tháng",
      );
      await add(m, 5, "EXPENSE", "4500000", "Nhà ở", bank.id, "Tiền thuê nhà");
      await add(
        m,
        12,
        "EXPENSE",
        String(2600000 + (i + 5) * 200000),
        "Ăn uống",
        bank.id,
        "Ăn uống trong tháng",
      );
      await add(
        m,
        18,
        "EXPENSE",
        String(1200000 + (i + 5) * 150000),
        "Mua sắm",
        bank.id,
        "Mua sắm cá nhân",
      );
      await add(
        m,
        22,
        "EXPENSE",
        "700000",
        "Di chuyển",
        cash.id,
        "Đi lại trong tháng",
      );
    }
    const today = Number(
      new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
        day: "numeric",
      }).format(new Date()),
    );
    const d = (day: number) => Math.min(day, today);
    await add(
      month,
      d(1),
      "INCOME",
      "24000000",
      "Tiền lương",
      bank.id,
      "Lương tháng · Công ty",
    );
    await add(
      month,
      d(2),
      "EXPENSE",
      "4500000",
      "Nhà ở",
      bank.id,
      "Tiền thuê nhà tháng này",
    );
    await add(
      month,
      d(5),
      "EXPENSE",
      "850000",
      "Ăn uống",
      bank.id,
      "Đi siêu thị cuối tuần",
    );
    await add(
      month,
      d(10),
      "EXPENSE",
      "1290000",
      "Mua sắm",
      bank.id,
      "Giày thể thao mới",
    );
    await add(
      month,
      d(13),
      "EXPENSE",
      "180000",
      "Di chuyển",
      ewallet.id,
      "Nạp xăng",
    );
    await add(
      month,
      d(17),
      "INCOME",
      "2500000",
      "Thu nhập khác",
      bank.id,
      "Dự án freelance",
    );
    await add(
      month,
      d(19),
      "EXPENSE",
      "350000",
      "Học tập",
      bank.id,
      "Sách và khóa học",
    );
    await add(
      month,
      d(21),
      "EXPENSE",
      "420000",
      "Giải trí",
      ewallet.id,
      "Xem phim cùng bạn bè",
    );
    await add(
      month,
      d(23),
      "EXPENSE",
      "185000",
      "Ăn uống",
      cash.id,
      "Bữa trưa cuối tuần",
    );
    await add(
      month,
      d(24),
      "EXPENSE",
      "65000",
      "Ăn uống",
      ewallet.id,
      "Cà phê sáng",
    );
    await this.finance.createTransaction(user.id, {
      kind: "TRANSFER",
      amount: "1000000",
      walletId: bank.id,
      destinationWalletId: cash.id,
      note: "Rút tiền mặt",
      occurredAt: `${month}-${String(d(20)).padStart(2, "0")}T12:00:00+07:00`,
    });
    await this.finance.saveBudget(user.id, {
      month,
      income: "26500000",
      savings: "8000000",
      mode: "AUTO",
      items: cats
        .filter((c) => c.kind === "EXPENSE")
        .map((c) => ({
          categoryId: c.id,
          fixed: c.name === "Nhà ở" ? "4500000" : "0",
          weight:
            (
              {
                food: 30,
                home: 0,
                transport: 10,
                shopping: 20,
                fun: 10,
                health: 10,
                education: 10,
                other: 10,
              } as Record<string, number>
            )[c.icon] || 0,
        })),
    });
    return user;
  }
}
