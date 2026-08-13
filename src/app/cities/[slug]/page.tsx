import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState, Grid, PageContainer, PlaceholderImage } from "@/components/shared";
import { ProductCard } from "@/components/product";
import { BrandCard } from "@/components/brand";
import { MerchantCard } from "@/components/merchant";
import { cityGuideRepository, productRepository } from "@/lib/repositories";
import { attachProductTags } from "@/lib/services/product-view";
import { mockBrands, mockMerchants } from "@/data/mock";

interface CityPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await cityGuideRepository.findBySlug(slug);
  if (!result.ok || !result.data) {
    return { title: "城市不存在" };
  }
  return {
    title: result.data.cityName["zh-CN"],
    description: result.data.introduction["zh-CN"],
    alternates: { canonical: `/cities/${slug}` },
  };
}

export default async function CityDetailPage({ params }: CityPageProps) {
  const { slug } = await params;
  const cityResult = await cityGuideRepository.findBySlug(slug);

  if (!cityResult.ok || !cityResult.data) {
    notFound();
  }

  const city = cityResult.data;
  const featuredBrands = mockBrands.filter((b) => city.featuredBrandIds.includes(b.id));
  const featuredMerchants = mockMerchants.filter((m) => city.featuredMerchantIds.includes(m.id));

  // 演示数据以英文城市名存储 sourceCity（如 "Milano"），与城市 slug 做不区分大小写匹配
  const productsResult = await productRepository.findPublished();
  const products = (productsResult.ok ? productsResult.data : []).filter(
    (p) => p.sourceCity?.toLowerCase() === city.slug,
  );
  const productsWithTags = await attachProductTags(products);

  return (
    <PageContainer className="flex flex-col gap-10 py-10">
      <div className="border-line overflow-hidden rounded-xs border">
        <PlaceholderImage label={city.cityName["zh-CN"]} aspect="landscape" />
      </div>

      <div>
        <h1 className="text-ink font-serif text-3xl font-semibold">{city.cityName["zh-CN"]}</h1>
        <p className="text-ink-muted mt-3 max-w-3xl text-sm leading-7">
          {city.introduction["zh-CN"]}
        </p>
      </div>

      {featuredBrands.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-ink font-serif text-xl font-semibold">当地品牌</h2>
          <Grid columns="4">
            {featuredBrands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </Grid>
        </section>
      )}

      {featuredMerchants.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-ink font-serif text-xl font-semibold">当地商家</h2>
          <div className="flex flex-col gap-3">
            {featuredMerchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-ink font-serif text-xl font-semibold">当地精选商品</h2>
        {productsWithTags.length === 0 ? (
          <EmptyState title="暂无该城市的精选商品" description="敬请期待后续更新。" />
        ) : (
          <Grid columns="4">
            {productsWithTags.map(({ product, tags }) => (
              <ProductCard key={product.id} product={product} tags={tags} />
            ))}
          </Grid>
        )}
      </section>
    </PageContainer>
  );
}
