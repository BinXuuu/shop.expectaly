/**
 * 平台角色定义。权限矩阵实现见 lib/permissions/matrix.ts。
 * 详见 docs/ROLES_AND_PERMISSIONS.md。
 */
import type { BaseEntity, ID } from "./common";

export type Role =
  | "guest" // 游客
  | "user" // 普通用户
  | "merchant_applicant" // 入驻申请中的用户
  | "merchant" // 已认证商家
  | "platform_operator" // 平台自营运营人员
  | "content_editor" // 内容编辑
  | "customer_service" // 客服
  | "product_reviewer" // 商品审核员
  | "merchant_reviewer" // 商家审核员
  | "admin" // 管理员
  | "super_admin"; // 超级管理员

export const ALL_ROLES: readonly Role[] = [
  "guest",
  "user",
  "merchant_applicant",
  "merchant",
  "platform_operator",
  "content_editor",
  "customer_service",
  "product_reviewer",
  "merchant_reviewer",
  "admin",
  "super_admin",
];

export const ROLE_LABELS: Record<Role, string> = {
  guest: "游客",
  user: "普通用户",
  merchant_applicant: "入驻申请中的用户",
  merchant: "已认证商家",
  platform_operator: "平台自营运营人员",
  content_editor: "内容编辑",
  customer_service: "客服",
  product_reviewer: "商品审核员",
  merchant_reviewer: "商家审核员",
  admin: "管理员",
  super_admin: "超级管理员",
};

/**
 * 对应数据库实体 user_roles：一个账号（profile）可以同时拥有多个角色，
 * 例如「商家 + 普通用户」。
 */
export interface UserRoleAssignment extends BaseEntity {
  userId: ID;
  role: Role;
  grantedAt: string;
  grantedBy: ID | null;
}
