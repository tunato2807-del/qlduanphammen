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

test("public mobile navigation supports keyboard, Escape and section focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Menu", exact: true });
  const nav = page.getByRole("navigation", { name: "Điều hướng trang chào" });
  await expect(nav).toBeHidden();
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Tab");
  await expect(nav.getByRole("link", { name: "Khám phá" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await expect(nav).toBeHidden();
  await menu.click();
  await nav.getByRole("link", { name: "Cảm hứng" }).click();
  await expect(page.locator("#cam-hung")).toBeFocused();
  await expect(nav).toBeHidden();
  await page
    .getByRole("button", { name: "Chuyến đi mơ ước", exact: true })
    .click();
  await expect(
    page.getByRole("heading", {
      name: "Để chuyến đi không chỉ nằm trong dự định.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Chuyến đi mơ ước", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page
    .getByRole("button", { name: "Theo dõi mục tiêu", exact: true })
    .click();
  await expect(page.locator("#finora-access")).toBeFocused();
});

test("welcome illustrations pause, retain preference and honor device reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/");
  const animation = () =>
    page
      .locator(".welcome-arch .life-cloud")
      .evaluate((node) => getComputedStyle(node).animationName);
  await expect.poll(animation).toBe("welcome-drift");
  await page
    .getByRole("button", { name: "Tạm dừng chuyển động", exact: true })
    .click();
  await expect.poll(animation).toBe("none");
  await page.reload();
  const resume = page.getByRole("button", {
    name: "Bật chuyển động trang chào",
    exact: true,
  });
  await expect(resume).toHaveAttribute("aria-pressed", "true");
  await expect.poll(animation).toBe("none");
  await resume.click();
  await expect.poll(animation).toBe("welcome-drift");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(animation).toBe("none");
});
