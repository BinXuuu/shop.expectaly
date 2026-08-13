import { expect, test } from "@playwright/test";

test.describe("商品详情页", () => {
  test("已发布商品可正常访问并展示核心信息", async ({ page }) => {
    await page.goto("/products/favilli-enamel-earrings");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Favilli");
    await expect(page.getByRole("button", { name: /举报该商品/ })).toBeVisible();
  });

  test("待审核/未发布商品返回 404", async ({ page }) => {
    const response = await page.goto("/products/parma-cigar-collectors-set");
    expect(response?.status()).toBe(404);
  });

  test("不存在的商品 slug 返回 404", async ({ page }) => {
    const response = await page.goto("/products/this-slug-does-not-exist");
    expect(response?.status()).toBe(404);
  });
});
