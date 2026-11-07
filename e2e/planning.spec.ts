import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";
import { readFile } from "node:fs/promises";
async function checkAxe(page: Page) {
  await page.addScriptTag({ content: axe.source });
  const violations = await page.evaluate(async () => {
    const a = (window as unknown as { axe: typeof import("axe-core") }).axe;
    return (
      await a.run(document, {
        runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
      })
    ).violations
      .filter((v) => v.impact === "serious" || v.impact === "critical")
      .map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.target) }));
  });
  expect(violations).toEqual([]);
}
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
test("savings allocations and recurring confirmation work through the complete UI", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await demo(page);
  await nav(page, "Kế hoạch");
  await expect(page.getByText("Một ước mơ, một mục tiêu")).toBeVisible();
  await page.getByRole("button", { name: "Tạo mục tiêu", exact: true }).click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tên kế hoạch").fill("Laptop học tập");
  await dialog.getByLabel("Số tiền (VND)").fill("2000000");
  await dialog.getByLabel("Ngày hoàn thành").fill("2027-12-31");
  await checkAxe(page);
  await dialog.getByRole("button", { name: "Lưu kế hoạch" }).click();
  await expect(
    page.getByRole("heading", { name: "Laptop học tập" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Phân bổ / rút tiền" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Số tiền (VND)").fill("100000");
  await checkAxe(page);
  await dialog.getByRole("button", { name: "Lưu kế hoạch" }).click();
  await expect(page.locator(".goal-amount")).toHaveText(/100.000/);
  await page.getByRole("button", { name: "Phân bổ / rút tiền" }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Thao tác").selectOption("WITHDRAW");
  await dialog.getByLabel("Số tiền (VND)").fill("40000");
  await dialog.getByRole("button", { name: "Lưu kế hoạch" }).click();
  await expect(page.locator(".goal-amount")).toHaveText(/60.000/);
  await page.getByText("Lịch sử phân bổ (2)", { exact: true }).click();
  await expect(page.locator(".goal-card .planning-row")).toHaveCount(2);
  await page
    .getByRole("button", { name: "Giao dịch định kỳ", exact: true })
    .click();
  await page.getByRole("button", { name: "Tạo quy tắc", exact: true }).click();
  dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tên kế hoạch").fill("Tiền nhà thử nghiệm");
  await dialog.getByLabel("Số tiền (VND)").fill("123000");
  await dialog.getByLabel("Ngày hằng tháng").fill("1");
  await checkAxe(page);
  await dialog.getByRole("button", { name: "Lưu kế hoạch" }).click();
  await expect(
    page.getByRole("button", { name: "Xác nhận ghi sổ" }),
  ).toBeVisible();
  await checkAxe(page);
  await page.getByRole("button", { name: "Xác nhận ghi sổ" }).click();
  await expect(page.getByText("Đã ghi sổ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Tạm dừng" }).click();
  await expect(page.getByRole("button", { name: "Bật lại" })).toBeVisible();
  await nav(page, "Giao dịch");
  await page
    .getByRole("textbox", { name: "Lọc giao dịch theo ghi chú hoặc danh mục" })
    .fill("");
  expect(errors).toEqual([]);
});
test("CSV preview, import and duplicate detection, budget suggestion/history and PDF download", async ({
  page,
}) => {
  await demo(page);
  const wallets = (await (await page.request.get("/api/wallets")).json()) as {
    name: string;
  }[];
  const month = await page
    .getByLabel("Tháng báo cáo")
    .inputValue()
    .catch(() => new Date().toISOString().slice(0, 7));
  await nav(page, "Giao dịch");
  await page.getByRole("button", { name: "Nhập CSV", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const csv = `occurredAt,kind,category,wallet,destinationWallet,amount,note\n${month}-02T12:00:00+07:00,EXPENSE,Ăn uống,${wallets[0].name},,54321,"CSV cà phê, cùng bạn"`;
  await dialog.getByLabel("Nội dung CSV").fill(csv);
  await dialog.getByRole("button", { name: "Kiểm tra dữ liệu" }).click();
  await expect(
    dialog.getByRole("button", { name: "Xác nhận nhập 1 dòng" }),
  ).toBeEnabled();
  await checkAxe(page);
  await dialog.getByRole("button", { name: "Xác nhận nhập 1 dòng" }).click();
  await expect(
    dialog.getByRole("heading", { name: "Đã nhập 1 giao dịch" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Hoàn tất" }).click();
  await page.getByRole("button", { name: "Nhập CSV", exact: true }).click();
  await page.getByLabel("Nội dung CSV").fill(csv);
  await page.getByRole("button", { name: "Kiểm tra dữ liệu" }).click();
  await expect(page.getByText("Trùng — bỏ qua")).toBeVisible();
  await page.keyboard.press("Escape");
  await nav(page, "Ngân sách");
  await page.getByText(/Phiên bản 1 · Đang áp dụng/).click();
  await expect(
    page.getByRole("columnheader", { name: "Còn / vượt" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Điều chỉnh ngân sách" }).click();
  await page.getByRole("button", { name: "Gợi ý từ 3 tháng trước" }).click();
  await expect(page.getByText(/Trung bình thu nhập 3 tháng/)).toBeVisible();
  await page
    .getByRole("button", { name: "Xem phương án", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Xác nhận áp dụng" }),
  ).toBeEnabled();
  await page.keyboard.press("Escape");
  await nav(page, "Báo cáo");
  await expect(
    page.getByRole("heading", { name: /So với tháng/ }),
  ).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "Tải báo cáo PDF" }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^finora-report-.*\.pdf$/);
  const path = await file.path();
  expect(path).toBeTruthy();
  expect((await readFile(path!)).subarray(0, 5).toString()).toBe("%PDF-");
});
test("recovery forms support keyboard, validation and invalid reset links without exposing token in URL", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Quên mật khẩu?" }).click();
  await page.getByLabel("Email khôi phục").fill("missing@example.test");
  await checkAxe(page);
  await page.getByRole("button", { name: "Gửi liên kết khôi phục" }).click();
  await expect(
    page.getByRole("alert").or(page.getByRole("status")),
  ).toBeVisible();
  await page.goto("/#reset-password?token=" + "a".repeat(64));
  await expect(
    page.getByRole("heading", { name: /Đặt lại mật khẩu/ }),
  ).toBeVisible();
  expect(page.url()).not.toContain("token=");
  await page
    .getByLabel("Mật khẩu mới", { exact: true })
    .fill("strong-password123");
  await page.getByLabel("Nhập lại mật khẩu mới").fill("different-password");
  await page
    .getByRole("button", { name: "Đặt lại mật khẩu", exact: true })
    .click();
  await expect(page.getByRole("alert")).toHaveText("Hai mật khẩu chưa khớp.");
  await page.getByLabel("Nhập lại mật khẩu mới").fill("strong-password123");
  await page
    .getByRole("button", { name: "Đặt lại mật khẩu", exact: true })
    .click();
  await expect(page.getByRole("alert")).toContainText("Liên kết đã hết hạn");
  await checkAxe(page);
});

test("button remains stable after the auth form changes with normal motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  await page.getByRole("button", { name: "Quên mật khẩu?" }).click();
  const button = page.getByRole("button", { name: "Gửi liên kết khôi phục" });
  await button.hover();
  await expect
    .poll(async () =>
      button.evaluate(async (el) => {
        const positions: number[] = [];
        for (let i = 0; i < 6; i++) {
          await new Promise((r) => requestAnimationFrame(r));
          positions.push(el.getBoundingClientRect().y);
        }
        return Math.max(...positions) - Math.min(...positions);
      }),
    )
    .toBeLessThan(0.1);
  await page.getByLabel("Email khôi phục").fill("motion@example.test");
  await button.click();
  await expect(
    page.getByRole("alert").or(page.getByRole("status")),
  ).toBeVisible();
});

test("a financial retry preserves its key across server and rate-limit failures", async ({
  page,
}) => {
  await demo(page);
  const keys: (string | null)[] = [];
  let calls = 0;
  await page.route("**/api/transactions", async (route) => {
    if (route.request().method() !== "POST") {
      await route.continue();
      return;
    }
    keys.push(await route.request().headerValue("Idempotency-Key"));
    calls++;
    if (calls < 3)
      await route.fulfill({
        status: calls === 1 ? 503 : 429,
        contentType: "application/json",
        body: JSON.stringify({
          message:
            calls === 1
              ? "Máy chủ tạm thời chưa sẵn sàng."
              : "Vui lòng thử lại sau.",
        }),
      });
    else await route.continue();
  });
  await page
    .getByRole("button", { name: "Thêm giao dịch", exact: true })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Số tiền (VND)").fill("12345");
  await dialog.getByLabel("Danh mục").selectOption({ label: "Ăn uống" });
  await dialog.getByLabel("Ghi chú").fill("Kiểm thử gửi lại cùng yêu cầu");
  await dialog.getByRole("button", { name: "Lưu giao dịch" }).click();
  await expect(dialog.getByRole("alert")).toHaveText(
    "Máy chủ tạm thời chưa sẵn sàng.",
  );
  await dialog.getByRole("button", { name: "Lưu giao dịch" }).click();
  await expect(dialog.getByRole("alert")).toHaveText("Vui lòng thử lại sau.");
  await dialog.getByRole("button", { name: "Lưu giao dịch" }).click();
  await expect(dialog).not.toBeVisible();
  expect(keys).toHaveLength(3);
  expect(keys[0]).toMatch(/^[a-f0-9-]{36}$/);
  expect(new Set(keys).size).toBe(1);
});

test("budget remaining money stays exact above the Number safe-integer boundary", async ({
  page,
}) => {
  await page.route(/\/api\/reports\/summary\?/, async (route) => {
    const response = await route.fetch();
    const data = await response.json();
    if (data.budget?.items[0]) {
      data.budget.items[0].limit = "1";
      data.budget.items[0].spent = "9007199254740993";
    }
    await route.fulfill({ response, json: data });
  });
  await demo(page);
  await nav(page, "Ngân sách");
  await expect(
    page
      .locator(".budget-caption")
      .getByText("Vượt 9.007.199.254.740.992 ₫", { exact: true }),
  ).toBeVisible();
});
