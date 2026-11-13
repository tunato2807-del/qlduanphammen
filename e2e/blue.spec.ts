import { test, expect } from "@playwright/test";
test("blue welcome fits phone and desktop and its CTA moves keyboard focus to account access", async ({
  page,
}) => {
  await page.goto("/");
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(
      page.getByRole("button", { name: "Bắt đầu cùng Finora" }),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.getByRole("button", { name: "Bắt đầu cùng Finora" }).click();
  await expect(page.locator("#finora-access")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("button", { name: "Giảm chuyển động" }),
  ).toBeFocused();
  await expect(
    page.getByRole("heading", { name: "Chào mừng bạn trở lại" }),
  ).toBeInViewport();
});
