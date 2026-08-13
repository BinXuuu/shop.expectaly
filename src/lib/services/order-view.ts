import type { BadgeTone } from "@/components/ui/Badge";
import type { OrderStatus } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  contacted_merchant: "已联系商家",
  negotiating: "协商中",
  agreed_with_merchant: "已与商家达成协议",
  cancelled: "已取消",
  user_marked_completed: "用户已标记完成",
  submitted: "已提交",
  awaiting_merchant_confirmation: "等待商家确认",
  awaiting_payment: "等待用户付款",
  paid: "已付款",
  sourcing_in_italy: "意大利采购中",
  sourcing_completed: "已完成采购",
  italy_domestic_shipping: "意大利境内运输",
  international_shipping: "国际运输中",
  customs_clearance: "清关中",
  domestic_delivery: "国内配送中",
  completed: "已完成",
  after_sales: "售后中",
  refunded: "已退款",
};

const STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  contacted_merchant: "neutral",
  negotiating: "accent",
  agreed_with_merchant: "accent",
  cancelled: "muted",
  user_marked_completed: "success",
  submitted: "neutral",
  awaiting_merchant_confirmation: "neutral",
  awaiting_payment: "warning",
  paid: "accent",
  sourcing_in_italy: "accent",
  sourcing_completed: "accent",
  italy_domestic_shipping: "accent",
  international_shipping: "accent",
  customs_clearance: "accent",
  domestic_delivery: "accent",
  completed: "success",
  after_sales: "warning",
  refunded: "muted",
};

export function getOrderStatusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status];
}

export function getOrderStatusTone(status: OrderStatus): BadgeTone {
  return STATUS_TONES[status];
}
