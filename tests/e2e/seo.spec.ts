import { expect, test } from "@playwright/test";

test.describe("SEO：站点地图、爬虫规则与结构化数据", () => {
  test("sitemap.xml 返回有效 XML 且包含核心路径", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/discover");
    expect(body).toContain("/products/favilli-enamel-earrings");
    // 未发布/待审核商品不应出现在站点地图中
    expect(body).not.toContain("/products/parma-cigar-collectors-set");
  });

  test("robots.txt 禁止索引后台与内部路径", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("Disallow: /admin");
    expect(body).toContain("Disallow: /merchant");
    expect(body).toContain("Disallow: /account");
    expect(body).toContain("Disallow: /internal");
    expect(body).toContain("Sitemap:");
  });

  test("商品详情页注入有效的 Product JSON-LD 结构化数据", async ({ page }) => {
    await page.goto("/products/favilli-enamel-earrings");
    const jsonLdContent = await page
      .locator('script[type="application/ld+json"]')
      .first()
      .textContent();
    expect(jsonLdContent).toBeTruthy();
    const data = JSON.parse(jsonLdContent!);
    expect(data["@type"]).toBe("Product");
    expect(data.name).toBeTruthy();
    expect(data.offers).toBeTruthy();
  });

  test("首页与商品页均设置了非默认的 <title> 与 meta description", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/意料之中/);
    const homeDescription = await page.locator('meta[name="description"]').getAttribute("content");
    expect(homeDescription?.length).toBeGreaterThan(10);

    await page.goto("/products/favilli-enamel-earrings");
    await expect(page).toHaveTitle(/Favilli/);
  });

  test("商品详情页设置了 canonical 链接", async ({ page }) => {
    await page.goto("/products/favilli-enamel-earrings");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toContain("/products/favilli-enamel-earrings");
  });
});
