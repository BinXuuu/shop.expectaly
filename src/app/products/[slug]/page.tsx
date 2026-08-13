import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  AgeConfirmationGate,
  EmptyState,
  Grid,
  JsonLd,
  PageContainer,
  ReportDialog,
} from "@/components/shared";
import { PlaceholderImage } from "@/components/shared/PlaceholderImage";
import {
  BrowsingHistoryRecorder,
  ProductActionsPanel,
  ProductCard,
  ProductTagBadge,
  Price,
} from "@/components/product";
import { MerchantCard } from "@/components/merchant";
import { Badge } from "@/components/ui/Badge";
import {
  brandRepository,
  categoryRepository,
  merchantRepository,
  productRepository,
  productReviewRepository,
} from "@/lib/repositories";
import { attachProductTags } from "@/lib/services/product-view";
import { getFeatureFlags } from "@/lib/config/feature-flags";
import { siteConfig } from "@/lib/config/site";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

async function loadProduct(slug: string) {
  const productResult = await productRepository.findBySlug(slug);
  if (!productResult.ok || !productResult.data || productResult.data.status !== "published") {
    return null;
  }
  return productResult.data;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) {
    return { title: "商品不存在" };
  }
  return {
    title: product.name["zh-CN"],
    description: product.summary?.["zh-CN"] ?? product.name["zh-CN"],
    alternates: { canonical: `/products/${slug}` },
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await loadProduct(slug);

  if (!product) {
    notFound();
  }

  const [mediaRes, variantsRes, tagsRes, reviewsRes] = await Promise.all([
    productRepository.getMedia(product.id),
    productRepository.getVariants(product.id),
    productRepository.getTagKeys(product.id),
    productReviewRepository.findByProduct(product.id),
  ]);

  const media = mediaRes.ok ? mediaRes.data : [];
  const variants = variantsRes.ok ? variantsRes.data : [];
  const tags = tagsRes.ok ? tagsRes.data : [];
  const reviews = reviewsRes.ok ? reviewsRes.data : [];

  const [brandResult, categoryResult, merchantResult] = await Promise.all([
    product.brandId ? brandRepository.findById(product.brandId) : Promise.resolve(null),
    categoryRepository.findById(product.categoryId),
    product.merchantId ? merchantRepository.findById(product.merchantId) : Promise.resolve(null),
  ]);

  const brand = brandResult?.ok ? brandResult.data : null;
  const category = categoryResult.ok ? categoryResult.data : null;
  const merchant = merchantResult?.ok ? merchantResult.data : null;

  const [sameCategoryRes, sameBrandRes] = await Promise.all([
    productRepository.findByCategory(product.categoryId),
    product.brandId
      ? productRepository.findByBrand(product.brandId)
      : Promise.resolve({ ok: true as const, data: [] }),
  ]);

  const similarProducts = (sameCategoryRes.ok ? sameCategoryRes.data : [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);
  const sameBrandProducts = (sameBrandRes.ok ? sameBrandRes.data : [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const [similarWithTags, sameBrandWithTags] = await Promise.all([
    attachProductTags(similarProducts),
    attachProductTags(sameBrandProducts),
  ]);

  const { paymentEnabled } = getFeatureFlags();

  const actionsContent = (
    <ProductActionsPanel product={product} merchant={merchant} paymentEnabled={paymentEnabled} />
  );

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name["zh-CN"],
    description: product.summary?.["zh-CN"] ?? product.name["zh-CN"],
    sku: product.id,
    ...(brand ? { brand: { "@type": "Brand", name: brand.name["zh-CN"] } } : {}),
    offers: {
      "@type": "Offer",
      url: `${siteConfig.url}/products/${product.slug}`,
      priceCurrency: product.pricing.originalCurrency,
      price: product.pricing.originalPrice,
      availability: tags.includes("sold_out")
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
    },
  };

  return (
    <PageContainer className="flex flex-col gap-12 py-10">
      <JsonLd data={productJsonLd} />
      <BrowsingHistoryRecorder
        productId={product.id}
        slug={product.slug}
        name={product.name["zh-CN"]}
        brandName={brand?.name["zh-CN"]}
      />
      <nav aria-label="面包屑" className="text-ink-muted flex flex-wrap items-center gap-1 text-xs">
        <Link href="/" className="hover:text-ink">
          首页
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/discover" className="hover:text-ink">
          商品发现
        </Link>
        {category && (
          <>
            <span aria-hidden="true">/</span>
            <Link href={`/categories/${category.slug}`} className="hover:text-ink">
              {category.name["zh-CN"]}
            </Link>
          </>
        )}
        <span aria-hidden="true">/</span>
        <span className="text-ink">{product.name["zh-CN"]}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <div className="border-line overflow-hidden rounded-xs border">
            <PlaceholderImage label={product.name["zh-CN"]} aspect="square" />
          </div>
          {media.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {media.slice(1).map((item) => (
                <div key={item.id} className="border-line overflow-hidden rounded-xs border">
                  <PlaceholderImage label={item.altText} aspect="square" />
                </div>
              ))}
            </div>
          )}
          <div className="text-ink-faint flex gap-2 text-xs">
            <span className="border-line rounded-xs border px-2 py-1">图片</span>
            <span className="border-line rounded-xs border px-2 py-1" title="暂未接入视频素材">
              视频（暂未开放）
            </span>
            <span className="border-line rounded-xs border px-2 py-1" title="暂未接入 360° 展示">
              360° 展示（暂未开放）
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div>
            {brand && (
              <Link
                href={`/brands/${brand.slug}`}
                className="text-brand-700 text-sm hover:underline"
              >
                {brand.name["zh-CN"]}
              </Link>
            )}
            <h1 className="text-ink mt-1 font-serif text-2xl font-semibold sm:text-3xl">
              {product.name["zh-CN"]}
            </h1>
            {product.summary && (
              <p className="text-ink-muted mt-2 text-sm">{product.summary["zh-CN"]}</p>
            )}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <ProductTagBadge key={tag} tagKey={tag} />
              ))}
            </div>
          </div>

          <Price pricing={product.pricing} />

          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {product.sourceCity && (
              <>
                <dt className="text-ink-muted">采购城市</dt>
                <dd className="text-ink">{product.sourceCity}</dd>
              </>
            )}
            {product.sourceStore && (
              <>
                <dt className="text-ink-muted">采购门店</dt>
                <dd className="text-ink">{product.sourceStore}</dd>
              </>
            )}
            {product.estimatedArrivalAt && (
              <>
                <dt className="text-ink-muted">预计到货</dt>
                <dd className="text-ink">
                  {new Date(product.estimatedArrivalAt).toLocaleDateString("zh-CN")}
                </dd>
              </>
            )}
            {product.dimensions && (
              <>
                <dt className="text-ink-muted">尺寸</dt>
                <dd className="text-ink">{product.dimensions}</dd>
              </>
            )}
            {product.materials && (
              <>
                <dt className="text-ink-muted">材质</dt>
                <dd className="text-ink">{product.materials["zh-CN"]}</dd>
              </>
            )}
          </dl>

          {variants.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-ink text-sm font-medium">规格</span>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => (
                  <span
                    key={variant.id}
                    className="border-line-strong text-ink rounded-xs border px-3 py-1.5 text-sm"
                  >
                    {variant.optionLabel["zh-CN"]}（库存 {variant.stockQuantity}）
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="text-ink-muted flex flex-wrap gap-1.5 text-xs">
            {product.pricing.includesInternationalShipping && (
              <Badge tone="neutral">含国际运费</Badge>
            )}
            {product.pricing.includesItalyDomesticShipping && (
              <Badge tone="neutral">含意大利境内运费</Badge>
            )}
            {product.pricing.includesDomesticShipping && <Badge tone="neutral">含国内运费</Badge>}
            {product.pricing.includesTax && <Badge tone="neutral">含税费</Badge>}
            {product.pricing.includesDaigouServiceFee && <Badge tone="neutral">含代购服务费</Badge>}
            {product.pricing.isAllInPrice && <Badge tone="accent">到手价</Badge>}
            {!product.pricing.isAllInPrice && (
              <Badge tone="neutral">未税未含运费，具体以商家确认为准</Badge>
            )}
          </div>

          {product.compliance.ageRestricted ? (
            <AgeConfirmationGate
              contextType="product"
              contextId={product.id}
              minimumAge={product.compliance.minimumAge ?? 18}
              restrictedRegions={product.compliance.restrictedRegions}
            >
              {actionsContent}
            </AgeConfirmationGate>
          ) : (
            actionsContent
          )}
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-8">
          {product.story && (
            <section>
              <h2 className="text-ink font-serif text-lg font-semibold">商品故事</h2>
              <p className="text-ink-muted mt-2 text-sm leading-7">{product.story["zh-CN"]}</p>
            </section>
          )}
          {product.collectibleValueNote && (
            <section>
              <h2 className="text-ink font-serif text-lg font-semibold">收藏价值说明</h2>
              <p className="text-ink-muted mt-2 text-sm leading-7">
                {product.collectibleValueNote["zh-CN"]}
              </p>
            </section>
          )}
          {product.authenticityNote && (
            <section>
              <h2 className="text-ink font-serif text-lg font-semibold">正品与采购凭证说明</h2>
              <p className="text-ink-muted mt-2 text-sm leading-7">
                {product.authenticityNote["zh-CN"]}
              </p>
            </section>
          )}
          {brand?.story && (
            <section>
              <h2 className="text-ink font-serif text-lg font-semibold">品牌介绍</h2>
              <p className="text-ink-muted mt-2 text-sm leading-7">{brand.story["zh-CN"]}</p>
            </section>
          )}

          <section>
            <h2 className="text-ink font-serif text-lg font-semibold">用户评价</h2>
            {reviews.length === 0 ? (
              <EmptyState
                title="暂无评价"
                description="成为第一个分享体验的用户。"
                className="mt-3 py-10"
              />
            ) : (
              <div className="mt-3 flex flex-col gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="border-line rounded-xs border p-4">
                    <div className="flex items-center gap-2">
                      {review.verification === "verified_purchase" && (
                        <Badge tone="success">已验证购买</Badge>
                      )}
                      <span className="text-ink-faint text-xs">{"★".repeat(review.rating)}</span>
                    </div>
                    {review.title && (
                      <p className="text-ink mt-2 text-sm font-medium">{review.title}</p>
                    )}
                    <p className="text-ink-muted mt-1 text-sm">{review.body}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="border-line bg-surface-muted flex flex-col gap-2 rounded-xs border p-5">
            <h2 className="text-ink text-sm font-semibold">售后说明与免责声明</h2>
            <p className="text-ink-muted text-xs leading-6">
              多数商品为用户与商家自主协商完成的自主交易，平台不参与付款、发货和售后责任；仅标注支持平台担保的商品
              将在功能开放后逐步接入站内交易与售后流程。详见
              <Link href="/legal/self-negotiated-disclaimer" className="text-brand-700 underline">
                自主交易免责声明
              </Link>
              与
              <Link href="/legal/after-sales-dispute-rules" className="text-brand-700 underline">
                售后及纠纷处理规则
              </Link>
              。
            </p>
            <ReportDialog reportedType="product" reportedLabel="该商品" />
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="text-ink font-serif text-lg font-semibold">商家信息</h2>
          {merchant ? (
            <MerchantCard merchant={merchant} />
          ) : (
            <p className="text-ink-muted text-sm">该商品由平台自营提供。</p>
          )}
        </div>
      </div>

      {sameBrandWithTags.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-ink font-serif text-xl font-semibold">同品牌商品</h2>
          <Grid columns="4">
            {sameBrandWithTags.map(({ product: p, tags: t }) => (
              <ProductCard key={p.id} product={p} tags={t} brandName={brand?.name["zh-CN"]} />
            ))}
          </Grid>
        </section>
      )}

      {similarWithTags.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-ink font-serif text-xl font-semibold">相似商品</h2>
          <Grid columns="4">
            {similarWithTags.map(({ product: p, tags: t }) => (
              <ProductCard key={p.id} product={p} tags={t} />
            ))}
          </Grid>
        </section>
      )}
    </PageContainer>
  );
}
