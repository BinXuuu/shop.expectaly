/**
 * 演示数据：询价单、询价消息与商家报价。
 */
import type { Inquiry, InquiryMessage, MerchantQuote } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

export const mockInquiries: Inquiry[] = [
  {
    id: "inquiry-1",
    userId: "profile-user-chenxi",
    productId: "product-tuscany-glass-ornament",
    variantId: null,
    merchantId: "merchant-firenze-craft-collective",
    quantity: 2,
    budgetAmount: 180,
    budgetCurrency: "EUR",
    message: "想问一下两件不同配色是否可以拼在一起发货，运费怎么算？",
    contactMethod: "in_site",
    contactValue: null,
    status: "quoted",
    latestQuoteId: "quote-1",
    createdAt: "2026-07-10T10:00:00+02:00",
    updatedAt: "2026-07-11T10:00:00+02:00",
    ...base,
  },
  {
    id: "inquiry-2",
    userId: "profile-user-zhangming",
    productId: "product-parma-cigar-collection",
    variantId: null,
    merchantId: "merchant-chiara-milano-buyer",
    quantity: 1,
    budgetAmount: null,
    budgetCurrency: null,
    message: "请问收藏木盒版本是否有单独出售，含税到手价大概多少？",
    contactMethod: "in_site",
    contactValue: null,
    status: "pending_merchant_reply",
    latestQuoteId: null,
    createdAt: "2026-07-19T10:00:00+02:00",
    updatedAt: "2026-07-19T10:00:00+02:00",
    ...base,
  },
];

export const mockInquiryMessages: InquiryMessage[] = [
  {
    id: "inquiry-msg-1",
    inquiryId: "inquiry-1",
    senderId: "profile-user-chenxi",
    senderRole: "user",
    body: "想问一下两件不同配色是否可以拼在一起发货，运费怎么算？",
    attachmentUrls: [],
    createdAt: "2026-07-10T10:00:00+02:00",
    updatedAt: "2026-07-10T10:00:00+02:00",
    ...base,
  },
  {
    id: "inquiry-msg-2",
    inquiryId: "inquiry-1",
    senderId: "profile-merchant-milano-atelier-owner",
    senderRole: "merchant",
    body: "可以合并发货，已给出合并运费后的报价，请查收。",
    attachmentUrls: [],
    createdAt: "2026-07-11T10:00:00+02:00",
    updatedAt: "2026-07-11T10:00:00+02:00",
    ...base,
  },
];

export const mockMerchantQuotes: MerchantQuote[] = [
  {
    id: "quote-1",
    inquiryId: "inquiry-1",
    merchantId: "merchant-firenze-craft-collective",
    quotedPrice: 176,
    quotedCurrency: "EUR",
    shippingFee: 22,
    serviceFee: null,
    taxFee: null,
    validUntil: "2026-07-25T23:59:59+02:00",
    note: "两件合并发货优惠 14 欧元运费",
    status: "active",
    createdAt: "2026-07-11T10:00:00+02:00",
    updatedAt: "2026-07-11T10:00:00+02:00",
    ...base,
  },
];
