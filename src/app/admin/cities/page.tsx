import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { cityGuideRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "城市管理" };

export default async function AdminCitiesPage() {
  const citiesResult = await cityGuideRepository.findAll();
  const cities = citiesResult.ok
    ? [...citiesResult.data].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">城市管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {cities.length} 个城市选品指南。新增/编辑操作将在接入真实数据库后开放。
        </p>
      </div>

      {cities.length === 0 ? (
        <EmptyState title="暂无城市数据" description="演示数据为空。" />
      ) : (
        <div className="flex flex-col gap-3">
          {cities.map((city) => (
            <div
              key={city.id}
              className="border-line flex flex-wrap items-center justify-between gap-3 rounded-xs border p-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-ink text-sm font-medium">{city.cityName["zh-CN"]}</span>
                  <span className="text-ink-muted text-xs">{city.country}</span>
                  <Badge tone={city.isVisible ? "success" : "muted"}>
                    {city.isVisible ? "已上线" : "已隐藏"}
                  </Badge>
                </div>
                <p className="text-ink-muted mt-1 text-xs">
                  精选品牌 {city.featuredBrandIds.length} 个 · 精选商家{" "}
                  {city.featuredMerchantIds.length} 个
                </p>
              </div>
              <Link
                href={`/cities/${city.slug}`}
                className="focus-ring text-brand-700 text-xs underline"
              >
                查看城市页
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
