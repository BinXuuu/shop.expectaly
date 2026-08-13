import { expect, test } from "@playwright/test";

test.describe("商品发现与搜索", () => {
  // 桌面筛选栏与移动端筛选抽屉共享同一份表单字段（含重复 id="q"），
  // 以下测试针对桌面常驻筛选栏，固定桌面视口避免在移动端设备项目下匹配到隐藏的抽屉副本。
  test.use({ viewport: { width: 1280, height: 800 } });

  test("按关键词筛选商品并可清除筛选", async ({ page }) => {
    await page.goto("/discover");
    await page.getByPlaceholder("商品名称").first().fill("耳饰");
    await page.getByRole("button", { name: "应用筛选" }).first().click();

    await expect(page).toHaveURL(/q=%E8%80%B3%E9%A5%B0|q=耳饰/);
    await expect(page.getByRole("link", { name: /清除全部筛选/ })).toBeVisible();

    await page.getByRole("link", { name: /清除全部筛选/ }).click();
    await expect(page).toHaveURL(/\/discover$/);
  });

  test("搜索无结果时展示空状态", async ({ page }) => {
    await page.goto("/discover?q=zzz-not-exist-zzz");
    await expect(page.getByText(/没有找到|暂无/)).toBeVisible();
  });

  test("移动端筛选抽屉可正常打开与关闭", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/discover");
    const filterTrigger = page.getByRole("button", { name: /筛选/ }).first();
    await filterTrigger.click();
    await expect(page.getByRole("button", { name: "应用筛选" }).last()).toBeVisible();
  });
});

test.describe("搜索页", () => {
  test("跨类型搜索返回结果分组", async ({ page }) => {
    await page.goto("/search?q=米兰");
    await expect(page.getByText("米兰", { exact: false }).first()).toBeVisible();
  });
});
