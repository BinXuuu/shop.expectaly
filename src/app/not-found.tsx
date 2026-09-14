import Link from "next/link";
import { Home, Search } from "lucide-react";
import { PageContainer } from "@/components/shared";
import { buttonClasses } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageContainer className="max-w-2xl py-20 text-center">
      <p className="text-brand-700 text-sm font-semibold">404</p>
      <h1 className="text-ink mt-3 font-serif text-3xl font-semibold sm:text-4xl">
        没有找到这个页面
      </h1>
      <p className="text-ink-muted mx-auto mt-4 max-w-xl text-base leading-7">
        链接可能已经失效，或商品/页面已下架。你可以回到首页，或者直接搜索想找的商品、品牌和商家。
      </p>
      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/" className={buttonClasses("primary", "lg")}>
          <Home className="h-4 w-4" />
          回到首页
        </Link>
        <Link href="/search" className={buttonClasses("secondary", "lg")}>
          <Search className="h-4 w-4" />
          搜索商品
        </Link>
      </div>
    </PageContainer>
  );
}
