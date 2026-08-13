import { expect, test } from "@playwright/test";

test.describe("移动端导航抽屉", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("打开菜单显示抽屉内容，关闭后不再拦截页面点击", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: "打开菜单" }).click();
    await expect(page.getByRole("heading", { name: "菜单" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "移动端主导航" })).toBeVisible();

    await page.getByRole("button", { name: "关闭" }).click();
    await expect(page.getByRole("heading", { name: "菜单" })).toBeHidden();

    // 关闭后页脚链接应可正常点击（此前 Drawer 关闭态仍占用布局并拦截点击，Stage09 已修复）
    await page.getByRole("link", { name: "常见问题" }).click();
    await expect(page).toHaveURL(/\/faq$/);
  });
});
