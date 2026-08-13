"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";

const ACCOUNT_NAV_ITEMS = [
  { label: "概览", href: "/account" },
  { label: "我的订单", href: "/account/orders" },
  { label: "询价记录", href: "/account/inquiries" },
  { label: "代购申请", href: "/account/custom-purchases" },
  { label: "我的收藏", href: "/account/wishlist" },
  { label: "浏览历史", href: "/account/history" },
  { label: "消息通知", href: "/account/notifications" },
  { label: "地址管理", href: "/account/addresses" },
  { label: "我的评价", href: "/account/reviews" },
  { label: "账号设置", href: "/account/settings" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="用户中心导航" className="flex flex-col gap-1">
      {ACCOUNT_NAV_ITEMS.map((item) => {
        const isActive =
          item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href);
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
