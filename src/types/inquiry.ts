import type { BaseEntity, Currency, ID } from "./common";

export type InquiryStatus =
  | "pending_merchant_reply" // 待商家回复
  | "quoted" // 商家已报价
  | "viewed_by_user" // 用户已查看
  | "negotiating" // 协商中
  | "agreed" // 已达成
  | "cancelled" // 已取消
  | "expired"; // 已过期

export type ContactMethod = "in_site" | "wechat" | "phone";

/**
 * 对应数据库实体 inquiries。
 * 第一期站内记录询价，实际沟通允许转到微信，因此 contactMethod 可为 "wechat"。
 */
export interface Inquiry extends BaseEntity {
  userId: ID;
  productId: ID;
  variantId: ID | null;
  merchantId: ID;
  quantity: number;
  budgetAmount: number | null;
  budgetCurrency: Currency | null;
  message: string;
  contactMethod: ContactMethod;
  contactValue: string | null;
  status: InquiryStatus;
  latestQuoteId: ID | null;
}

export type InquirySenderRole = "user" | "merchant";

/** 对应数据库实体 inquiry_messages：站内询价消息记录 */
export interface InquiryMessage extends BaseEntity {
  inquiryId: ID;
  senderId: ID;
  senderRole: InquirySenderRole;
  body: string;
  attachmentUrls: string[];
}

export type MerchantQuoteStatus = "active" | "accepted" | "expired" | "withdrawn";

/** 对应数据库实体 merchant_quotes：商家针对询价单给出的正式报价 */
export interface MerchantQuote extends BaseEntity {
  inquiryId: ID;
  merchantId: ID;
  quotedPrice: number;
  quotedCurrency: Currency;
  shippingFee: number | null;
  serviceFee: number | null;
  taxFee: number | null;
  validUntil: string | null;
  note: string | null;
  status: MerchantQuoteStatus;
}
