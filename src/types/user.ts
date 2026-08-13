import type { BaseEntity, ID, Locale } from "./common";
import type { Role } from "./roles";

export type AccountStatus = "active" | "suspended" | "banned";

export type AuthProvider = "email" | "phone" | "wechat" | "main_site_sso";

/**
 * 对应数据库实体 profiles。
 * 真实认证信息（密码哈希等）由 Supabase Auth 管理，此处只存业务侧资料。
 */
export interface Profile extends BaseEntity {
  authUserId: ID; // 对应 Supabase Auth 用户 ID
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  phone: string | null;
  primaryProvider: AuthProvider;
  /** 便于跨子域与主站账号互通，参见 docs/MAIN_SITE_INTEGRATION.md */
  mainSiteUserId: ID | null;
  locale: Locale;
  roles: Role[];
  status: AccountStatus;
  lastLoginAt: string | null;
}

/** 用户地址簿，对应 addresses 实体 */
export interface Address extends BaseEntity {
  userId: ID;
  recipientName: string;
  phone: string;
  country: string;
  province: string | null;
  city: string;
  district: string | null;
  detail: string;
  postalCode: string | null;
  isDefault: boolean;
  label: string | null; // 例如「家」「公司」
}
