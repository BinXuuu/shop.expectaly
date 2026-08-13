import { expect, test } from "@playwright/test";
import { loginAsDemoAccount } from "./utils/auth";

const RESTRICTED_PRODUCT_URL = "/products/toscano-cigar-tasting-set";

test.describe("受限制商品：年龄确认与地区限制", () => {
  test("未确认年龄前不展示交易入口", async ({ page }) => {
    await page.goto(RESTRICTED_PRODUCT_URL);
    await expect(page.getByRole("heading", { name: "该商品分类受年龄限制" })).toBeVisible();
    await expect(page.getByRole("button", { name: "发起人工询价" })).toHaveCount(0);
  });

  test("确认年龄后需声明收货地区，受限地区会被拦截，切换地区后恢复交易入口", async ({ page }) => {
    await page.goto(RESTRICTED_PRODUCT_URL);
    await page.getByRole("button", { name: "我已确认达到当地法定年龄" }).click();

    await expect(page.getByRole("heading", { name: "该商品分类受收货地区限制" })).toBeVisible();
    await page.getByLabel("请选择收货地区").selectOption("西藏自治区");
    await expect(page.getByText(/暂不支持配送至「西藏自治区」/)).toBeVisible();

    await page.getByRole("button", { name: "重新选择收货地区" }).click();
    await page.getByLabel("请选择收货地区").selectOption("上海市");
    await expect(page.getByRole("button", { name: "发起人工询价" })).toBeVisible();
  });

  test("年龄确认与地区声明在刷新后仍然保留（本地持久化）", async ({ page }) => {
    await page.goto(RESTRICTED_PRODUCT_URL);
    await page.getByRole("button", { name: "我已确认达到当地法定年龄" }).click();
    await page.getByLabel("请选择收货地区").selectOption("上海市");
    await expect(page.getByRole("button", { name: "发起人工询价" })).toBeVisible();

    await page.reload();
    await expect(page.getByRole("button", { name: "发起人工询价" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "该商品分类受年龄限制" })).toHaveCount(0);
  });
});

test.describe("举报处理：风险关键词预警", () => {
  test("命中风险关键词的举报会显示高亮标签", async ({ page }) => {
    await loginAsDemoAccount(page, "系统预置", "/admin/reports");
    await expect(page.getByText(/命中风险关键词：高仿/)).toBeVisible();
  });
});
