import type { BaseEntity, Currency, ID, LocalizedText, PublisherType } from "./common";

export type ProductStatus =
  "draft" | "pending_review" | "changes_requested" | "published" | "rejected" | "off_shelf";

/** 商家为商品选择支持的交易方式，可多选 */
export type TradeMode =
  | "display_only" // 仅展示
  | "contact_merchant" // 联系商家
  | "wechat_contact" // 添加微信
  | "manual_inquiry" // 人工询价
  | "custom_purchase_request" // 提交代购需求
  | "preorder" // 加入预订
  | "group_buy" // 加入拼单
  | "platform_checkout"; // 平台交易（第一期功能开关关闭）

/** 价格展示模式，由商家在发布商品时选择 */
export type PriceDisplayMode = "cny_only" | "eur_only" | "both" | "reference_only" | "inquiry_only";

export type ComplianceStatus = "not_required" | "pending_review" | "approved" | "rejected";

/**
 * 价格相关字段。参见 docs/PROJECT_REQUIREMENTS.md 十四「价格与汇率」。
 * 汇率换算结果均为参考值，最终价格以商家或平台确认结果为准。
 */
export interface ProductPricing {
  originalPrice: number;
  originalCurrency: Currency;
  cnyReferencePrice: number | null;
  eurReferencePrice: number | null;
  displayMode: PriceDisplayMode;
  includesItalyDomesticShipping: boolean;
  includesInternationalShipping: boolean;
  includesDomesticShipping: boolean;
  includesDaigouServiceFee: boolean;
  includesTax: boolean;
  isAllInPrice: boolean; // 是否为到手价
  requiresDeposit: boolean;
  depositAmount: number | null;
  priceValidUntil: string | null;
}

/**
 * 受限制商品合规字段。参见 docs/COMPLIANCE.md。
 * 受限制商品（如雪茄）不允许商家直接发布，必须人工审核。
 */
export interface ProductCompliance {
  ageRestricted: boolean;
  minimumAge: number | null;
  restrictedRegions: string[];
  complianceStatus: ComplianceStatus;
  requiresManualReview: boolean;
  legalNoticeId: ID | null;
}

/** 对应数据库实体 products */
export interface Product extends BaseEntity {
  slug: string;
  publisherType: PublisherType;
  merchantId: ID | null; // publisherType === "platform" 时为 null
  brandId: ID | null;
  categoryId: ID;
  name: LocalizedText;
  summary: LocalizedText | null;
  story: LocalizedText | null;
  materials: LocalizedText | null;
  dimensions: string | null;
  collectibleValueNote: LocalizedText | null;
  authenticityNote: LocalizedText | null;
  sourceCity: string | null;
  sourceStore: string | null;
  estimatedArrivalAt: string | null;
  status: ProductStatus;
  reviewerId: ID | null;
  reviewNote: string | null;
  tradeModes: TradeMode[];
  pricing: ProductPricing;
  compliance: ProductCompliance;
  favoriteCount: number;
  viewCount: number;
  isFeatured: boolean;
  publishedAt: string | null;
}

/** 对应数据库实体 product_variants：规格（如尺寸、配色） */
export interface ProductVariant extends BaseEntity {
  productId: ID;
  sku: string;
  optionLabel: LocalizedText; // 例如「标准版 / 收藏版」
  priceOverride: number | null;
  stockQuantity: number;
  isDefault: boolean;
}

export type ProductMediaType = "image" | "video" | "spin360";

/** 对应数据库实体 product_media */
export interface ProductMedia extends BaseEntity {
  productId: ID;
  type: ProductMediaType;
  url: string;
  altText: string;
  isCover: boolean;
  sortOrder: number;
}

/** 对应数据库实体 inventories */
export interface Inventory extends BaseEntity {
  productId: ID;
  variantId: ID | null;
  quantityAvailable: number;
  quantityReserved: number;
  trackInventory: boolean;
}
