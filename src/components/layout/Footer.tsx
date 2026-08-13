import Link from "next/link";
import { Logo } from "./Logo";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "探索",
    links: [
      { label: "商品发现", href: "/discover" },
      { label: "品牌", href: "/brands" },
      { label: "商家", href: "/merchants" },
      { label: "城市选品", href: "/cities" },
      { label: "专题策展", href: "/editorial" },
    ],
  },
  {
    title: "服务",
    links: [
      { label: "自定义代购", href: "/custom-purchase" },
      { label: "代购流程说明", href: "/how-it-works" },
      { label: "商家入驻", href: "/merchant-apply" },
      { label: "平台说明", href: "/about" },
    ],
  },
  {
    title: "帮助与支持",
    links: [
      { label: "常见问题", href: "/faq" },
      { label: "售后与纠纷处理", href: "/legal/after-sales-dispute-rules" },
      { label: "举报中心", href: "/legal/ip-complaint-policy" },
    ],
  },
  {
    title: "法律与政策",
    links: [
      { label: "用户协议", href: "/legal/user-agreement" },
      { label: "隐私政策", href: "/legal/privacy-policy" },
      { label: "Cookie 政策", href: "/legal/cookie-policy" },
      { label: "受限制商品政策", href: "/legal/restricted-products-policy" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-line bg-surface border-t">
      <div className="mx-auto max-w-(--container-page) px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 flex flex-col gap-3 sm:col-span-3 lg:col-span-1">
            <Logo />
            <p className="text-ink-muted max-w-xs text-sm leading-6">
              意大利小众品牌集合店 · 本地买手平台 ·
              代购资源整合平台。资源整合与流量撮合为主，不强制平台抽成。
            </p>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="focus-ring text-ink-muted hover:text-ink rounded-xs text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="border-line mt-10 flex flex-col gap-4 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ink-faint text-xs">
            © {new Date().getFullYear()} 意料之中～意购（Expectaly
            Shop）。所有交易请以商品详情页及商家说明为准。
          </p>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <a
              href="https://expectaly.com"
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring text-ink-muted hover:text-ink rounded-xs text-xs underline underline-offset-2"
            >
              前往主站 expectaly.com（意大利生活资源 Wiki）
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
