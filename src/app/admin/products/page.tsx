import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { brandRepository, categoryRepository, productRepository } from "@/lib/repositories";
import { getProductStatusLabel, getProductStatusTone } from "@/lib/services/product-view";

export const metadata: Metadata = { title: "商品管理" };

export default async function AdminProductsPage() {
  const [productsResult, categoriesResult, brandsResult] = await Promise.all([
    productRepository.findAll(),
    categoryRepository.findAll(),
    brandRepository.findAll(),
  ]);
  const products = productsResult.ok ? productsResult.data : [];
  const categoryNameById = new Map(
    (categoriesResult.ok ? categoriesResult.data : []).map((c) => [c.id, c.name["zh-CN"]]),
  );
  const brandNameById = new Map(
    (brandsResult.ok ? brandsResult.data : []).map((b) => [b.id, b.name["zh-CN"]]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">商品管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {products.length} 件商品（含平台自营与全部商家）。待审核商品请前往「商品审核」处理。
        </p>
      </div>

      {products.length === 0 ? (
        <EmptyState title="暂无商品数据" description="演示数据为空。" />
      ) : (
        <div className="border-line overflow-x-auto rounded-xs border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">商品</th>
                <th className="px-4 py-3 font-medium">分类</th>
                <th className="px-4 py-3 font-medium">品牌</th>
                <th className="px-4 py-3 font-medium">发布方</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-line border-t">
                  <td className="text-ink px-4 py-3 font-medium">{product.name["zh-CN"]}</td>
                  <td className="text-ink-muted px-4 py-3">
                    {categoryNameById.get(product.categoryId) ?? "—"}
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {product.brandId ? (brandNameById.get(product.brandId) ?? "—") : "—"}
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {product.publisherType === "platform" ? "平台自营" : "商家"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={getProductStatusTone(product.status)}>
                      {getProductStatusLabel(product.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {product.status === "published" ? (
                      <Link
                        href={`/products/${product.slug}`}
                        className="focus-ring text-brand-700 text-xs underline"
                      >
                        查看详情页
                      </Link>
                    ) : (
                      <span className="text-ink-faint text-xs">未发布，无公开详情页</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
