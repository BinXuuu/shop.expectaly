import type { FeatureFlagKey, FeatureFlags } from "@/types";

function parseBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback;
  return value.trim().toLowerCase() === "true";
}

/**
 * 功能开关读取入口。第一期所有开关默认关闭，未配置对应凭证/服务时保持关闭，
 * 不允许业务代码自行绕过该函数直接读取 process.env。
 *
 * - paymentEnabled：即使为 true，也不存在真实支付网关实现（见 lib/services/payment-service.ts），
 *   前台在未启用时必须展示引导联系商家/询价的提示，不得出现虚假的“支付成功”。
 * - wechatLoginEnabled：为 true 但缺少 WECHAT_OAUTH_APP_ID / SECRET 时，登录入口仍需保持禁用并提示。
 * - mainSiteSsoEnabled：与主站账号互通开关，详见 docs/MAIN_SITE_INTEGRATION.md。
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    paymentEnabled: parseBooleanEnv(process.env.PAYMENT_ENABLED, false),
    wechatLoginEnabled:
      parseBooleanEnv(process.env.WECHAT_LOGIN_ENABLED, false) &&
      Boolean(process.env.WECHAT_OAUTH_APP_ID) &&
      Boolean(process.env.WECHAT_OAUTH_APP_SECRET),
    mainSiteSsoEnabled: parseBooleanEnv(process.env.MAIN_SITE_SSO_ENABLED, false),
  };
}

export function isFeatureEnabled(key: FeatureFlagKey): boolean {
  return getFeatureFlags()[key];
}

export const PAYMENT_DISABLED_NOTICE =
  "平台担保交易正在逐步开放，当前商品请根据页面说明联系商家或提交询价。";

export const WECHAT_LOGIN_DISABLED_NOTICE = "微信登录尚未开放，请先使用邮箱或手机号登录。";
