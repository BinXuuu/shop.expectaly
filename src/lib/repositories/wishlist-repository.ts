import type { Result, Wishlist, WishlistItem } from "@/types";
import { ok } from "@/types";
import { mockWishlistItems, mockWishlists } from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<Wishlist>(() => mockWishlists);

export const wishlistRepository = {
  ...base,

  async findByUser(userId: string): Promise<Result<Wishlist | null>> {
    return ok(mockWishlists.find((w) => w.userId === userId && !w.deletedAt) ?? null);
  },

  async getItems(wishlistId: string): Promise<Result<WishlistItem[]>> {
    return ok(mockWishlistItems.filter((i) => i.wishlistId === wishlistId && !i.deletedAt));
  },
};
