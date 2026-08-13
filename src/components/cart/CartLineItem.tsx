"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, X } from "lucide-react";
import type { ProductPricing } from "@/types";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { Price } from "@/components/product/Price";

export interface CartLineItemProps {
  slug: string;
  name: string;
  variantLabel?: string;
  pricing: ProductPricing;
  initialQuantity: number;
}

/**
 * 购物车单行商品：数量调整、移入收藏、删除均为界面交互演示（本地状态），
 * 尚未接入 cart_items 表的真实写入。
 */
export function CartLineItem({
  slug,
  name,
  variantLabel,
  pricing,
  initialQuantity,
}: CartLineItemProps) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [removed, setRemoved] = useState(false);
  const [savedForLater, setSavedForLater] = useState(false);

  if (removed) {
    return (
      <div className="border-line text-ink-faint flex items-center justify-between rounded-xs border border-dashed p-3 text-sm">
        <span>{name} 已从购物车移除（演示交互）</span>
        <button
          type="button"
          onClick={() => setRemoved(false)}
          className="focus-ring text-brand-700 underline"
        >
          撤销
        </button>
      </div>
    );
  }

  return (
    <div className="border-line flex gap-3 border-b py-4 last:border-b-0">
      <PlaceholderImage label={name} aspect="square" className="h-20 w-20 shrink-0 rounded-xs" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={`/products/${slug}`}
          className="text-ink hover:text-brand-700 text-sm font-medium"
        >
          {name}
        </Link>
        {variantLabel && <span className="text-ink-muted text-xs">规格：{variantLabel}</span>}
        <div className="mt-1 flex items-center gap-2">
          <button
            type="button"
            aria-label="减少数量"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="focus-ring border-line-strong text-ink-muted hover:text-ink flex h-7 w-7 items-center justify-center rounded-xs border"
          >
            <Minus aria-hidden="true" className="h-3 w-3" />
          </button>
          <span className="text-ink w-6 text-center text-sm">{quantity}</span>
          <button
            type="button"
            aria-label="增加数量"
            onClick={() => setQuantity((q) => q + 1)}
            className="focus-ring border-line-strong text-ink-muted hover:text-ink flex h-7 w-7 items-center justify-center rounded-xs border"
          >
            <Plus aria-hidden="true" className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={() => setSavedForLater((v) => !v)}
            className="focus-ring text-ink-muted hover:text-ink ml-2 flex items-center gap-1 text-xs"
          >
            <Heart
              aria-hidden="true"
              className={savedForLater ? "text-danger-900 h-3.5 w-3.5 fill-current" : "h-3.5 w-3.5"}
            />
            {savedForLater ? "已移入收藏" : "移入收藏"}
          </button>
          <button
            type="button"
            onClick={() => setRemoved(true)}
            aria-label="删除"
            className="focus-ring text-ink-faint hover:text-danger-900 ml-1"
          >
            <X aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <Price pricing={pricing} showDisclaimer={false} className="shrink-0 items-end text-right" />
    </div>
  );
}
