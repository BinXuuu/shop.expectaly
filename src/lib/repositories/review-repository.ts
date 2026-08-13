import type { MerchantReview, ProductReview, Result } from "@/types";
import { ok } from "@/types";
import { mockMerchantReviews, mockProductReviews } from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const productReviewRepository = {
  ...createInMemoryRepository<ProductReview>(() => mockProductReviews),

  async findByProduct(productId: string): Promise<Result<ProductReview[]>> {
    return ok(
      mockProductReviews.filter((r) => r.productId === productId && !r.isHidden && !r.deletedAt),
    );
  },

  async findByUser(userId: string): Promise<Result<ProductReview[]>> {
    return ok(mockProductReviews.filter((r) => r.userId === userId && !r.deletedAt));
  },
};

export const merchantReviewRepository = {
  ...createInMemoryRepository<MerchantReview>(() => mockMerchantReviews),

  async findByMerchant(merchantId: string): Promise<Result<MerchantReview[]>> {
    return ok(
      mockMerchantReviews.filter((r) => r.merchantId === merchantId && !r.isHidden && !r.deletedAt),
    );
  },

  async findByUser(userId: string): Promise<Result<MerchantReview[]>> {
    return ok(mockMerchantReviews.filter((r) => r.userId === userId && !r.deletedAt));
  },
};
