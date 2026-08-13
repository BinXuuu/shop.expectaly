import type { BaseEntity, ID } from "./common";

/**
 * 只有平台确认的订单才能标记为「已验证购买」，其余为「未验证体验评价」。
 */
export type ReviewVerification = "verified_purchase" | "unverified_experience";

/** 对应数据库实体 product_reviews */
export interface ProductReview extends BaseEntity {
  productId: ID;
  userId: ID;
  orderId: ID | null;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string | null;
  body: string;
  imageUrls: string[];
  verification: ReviewVerification;
  merchantReply: string | null;
  merchantRepliedAt: string | null;
  isHidden: boolean;
}

/** 对应数据库实体 merchant_reviews */
export interface MerchantReview extends BaseEntity {
  merchantId: ID;
  userId: ID;
  orderId: ID | null;
  rating: 1 | 2 | 3 | 4 | 5;
  body: string;
  verification: ReviewVerification;
  isHidden: boolean;
}
