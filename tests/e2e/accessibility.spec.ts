import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { loginAsDemoAccount } from "./utils/auth";

/**
 * 自动化可访问性扫描（axe-core），覆盖代表性页面模板。
 * 仅断言 serious/critical 级别问题，moderate/minor 级别记录在报告中供后续迭代跟进，
 * 避免因过于严格的规则（如第三方图标库的实现细节）阻塞本阶段交付。
 */
function seriousViolations(results: Awaited<ReturnType<AxeBuilder["analyze"]>>) {
  return results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
}

test.describe("可访问性扫描", () => {
  test("首页", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });

  test("商品发现页", async ({ page }) => {
    await page.goto("/discover");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });

  test("商品详情页", async ({ page }) => {
    await page.goto("/products/favilli-enamel-earrings");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });

  test("登录页", async ({ page }) => {
    await page.goto("/auth/login");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });

  test("用户中心概览", async ({ page }) => {
    await loginAsDemoAccount(page, "张明", "/account");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });

  test("购物车页", async ({ page }) => {
    await loginAsDemoAccount(page, "张明", "/cart");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });

  test("商家后台数据概览", async ({ page }) => {
    await loginAsDemoAccount(page, "Giulia", "/merchant");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });

  test("平台后台仪表盘", async ({ page }) => {
    await loginAsDemoAccount(page, "系统预置", "/admin");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });

  test("法律文本页", async ({ page }) => {
    await page.goto("/legal/user-agreement");
    const results = await new AxeBuilder({ page }).analyze();
    expect(seriousViolations(results), JSON.stringify(seriousViolations(results), null, 2)).toEqual(
      [],
    );
  });
});
