import Link from "next/link";
import type { Brand } from "@/types";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { cn } from "@/lib/utils/cn";

export interface BrandCardProps {
  brand: Brand;
  className?: string;
}

/** 品牌卡片：突出品牌名称、所在城市与一句话故事，弱化商品堆叠感。 */
export function BrandCard({ brand, className }: BrandCardProps) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className={cn("focus-ring group flex flex-col rounded-xs", className)}
    >
      <div className="border-line overflow-hidden rounded-xs border">
        <PlaceholderImage label={brand.name["zh-CN"]} aspect="landscape" />
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <h2 className="text-ink group-hover:text-brand-700 font-serif text-base font-semibold">
          {brand.name["zh-CN"]}
        </h2>
        {brand.city && <span className="text-ink-muted text-xs">{brand.city}</span>}
        {brand.story && (
          <p className="text-ink-muted mt-1 line-clamp-2 text-sm leading-6">
            {brand.story["zh-CN"]}
          </p>
        )}
      </div>
    </Link>
  );
}
