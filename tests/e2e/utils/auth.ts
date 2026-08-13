import type { Page } from "@playwright/test";

/**
 * 开发环境演示账号快捷登录（对应 LoginForm.tsx 中 `<details>` 折叠面板的角色账号列表）。
 * displayName 需与 DEMO_ACCOUNTS 中的展示名一致，用于在按钮文案中精确匹配。
 */
export async function loginAsDemoAccount(page: Page, displayName: string, redirectTo?: string) {
  const url = redirectTo ? `/auth/login?redirect=${encodeURIComponent(redirectTo)}` : "/auth/login";
  await page.goto(url);
  await page.getByText("开发环境快捷登录（按角色）").click();
  await page.getByRole("button", { name: new RegExp(displayName) }).click();
  await page.waitForLoadState("networkidle");
}

export async function logout(page: Page) {
  await page.goto("/account");
  const logoutButton = page.getByRole("button", { name: "退出登录" });
  if (await logoutButton.isVisible().catch(() => false)) {
    await logoutButton.click();
    await page.waitForLoadState("networkidle");
  }
}
