import type { Category, Result } from "@/types";
import { ok } from "@/types";
import { mockCategories } from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<Category>(() => mockCategories);

export const categoryRepository = {
  ...base,

  async findBySlug(slug: string): Promise<Result<Category | null>> {
    return ok(mockCategories.find((c) => c.slug === slug && !c.deletedAt) ?? null);
  },

  async findVisible(): Promise<Result<Category[]>> {
    return ok(
      mockCategories
        .filter((c) => c.isVisible && !c.deletedAt)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },

  async findChildren(parentId: string): Promise<Result<Category[]>> {
    return ok(mockCategories.filter((c) => c.parentId === parentId && !c.deletedAt));
  },
};
