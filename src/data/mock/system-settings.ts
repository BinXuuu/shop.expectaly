/**
 * 演示数据：平台后台可配置的键值项。
 * 第一期为只读展示，实际写入需接入真实 Supabase 项目后开放。
 */
import type { SystemSetting } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: "profile-super-admin",
} as const;

export const mockSystemSettings: SystemSetting[] = [
  {
    id: "setting-payment-enabled",
    key: "payment_enabled",
    value: "false",
    valueType: "boolean",
    description: "平台担保交易支付通道。第一期强制关闭，不接入真实支付网关。",
    createdAt: "2026-05-01T09:00:00+08:00",
    updatedAt: "2026-07-20T08:00:00+02:00",
    ...base,
  },
  {
    id: "setting-wechat-login-enabled",
    key: "wechat_login_enabled",
    value: "false",
    valueType: "boolean",
    description: "微信开放平台登录。未配置正式凭证前保持关闭。",
    createdAt: "2026-05-01T09:00:00+08:00",
    updatedAt: "2026-05-01T09:00:00+08:00",
    ...base,
  },
  {
    id: "setting-main-site-sso-enabled",
    key: "main_site_sso_enabled",
    value: "false",
    valueType: "boolean",
    description: "与 expectaly.com 主站的账号互通（SSO）。详见 docs/MAIN_SITE_INTEGRATION.md。",
    createdAt: "2026-05-01T09:00:00+08:00",
    updatedAt: "2026-05-01T09:00:00+08:00",
    ...base,
  },
  {
    id: "setting-platform-service-fee-rate",
    key: "platform_service_fee_rate",
    value: "0.05",
    valueType: "number",
    description: "平台担保交易服务费率（支付功能开放后生效，当前仅作展示）。",
    createdAt: "2026-05-01T09:00:00+08:00",
    updatedAt: "2026-05-01T09:00:00+08:00",
    ...base,
  },
  {
    id: "setting-risk-keywords",
    key: "risk_keywords",
    value: "假货,仿品,一比一,高仿",
    valueType: "string",
    description: "商品/评价内容风险关键词，命中后进入人工审核队列。",
    createdAt: "2026-05-01T09:00:00+08:00",
    updatedAt: "2026-06-10T09:00:00+08:00",
    ...base,
  },
];
