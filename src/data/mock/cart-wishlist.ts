/**
 * 演示数据：购物车与意向清单。
 */
import type { Cart, CartItem, Wishlist, WishlistItem } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

export const mockCarts: Cart[] = [
  {
    id: "cart-zhangming",
    userId: "profile-user-zhangming",
    createdAt: "2026-07-15T10:00:00+02:00",
    updatedAt: "2026-07-19T10:00:00+02:00",
    ...base,
  },
];

export const mockCartItems: CartItem[] = [
  {
    id: "cart-item-1",
    cartId: "cart-zhangming",
    productId: "product-desk-collectible-sculpture",
    variantId: "variant-desk-sculpture-standard",
    quantity: 1,
    priceSnapshotId: null,
    note: null,
    createdAt: "2026-07-15T10:00:00+02:00",
    updatedAt: "2026-07-15T10:00:00+02:00",
    ...base,
  },
  {
    id: "cart-item-2",
    cartId: "cart-zhangming",
    productId: "product-inter-milan-scarf-group-buy",
    variantId: null,
    quantity: 2,
    priceSnapshotId: null,
    note: "等拼单成团",
    createdAt: "2026-07-19T10:00:00+02:00",
    updatedAt: "2026-07-19T10:00:00+02:00",
    ...base,
  },
];

export const mockWishlists: Wishlist[] = [
  {
    id: "wishlist-zhangming",
    userId: "profile-user-zhangming",
    createdAt: "2026-06-01T10:00:00+02:00",
    updatedAt: "2026-07-10T10:00:00+02:00",
    ...base,
  },
];

export const mockWishlistItems: WishlistItem[] = [
  {
    id: "wishlist-item-1",
    wishlistId: "wishlist-zhangming",
    productId: "product-humilis-silver-brooch",
    note: null,
    createdAt: "2026-06-05T10:00:00+02:00",
    updatedAt: "2026-06-05T10:00:00+02:00",
    ...base,
  },
  {
    id: "wishlist-item-2",
    wishlistId: "wishlist-zhangming",
    productId: "product-torino-vintage-racing-poster",
    note: "等书房布置好再下单",
    createdAt: "2026-07-10T10:00:00+02:00",
    updatedAt: "2026-07-10T10:00:00+02:00",
    ...base,
  },
];
