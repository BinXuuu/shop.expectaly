import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product, ProductTagKey } from "@/types";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { cn } from "@/lib/utils/cn";
import { Price } from "./Price";
import { ProductTagBadge } from "./ProductTagBadge";

export interface ProductCardProps {
  product: Product;
  brandName?: string;
  tags?: ProductTagKey[];
  className?: string;
}

/**
 * 商品卡片：统一网格展示单位。直角/极小圆角、无阴影，图片比例统一为正方形，
 * 交易标签与分类分开展示，售罄商品降低图片透明度提示不可购买。
 */
export function ProductCard({ product, brandName, tags = [], className }: ProductCardProps) {
  const isSoldOut = tags.includes("sold_out");
  const visibleTags = tags.slice(0, 2);

  return (
    <article className={cn("group flex flex-col", className)}>
      <Link href={`/products/${product.slug}`} className="focus-ring block rounded-xs">
        <div className="border-line relative overflow-hidden rounded-xs border">
          <PlaceholderImage
            label={product.name["zh-CN"]}
            aspect="square"
            className={cn("transition-opacity", isSoldOut && "opacity-50")}
          />
          <button
            type="button"
            aria-label="加入收藏"
            className="focus-ring bg-surface/90 text-ink-muted hover:text-danger-900 absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full"
          >
            <Heart aria-hidden="true" className="h-4 w-4" />
          </button>
          {visibleTags.length > 0 && (
            <div className="absolute bottom-2 left-2 flex flex-wrap gap-1">
              {visibleTags.map((tag) => (
                <ProductTagBadge key={tag} tagKey={tag} />
              ))}
            </div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex flex-col gap-1">
        {brandName && <span className="text-ink-muted text-xs">{brandName}</span>}
        <Link href={`/products/${product.slug}`} className="focus-ring rounded-xs">
          <h2 className="text-ink hover:text-brand-700 line-clamp-2 text-sm font-medium">
            {product.name["zh-CN"]}
          </h2>
        </Link>
        <Price pricing={product.pricing} showDisclaimer={false} className="mt-1" />
        {product.sourceCity && <span className="text-ink-faint text-xs">{product.sourceCity}</span>}
      </div>
    </article>
  );
}
