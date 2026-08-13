import type { Role } from "@/types";

/**
 * 权限资源。覆盖用户端、商家后台、平台后台涉及的主要数据资源。
 */
export type PermissionResource =
  | "product"
  | "merchant"
  | "merchant_application"
  | "brand"
  | "category"
  | "order"
  | "inquiry"
  | "custom_purchase"
  | "group_buy"
  | "preorder"
  | "review"
  | "report"
  | "content"
  | "editorial"
  | "city_guide"
  | "faq"
  | "legal_document"
  | "exchange_rate"
  | "cart"
  | "wishlist"
  | "address"
  | "notification"
  | "user"
  | "role"
  | "system_setting"
  | "audit_log";

export type PermissionAction =
  | "view" // 查看所有
  | "view_own" // 仅查看归属于自己（或自己商家）的数据
  | "create"
  | "update"
  | "update_own"
  | "delete"
  | "publish"
  | "approve"
  | "reject"
  | "respond"
  | "moderate"
  | "manage"; // 完整管理权限（含增删改查）

export type PermissionKey = `${PermissionResource}:${PermissionAction}`;

/** 已认证用户共有的基础权限（购物、收藏、地址、询价、代购需求、评价、举报等自有数据） */
const AUTHENTICATED_BASE: PermissionKey[] = [
  "cart:manage",
  "wishlist:manage",
  "address:manage",
  "inquiry:create",
  "inquiry:view_own",
  "custom_purchase:create",
  "custom_purchase:view_own",
  "order:create",
  "order:view_own",
  "review:create",
  "review:view_own",
  "report:create",
  "merchant_application:create",
  "notification:view_own",
];

const PUBLIC_READ: PermissionKey[] = [
  "product:view",
  "brand:view",
  "category:view",
  "merchant:view",
  "content:view",
  "editorial:view",
  "city_guide:view",
  "faq:view",
  "legal_document:view",
];

const MERCHANT_OPERATIONS: PermissionKey[] = [
  "product:create",
  "product:view_own",
  "product:update_own",
  "merchant:update_own",
  "merchant:view_own",
  "merchant_application:view_own",
  "merchant_application:update_own",
  "inquiry:view",
  "inquiry:respond",
  "order:view",
  "order:update",
  "group_buy:manage",
  "preorder:manage",
  "review:respond",
  "content:create",
  "content:update_own",
];

const CONTENT_MANAGEMENT: PermissionKey[] = [
  "content:create",
  "content:update",
  "content:publish",
  "editorial:create",
  "editorial:update",
  "editorial:publish",
  "city_guide:create",
  "city_guide:update",
  "city_guide:publish",
  "faq:create",
  "faq:update",
  "faq:publish",
  "brand:update",
];

const CUSTOMER_SERVICE_OPS: PermissionKey[] = [
  "inquiry:view",
  "inquiry:respond",
  "order:view",
  "report:view",
  "report:moderate",
  "notification:manage",
  "user:view",
];

const PRODUCT_REVIEW_OPS: PermissionKey[] = [
  "product:view",
  "product:approve",
  "product:reject",
  "product:moderate",
];

const MERCHANT_REVIEW_OPS: PermissionKey[] = [
  "merchant_application:view",
  "merchant_application:approve",
  "merchant_application:reject",
  "merchant:moderate",
];

const ADMIN_MANAGEMENT: PermissionKey[] = [
  "product:manage",
  "merchant:manage",
  "merchant_application:manage",
  "order:manage",
  "inquiry:manage",
  "custom_purchase:manage",
  "group_buy:manage",
  "preorder:manage",
  "review:manage",
  "report:manage",
  "content:manage",
  "editorial:manage",
  "city_guide:manage",
  "faq:manage",
  "legal_document:manage",
  "category:manage",
  "brand:manage",
  "exchange_rate:manage",
  "user:manage",
  "notification:manage",
  "system_setting:manage",
  "audit_log:view",
];

/**
 * 角色 -> 权限集合。super_admin 不在此列出，can() 对其永远放行。
 */
export const ROLE_PERMISSIONS: Record<Exclude<Role, "super_admin">, PermissionKey[]> = {
  guest: [...PUBLIC_READ],
  user: [...PUBLIC_READ, ...AUTHENTICATED_BASE],
  merchant_applicant: [...PUBLIC_READ, ...AUTHENTICATED_BASE],
  merchant: [...PUBLIC_READ, ...AUTHENTICATED_BASE, ...MERCHANT_OPERATIONS],
  platform_operator: [
    ...PUBLIC_READ,
    ...AUTHENTICATED_BASE,
    ...MERCHANT_OPERATIONS,
    "product:publish",
  ],
  content_editor: [...PUBLIC_READ, ...AUTHENTICATED_BASE, ...CONTENT_MANAGEMENT],
  customer_service: [...PUBLIC_READ, ...AUTHENTICATED_BASE, ...CUSTOMER_SERVICE_OPS],
  product_reviewer: [...PUBLIC_READ, ...AUTHENTICATED_BASE, ...PRODUCT_REVIEW_OPS],
  merchant_reviewer: [...PUBLIC_READ, ...AUTHENTICATED_BASE, ...MERCHANT_REVIEW_OPS],
  admin: [
    ...PUBLIC_READ,
    ...AUTHENTICATED_BASE,
    ...MERCHANT_OPERATIONS,
    ...CONTENT_MANAGEMENT,
    ...CUSTOMER_SERVICE_OPS,
    ...PRODUCT_REVIEW_OPS,
    ...MERCHANT_REVIEW_OPS,
    ...ADMIN_MANAGEMENT,
  ],
};

/** super_admin 额外独占的权限（角色与权限管理、系统级设置） */
export const SUPER_ADMIN_ONLY: PermissionKey[] = ["role:manage", "system_setting:manage"];
