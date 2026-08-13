import type { BaseEntity, Currency, ID } from "./common";

/** 订单类型：平台订单（走支付与履约流程）或商家自主交易（平台仅记录状态） */
export type OrderKind = "platform" | "self_negotiated";

/**
 * 自主交易状态：平台不参与付款、发货和售后责任，仅作为撮合记录。
 */
export type SelfNegotiatedStatus =
  | "contacted_merchant" // 已联系商家
  | "negotiating" // 协商中
  | "agreed_with_merchant" // 已与商家达成协议
  | "cancelled" // 已取消
  | "user_marked_completed"; // 用户手动标记完成

/**
 * 平台订单完整状态机。第一期 payment_enabled = false，
 * 状态机与数据结构预留，不代表真实支付已启用。
 */
export type PlatformOrderStatus =
  | "submitted" // 已提交
  | "awaiting_merchant_confirmation" // 等待商家确认
  | "awaiting_payment" // 等待用户付款
  | "paid" // 已付款
  | "sourcing_in_italy" // 意大利采购中
  | "sourcing_completed" // 已完成采购
  | "italy_domestic_shipping" // 意大利境内运输
  | "international_shipping" // 国际运输
  | "customs_clearance" // 清关中
  | "domestic_delivery" // 国内配送
  | "completed" // 已完成
  | "after_sales" // 售后中
  | "refunded" // 已退款
  | "cancelled"; // 已取消

export type OrderStatus = SelfNegotiatedStatus | PlatformOrderStatus;

/** 对应数据库实体 orders */
export interface Order extends BaseEntity {
  orderNumber: string;
  userId: ID;
  merchantId: ID | null; // 平台自营时为 null
  orderKind: OrderKind;
  status: OrderStatus;
  currency: Currency;
  itemsSubtotal: number;
  shippingFee: number | null;
  serviceFee: number | null;
  taxFee: number | null;
  depositAmount: number | null;
  totalAmount: number;
  addressId: ID | null;
  contactPhone: string | null;
  /** 下单时功能开关快照，避免历史订单因后续开关变化而产生歧义 */
  paymentEnabledSnapshot: boolean;
  cancelledReason: string | null;
  completedAt: string | null;
}

/** 对应数据库实体 order_items */
export interface OrderItem extends BaseEntity {
  orderId: ID;
  productId: ID;
  variantId: ID | null;
  quantity: number;
  unitPrice: number;
  currency: Currency;
  priceSnapshotId: ID | null;
  productNameSnapshot: string;
  productImageSnapshot: string | null;
}

/** 对应数据库实体 order_status_history：完整状态流转审计轨迹 */
export interface OrderStatusHistory extends BaseEntity {
  orderId: ID;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedBy: ID | null;
  note: string | null;
  occurredAt: string;
}

export type PurchaseProgressStage =
  | "sourcing_in_italy"
  | "sourcing_completed"
  | "italy_domestic_shipping"
  | "international_shipping"
  | "customs_clearance"
  | "domestic_delivery"
  | "completed";

/**
 * 对应数据库实体 purchase_progress：面向用户展示的代购进度时间线，
 * 与 order_status_history（系统审计轨迹）分开，便于账户中心呈现更友好的节点信息。
 */
export interface PurchaseProgress extends BaseEntity {
  orderId: ID;
  stage: PurchaseProgressStage;
  note: string | null;
  occurredAt: string;
}
