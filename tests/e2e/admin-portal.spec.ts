import { expect, test } from "@playwright/test";
import { loginAsDemoAccount } from "./utils/auth";

test.describe("平台后台", () => {
  test("非管理角色访问平台后台展示无权访问引导", async ({ page }) => {
    await loginAsDemoAccount(page, "张明", "/admin");
    await expect(page.getByRole("heading", { name: "无权访问平台后台" })).toBeVisible();
  });

  test("客服角色仅看到权限范围内的导航项", async ({ page }) => {
    await loginAsDemoAccount(page, "周子涵", "/admin");
    const nav = page.getByRole("navigation", { name: "平台后台导航" });
    await expect(nav.getByRole("link", { name: "仪表盘" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "举报处理" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "角色权限" })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "商品审核" })).toHaveCount(0);
  });

  test("非超级管理员直接访问 /admin/roles 被拦截", async ({ page }) => {
    await loginAsDemoAccount(page, "周子涵", "/admin/roles");
    await expect(page.getByRole("heading", { name: "无权访问", exact: true })).toBeVisible();
  });

  test("超级管理员可访问角色权限矩阵且导航完整", async ({ page }) => {
    await loginAsDemoAccount(page, "系统预置", "/admin/roles");
    await expect(page.getByRole("heading", { name: "角色权限", exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: "超级管理员独占权限" })).toBeVisible();
  });

  test("商品审核队列展示待审核商品并可打开审核弹层", async ({ page }) => {
    await loginAsDemoAccount(page, "何嘉", "/admin/product-reviews");
    await expect(page.getByText("帕尔马雪茄收藏套装").first()).toBeVisible();
    await page.getByRole("button", { name: "审核" }).first().click();
    await expect(page.getByText("审核决定")).toBeVisible();
  });
});
