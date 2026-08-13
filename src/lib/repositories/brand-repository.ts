import type { Brand, Result } from "@/types";
import { ok } from "@/types";
import { mockBrands } from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<Brand>(() => mockBrands);

export const brandRepository = {
  ...base,

  async findBySlug(slug: string): Promise<Result<Brand | null>> {
    return ok(mockBrands.find((b) => b.slug === slug && !b.deletedAt) ?? null);
  },

  async findFeatured(): Promise<Result<Brand[]>> {
    return ok(
      mockBrands
        .filter((b) => b.isFeatured && !b.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },
};
