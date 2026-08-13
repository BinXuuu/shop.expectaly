"use client";

import Link from "next/link";
import { Heart, ShoppingBag, User } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { PRIMARY_NAV_LINKS, SECONDARY_NAV_LINKS } from "./nav-links";

export interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  return (
    <Drawer open={open} onClose={onClose} title="菜单" side="left">
      <nav aria-label="移动端主导航" className="flex flex-col gap-1">
        {PRIMARY_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="focus-ring text-ink hover:bg-surface-muted rounded-xs px-2 py-2.5 text-sm font-medium"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="border-line my-4 border-t" />

      <nav aria-label="账户与订单" className="flex flex-col gap-1">
        <Link
          href="/account"
          onClick={onClose}
          className="focus-ring text-ink hover:bg-surface-muted flex items-center gap-2 rounded-xs px-2 py-2.5 text-sm"
        >
          <User aria-hidden="true" className="h-4 w-4" /> 用户中心
        </Link>
        <Link
          href="/cart"
          onClick={onClose}
          className="focus-ring text-ink hover:bg-surface-muted flex items-center gap-2 rounded-xs px-2 py-2.5 text-sm"
        >
          <ShoppingBag aria-hidden="true" className="h-4 w-4" /> 购物车
        </Link>
        <Link
          href="/account/wishlist"
          onClick={onClose}
          className="focus-ring text-ink hover:bg-surface-muted flex items-center gap-2 rounded-xs px-2 py-2.5 text-sm"
        >
          <Heart aria-hidden="true" className="h-4 w-4" /> 我的收藏
        </Link>
      </nav>

      <div className="border-line my-4 border-t" />

      <nav aria-label="平台说明" className="flex flex-col gap-1">
        {SECONDARY_NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="focus-ring text-ink-muted hover:bg-surface-muted hover:text-ink rounded-xs px-2 py-2 text-sm"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="mt-6 flex items-center justify-between">
        <LanguageSwitcher />
        <a
          href="https://expectaly.com"
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring text-ink-muted hover:text-ink rounded-xs text-xs underline underline-offset-2"
        >
          前往主站 expectaly.com
        </a>
      </div>
    </Drawer>
  );
}
