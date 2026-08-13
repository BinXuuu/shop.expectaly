import type { BaseEntity, ID } from "./common";

/** 第一期实现站内通知与开发环境邮件占位，短信/微信模板消息接口预留 */
export type NotificationChannel = "in_site" | "email" | "sms" | "wechat_template";

export type NotificationScene =
  | "merchant_application_review"
  | "product_review"
  | "inquiry_reply"
  | "quote_expiring"
  | "purchase_progress_update"
  | "product_arrival"
  | "price_drop"
  | "group_buy_succeeded"
  | "preorder_confirmed"
  | "after_sales_update"
  | "report_handled"
  | "system_announcement";

export type NotificationDeliveryStatus = "pending" | "sent" | "failed";

/** 对应数据库实体 notifications */
export interface Notification extends BaseEntity {
  userId: ID;
  channel: NotificationChannel;
  scene: NotificationScene;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
  readAt: string | null;
  deliveryStatus: NotificationDeliveryStatus;
  sentAt: string | null;
}
