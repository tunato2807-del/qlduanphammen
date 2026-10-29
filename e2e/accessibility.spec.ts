import { test, expect, type Page } from "@playwright/test";
import axe from "axe-core";

async function accessible(page: Page, label: string) {
  await page.evaluate(() => document.fonts.ready);
  await page.addScriptTag({ content: axe.source });
  const issues = await page.evaluate(async () => {
    const engine = (window as unknown as { axe: typeof import("axe-core") })
      .axe;
    const result = await engine.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] },
    });
    return result.violations
      .filter(
        (issue) => issue.impact === "serious" || issue.impact === "critical",
      )
      .map((issue) => ({
        id: issue.id,
        nodes: issue.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      }));
  });
  expect(issues, label).toEqual([]);
}
test("main screens and dialogs meet automated accessibility checks", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Đăng nhập", exact: true }),
  ).toBeVisible();
  await accessible(page, "login");
  await page.getByRole("button", { name: "Đăng ký miễn phí" }).click();
  await accessible(page, "registration");
  await page
    .getByRole("button", { name: "Trải nghiệm với dữ liệu mẫu" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Chào Minh Anh/ }),
  ).toBeVisible();
  for (const name of [
    "Tổng quan",
    "Giao dịch",
    "Ví của tôi",
    "Ngân sách",
    "Báo cáo",
  ]) {
    await page
      .locator("nav")
      .getByRole("button", { name, exact: true })
      .click();
    await expect(page.locator("main h1")).toBeVisible();
    await accessible(page, name);
  }
  await page.getByRole("button", { name: "Cài đặt", exact: true }).click();
  await accessible(page, "settings");
  await page.getByRole("button", { name: "Đổi mật khẩu", exact: true }).click();
  await accessible(page, "password dialog");
  await page.keyboard.press("Escape");
  await page
    .locator("nav")
    .getByRole("button", { name: "Tổng quan", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Thêm giao dịch", exact: true })
    .click();
  await accessible(page, "transaction dialog");
  await page.keyboard.press("Escape");
  await page
    .locator("nav")
    .getByRole("button", { name: "Ngân sách", exact: true })
    .click();
  await page.getByRole("button", { name: "Điều chỉnh ngân sách" }).click();
  await accessible(page, "budget dialog");
});

test("all screens fit supported viewport widths and mobile menu supports Escape", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Trải nghiệm với dữ liệu mẫu" })
    .click();
  await expect(
    page.getByRole("heading", { name: /Chào Minh Anh/ }),
  ).toBeVisible();
  const skip = page.getByRole("link", { name: "Bỏ qua điều hướng" });
  await skip.focus();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 950 });
    for (const name of [
      "Tổng quan",
      "Giao dịch",
      "Ví của tôi",
      "Ngân sách",
      "Báo cáo",
    ]) {
      if (width <= 800)
        await page.getByRole("button", { name: "Mở menu" }).click();
      await page
        .locator("nav")
        .getByRole("button", { name, exact: true })
        .click();
      await expect
        .poll(
          () =>
            page.evaluate(
              () => document.documentElement.scrollWidth - innerWidth,
            ),
          { message: `${name} at ${width}px` },
        )
        .toBeLessThanOrEqual(0);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  const menu = page.getByRole("button", { name: "Mở menu" });
  await menu.click();
  await page.keyboard.press("Escape");
  await expect(page.locator(".sidebar")).not.toHaveClass(/open/);
  await expect(menu).toBeFocused();
});
