"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const MERCHANT_NAV_ITEMS = [
  { label: "数据概览", href: "/merchant" },
  { label: "商品管理", href: "/merchant/products" },
  { label: "询价管理", href: "/merchant/inquiries" },
  { label: "订单管理", href: "/merchant/orders" },
  { label: "拼单管理", href: "/merchant/group-buys" },
  { label: "预订管理", href: "/merchant/preorders" },
  { label: "店铺资料", href: "/merchant/store" },
  { label: "认证资料", href: "/merchant/verification" },
  { label: "内容管理", href: "/merchant/content" },
  { label: "评价管理", href: "/merchant/reviews" },
  { label: "数据统计", href: "/merchant/analytics" },
  { label: "账号安全", href: "/merchant/settings" },
];

export function MerchantNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="商家后台导航" className="flex flex-col gap-1">
      {MERCHANT_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/merchant" ? pathname === item.href : pathname.startsWith(item.href);
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
