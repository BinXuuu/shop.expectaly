import type { BaseEntity, ID, LocalizedText } from "./common";

export type ContentPageStatus = "draft" | "published";

/** 对应数据库实体 content_pages：平台说明、代购流程等静态内容页 */
export interface ContentPage extends BaseEntity {
  slug: string;
  title: LocalizedText;
  body: LocalizedText;
  seoTitle: string | null;
  seoDescription: string | null;
  status: ContentPageStatus;
  publishedAt: string | null;
}

export type EditorialItemType = "product" | "brand" | "merchant" | "city";

/** 对应数据库实体 editorial_collections：主题策展专题，如「米兰本周精选」 */
export interface EditorialCollection extends BaseEntity {
  slug: string;
  title: LocalizedText;
  coverImageUrl: string | null;
  description: LocalizedText | null;
  status: ContentPageStatus;
  isFeatured: boolean;
  sortOrder: number;
  publishedAt: string | null;
}

/** 对应数据库实体 editorial_collection_items */
export interface EditorialCollectionItem extends BaseEntity {
  collectionId: ID;
  itemType: EditorialItemType;
  itemId: ID;
  note: LocalizedText | null;
  sortOrder: number;
}

/** 对应数据库实体 city_guides */
export interface CityGuide extends BaseEntity {
  slug: string;
  cityName: LocalizedText;
  country: string;
  heroImageUrl: string | null;
  introduction: LocalizedText;
  featuredBrandIds: ID[];
  featuredMerchantIds: ID[];
  sortOrder: number;
  isVisible: boolean;
}

/** 对应数据库实体 faqs */
export interface Faq extends BaseEntity {
  category: string;
  question: LocalizedText;
  answer: LocalizedText;
  sortOrder: number;
  isVisible: boolean;
}

export type LegalDocumentSlug =
  | "user-agreement"
  | "privacy-policy"
  | "cookie-policy"
  | "merchant-agreement"
  | "self-negotiated-disclaimer"
  | "platform-transaction-rules"
  | "product-listing-guidelines"
  | "ip-complaint-policy"
  | "restricted-products-policy"
  | "minor-protection-notice"
  | "after-sales-dispute-rules";

/**
 * 对应数据库实体 legal_documents。
 * 初期文本一律标注为待法律顾问审核的模板，不构成正式法律意见。
 */
export interface LegalDocument extends BaseEntity {
  slug: LegalDocumentSlug;
  title: LocalizedText;
  body: LocalizedText;
  version: string;
  effectiveAt: string;
  isPendingLegalReview: boolean;
}
