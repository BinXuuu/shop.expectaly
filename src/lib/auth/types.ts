export interface AuthActionState {
  error?: string;
}

/**
 * 校验 `redirect` 查询参数/表单字段，防止开放重定向（open redirect）：
 * 拒绝非站内相对路径（如完整 URL）与协议相对 URL（如 `//evil.com`，浏览器会解析为跨站地址）。
 * 登录页（`auth/login/page.tsx`）与登录 Server Actions（`actions.ts`）必须共用此函数，
 * 不得各自实现校验逻辑，避免其中一处遗漏防护。
 */
export function safeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/account";
  }
  return path;
}
