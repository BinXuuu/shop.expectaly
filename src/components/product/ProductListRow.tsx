import Link from "next/link";
import type { Product, ProductTagKey } from "@/types";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import { Price } from "./Price";
import { ProductTagBadge } from "./ProductTagBadge";

export interface ProductListRowProps {
  product: Product;
  brandName?: string;
  tags?: ProductTagKey[];
}

/** 商品列表视图行：与 ProductCard 共用同一批数据，适合信息密度更高的浏览方式。 */
export function ProductListRow({ product, brandName, tags = [] }: ProductListRowProps) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="focus-ring border-line hover:border-brand-200 flex gap-4 rounded-xs border p-3"
    >
      <PlaceholderImage
        label={product.name["zh-CN"]}
        aspect="square"
        className="h-24 w-24 shrink-0 rounded-xs"
      />
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        {brandName && <span className="text-ink-muted text-xs">{brandName}</span>}
        <h3 className="text-ink line-clamp-1 text-sm font-medium">{product.name["zh-CN"]}</h3>
        <div className="flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <ProductTagBadge key={tag} tagKey={tag} />
          ))}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end justify-center">
        <Price pricing={product.pricing} showDisclaimer={false} className="items-end text-right" />
      </div>
    </Link>
  );
}
