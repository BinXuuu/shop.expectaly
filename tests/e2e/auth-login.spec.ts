import { expect, test } from "@playwright/test";
import { loginAsDemoAccount, logout } from "./utils/auth";

test.describe("登录与路由保护", () => {
  test("未登录访问 /account 会重定向到登录页并带上 redirect 参数", async ({ page }) => {
    await page.goto("/account");
    await expect(page).toHaveURL(/\/auth\/login\?redirect=%2Faccount/);
  });

  test("演示账号登录后可进入用户中心，并遵循 redirect 参数跳回原路径", async ({ page }) => {
    await loginAsDemoAccount(page, "张明", "/account/wishlist");
    await expect(page).toHaveURL(/\/account\/wishlist$/);
    await logout(page);
  });

  test("开放重定向防护：redirect 为协议相对地址时安全回退到 /account", async ({ page }) => {
    await loginAsDemoAccount(page, "张明");
    await expect(page).toHaveURL(/\/account$/);

    await page.goto("/auth/login?redirect=//evil.example.com");
    await expect(page).toHaveURL(/^http:\/\/localhost:3101\/account$/);
    await logout(page);
  });

  test("退出登录后再次访问受保护页面会被重定向回登录页", async ({ page }) => {
    await loginAsDemoAccount(page, "张明");
    await logout(page);
    await page.goto("/account/orders");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
