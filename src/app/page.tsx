import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer, Grid, SectionHeading } from "@/components/shared";
import { ProductCard } from "@/components/product";
import { BrandCard } from "@/components/brand";
import { MerchantCard } from "@/components/merchant";
import { buttonClasses } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  brandRepository,
  categoryRepository,
  cityGuideRepository,
  editorialCollectionRepository,
  faqRepository,
  merchantRepository,
  productRepository,
  productReviewRepository,
  profileRepository,
} from "@/lib/repositories";
import { attachProductTags, type ProductWithTags } from "@/lib/services/product-view";

export const metadata: Metadata = { alternates: { canonical: "/" } };

function ProductGrid({ items }: { items: ProductWithTags[] }) {
  return (
    <Grid columns="4">
      {items.map(({ product, tags }) => (
        <ProductCard key={product.id} product={product} tags={tags} />
      ))}
    </Grid>
  );
}

export default async function HomePage() {
  const [
    featuredRes,
    publishedRes,
    limitedRes,
    preorderRes,
    groupBuyRes,
    brandsRes,
    merchantsRes,
    categoriesRes,
    citiesRes,
    editorialRes,
    faqsRes,
  ] = await Promise.all([
    productRepository.findFeatured(),
    productRepository.findPublished(),
    productRepository.findByTag("limited"),
    productRepository.findByTag("preorder"),
    productRepository.findByTag("group_buy"),
    brandRepository.findFeatured(),
    merchantRepository.findActive(),
    categoryRepository.findVisible(),
    cityGuideRepository.findVisible(),
    editorialCollectionRepository.findFeatured(),
    faqRepository.findVisible(),
  ]);

  const featured = featuredRes.ok ? featuredRes.data.slice(0, 4) : [];
  const newArrivals = publishedRes.ok
    ? [...publishedRes.data]
        .sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""))
        .slice(0, 4)
    : [];
  const limited = limitedRes.ok ? limitedRes.data.slice(0, 4) : [];
  const preorderAndGroupBuy = [
    ...(preorderRes.ok ? preorderRes.data : []),
    ...(groupBuyRes.ok ? groupBuyRes.data : []),
  ].slice(0, 4);
  const brands = brandsRes.ok ? brandsRes.data.slice(0, 4) : [];
  const merchants = merchantsRes.ok ? merchantsRes.data.slice(0, 3) : [];
  const categories = categoriesRes.ok ? categoriesRes.data.slice(0, 8) : [];
  const cities = citiesRes.ok ? citiesRes.data.slice(0, 6) : [];
  const editorialCollections = editorialRes.ok ? editorialRes.data.slice(0, 3) : [];
  const faqs = faqsRes.ok ? faqsRes.data.slice(0, 4) : [];

  const [featuredWithTags, newArrivalsWithTags, limitedWithTags, preorderWithTags] =
    await Promise.all([
      attachProductTags(featured),
      attachProductTags(newArrivals),
      attachProductTags(limited),
      attachProductTags(preorderAndGroupBuy),
    ]);

  const reviewsResult = await productReviewRepository.findAll();
  const testimonials = reviewsResult.ok ? reviewsResult.data.slice(0, 3) : [];
  const testimonialAuthors = await Promise.all(
    testimonials.map(async (review) => {
      const profileResult = await profileRepository.findById(review.userId);
      return profileResult.ok ? profileResult.data.displayName : "匿名用户";
    }),
  );

  return (
    <>
      <section className="border-line bg-surface border-b">
        <PageContainer className="flex flex-col gap-6 py-16 sm:py-24">
          <p className="text-brand-700 text-xs tracking-[0.2em] uppercase">Expectaly Shop</p>
          <h1 className="text-ink max-w-2xl font-serif text-4xl font-semibold sm:text-5xl">
            意大利小众品牌与本地买手资源，都在意料之中
          </h1>
          <p className="text-ink-muted max-w-xl text-base leading-7">
            精选意大利小众设计师饰品、国际米兰与法拉利收藏、手工艺品与生活方式好物。
            资源整合与流量撮合为主，不强制平台抽成，交易方式由你与商家自主协商。
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/discover" className={buttonClasses("primary", "lg")}>
              开始探索
            </Link>
            <Link href="/custom-purchase" className={buttonClasses("secondary", "lg")}>
              提交代购需求
            </Link>
          </div>
        </PageContainer>
      </section>

      <PageContainer className="flex flex-col gap-20 py-16 sm:py-20">
        <section className="flex flex-col gap-6">
          <SectionHeading eyebrow="Curated" title="本期精选" href="/discover?sort=featured" />
          <ProductGrid items={featuredWithTags} />
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading title="热门类别" href="/discover" linkLabel="浏览全部分类" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="focus-ring border-line text-ink hover:border-brand-200 hover:text-brand-700 rounded-xs border px-4 py-5 text-center text-sm font-medium"
              >
                {category.name["zh-CN"]}
              </Link>
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading eyebrow="New" title="新到商品" href="/discover?sort=newest" />
          <ProductGrid items={newArrivalsWithTags} />
        </section>

        {editorialCollections.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeading title="专题策展" description="本周编辑精选主题" href="/editorial" />
            <div className="grid gap-4 sm:grid-cols-3">
              {editorialCollections.map((collection) => (
                <Link
                  key={collection.id}
                  href={`/editorial/${collection.slug}`}
                  className="focus-ring border-line hover:border-brand-200 flex flex-col gap-2 rounded-xs border p-5"
                >
                  <h3 className="text-ink font-serif text-lg font-semibold">
                    {collection.title["zh-CN"]}
                  </h3>
                  {collection.description && (
                    <p className="text-ink-muted line-clamp-2 text-sm">
                      {collection.description["zh-CN"]}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-6">
          <SectionHeading title="本周买手与商家推荐" href="/merchants" />
          <div className="flex flex-col gap-3">
            {merchants.map((merchant) => (
              <MerchantCard key={merchant.id} merchant={merchant} />
            ))}
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading title="小众品牌故事" href="/brands" />
          <Grid columns="4">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </Grid>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading eyebrow="Limited" title="限量收藏" href="/discover?tag=limited" />
          <ProductGrid items={limitedWithTags} />
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading title="意大利城市选品" href="/cities" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${city.slug}`}
                className="focus-ring border-line hover:border-brand-200 rounded-xs border px-3 py-6 text-center"
              >
                <span className="text-ink text-sm font-medium">{city.cityName["zh-CN"]}</span>
              </Link>
            ))}
          </div>
        </section>

        {preorderWithTags.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeading
              title="预订与拼单专区"
              description="需要等待到货或达成成团数量的商品"
              href="/discover?tag=preorder"
            />
            <ProductGrid items={preorderWithTags} />
          </section>
        )}

        <section className="border-line bg-surface grid gap-6 rounded-xs border p-8 sm:grid-cols-2 sm:items-center">
          <div className="flex flex-col gap-3">
            <h2 className="text-ink font-serif text-2xl font-semibold">没找到你想要的商品？</h2>
            <p className="text-ink-muted text-sm">
              提交商品名称、品牌、参考链接或截图，平台与认证商家将协助为你寻找同款或类似款。
            </p>
          </div>
          <div>
            <Link href="/custom-purchase" className={buttonClasses("primary", "lg")}>
              提交自定义代购需求
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-6">
          <SectionHeading title="平台服务说明" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Link
              href="/about"
              className="focus-ring border-line hover:border-brand-200 rounded-xs border p-5"
            >
              <h3 className="text-ink text-sm font-semibold">平台定位</h3>
              <p className="text-ink-muted mt-2 text-sm">了解平台商品来源、交易方式与费用构成</p>
            </Link>
            <Link
              href="/how-it-works"
              className="focus-ring border-line hover:border-brand-200 rounded-xs border p-5"
            >
              <h3 className="text-ink text-sm font-semibold">代购流程</h3>
              <p className="text-ink-muted mt-2 text-sm">从询价、协商到交付的完整流程说明</p>
            </Link>
            <Link
              href="/merchant-apply"
              className="focus-ring border-line hover:border-brand-200 rounded-xs border p-5"
            >
              <h3 className="text-ink text-sm font-semibold">商家入驻</h3>
              <p className="text-ink-muted mt-2 text-sm">成为认证商家或本地买手，发布你的选品</p>
            </Link>
          </div>
        </section>

        {testimonials.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeading title="用户评价" />
            <div className="grid gap-4 sm:grid-cols-3">
              {testimonials.map((review, index) => (
                <div
                  key={review.id}
                  className="border-line flex flex-col gap-3 rounded-xs border p-5"
                >
                  <div className="flex items-center gap-2">
                    {review.verification === "verified_purchase" && (
                      <Badge tone="success">已验证购买</Badge>
                    )}
                  </div>
                  <p className="text-ink text-sm leading-6">{review.body}</p>
                  <span className="text-ink-muted text-xs">{testimonialAuthors[index]}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {faqs.length > 0 && (
          <section className="flex flex-col gap-6">
            <SectionHeading title="常见问题" href="/faq" />
            <div className="grid gap-4 sm:grid-cols-2">
              {faqs.map((faq) => (
                <div key={faq.id} className="border-line rounded-xs border p-5">
                  <h3 className="text-ink text-sm font-semibold">{faq.question["zh-CN"]}</h3>
                  <p className="text-ink-muted mt-2 line-clamp-3 text-sm">{faq.answer["zh-CN"]}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </PageContainer>
    </>
  );
}
