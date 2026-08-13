import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { brandRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "品牌管理" };

export default async function AdminBrandsPage() {
  const brandsResult = await brandRepository.findAll();
  const brands = brandsResult.ok
    ? [...brandsResult.data].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">品牌管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {brands.length} 个品牌。新增/编辑操作将在接入真实数据库后开放。
        </p>
      </div>

      {brands.length === 0 ? (
        <EmptyState title="暂无品牌数据" description="演示数据为空。" />
      ) : (
        <div className="border-line overflow-x-auto rounded-xs border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">品牌名称</th>
                <th className="px-4 py-3 font-medium">起源城市</th>
                <th className="px-4 py-3 font-medium">精选</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {brands.map((brand) => (
                <tr key={brand.id} className="border-line border-t">
                  <td className="text-ink px-4 py-3 font-medium">{brand.name["zh-CN"]}</td>
                  <td className="text-ink-muted px-4 py-3">{brand.city ?? "—"}</td>
                  <td className="px-4 py-3">
                    <Badge tone={brand.isFeatured ? "accent" : "neutral"}>
                      {brand.isFeatured ? "精选" : "普通"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/brands/${brand.slug}`}
                      className="focus-ring text-brand-700 text-xs underline"
                    >
                      查看品牌页
                    </Link>
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
