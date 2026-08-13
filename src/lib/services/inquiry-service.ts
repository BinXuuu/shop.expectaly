import type { InquiryStatus } from "@/types";
import { AppError } from "@/lib/errors/app-error";

/**
 * 询价单状态流转规则：待商家回复 -> 商家已报价 -> 用户已查看 -> 协商中 -> 已达成，
 * 用户或商家可在达成前的任意阶段取消；报价过期由系统判定后置为「已过期」。
 */
const ALLOWED_TRANSITIONS: Record<InquiryStatus, InquiryStatus[]> = {
  pending_merchant_reply: ["quoted", "cancelled", "expired"],
  quoted: ["viewed_by_user", "negotiating", "cancelled", "expired"],
  viewed_by_user: ["negotiating", "agreed", "cancelled", "expired"],
  negotiating: ["quoted", "agreed", "cancelled", "expired"],
  agreed: [],
  cancelled: [],
  expired: [],
};

export function canTransitionInquiryStatus(from: InquiryStatus, to: InquiryStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/**
 * 校验状态迁移是否合法。调用方（商家回复、用户取消等具体业务函数）
 * 应先自行完成对应的权限与归属校验，再调用本函数校验状态机是否允许该迁移。
 */
export function assertInquiryTransition(from: InquiryStatus, to: InquiryStatus): void {
  if (!canTransitionInquiryStatus(from, to)) {
    throw AppError.conflict(`询价单状态无法从「${from}」变更为「${to}」`);
  }
}
