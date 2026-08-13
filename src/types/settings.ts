import type { BaseEntity, ID } from "./common";

export type SystemSettingValueType = "boolean" | "number" | "string" | "json";

/** 对应数据库实体 system_settings：后台可配置的键值项（汇率来源、服务费率、风险关键词等） */
export interface SystemSetting extends BaseEntity {
  key: string;
  value: string; // 统一存字符串，读取时按 valueType 解析
  valueType: SystemSettingValueType;
  description: string | null;
  updatedBy: ID | null;
}

/**
 * 平台功能开关。第一期默认全部关闭真实第三方接入，
 * 具体读取逻辑见 lib/config/feature-flags.ts。
 */
export interface FeatureFlags {
  /** 平台担保交易支付通道，第一期强制为 false，不接入真实支付 */
  paymentEnabled: boolean;
  /** 微信登录，未配置开放平台凭证前保持 false 并在前端给出友好提示 */
  wechatLoginEnabled: boolean;
  /** 与 expectaly.com 主站的账号互通（SSO），详见 docs/MAIN_SITE_INTEGRATION.md */
  mainSiteSsoEnabled: boolean;
}

export type FeatureFlagKey = keyof FeatureFlags;
