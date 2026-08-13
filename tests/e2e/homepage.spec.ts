import { expect, test } from "@playwright/test";

test.describe("首页", () => {
  test("加载首页并展示核心分区", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/意料之中/);
    // Logo 在桌面端与移动端均常驻展示，主导航链接在移动端收纳进汉堡菜单，故不用作跨视口断言依据。
    await expect(page.getByRole("link", { name: /意料之中～意购/ }).first()).toBeVisible();
  });

  test("首页无水平溢出", async ({ page }) => {
    await page.goto("/");
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(hasOverflow).toBe(false);
  });
});
