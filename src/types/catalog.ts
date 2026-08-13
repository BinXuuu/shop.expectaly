import type { BaseEntity, ID, LocalizedText } from "./common";

export type BrandRelationship = "unofficial_selection" | "authorized_partner" | "platform_owned";

/** 对应数据库实体 brands */
export interface Brand extends BaseEntity {
  slug: string;
  name: LocalizedText;
  logoUrl: string | null;
  heroImageUrl: string | null;
  story: LocalizedText | null;
  city: string | null;
  foundedYear: number | null;
  categoryTags: string[];
  relationship: BrandRelationship;
  isFeatured: boolean;
  sortOrder: number;
}

/** 对应数据库实体 categories，支持管理员新增、排序、隐藏、编辑 */
export interface Category extends BaseEntity {
  slug: string;
  name: LocalizedText;
  description: LocalizedText | null;
  iconUrl: string | null;
  parentId: ID | null;
  sortOrder: number;
  isVisible: boolean;
}

/** 交易方式标签与商品分类分开设计 */
export type ProductTagKey =
  | "italy_in_stock"
  | "domestic_in_stock"
  | "preorder"
  | "daigou"
  | "group_buy"
  | "inquiry_only"
  | "limited"
  | "exclusive"
  | "arriving_soon"
  | "sold_out";

/** 对应数据库实体 product_tags */
export interface ProductTag extends BaseEntity {
  key: ProductTagKey;
  label: LocalizedText;
  description: LocalizedText | null;
  colorToken: string; // 设计系统中的语义色 token，而非硬编码颜色值
}

/** 对应数据库实体 product_tag_relations（商品 <-> 标签 多对多） */
export interface ProductTagRelation {
  id: ID;
  productId: ID;
  tagKey: ProductTagKey;
  createdAt: string;
}
