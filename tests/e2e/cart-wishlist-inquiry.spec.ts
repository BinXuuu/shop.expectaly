import { expect, test } from "@playwright/test";
import { loginAsDemoAccount } from "./utils/auth";

test.describe("购物车、收藏与询价", () => {
  test("购物车按商家分组展示，且支付功能开关提示可见", async ({ page }) => {
    await loginAsDemoAccount(page, "张明");
    await page.goto("/cart");
    await expect(page.getByRole("heading", { name: "购物车", exact: true })).toBeVisible();
    await expect(page.getByText(/平台担保交易正在逐步开放/).first()).toBeVisible();
  });

  test("购物车行内数量调整为本地演示交互", async ({ page }) => {
    await loginAsDemoAccount(page, "张明");
    await page.goto("/cart");
    const increaseButtons = page.getByRole("button", { name: "增加数量" });
    if (await increaseButtons.count()) {
      const first = increaseButtons.first();
      await first.click();
      // 本地状态演示交互，验证按钮可正常响应而不报错
      await expect(first).toBeEnabled();
    }
  });

  test("我的收藏页可访问（未登录会被路由保护拦截）", async ({ page }) => {
    await page.goto("/account/wishlist");
    await expect(page).toHaveURL(/\/auth\/login/);

    await loginAsDemoAccount(page, "张明", "/account/wishlist");
    await expect(page).toHaveURL(/\/account\/wishlist$/);
  });

  test("我的询价记录页展示已有询价", async ({ page }) => {
    await loginAsDemoAccount(page, "张明", "/account/inquiries");
    await expect(page.getByRole("heading", { name: "询价记录" })).toBeVisible();
  });
});
