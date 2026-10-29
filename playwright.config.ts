import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 45000,
  expect: { timeout: 10000 },
  use: {
    baseURL: "http://127.0.0.1:5173",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
    launchOptions: { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH },
  },
  webServer: {
    command: process.env.CI ? "npm run dev" : "bash scripts/start.sh",
    url: "http://127.0.0.1:5173/api/health",
    reuseExistingServer: !process.env.CI,
    timeout: 90000,
  },
});
