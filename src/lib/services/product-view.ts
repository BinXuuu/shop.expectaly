import type { BadgeTone } from "@/components/ui/Badge";
import type { Product, ProductStatus, ProductTagKey } from "@/types";
import { productRepository } from "@/lib/repositories";

export interface ProductWithTags {
  product: Product;
  tags: ProductTagKey[];
}

const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "草稿",
  pending_review: "待审核",
  changes_requested: "需修改",
  published: "已发布",
  rejected: "审核拒绝",
  off_shelf: "已下架",
};

const PRODUCT_STATUS_TONES: Record<ProductStatus, BadgeTone> = {
  draft: "neutral",
  pending_review: "warning",
  changes_requested: "warning",
  published: "success",
  rejected: "danger",
  off_shelf: "muted",
};

export function getProductStatusLabel(status: ProductStatus): string {
  return PRODUCT_STATUS_LABELS[status];
}

export function getProductStatusTone(status: ProductStatus): BadgeTone {
  return PRODUCT_STATUS_TONES[status];
}

/** 批量为商品列表附加交易标签，供首页 / 商品详情「相似商品」等展示场景复用。 */
export async function attachProductTags(products: Product[]): Promise<ProductWithTags[]> {
  return Promise.all(
    products.map(async (product) => {
      const tagsResult = await productRepository.getTagKeys(product.id);
      return { product, tags: tagsResult.ok ? tagsResult.data : [] };
    }),
  );
}
