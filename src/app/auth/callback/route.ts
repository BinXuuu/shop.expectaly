import { NextResponse, type NextRequest } from "next/server";
import { getFeatureFlags } from "@/lib/config/feature-flags";

/**
 * 通用 OAuth 回调路由骨架。第一期仅处理「未配置」的友好跳转，
 * 真实的微信开放平台 / 主站 SSO 令牌交换逻辑留待正式接入时补充，
 * 届时 provider 分支将替换为调用对应的 Supabase Auth / 主站 SSO 交换接口。
 */
export async function GET(request: NextRequest) {
  const provider = request.nextUrl.searchParams.get("provider");
  const { wechatLoginEnabled, mainSiteSsoEnabled } = getFeatureFlags();

  if (provider === "wechat" && !wechatLoginEnabled) {
    return NextResponse.redirect(new URL("/auth/login?error=wechat_not_configured", request.url));
  }

  if (provider === "main_site" && !mainSiteSsoEnabled) {
    return NextResponse.redirect(new URL("/auth/login?error=wechat_not_configured", request.url));
  }

  return NextResponse.redirect(new URL("/auth/login", request.url));
}
