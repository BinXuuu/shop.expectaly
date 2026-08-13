/**
 * 演示数据：品牌档案。为项目演示数据，不代表真实品牌授权或合作关系。
 */
import type { Brand } from "@/types";

const base = {
  createdAt: "2026-05-02T09:00:00+02:00",
  updatedAt: "2026-05-02T09:00:00+02:00",
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

export const mockBrands: Brand[] = [
  {
    id: "brand-favilli",
    slug: "favilli",
    name: { "zh-CN": "Favilli", "en-US": "Favilli" },
    logoUrl: "/images/placeholder/brand-favilli-logo.svg",
    heroImageUrl: "/images/placeholder/brand-favilli-hero.svg",
    story: {
      "zh-CN":
        "Favilli 是一家源自意大利的小众珐琅饰品工坊，坚持全手工彩绘珐琅工艺，作品以鲜明色彩与几何图案著称。（演示数据）",
    },
    city: "Milano",
    foundedYear: 2014,
    categoryTags: ["niche-jewelry"],
    relationship: "unofficial_selection",
    isFeatured: true,
    sortOrder: 1,
    ...base,
  },
  {
    id: "brand-humilis",
    slug: "humilis",
    name: { "zh-CN": "Humilis", "en-US": "Humilis" },
    logoUrl: "/images/placeholder/brand-humilis-logo.svg",
    heroImageUrl: "/images/placeholder/brand-humilis-hero.svg",
    story: {
      "zh-CN":
        "Humilis 专注于极简线条的当代银饰设计，由都灵独立设计师工作室创立，强调材质本身的质感。（演示数据）",
    },
    city: "Torino",
    foundedYear: 2018,
    categoryTags: ["niche-jewelry", "fashion-accessories"],
    relationship: "unofficial_selection",
    isFeatured: true,
    sortOrder: 2,
    ...base,
  },
  {
    id: "brand-milano-atelier",
    slug: "milano-atelier",
    name: { "zh-CN": "Milano Atelier", "en-US": "Milano Atelier" },
    logoUrl: "/images/placeholder/brand-milano-atelier-logo.svg",
    heroImageUrl: "/images/placeholder/brand-milano-atelier-hero.svg",
    story: {
      "zh-CN": "米兰买手工作室，长期挖掘本地小众设计师与限量联名系列。（演示数据）",
    },
    city: "Milano",
    foundedYear: 2016,
    categoryTags: ["fashion-accessories", "home-design"],
    relationship: "authorized_partner",
    isFeatured: true,
    sortOrder: 3,
    ...base,
  },
  {
    id: "brand-torino-objects",
    slug: "torino-objects",
    name: { "zh-CN": "Torino Objects", "en-US": "Torino Objects" },
    logoUrl: "/images/placeholder/brand-torino-objects-logo.svg",
    heroImageUrl: "/images/placeholder/brand-torino-objects-hero.svg",
    story: {
      "zh-CN": "都灵设计工作室出品的桌面器物与生活方式收藏品。（演示数据）",
    },
    city: "Torino",
    foundedYear: 2019,
    categoryTags: ["home-design", "collectible-figures"],
    relationship: "unofficial_selection",
    isFeatured: false,
    sortOrder: 4,
    ...base,
  },
  {
    id: "brand-firenze-piccoli",
    slug: "firenze-piccoli",
    name: { "zh-CN": "Firenze Piccoli", "en-US": "Firenze Piccoli" },
    logoUrl: "/images/placeholder/brand-firenze-piccoli-logo.svg",
    heroImageUrl: "/images/placeholder/brand-firenze-piccoli-hero.svg",
    story: {
      "zh-CN": "佛罗伦萨传统手工艺集合品牌，专注皮具与玻璃工艺的当代演绎。（演示数据）",
    },
    city: "Firenze",
    foundedYear: 2011,
    categoryTags: ["italian-crafts"],
    relationship: "unofficial_selection",
    isFeatured: false,
    sortOrder: 5,
    ...base,
  },
  {
    id: "brand-modena-collectors",
    slug: "modena-collectors",
    name: { "zh-CN": "Modena Collectors", "en-US": "Modena Collectors" },
    logoUrl: "/images/placeholder/brand-modena-collectors-logo.svg",
    heroImageUrl: "/images/placeholder/brand-modena-collectors-hero.svg",
    story: {
      "zh-CN": "摩德纳赛车收藏圈层买手，专注法拉利及经典赛车限量模型与周边。（演示数据）",
    },
    city: "Modena",
    foundedYear: 2015,
    categoryTags: ["ferrari-car-models", "limited-editions"],
    relationship: "unofficial_selection",
    isFeatured: true,
    sortOrder: 6,
    ...base,
  },
];
