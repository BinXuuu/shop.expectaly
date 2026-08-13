import type { BaseEntity, ID } from "./common";

/** 对应数据库实体 carts：每个用户一个购物车 */
export interface Cart extends BaseEntity {
  userId: ID;
}

/**
 * 对应数据库实体 cart_items。
 * 按商家分组、区分交易方式等展示逻辑在 lib/services/cart-service.ts 中基于关联的 Product 计算，
 * 不在数据层冗余存储，避免与商品状态不一致。
 */
export interface CartItem extends BaseEntity {
  cartId: ID;
  productId: ID;
  variantId: ID | null;
  quantity: number;
  priceSnapshotId: ID | null;
  note: string | null;
}

/** 对应数据库实体 wishlists：一个用户一个默认意向清单 */
export interface Wishlist extends BaseEntity {
  userId: ID;
}

/** 对应数据库实体 wishlist_items */
export interface WishlistItem extends BaseEntity {
  wishlistId: ID;
  productId: ID;
  note: string | null;
}
