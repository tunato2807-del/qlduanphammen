import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";
async function demo(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Trải nghiệm với dữ liệu mẫu" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Chào Minh Anh/ }),
  ).toBeVisible();
}
async function nav(page: Page, name: string) {
  await page.locator("nav").getByRole("button", { name, exact: true }).click();
}
async function accessible(page: Page) {
  await page.addScriptTag({ content: axe.source });
  const issues = await page.evaluate(async () => {
    const a = (window as unknown as { axe: typeof import("axe-core") }).axe;
    return (
      await a.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })
    ).violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }));
  });
  expect(issues).toEqual([]);
}
test("goal editing, archive, withdrawal and restore keep actual money and history", async ({
  page,
}) => {
  await demo(page);
  await nav(page, "Kế hoạch");
  await page.getByRole("button", { name: "Tạo mục tiêu", exact: true }).click();
  let d = page.getByRole("dialog");
  await d.getByLabel("Tên kế hoạch").fill("Du lịch ban đầu");
  await d.getByLabel("Số tiền (VND)").fill("1000000");
  await d.getByLabel("Ngày hoàn thành").fill("2030-12-31");
  await d.getByRole("button", { name: "Lưu kế hoạch" }).click();
  await expect(
    page.getByRole("heading", { name: "Du lịch ban đầu" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Chỉnh sửa mục tiêu Du lịch ban đầu" })
    .click();
  d = page.getByRole("dialog");
  await d.getByLabel("Tên kế hoạch").fill("Du lịch mùa hè");
  await d.getByLabel("Số tiền (VND)").fill("2000000");
  await accessible(page);
  await d.getByRole("button", { name: "Lưu kế hoạch" }).click();
  await expect(
    page.getByRole("heading", { name: "Du lịch mùa hè" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Phân bổ / rút tiền" }).click();
  await page.getByRole("dialog").getByLabel("Số tiền (VND)").fill("100000");
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Lưu kế hoạch" })
    .click();
  await expect(page.locator(".goal-amount")).toContainText("100.000");
  await page.getByRole("button", { name: "Lưu trữ", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Du lịch mùa hè" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Đã lưu trữ", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Du lịch mùa hè" }),
  ).toBeVisible();
  await accessible(page);
  await page.getByRole("button", { name: "Phân bổ / rút tiền" }).click();
  d = page.getByRole("dialog");
  await expect(d.getByLabel("Thao tác")).toHaveValue("WITHDRAW");
  await expect(d.getByRole("option", { name: "Dành tiền từ ví" })).toHaveCount(
    0,
  );
  await d.getByLabel("Số tiền (VND)").fill("40000");
  await d.getByRole("button", { name: "Lưu kế hoạch" }).click();
  await expect(page.locator(".goal-amount")).toContainText("60.000");
  await page.getByRole("button", { name: "Khôi phục", exact: true }).click();
  await page
    .getByRole("button", { name: "Đang theo đuổi", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Du lịch mùa hè" }),
  ).toBeVisible();
  await page.getByText("Lịch sử phân bổ (2)", { exact: true }).click();
  await expect(page.locator(".goal-card .planning-row")).toHaveCount(2);
});
test("future recurring changes preserve pending draft values and do not book future money", async ({
  page,
}) => {
  await demo(page);
  await nav(page, "Kế hoạch");
  await page
    .getByRole("button", { name: "Giao dịch định kỳ", exact: true })
    .click();
  await page.getByRole("button", { name: "Tạo quy tắc", exact: true }).click();
  let d = page.getByRole("dialog");
  await d.getByLabel("Tên kế hoạch").fill("Quy tắc cũ");
  await d.getByLabel("Số tiền (VND)").fill("1000");
  await d.getByLabel("Ngày hằng tháng").fill("1");
  await d.getByRole("button", { name: "Lưu kế hoạch" }).click();
  await expect(
    page.getByRole("button", { name: "Xác nhận ghi sổ" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Đổi quy tắc Quy tắc cũ từ tháng sau" })
    .click();
  d = page.getByRole("dialog");
  await d.getByLabel("Tên kế hoạch").fill("Quy tắc mới");
  await d.getByLabel("Số tiền (VND)").fill("2000");
  await accessible(page);
  const future = await d.getByLabel("Tháng hiệu lực mới").inputValue();
  await d.getByRole("button", { name: "Lưu thay đổi tương lai" }).click();
  await expect(
    page.getByRole("heading", { name: "Quy tắc mới", exact: true }),
  ).toBeVisible();
  const draft = page.locator(".planning-row").filter({ hasText: "Quy tắc cũ" });
  await expect(draft).toContainText("1.000");
  await draft.getByRole("button", { name: "Xác nhận ghi sổ" }).click();
  await expect(draft.getByText("Đã ghi sổ", { exact: true })).toBeVisible();
  await page.getByLabel("Tháng báo cáo").fill(future);
  await expect(
    page.getByText("Chưa có khoản đến hạn trong tháng này."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Xác nhận ghi sổ" }),
  ).toHaveCount(0);
});
test("budget history becomes a reviewed new revision and warns about archived categories", async ({
  page,
}) => {
  await demo(page);
  await nav(page, "Ngân sách");
  await page.getByText(/Phiên bản 1 · Đang áp dụng/).click();
  await page
    .getByRole("button", { name: "Dùng phiên bản 1 làm bản nháp" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Bản nháp từ phiên bản 1",
  );
  await page
    .getByRole("button", { name: "Xem phương án", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận áp dụng" }).click();
  await expect(page.locator(".section-row .period-badge")).toContainText(
    "Phiên bản 2",
  );
  const categories = (await (
    await page.request.get("/api/categories")
  ).json()) as { id: string; icon: string }[];
  const food = categories.find((c) => c.icon === "food")!;
  await page.request.patch("/api/categories/" + food.id, {
    data: { archived: true },
  });
  await page.reload();
  await page.getByText(/Phiên bản 1 · Đã thay thế/).click();
  await page
    .getByRole("button", { name: "Dùng phiên bản 1 làm bản nháp" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "Danh mục đã lưu trữ được loại khỏi bản nháp",
  );
  await accessible(page);
  await page
    .getByRole("button", { name: "Xem phương án", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận áp dụng" }).click();
  await expect(page.locator(".section-row .period-badge")).toContainText(
    "Phiên bản 3",
  );
});
test("profile, combined ledger filters, CSV and keyboard search work together", async ({
  page,
}) => {
  await demo(page);
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page.getByLabel("Tên hiển thị").fill("Nguyễn Gia Hân");
  await page.getByRole("button", { name: "Lưu hồ sơ" }).click();
  await expect(page.locator(".sidebar-profile strong")).toHaveText(
    "Nguyễn Gia Hân",
  );
  await accessible(page);
  await nav(page, "Giao dịch");
  await page
    .getByLabel("Lọc theo ví", { exact: true })
    .selectOption({ label: "Tiền mặt" });
  await expect(page.locator(".ledger-count")).toContainText("2 giao dịch");
  await page.getByLabel("Thứ tự giao dịch").selectOption("asc");
  await page
    .getByLabel("Lọc theo danh mục", { exact: true })
    .selectOption({ label: "Ăn uống" });
  await expect(page.locator(".ledger-count")).toContainText("1 giao dịch");
  await page
    .getByLabel("Lọc giao dịch theo ghi chú hoặc danh mục")
    .fill("Rút tiền");
  await expect(
    page.getByText("Chưa tìm thấy giao dịch", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Xóa bộ lọc", exact: true })
    .first()
    .click();
  await page
    .getByLabel("Lọc theo ví", { exact: true })
    .selectOption({ label: "Tiền mặt" });
  await expect(page.locator(".ledger-count")).toContainText("2 giao dịch");
  const href = await page
    .getByRole("link", { name: "Xuất CSV" })
    .getAttribute("href");
  const csv = await page.request.get(href!);
  expect(csv.headers()["x-export-total"]).toBe("2");
  expect(await csv.text()).toContain("Rút tiền mặt");
  await page.keyboard.press("Control+k");
  await expect(
    page.getByLabel("Tìm kiếm giao dịch", { exact: true }),
  ).toBeFocused();
  await page
    .getByLabel("Tìm kiếm giao dịch", { exact: true })
    .fill("Không tồn tại");
  await expect(
    page.getByText("Chưa tìm thấy giao dịch", { exact: true }),
  ).toBeVisible();
});
test("render failure is contained and a reload recovers the current page", async ({
  page,
}) => {
  let once = true;
  await page.route(/\/api\/reports\/summary\?/, async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    if (once) {
      once = false;
      data.wallets = null;
    }
    await route.fulfill({ response, json: data });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Trải nghiệm với dữ liệu mẫu" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Có sự cố khi mở màn hình" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Thử lại màn hình" }).click();
  await expect(
    page.getByRole("heading", { name: /Chào Minh Anh/ }),
  ).toBeVisible();
});
test("changing month hides the old report until the new scoped response arrives", async ({
  page,
}) => {
  await demo(page);
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/reports/summary?month=2001-01", async (route) => {
    await gate;
    await route.continue();
  });
  try {
    await page.getByLabel("Tháng báo cáo").fill("2001-01");
    await expect(
      page.getByText("Đang sắp xếp không gian tài chính của bạn…"),
    ).toBeVisible();
    await expect(page.locator(".balance-spotlight")).toHaveCount(0);
    release();
    await expect(
      page.getByRole("heading", { name: /Chào Minh Anh/ }),
    ).toBeVisible();
    await expect(page.locator(".stat-value").first()).toHaveText("0 ₫");
  } finally {
    release();
  }
});
