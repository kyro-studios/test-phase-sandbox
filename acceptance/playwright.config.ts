import { defineConfig, devices } from "@playwright/test";

const frontendUrl = "http://localhost:5173";
const backendPort = 8080;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? [["list"]] : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: frontendUrl,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: [
    {
      // バックエンド。終了時に Playwright が止める
      command: "./gradlew --no-daemon -q installDist && exec build/install/backend/bin/backend",
      cwd: "../app/backend",
      env: { PORT: String(backendPort) },
      port: backendPort,
      reuseExistingServer: !process.env.CI,
      timeout: 180_000,
    },
    {
      // フロントエンド。Vite の開発サーバーが /api をバックエンドへ中継する
      command: "npm run dev -- --strictPort",
      cwd: "../app/frontend",
      url: frontendUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
