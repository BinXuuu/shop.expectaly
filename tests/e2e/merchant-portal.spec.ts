import { expect, test } from "@playwright/test";
import { loginAsDemoAccount } from "./utils/auth";

test.describe("商家后台", () => {
  test("认证商家可访问数据概览", async ({ page }) => {
    await loginAsDemoAccount(page, "Giulia", "/merchant");
    await expect(page.getByRole("heading", { name: "数据概览" })).toBeVisible();
  });

  test("非商家账号访问商家后台展示引导页而非报错", async ({ page }) => {
    await loginAsDemoAccount(page, "张明", "/merchant");
    await expect(page.getByRole("heading", { name: "你还不是认证商家" })).toBeVisible();
  });

  test("跨商家编辑商品被服务端拦截返回 404", async ({ page }) => {
    await loginAsDemoAccount(page, "Giulia");
    // product-ferrari-f40-model 归属 Modena Collectors，而非当前登录的 Milano Atelier
    const response = await page.goto("/merchant/products/product-ferrari-f40-model/edit");
    expect(response?.status()).toBe(404);
  });

  test("未登录访问商家后台会重定向到登录页", async ({ page }) => {
    await page.goto("/merchant");
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
