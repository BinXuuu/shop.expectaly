/**
 * 演示数据：拼单与预订。
 */
import type { GroupBuy, GroupBuyMember, Preorder } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

export const mockGroupBuys: GroupBuy[] = [
  {
    id: "group-buy-1",
    productId: "product-inter-milan-scarf-group-buy",
    merchantId: "merchant-chiara-milano-buyer",
    targetQuantity: 20,
    currentQuantity: 14,
    pricePerUnit: 25,
    currency: "EUR",
    startsAt: "2026-07-01T00:00:00+02:00",
    endsAt: "2026-08-01T23:59:59+02:00",
    status: "open",
    createdAt: "2026-06-18T10:00:00+02:00",
    updatedAt: "2026-07-19T10:00:00+02:00",
    ...base,
  },
];

export const mockGroupBuyMembers: GroupBuyMember[] = [
  {
    id: "group-buy-member-1",
    groupBuyId: "group-buy-1",
    userId: "profile-user-zhangming",
    quantity: 2,
    orderId: null,
    joinedAt: "2026-07-19T10:00:00+02:00",
    createdAt: "2026-07-19T10:00:00+02:00",
    updatedAt: "2026-07-19T10:00:00+02:00",
    ...base,
  },
];

export const mockPreorders: Preorder[] = [
  {
    id: "preorder-1",
    productId: "product-tuscany-glass-ornament",
    merchantId: "merchant-firenze-craft-collective",
    userId: "profile-user-chenxi",
    quantity: 1,
    depositAmount: 30,
    depositCurrency: "EUR",
    expectedArrivalAt: "2026-08-15T00:00:00+02:00",
    status: "confirmed",
    orderId: null,
    createdAt: "2026-06-05T10:00:00+02:00",
    updatedAt: "2026-06-06T10:00:00+02:00",
    ...base,
  },
];
