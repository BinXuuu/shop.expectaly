import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState, Grid, PageContainer, SearchBar } from "@/components/shared";
import { ProductCard } from "@/components/product";
import { BrandCard } from "@/components/brand";
import { MerchantCard } from "@/components/merchant";
import {
  brandRepository,
  cityGuideRepository,
  editorialCollectionRepository,
  merchantRepository,
  productRepository,
} from "@/lib/repositories";
import { attachProductTags } from "@/lib/services/product-view";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索商品、品牌、商家、城市与专题策展内容。",
  // 统一指向不带查询参数的基础路径，避免每个搜索关键词组合被当作独立页面重复收录。
  alternates: { canonical: "/search" },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim().toLowerCase() ?? "";

  if (!query) {
    return (
      <PageContainer className="flex flex-col gap-8 py-10">
        <h1 className="text-ink font-serif text-2xl font-semibold">搜索</h1>
        <SearchBar autoFocus />
      </PageContainer>
    );
  }

  const [productsRes, brandsRes, merchantsRes, citiesRes, editorialRes] = await Promise.all([
    productRepository.findPublished(),
    brandRepository.findAll(),
    merchantRepository.findActive(),
    cityGuideRepository.findVisible(),
    editorialCollectionRepository.findAll(),
  ]);

  const products = (productsRes.ok ? productsRes.data : []).filter(
    (p) =>
      p.name["zh-CN"].toLowerCase().includes(query) ||
      p.slug.includes(query) ||
      p.id.includes(query),
  );
  const brands = (brandsRes.ok ? brandsRes.data : []).filter((b) =>
    b.name["zh-CN"].toLowerCase().includes(query),
  );
  const merchants = (merchantsRes.ok ? merchantsRes.data : []).filter((m) =>
    m.name["zh-CN"].toLowerCase().includes(query),
  );
  const cities = (citiesRes.ok ? citiesRes.data : []).filter((c) =>
    c.cityName["zh-CN"].toLowerCase().includes(query),
  );
  const editorialCollections = (editorialRes.ok ? editorialRes.data : []).filter(
    (c) => c.status === "published" && c.title["zh-CN"].toLowerCase().includes(query),
  );

  const productsWithTags = await attachProductTags(products);
  const totalResults =
    products.length +
    brands.length +
    merchants.length +
    cities.length +
    editorialCollections.length;

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-ink font-serif text-2xl font-semibold">搜索</h1>
        <SearchBar defaultValue={q} />
      </div>

      <p className="text-ink-muted text-sm">
        「{q}」共找到 {totalResults} 条结果
      </p>

      {totalResults === 0 ? (
        <EmptyState title="没有找到相关内容" description="试试更换关键词，或浏览商品发现页。" />
      ) : (
        <div className="flex flex-col gap-10">
          {productsWithTags.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-ink text-sm font-semibold">商品（{productsWithTags.length}）</h2>
              <Grid columns="4">
                {productsWithTags.map(({ product, tags }) => (
                  <ProductCard key={product.id} product={product} tags={tags} />
                ))}
              </Grid>
            </section>
          )}

          {brands.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-ink text-sm font-semibold">品牌（{brands.length}）</h2>
              <Grid columns="4">
                {brands.map((brand) => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </Grid>
            </section>
          )}

          {merchants.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-ink text-sm font-semibold">商家（{merchants.length}）</h2>
              <div className="flex flex-col gap-3">
                {merchants.map((merchant) => (
                  <MerchantCard key={merchant.id} merchant={merchant} />
                ))}
              </div>
            </section>
          )}

          {cities.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-ink text-sm font-semibold">城市（{cities.length}）</h2>
              <div className="flex flex-wrap gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.id}
                    href={`/cities/${city.slug}`}
                    className="focus-ring border-line text-ink hover:border-brand-200 rounded-xs border px-3 py-1.5 text-sm"
                  >
                    {city.cityName["zh-CN"]}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {editorialCollections.length > 0 && (
            <section className="flex flex-col gap-4">
              <h2 className="text-ink text-sm font-semibold">
                专题（{editorialCollections.length}）
              </h2>
              <div className="flex flex-wrap gap-2">
                {editorialCollections.map((collection) => (
                  <Link
                    key={collection.id}
                    href={`/editorial/${collection.slug}`}
                    className="focus-ring border-line text-ink hover:border-brand-200 rounded-xs border px-3 py-1.5 text-sm"
                  >
                    {collection.title["zh-CN"]}
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </PageContainer>
  );
}
