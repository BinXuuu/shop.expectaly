import { defineConfig, devices } from "@playwright/test";

/**
 * Stage 09 端到端测试配置。使用独立端口（3101）避免与手动开发服务器（3100）冲突。
 * 第一期仅安装 Chromium + Firefox 浏览器引擎（跳过 WebKit 以控制安装体积/时间），
 * 移动端视口通过 "Mobile Chrome" 设备预设覆盖，而非依赖 WebKit 的 "Mobile Safari"。
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // 三个浏览器项目共用同一个开发服务器（按需编译页面），并发 worker 过多会导致首次编译超时，
  // 与真实浏览器兼容性问题无关，故本地默认限制并发数；CI 环境保持单 worker 顺序执行。
  workers: process.env.CI ? 1 : 4,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3101",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 5"] } },
  ],
  webServer: {
    command: "npm run dev -- -p 3101",
    url: "http://localhost:3101",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
