import type { BaseEntity, Currency, ID } from "./common";

export type GroupBuyStatus = "open" | "succeeded" | "failed" | "cancelled";

/** 对应数据库实体 group_buys：拼单活动 */
export interface GroupBuy extends BaseEntity {
  productId: ID;
  merchantId: ID;
  targetQuantity: number;
  currentQuantity: number;
  pricePerUnit: number;
  currency: Currency;
  startsAt: string;
  endsAt: string;
  status: GroupBuyStatus;
}

/** 对应数据库实体 group_buy_members */
export interface GroupBuyMember extends BaseEntity {
  groupBuyId: ID;
  userId: ID;
  quantity: number;
  orderId: ID | null; // 拼单成功后关联生成的订单
  joinedAt: string;
}

export type PreorderStatus = "pending" | "confirmed" | "fulfilled" | "cancelled";

/** 对应数据库实体 preorders */
export interface Preorder extends BaseEntity {
  productId: ID;
  merchantId: ID;
  userId: ID;
  quantity: number;
  depositAmount: number | null;
  depositCurrency: Currency | null;
  expectedArrivalAt: string | null;
  status: PreorderStatus;
  orderId: ID | null;
}
