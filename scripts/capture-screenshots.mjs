import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

const baseURL = "http://127.0.0.1:5173";
let server;
let browser;
const ready = async () => {
  try {
    return (
      await fetch(baseURL + "/api/health", {
        signal: AbortSignal.timeout(1000),
      })
    ).ok;
  } catch {
    return false;
  }
};
try {
  if (!(await ready())) {
    server = spawn("npm", ["run", "dev"], { stdio: "ignore", detached: true });
    let available = false;
    for (let attempt = 0; attempt < 60; attempt++) {
      if (await ready()) {
        available = true;
        break;
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
    if (!available)
      throw new Error(
        "Application did not become ready. Start PostgreSQL and migrate first.",
      );
  }
  browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_EXECUTABLE_PATH,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir("docs/images", { recursive: true });
  await page.goto(baseURL);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "docs/images/login.png", fullPage: true });
  await page
    .getByRole("button", { name: "Trải nghiệm với dữ liệu mẫu" })
    .click();
  await page.getByRole("heading", { name: /Chào Minh Anh/ }).waitFor();
  await page.locator(".flow-chart svg").first().waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "docs/images/dashboard.png", fullPage: true });
  await page
    .locator("nav")
    .getByRole("button", { name: "Ngân sách", exact: true })
    .click();
  await page.getByRole("heading", { name: /Chi tiêu có kế hoạch/ }).waitFor();
  await page.screenshot({ path: "docs/images/budget.png", fullPage: true });
  await page
    .locator("nav")
    .getByRole("button", { name: "Tổng quan", exact: true })
    .click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(
    () => document.documentElement.scrollWidth === innerWidth,
  );
  // Chart ResizeObserver updates on the next rendering frames.
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await page.locator("main").focus();
  await page.waitForFunction(() => document.activeElement?.tagName === "MAIN");
  await page.screenshot({ path: "docs/images/mobile.png", fullPage: true });
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Saved four demo screenshots; no page errors.");
} finally {
  await browser?.close();
  if (server?.pid) process.kill(-server.pid, "SIGTERM");
}
