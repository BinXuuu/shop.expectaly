import type { BaseEntity, Currency, ID } from "./common";

/**
 * 支付系统预留结构。第一期 payment_enabled = false（见 lib/config/feature-flags.ts），
 * 不接入真实支付渠道，也不得展示虚假的“支付成功”。
 */

export type PaymentStatus =
  "pending" | "requires_action" | "succeeded" | "failed" | "cancelled" | "refunded";

export type PaymentProviderName = "unconfigured" | "alipay" | "wechat_pay" | "stripe";

/** 对应数据库实体 payments：支付意图记录 */
export interface Payment extends BaseEntity {
  orderId: ID;
  provider: PaymentProviderName;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  /** 幂等键，防止重复创建支付意图 */
  idempotencyKey: string;
  /** 创建支付意图时的订单金额快照，避免订单金额后续变化导致对账歧义 */
  orderAmountSnapshot: number;
  expiresAt: string | null;
}

export type PaymentTransactionType = "charge" | "refund" | "webhook_event";

/** 对应数据库实体 payment_transactions：支付网关侧的每一次交互日志 */
export interface PaymentTransaction extends BaseEntity {
  paymentId: ID;
  provider: PaymentProviderName;
  providerTransactionId: string | null;
  type: PaymentTransactionType;
  amount: number;
  currency: Currency;
  status: PaymentStatus;
  /** 指向内部日志存储的引用，不在类型层直接携带网关原始报文 */
  logRef: string | null;
  occurredAt: string;
}

export type RefundStatus = "requested" | "processing" | "succeeded" | "failed" | "cancelled";

/** 对应数据库实体 refunds */
export interface Refund extends BaseEntity {
  paymentId: ID;
  orderId: ID;
  amount: number;
  currency: Currency;
  reason: string;
  status: RefundStatus;
  requestedBy: ID;
  processedAt: string | null;
}

export interface CreatePaymentIntentInput {
  orderId: ID;
  amount: number;
  currency: Currency;
  idempotencyKey: string;
}

export interface PaymentIntentResult {
  paymentId: ID;
  clientSecret: string | null;
  status: PaymentStatus;
}

export interface CreateRefundInput {
  paymentId: ID;
  amount: number;
  reason: string;
  requestedBy: ID;
}

/**
 * 支付服务商适配接口。第一期未接入任何真实网关，
 * 由 lib/services/payment-service.ts 提供一个返回“未启用”状态的占位实现。
 */
export interface PaymentProvider {
  name: PaymentProviderName;
  createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntentResult>;
  confirmPayment(paymentId: ID): Promise<PaymentTransaction>;
  refund(input: CreateRefundInput): Promise<Refund>;
}
