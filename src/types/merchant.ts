import type { BaseEntity, ID, LocalizedText } from "./common";

export type MerchantType = "individual" | "company";

export type MerchantApplicationStatus =
  "draft" | "submitted" | "in_review" | "needs_more_info" | "approved" | "rejected";

export type MerchantStoreStatus = "active" | "paused" | "suspended" | "banned";

export type MerchantVerificationLevel =
  | "individual_verified"
  | "company_verified"
  | "italy_local_verified"
  | "platform_partner"
  | "platform_owned";

/** 对应数据库实体 merchant_applications：商家入驻申请 */
export interface MerchantApplication extends BaseEntity {
  applicantUserId: ID;
  merchantType: MerchantType;
  legalName: string;
  country: string;
  city: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  wechatId: string | null;
  wechatQrCodeUrl: string | null;
  mainCategories: string[]; // Category.slug 列表
  introduction: string;
  identityOrCompanyDocs: string[]; // 上传文件的 URL / 占位路径
  sourcingCapability: string;
  shippingOrigin: string;
  afterSalesPolicy: string;
  wantsPlatformTransaction: boolean;
  status: MerchantApplicationStatus;
  reviewerId: ID | null;
  reviewNote: string | null;
  reviewedAt: string | null;
}

/** 对应数据库实体 merchants：审核通过后创建正式商家档案 */
export interface Merchant extends BaseEntity {
  slug: string;
  applicationId: ID | null;
  name: LocalizedText;
  logoUrl: string | null;
  heroImageUrl: string | null;
  city: string;
  country: string;
  introduction: LocalizedText;
  merchantType: MerchantType;
  verificationLevels: MerchantVerificationLevel[];
  mainCategories: string[];
  contactPhone: string | null;
  contactEmail: string | null;
  wechatId: string | null;
  wechatQrCodeUrl: string | null;
  shippingOrigin: string;
  afterSalesPolicy: LocalizedText;
  supportsPlatformGuarantee: boolean;
  ratingAverage: number;
  ratingCount: number;
  storeStatus: MerchantStoreStatus;
  joinedAt: string;
}

export type MerchantMemberRole = "owner" | "staff";

/** 对应数据库实体 merchant_members：商家团队成员（预留多成员管理） */
export interface MerchantMember extends BaseEntity {
  merchantId: ID;
  userId: ID;
  role: MerchantMemberRole;
}

/** 对应数据库实体 merchant_verifications：认证材料与审核记录 */
export interface MerchantVerification extends BaseEntity {
  merchantId: ID;
  level: MerchantVerificationLevel;
  documentUrls: string[];
  verifiedBy: ID | null;
  verifiedAt: string | null;
  expiresAt: string | null;
  notes: string | null;
}
