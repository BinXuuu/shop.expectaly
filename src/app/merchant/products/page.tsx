import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { getProductStatusLabel, getProductStatusTone } from "@/lib/services/product-view";
import { productRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "商品管理" };

export default async function MerchantProductsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const productsResult = await productRepository.findByMerchant(merchant.id);
  const products = productsResult.ok
    ? [...productsResult.data].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink font-serif text-2xl font-semibold">商品管理</h1>
          <p className="text-ink-muted mt-1 text-sm">
            新发布商品默认进入平台审核，审核通过后才会公开展示。
          </p>
        </div>
        <Link href="/merchant/products/new" className={buttonClasses("primary", "sm")}>
          新建商品
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState title="暂无商品" description="点击右上角新建商品，开始发布你的第一件商品。" />
      ) : (
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="border-line flex flex-wrap items-center justify-between gap-3 rounded-xs border p-4"
            >
              <div>
                <p className="text-ink text-sm font-medium">{product.name["zh-CN"]}</p>
                <p className="text-ink-faint mt-1 text-xs">
                  更新于 {new Date(product.updatedAt).toLocaleDateString("zh-CN")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={getProductStatusTone(product.status)}>
                  {getProductStatusLabel(product.status)}
                </Badge>
                <Link
                  href={`/merchant/products/${product.id}/edit`}
                  className="focus-ring text-brand-700 rounded-xs text-sm hover:underline"
                >
                  编辑
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
