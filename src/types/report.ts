import type { BaseEntity, ID } from "./common";

export type ReportedEntityType = "product" | "merchant" | "review" | "content";

export type ReportCategory =
  | "infringement" // 侵权内容
  | "false_information" // 虚假信息
  | "restricted_product" // 违规商品
  | "suspicious_transaction" // 可疑交易
  | "minor_risk" // 未成年人相关风险
  | "other";

export type ReportStatus =
  | "pending" // 待处理
  | "investigating" // 调查中
  | "resolved" // 已处理
  | "dismissed" // 已驳回
  | "removed" // 已下架
  | "banned"; // 已封禁

/** 对应数据库实体 reports */
export interface Report extends BaseEntity {
  reportedType: ReportedEntityType;
  reportedId: ID;
  reporterId: ID;
  category: ReportCategory;
  description: string;
  status: ReportStatus;
  handledBy: ID | null;
  handledAt: string | null;
  resolutionNote: string | null;
}
