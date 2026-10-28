import { test, expect } from "@playwright/test";
import { randomUUID } from "node:crypto";
test("demo: transactions, budget, CSV, mobile and keyboard navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page
    .getByRole("button", { name: "Trải nghiệm với dữ liệu mẫu" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Chào Minh Anh/ }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Thêm giao dịch", exact: true })
    .click();
  let dialog = page.getByRole("dialog");
  await dialog.getByLabel("Số tiền (VND)").fill("42000");
  await dialog.getByLabel("Danh mục").selectOption({ label: "Ăn uống" });
  await dialog.getByLabel("Ghi chú").fill("Giao dịch E2E");
  await dialog.getByRole("button", { name: "Lưu giao dịch" }).click();
  await expect(dialog).not.toBeVisible();
  await page
    .locator("nav")
    .getByRole("button", { name: "Giao dịch", exact: true })
    .click();
  await page
    .getByLabel("Lọc giao dịch theo ghi chú hoặc danh mục")
    .fill("Giao dịch E2E");
  await expect(
    page.getByRole("button", { name: /Giao dịch E2E/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sửa", exact: true }).click();
  await dialog.getByLabel("Số tiền (VND)").fill("50000");
  await dialog.getByRole("button", { name: "Lưu giao dịch" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("−50.000 ₫", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Xóa", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Xóa giao dịch", exact: true })
    .click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Chưa tìm thấy giao dịch")).toBeVisible();
  await page.locator("nav").getByRole("button", { name: "Ngân sách" }).click();
  await page.getByRole("button", { name: "Điều chỉnh ngân sách" }).click();
  await page.getByRole("button", { name: "Xem phương án" }).click();
  await expect(page.getByText("Phương án của bạn đã sẵn sàng")).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận áp dụng" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Phiên bản 2", { exact: false })).toBeVisible();
  await page
    .locator("nav")
    .getByRole("button", { name: "Báo cáo", exact: true })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("link", { name: "Tải dữ liệu CSV" }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(
    /^finora-\d{4}-\d{2}\.csv$/,
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Mở menu" }).click();
  await page
    .locator("nav")
    .getByRole("button", { name: "Tổng quan", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: /Chào Minh Anh/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page
    .getByRole("button", { name: "Thêm giao dịch", exact: true })
    .click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await page
    .getByRole("button", { name: "Thêm giao dịch", exact: true })
    .click();
  await dialog.getByLabel("Số tiền (VND)").fill("1000");
  await dialog.getByLabel("Danh mục").selectOption({ label: "Ăn uống" });
  await dialog.getByRole("button", { name: "Lưu giao dịch" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.locator(".toast")).toBeVisible();
  const toastBox = await page.locator(".toast").boundingBox();
  expect(toastBox!.x).toBeGreaterThanOrEqual(0);
  expect(toastBox!.x + toastBox!.width).toBeLessThanOrEqual(390);
  expect(errors).toEqual([]);
});
test("new account: empty state, wallet creation and manually approved budget", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Đăng ký miễn phí" }).click();
  await page.getByLabel("Tên của bạn").fill("Tài khoản E2E");
  await page
    .getByLabel("Địa chỉ email")
    .fill(`e2e-${randomUUID()}@finora.test`);
  await page
    .getByLabel("Mật khẩu", { exact: true })
    .fill("e2e-secure-password-123");
  await page
    .getByRole("button", { name: "Tạo tài khoản", exact: true })
    .click();
  await expect(page.getByText("Bắt đầu từ giao dịch đầu tiên")).toBeVisible();
  await page
    .locator("nav")
    .getByRole("button", { name: "Ví của tôi", exact: true })
    .click();
  await page.getByRole("button", { name: "Thêm ví mới" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("Tên ví").fill("Ví kiểm thử");
  await dialog.getByLabel("Số dư ban đầu (VND)").fill("1000000");
  await dialog.getByRole("button", { name: "Tạo ví", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Ví kiểm thử", exact: true }),
  ).toBeVisible();
  await page.locator("nav").getByRole("button", { name: "Ngân sách" }).click();
  await page.getByRole("button", { name: "Tạo ngân sách đầu tiên" }).click();
  await page.getByRole("button", { name: "Tự đặt hạn mức" }).click();
  await page.getByLabel("Thu nhập dự kiến (VND)").fill("10000000");
  await page.getByLabel("Dự trù tiết kiệm (VND)").fill("2000000");
  await page
    .getByRole("spinbutton", { name: "Hạn mức Ăn uống", exact: true })
    .fill("8000000");
  await page.getByRole("button", { name: "Xem phương án" }).click();
  await expect(page.getByText("Phương án của bạn đã sẵn sàng")).toBeVisible();
  await page.getByRole("button", { name: "Xác nhận áp dụng" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText("Phiên bản 1 · Thiết lập thủ công"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await page
    .getByRole("button", { name: "Chỉnh sửa danh mục Ăn uống", exact: true })
    .click();
  await dialog.getByLabel("Tên danh mục").fill("Ăn uống cá nhân");
  await dialog.getByRole("button", { name: "Lưu thay đổi" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByText("Ăn uống cá nhân", { exact: true }),
  ).toBeVisible();
});

test("motion preference is controllable, persists, and honors system reduction", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Giảm chuyển động" });
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "quiet");
  await page.reload();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
  await toggle.click();
  await expect(page.locator("html")).toHaveAttribute("data-motion", "playful");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("html")).toHaveAttribute("data-motion", "quiet");
  await expect(page.locator(".auth-float")).toHaveCSS("animation-name", "none");
});

test("session bootstrap distinguishes server failure from signed-out state and supports retry", async ({
  page,
}) => {
  let unavailable = true;
  await page.route("**/api/auth/me", async (route) => {
    await route.fulfill({
      status: unavailable ? 503 : 401,
      contentType: "application/json",
      body: JSON.stringify({
        message: unavailable
          ? "Máy chủ tạm thời chưa sẵn sàng."
          : "Vui lòng đăng nhập.",
      }),
    });
  });
  await page.goto("/");
  await expect(page.getByRole("alert")).toContainText(
    "Máy chủ tạm thời chưa sẵn sàng.",
  );
  await expect(
    page.getByRole("button", { name: "Đăng nhập", exact: true }),
  ).not.toBeVisible();
  unavailable = false;
  await page.getByRole("button", { name: "Thử kết nối lại" }).click();
  await expect(
    page.getByRole("button", { name: "Đăng nhập", exact: true }),
  ).toBeVisible();
});
