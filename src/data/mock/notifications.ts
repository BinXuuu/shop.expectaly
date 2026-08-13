/**
 * 演示数据：站内通知。
 */
import type { Notification } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  channel: "in_site",
  deliveryStatus: "sent",
} as const;

export const mockNotifications: Notification[] = [
  {
    id: "notification-1",
    userId: "profile-user-zhangming",
    scene: "purchase_progress_update",
    title: "订单进度更新",
    body: "您的订单 PF20260701001 已进入「国际运输」阶段。",
    linkUrl: "/account/orders",
    isRead: false,
    readAt: null,
    sentAt: "2026-07-18T10:05:00+02:00",
    createdAt: "2026-07-18T10:05:00+02:00",
    updatedAt: "2026-07-18T10:05:00+02:00",
    ...base,
  },
  {
    id: "notification-2",
    userId: "profile-user-chenxi",
    scene: "inquiry_reply",
    title: "商家已回复您的询价",
    body: "Firenze Piccoli 商家已针对您的询价给出报价，请查看详情。",
    linkUrl: "/account/inquiries",
    isRead: true,
    readAt: "2026-07-11T12:00:00+02:00",
    sentAt: "2026-07-11T10:05:00+02:00",
    createdAt: "2026-07-11T10:05:00+02:00",
    updatedAt: "2026-07-11T12:00:00+02:00",
    ...base,
  },
  {
    id: "notification-3",
    userId: "profile-user-chenxi",
    scene: "merchant_application_review",
    title: "商家入驻申请需要补充资料",
    body: "您的入驻申请需要补充采购能力证明与售后规则说明。",
    linkUrl: "/account/merchant-application",
    isRead: false,
    readAt: null,
    sentAt: "2026-07-15T09:05:00+02:00",
    createdAt: "2026-07-15T09:05:00+02:00",
    updatedAt: "2026-07-15T09:05:00+02:00",
    ...base,
  },
];
