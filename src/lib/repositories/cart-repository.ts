import type { Cart, CartItem, Result } from "@/types";
import { ok } from "@/types";
import { mockCartItems, mockCarts } from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<Cart>(() => mockCarts);

export const cartRepository = {
  ...base,

  async findByUser(userId: string): Promise<Result<Cart | null>> {
    return ok(mockCarts.find((c) => c.userId === userId && !c.deletedAt) ?? null);
  },

  async getItems(cartId: string): Promise<Result<CartItem[]>> {
    return ok(mockCartItems.filter((i) => i.cartId === cartId && !i.deletedAt));
  },
};
