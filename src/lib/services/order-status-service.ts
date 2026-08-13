import type { OrderKind, OrderStatus, PlatformOrderStatus, SelfNegotiatedStatus } from "@/types";
import { AppError } from "@/lib/errors/app-error";

const SELF_NEGOTIATED_TRANSITIONS: Record<SelfNegotiatedStatus, SelfNegotiatedStatus[]> = {
  contacted_merchant: ["negotiating", "agreed_with_merchant", "cancelled"],
  negotiating: ["agreed_with_merchant", "cancelled"],
  agreed_with_merchant: ["user_marked_completed", "cancelled"],
  user_marked_completed: [],
  cancelled: [],
};

/**
 * 平台订单完整状态机，第一期 payment_enabled = false，该状态机为预留结构，
 * 不代表真实支付/物流已启用。
 */
const PLATFORM_ORDER_TRANSITIONS: Record<PlatformOrderStatus, PlatformOrderStatus[]> = {
  submitted: ["awaiting_merchant_confirmation", "cancelled"],
  awaiting_merchant_confirmation: ["awaiting_payment", "cancelled"],
  awaiting_payment: ["paid", "cancelled"],
  paid: ["sourcing_in_italy", "refunded", "cancelled"],
  sourcing_in_italy: ["sourcing_completed", "after_sales", "cancelled"],
  sourcing_completed: ["italy_domestic_shipping", "after_sales"],
  italy_domestic_shipping: ["international_shipping", "after_sales"],
  international_shipping: ["customs_clearance", "after_sales"],
  customs_clearance: ["domestic_delivery", "after_sales"],
  domestic_delivery: ["completed", "after_sales"],
  completed: ["after_sales"],
  after_sales: ["refunded", "completed"],
  refunded: [],
  cancelled: [],
};

function isSelfNegotiatedStatus(status: OrderStatus): status is SelfNegotiatedStatus {
  return status in SELF_NEGOTIATED_TRANSITIONS;
}

function isPlatformOrderStatus(status: OrderStatus): status is PlatformOrderStatus {
  return status in PLATFORM_ORDER_TRANSITIONS;
}

export function canTransitionOrderStatus(
  kind: OrderKind,
  from: OrderStatus,
  to: OrderStatus,
): boolean {
  if (kind === "self_negotiated" && isSelfNegotiatedStatus(from) && isSelfNegotiatedStatus(to)) {
    return SELF_NEGOTIATED_TRANSITIONS[from].includes(to);
  }
  if (kind === "platform" && isPlatformOrderStatus(from) && isPlatformOrderStatus(to)) {
    return PLATFORM_ORDER_TRANSITIONS[from].includes(to);
  }
  return false;
}

export function assertOrderTransition(kind: OrderKind, from: OrderStatus, to: OrderStatus): void {
  if (!canTransitionOrderStatus(kind, from, to)) {
    throw AppError.conflict(`订单状态无法从「${from}」变更为「${to}」`);
  }
}
