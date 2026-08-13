import type { BadgeTone } from "@/components/ui/Badge";
import type { MerchantApplicationStatus } from "@/types";

const STATUS_LABELS: Record<MerchantApplicationStatus, string> = {
  draft: "草稿",
  submitted: "已提交",
  in_review: "审核中",
  needs_more_info: "需补充资料",
  approved: "审核通过",
  rejected: "审核拒绝",
};

const STATUS_TONES: Record<MerchantApplicationStatus, BadgeTone> = {
  draft: "neutral",
  submitted: "accent",
  in_review: "accent",
  needs_more_info: "warning",
  approved: "success",
  rejected: "danger",
};

export function getMerchantApplicationStatusLabel(status: MerchantApplicationStatus): string {
  return STATUS_LABELS[status];
}

export function getMerchantApplicationStatusTone(status: MerchantApplicationStatus): BadgeTone {
  return STATUS_TONES[status];
}
