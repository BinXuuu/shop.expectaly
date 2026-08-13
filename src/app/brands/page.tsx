import type { Metadata } from "next";
import { PageContainer, Grid, EmptyState } from "@/components/shared";
import { BrandCard } from "@/components/brand";
import { brandRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "品牌",
  description: "意大利小众设计师品牌与买手工作室档案，非官方授权展示，仅为演示数据。",
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  const brandsResult = await brandRepository.findAll();
  const brands = brandsResult.ok
    ? [...brandsResult.data].sort((a, b) => a.sortOrder - b.sortOrder)
    : [];

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">品牌</h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm">
          意大利小众设计师品牌与独立工作室，由平台或商家整理呈现，均标注合作/展示关系，不代表官方授权。
        </p>
      </div>
      {brands.length === 0 ? (
        <EmptyState title="暂无品牌" description="品牌信息正在整理中，敬请期待。" />
      ) : (
        <Grid columns="4">
          {brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </Grid>
      )}
    </PageContainer>
  );
}
