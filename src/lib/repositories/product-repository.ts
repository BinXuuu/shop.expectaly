import type {
  Inventory,
  Product,
  ProductMedia,
  ProductTagKey,
  ProductTagRelation,
  ProductVariant,
  Result,
} from "@/types";
import { ok } from "@/types";
import {
  mockInventories,
  mockProductMedia,
  mockProducts,
  mockProductTagRelations,
  mockProductVariants,
} from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<Product>(() => mockProducts);

export const productRepository = {
  ...base,

  async findBySlug(slug: string): Promise<Result<Product | null>> {
    const found = mockProducts.find((p) => p.slug === slug && !p.deletedAt) ?? null;
    return ok(found);
  },

  async findPublished(): Promise<Result<Product[]>> {
    return ok(mockProducts.filter((p) => p.status === "published" && !p.deletedAt));
  },

  async findByCategory(categoryId: string): Promise<Result<Product[]>> {
    return ok(mockProducts.filter((p) => p.categoryId === categoryId && p.status === "published"));
  },

  async findByBrand(brandId: string): Promise<Result<Product[]>> {
    return ok(mockProducts.filter((p) => p.brandId === brandId && p.status === "published"));
  },

  async findByMerchant(merchantId: string): Promise<Result<Product[]>> {
    return ok(mockProducts.filter((p) => p.merchantId === merchantId));
  },

  async findByTag(tagKey: ProductTagKey): Promise<Result<Product[]>> {
    const productIds = new Set(
      mockProductTagRelations.filter((r) => r.tagKey === tagKey).map((r) => r.productId),
    );
    return ok(mockProducts.filter((p) => productIds.has(p.id) && p.status === "published"));
  },

  async findFeatured(): Promise<Result<Product[]>> {
    return ok(mockProducts.filter((p) => p.isFeatured && p.status === "published"));
  },

  async findPendingReview(): Promise<Result<Product[]>> {
    return ok(
      mockProducts.filter((p) => p.status === "pending_review" || p.status === "changes_requested"),
    );
  },

  async getMedia(productId: string): Promise<Result<ProductMedia[]>> {
    return ok(
      mockProductMedia
        .filter((m) => m.productId === productId && !m.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },

  async getVariants(productId: string): Promise<Result<ProductVariant[]>> {
    return ok(mockProductVariants.filter((v) => v.productId === productId && !v.deletedAt));
  },

  async getInventory(productId: string): Promise<Result<Inventory[]>> {
    return ok(mockInventories.filter((i) => i.productId === productId && !i.deletedAt));
  },

  async getTagRelations(productId: string): Promise<Result<ProductTagRelation[]>> {
    return ok(mockProductTagRelations.filter((r) => r.productId === productId));
  },

  /** 便捷方法：直接返回商品的交易标签键数组，供卡片类组件渲染使用。 */
  async getTagKeys(productId: string): Promise<Result<ProductTagKey[]>> {
    return ok(
      mockProductTagRelations.filter((r) => r.productId === productId).map((r) => r.tagKey),
    );
  },
};
