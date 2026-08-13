import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 必须与 src/lib/supabase/{server,client}.ts 里 cookieOptions.name 保持一致。
 * 体积较大时 Supabase 会把会话拆分为 `sb-auth-token.0` / `.1` 等分片 Cookie，
 * 因此这里用前缀匹配而非精确匹配。
 */
const SUPABASE_COOKIE_NAME_PREFIX = "sb-auth-token";

/**
 * 路由保护。Next.js 16 把 middleware 重命名为 proxy 并默认使用 Node.js 运行时，
 * 但 Cloudflare 的 OpenNext 适配器暂不支持 Node.js Proxy，因此这里改用旧的
 * middleware.ts 文件约定（仍受支持，默认 Edge 运行时）以兼容 Cloudflare 部署。
 * 仅做「是否存在会话 Cookie」的轻量校验，具体角色/权限判断在页面层
 * 通过 getCurrentProfile() + lib/permissions 完成，避免在中间件中引入数据访问逻辑。
 */
export function middleware(request: NextRequest) {
  const hasSession = request.cookies
    .getAll()
    .some((c) => c.name.startsWith(SUPABASE_COOKIE_NAME_PREFIX));

  if (!hasSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/merchant/:path*", "/cart", "/admin/:path*"],
};
