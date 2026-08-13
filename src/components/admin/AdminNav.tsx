"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Role } from "@/types";
import type { PermissionKey } from "@/lib/permissions";
import { can } from "@/lib/permissions";
import { cn } from "@/lib/utils/cn";

interface AdminNavItem {
  label: string;
  href: string;
  /** 至少满足其中一项权限即可看到该导航项；留空表示所有平台后台角色均可见。 */
  anyOf?: PermissionKey[];
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: "仪表盘", href: "/admin" },
  { label: "用户管理", href: "/admin/users", anyOf: ["user:view", "user:manage"] },
  { label: "商家管理", href: "/admin/merchants", anyOf: ["merchant:moderate", "merchant:manage"] },
  {
    label: "商家审核",
    href: "/admin/merchant-applications",
    anyOf: ["merchant_application:view", "merchant_application:manage"],
  },
  { label: "商品管理", href: "/admin/products", anyOf: ["product:publish", "product:manage"] },
  {
    label: "商品审核",
    href: "/admin/product-reviews",
    anyOf: ["product:approve", "product:manage"],
  },
  { label: "分类管理", href: "/admin/categories", anyOf: ["category:manage"] },
  { label: "品牌管理", href: "/admin/brands", anyOf: ["brand:update", "brand:manage"] },
  { label: "订单管理", href: "/admin/orders", anyOf: ["order:view", "order:manage"] },
  { label: "询价管理", href: "/admin/inquiries", anyOf: ["inquiry:view", "inquiry:manage"] },
  {
    label: "代购需求",
    href: "/admin/custom-purchases",
    anyOf: ["custom_purchase:manage"],
  },
  { label: "拼单管理", href: "/admin/group-buys", anyOf: ["group_buy:manage"] },
  { label: "举报处理", href: "/admin/reports", anyOf: ["report:view", "report:manage"] },
  { label: "专题管理", href: "/admin/editorial", anyOf: ["editorial:update", "editorial:manage"] },
  { label: "城市管理", href: "/admin/cities", anyOf: ["city_guide:update", "city_guide:manage"] },
  { label: "内容管理", href: "/admin/content", anyOf: ["content:update", "content:manage"] },
  { label: "法律文本", href: "/admin/legal", anyOf: ["legal_document:manage"] },
  { label: "汇率设置", href: "/admin/exchange-rates", anyOf: ["exchange_rate:manage"] },
  { label: "系统设置", href: "/admin/settings", anyOf: ["system_setting:manage"] },
  { label: "角色权限", href: "/admin/roles", anyOf: ["role:manage"] },
  { label: "审计日志", href: "/admin/audit-logs", anyOf: ["audit_log:view"] },
];

export interface AdminNavProps {
  roles: Role[];
}

export function AdminNav({ roles }: AdminNavProps) {
  const pathname = usePathname();
  const visibleItems = ADMIN_NAV_ITEMS.filter(
    (item) => !item.anyOf || item.anyOf.some((permission) => can(roles, permission)),
  );

  return (
    <nav aria-label="平台后台导航" className="flex flex-col gap-1">
      {visibleItems.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === item.href : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-ring rounded-xs px-3 py-2 text-sm",
              isActive
                ? "bg-brand-50 text-brand-700 font-medium"
                : "text-ink-muted hover:bg-surface-muted",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
