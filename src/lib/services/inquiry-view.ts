import type { BadgeTone } from "@/components/ui/Badge";
import type { InquiryStatus } from "@/types";

const STATUS_LABELS: Record<InquiryStatus, string> = {
  pending_merchant_reply: "待商家回复",
  quoted: "商家已报价",
  viewed_by_user: "已查看",
  negotiating: "协商中",
  agreed: "已达成",
  cancelled: "已取消",
  expired: "已过期",
};

const STATUS_TONES: Record<InquiryStatus, BadgeTone> = {
  pending_merchant_reply: "neutral",
  quoted: "accent",
  viewed_by_user: "accent",
  negotiating: "accent",
  agreed: "success",
  cancelled: "muted",
  expired: "muted",
};

export function getInquiryStatusLabel(status: InquiryStatus): string {
  return STATUS_LABELS[status];
}

export function getInquiryStatusTone(status: InquiryStatus): BadgeTone {
  return STATUS_TONES[status];
}
