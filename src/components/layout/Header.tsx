"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Search, ShoppingBag, User } from "lucide-react";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileMenu } from "./MobileMenu";
import { PRIMARY_NAV_LINKS } from "./nav-links";

/**
 * 极简顶部导航：Logo + 主导航 + 搜索/收藏/购物车/用户中心入口 + 语言切换。
 * 移动端收起为汉堡菜单触发抽屉；桌面端主导航常驻展示。
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-line bg-surface/95 sticky top-0 z-40 border-b backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-(--container-page) items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          aria-label="打开菜单"
          className="focus-ring border-line text-ink inline-flex h-10 w-10 items-center justify-center rounded-sm border lg:hidden"
        >
          <Menu aria-hidden="true" className="h-5 w-5" />
        </button>

        <Logo />

        <nav aria-label="主导航" className="hidden items-center gap-1 lg:flex">
          {PRIMARY_NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="focus-ring text-ink-muted hover:text-ink rounded-xs px-3 py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <Link
            href="/search"
            aria-label="搜索"
            className="focus-ring text-ink-muted hover:bg-surface-muted hover:text-ink hidden h-10 w-10 items-center justify-center rounded-sm sm:inline-flex"
          >
            <Search aria-hidden="true" className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/account"
            aria-label="用户中心"
            className="focus-ring text-ink-muted hover:bg-surface-muted hover:text-ink hidden h-10 w-10 items-center justify-center rounded-sm sm:inline-flex"
          >
            <User aria-hidden="true" className="h-4.5 w-4.5" />
          </Link>
          <Link
            href="/cart"
            aria-label="购物车"
            className="focus-ring text-ink-muted hover:bg-surface-muted hover:text-ink inline-flex h-10 w-10 items-center justify-center rounded-sm"
          >
            <ShoppingBag aria-hidden="true" className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
