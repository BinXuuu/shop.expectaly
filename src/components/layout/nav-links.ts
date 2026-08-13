export interface NavLink {
  label: string;
  href: string;
}

/** 顶部导航与移动端菜单共用的主导航结构。对应页面将在 Stage 03 起逐步实现。 */
export const PRIMARY_NAV_LINKS: NavLink[] = [
  { label: "发现", href: "/discover" },
  { label: "品牌", href: "/brands" },
  { label: "商家", href: "/merchants" },
  { label: "城市选品", href: "/cities" },
  { label: "专题策展", href: "/editorial" },
  { label: "自定义代购", href: "/custom-purchase" },
];

export const SECONDARY_NAV_LINKS: NavLink[] = [
  { label: "平台说明", href: "/about" },
  { label: "代购流程", href: "/how-it-works" },
  { label: "商家入驻", href: "/merchant-apply" },
];
