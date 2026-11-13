import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const baseURL = "http://127.0.0.1:5173";
let server;
let browser;
let page;
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
  page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await mkdir("docs/images", { recursive: true });
  await page.goto(baseURL);
  await page.getByRole("button", { name: "Đăng nhập", exact: true }).waitFor();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: "docs/images/landing.png" });
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
  // Synthetic fixtures belong only to this isolated demo account.
  const wallets = await (
    await page.request.get(baseURL + "/api/wallets")
  ).json();
  const categories = await (
    await page.request.get(baseURL + "/api/categories")
  ).json();
  const month = await page.getByLabel("Tháng báo cáo").inputValue();
  const post = async (path, body) => {
    const response = await page.request.post(baseURL + "/api" + path, {
      data: body,
    });
    if (!response.ok()) throw new Error("Demo fixture failed: " + path);
    return response.json();
  };
  const reserve = await post("/goals", {
    name: "Quỹ dự phòng",
    target: "30000000",
    targetDate: "2027-12-31T23:59:59+07:00",
  });
  await post(`/goals/${reserve.id}/contributions`, {
    action: "ADD",
    walletId: wallets[0].id,
    amount: "6000000",
    note: "Dành riêng từ tiền đã có",
  });
  const trip = await post("/goals", {
    name: "Một chuyến đi thật vui",
    target: "8000000",
    targetDate: "2027-06-30T23:59:59+07:00",
  });
  await post(`/goals/${trip.id}/contributions`, {
    action: "ADD",
    walletId: wallets[1].id,
    amount: "1800000",
    note: "Từng bước cho chuyến đi",
  });
  await post("/recurring", {
    name: "Gói học online",
    kind: "EXPENSE",
    amount: "199000",
    walletId: wallets[0].id,
    categoryId: categories.find((c) => c.icon === "education").id,
    day: 1,
    startMonth: month,
    note: "Nhắc thanh toán khóa học",
  });
  await page
    .locator("nav")
    .getByRole("button", { name: "Kế hoạch", exact: true })
    .click();
  await page
    .getByRole("heading", { name: "Quỹ dự phòng", exact: true })
    .waitFor();
  await page.screenshot({ path: "docs/images/planning.png", fullPage: true });
  await page
    .getByRole("button", { name: "Giao dịch định kỳ", exact: true })
    .click();
  await page.getByRole("button", { name: "Xác nhận ghi sổ" }).waitFor();
  await page.screenshot({ path: "docs/images/recurring.png", fullPage: true });
  await page
    .locator("nav")
    .getByRole("button", { name: "Báo cáo", exact: true })
    .click();
  await page.locator(".flow-chart svg").first().waitFor();
  await page.screenshot({ path: "docs/images/reports.png", fullPage: true });
  await mkdir("docs/examples", { recursive: true });
  const pdf = await page.request.get(
    baseURL + "/api/reports/pdf?month=" + month,
  );
  if (!pdf.ok()) throw new Error("Demo PDF failed");
  await writeFile("docs/examples/Finora-Bao-cao-mau.pdf", await pdf.body());
  const csv = `occurredAt,kind,category,wallet,destinationWallet,amount,note\n${month}-03T12:00:00+07:00,EXPENSE,Ăn uống,${wallets[0].name},,65000,Cà phê trong file mẫu`;
  await writeFile("docs/examples/finora-import-demo.csv", csv + "\n");
  await page
    .locator("nav")
    .getByRole("button", { name: "Giao dịch", exact: true })
    .click();
  await page.getByRole("button", { name: "Nhập CSV", exact: true }).click();
  await page.getByLabel("Nội dung CSV").fill(csv);
  await page.getByRole("button", { name: "Kiểm tra dữ liệu" }).click();
  await page.getByRole("button", { name: "Xác nhận nhập 1 dòng" }).waitFor();
  await page.screenshot({ path: "docs/images/import.png", fullPage: true });
  await page.keyboard.press("Escape");
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
  console.log(
    "Saved nine demo screenshots and example PDF/CSV; no page errors.",
  );
} catch (error) {
  await mkdir(".local", { recursive: true });
  await page?.screenshot({ path: ".local/capture-failed.png", fullPage: true });
  throw error;
} finally {
  await browser?.close();
  if (server?.pid) process.kill(-server.pid, "SIGTERM");
}
