import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageContainer, Grid, EmptyState, JsonLd, PlaceholderImage } from "@/components/shared";
import { ProductCard } from "@/components/product";
import { Badge } from "@/components/ui/Badge";
import { brandRepository, productRepository } from "@/lib/repositories";
import { attachProductTags } from "@/lib/services/product-view";

const RELATIONSHIP_LABELS = {
  unofficial_selection: "买手精选（非官方授权）",
  authorized_partner: "授权合作品牌",
  platform_owned: "平台自营",
} as const;

interface BrandPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await brandRepository.findBySlug(slug);
  if (!result.ok || !result.data) {
    return { title: "品牌不存在" };
  }
  return {
    title: result.data.name["zh-CN"],
    description: result.data.story?.["zh-CN"] ?? result.data.name["zh-CN"],
    alternates: { canonical: `/brands/${slug}` },
  };
}

export default async function BrandDetailPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brandResult = await brandRepository.findBySlug(slug);

  if (!brandResult.ok || !brandResult.data) {
    notFound();
  }

  const brand = brandResult.data;
  const productsResult = await productRepository.findByBrand(brand.id);
  const products = productsResult.ok ? productsResult.data : [];
  const productsWithTags = await attachProductTags(products);

  const brandJsonLd = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name["zh-CN"],
    description: brand.story?.["zh-CN"],
  };

  return (
    <PageContainer className="flex flex-col gap-10 py-10">
      <JsonLd data={brandJsonLd} />
      <div className="border-line overflow-hidden rounded-xs border">
        <PlaceholderImage label={brand.name["zh-CN"]} aspect="landscape" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-ink font-serif text-3xl font-semibold">{brand.name["zh-CN"]}</h1>
          <Badge tone="accent">{RELATIONSHIP_LABELS[brand.relationship]}</Badge>
        </div>
        <div className="text-ink-muted flex flex-wrap gap-4 text-sm">
          {brand.city && <span>所在城市：{brand.city}</span>}
          {brand.foundedYear && <span>创立于 {brand.foundedYear} 年</span>}
        </div>
        {brand.story && (
          <p className="text-ink-muted max-w-3xl text-sm leading-7">{brand.story["zh-CN"]}</p>
        )}
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink font-serif text-xl font-semibold">相关商品</h2>
        {productsWithTags.length === 0 ? (
          <EmptyState title="暂无在售商品" description="该品牌的商品正在整理上架中。" />
        ) : (
          <Grid columns="4">
            {productsWithTags.map(({ product, tags }) => (
              <ProductCard
                key={product.id}
                product={product}
                tags={tags}
                brandName={brand.name["zh-CN"]}
              />
            ))}
          </Grid>
        )}
      </section>
    </PageContainer>
  );
}
