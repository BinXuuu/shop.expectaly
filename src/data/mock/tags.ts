/**
 * 演示数据：商品交易标签目录。与商品分类（categories.ts）分开设计，一个商品可同时拥有多个标签。
 */
import type { ProductTag } from "@/types";

const base = {
  createdAt: "2026-05-01T09:00:00+02:00",
  updatedAt: "2026-05-01T09:00:00+02:00",
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

export const mockProductTags: ProductTag[] = [
  {
    id: "tag-italy-in-stock",
    key: "italy_in_stock",
    label: { "zh-CN": "意大利现货" },
    description: { "zh-CN": "商品当前在意大利本地有现货" },
    colorToken: "tag-neutral",
    ...base,
  },
  {
    id: "tag-domestic-in-stock",
    key: "domestic_in_stock",
    label: { "zh-CN": "国内现货" },
    description: { "zh-CN": "商品已在国内仓，可更快发货" },
    colorToken: "tag-neutral",
    ...base,
  },
  {
    id: "tag-preorder",
    key: "preorder",
    label: { "zh-CN": "预订" },
    description: { "zh-CN": "商品需要预订，按预计到货时间发货" },
    colorToken: "tag-accent",
    ...base,
  },
  {
    id: "tag-daigou",
    key: "daigou",
    label: { "zh-CN": "代购" },
    description: { "zh-CN": "由商家或买手代为采购" },
    colorToken: "tag-accent",
    ...base,
  },
  {
    id: "tag-group-buy",
    key: "group_buy",
    label: { "zh-CN": "拼单" },
    description: { "zh-CN": "达到目标人数或数量后成团发货" },
    colorToken: "tag-accent",
    ...base,
  },
  {
    id: "tag-inquiry-only",
    key: "inquiry_only",
    label: { "zh-CN": "询价" },
    description: { "zh-CN": "商品不展示固定价格，需人工询价" },
    colorToken: "tag-neutral",
    ...base,
  },
  {
    id: "tag-limited",
    key: "limited",
    label: { "zh-CN": "限量" },
    description: { "zh-CN": "商品为限量发行" },
    colorToken: "tag-emphasis",
    ...base,
  },
  {
    id: "tag-exclusive",
    key: "exclusive",
    label: { "zh-CN": "独家" },
    description: { "zh-CN": "平台或商家独家资源" },
    colorToken: "tag-emphasis",
    ...base,
  },
  {
    id: "tag-arriving-soon",
    key: "arriving_soon",
    label: { "zh-CN": "即将到货" },
    description: { "zh-CN": "商品在途，即将到货" },
    colorToken: "tag-neutral",
    ...base,
  },
  {
    id: "tag-sold-out",
    key: "sold_out",
    label: { "zh-CN": "已售罄" },
    description: { "zh-CN": "商品当前无可用库存" },
    colorToken: "tag-muted",
    ...base,
  },
];
