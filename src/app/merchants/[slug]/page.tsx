import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import {
  EmptyState,
  Grid,
  JsonLd,
  PageContainer,
  PlaceholderImage,
  ReportDialog,
} from "@/components/shared";
import { ProductCard } from "@/components/product";
import { Badge } from "@/components/ui/Badge";
import type { MerchantVerificationLevel } from "@/types";
import {
  merchantRepository,
  merchantReviewRepository,
  productRepository,
} from "@/lib/repositories";
import { attachProductTags } from "@/lib/services/product-view";

const VERIFICATION_LABELS: Record<MerchantVerificationLevel, string> = {
  individual_verified: "个人认证",
  company_verified: "企业认证",
  italy_local_verified: "意大利本地认证",
  platform_partner: "平台合作商家",
  platform_owned: "平台自营",
};

interface MerchantPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MerchantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await merchantRepository.findBySlug(slug);
  if (!result.ok || !result.data) {
    return { title: "商家不存在" };
  }
  return {
    title: result.data.name["zh-CN"],
    description: result.data.introduction["zh-CN"],
    alternates: { canonical: `/merchants/${slug}` },
  };
}

export default async function MerchantDetailPage({ params }: MerchantPageProps) {
  const { slug } = await params;
  const merchantResult = await merchantRepository.findBySlug(slug);

  if (!merchantResult.ok || !merchantResult.data) {
    notFound();
  }

  const merchant = merchantResult.data;

  const [productsResult, reviewsResult] = await Promise.all([
    productRepository.findByMerchant(merchant.id),
    merchantReviewRepository.findByMerchant(merchant.id),
  ]);

  const products = (productsResult.ok ? productsResult.data : []).filter(
    (p) => p.status === "published",
  );
  const productsWithTags = await attachProductTags(products);
  const reviews = reviewsResult.ok ? reviewsResult.data : [];

  const merchantJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: merchant.name["zh-CN"],
    description: merchant.introduction["zh-CN"],
    address: {
      "@type": "PostalAddress",
      addressLocality: merchant.city,
      addressCountry: merchant.country,
    },
    ...(merchant.ratingCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: merchant.ratingAverage,
            reviewCount: merchant.ratingCount,
          },
        }
      : {}),
  };

  return (
    <PageContainer className="flex flex-col gap-10 py-10">
      <JsonLd data={merchantJsonLd} />
      <div className="border-line overflow-hidden rounded-xs border">
        <PlaceholderImage label={merchant.name["zh-CN"]} aspect="landscape" />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-ink font-serif text-3xl font-semibold">{merchant.name["zh-CN"]}</h1>
          {merchant.verificationLevels.map((level) => (
            <Badge key={level} tone="accent">
              {VERIFICATION_LABELS[level]}
            </Badge>
          ))}
          {merchant.supportsPlatformGuarantee && <Badge tone="success">支持平台担保</Badge>}
        </div>

        <div className="text-ink-muted flex flex-wrap items-center gap-4 text-sm">
          <span>{merchant.city}</span>
          <span className="flex items-center gap-1">
            <Star aria-hidden="true" className="text-warning-900 h-3.5 w-3.5 fill-current" />
            {merchant.ratingAverage.toFixed(1)}（{merchant.ratingCount} 条评价）
          </span>
          <span>发货地：{merchant.shippingOrigin}</span>
        </div>

        <p className="text-ink-muted max-w-3xl text-sm leading-7">
          {merchant.introduction["zh-CN"]}
        </p>

        <div className="text-ink flex flex-col gap-1 text-sm">
          {merchant.contactPhone && <p>联系电话：{merchant.contactPhone}</p>}
          {merchant.contactEmail && <p>邮箱：{merchant.contactEmail}</p>}
          {merchant.wechatId && <p>微信号：{merchant.wechatId}</p>}
        </div>

        <div className="border-line bg-surface-muted text-ink-muted rounded-xs border p-4 text-sm">
          <span className="text-ink font-medium">售后规则：</span>
          {merchant.afterSalesPolicy["zh-CN"]}
        </div>

        <ReportDialog reportedType="merchant" reportedLabel="该商家" />
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink font-serif text-xl font-semibold">在售商品</h2>
        {productsWithTags.length === 0 ? (
          <EmptyState title="暂无在售商品" description="该商家的商品正在整理上架中。" />
        ) : (
          <Grid columns="4">
            {productsWithTags.map(({ product, tags }) => (
              <ProductCard key={product.id} product={product} tags={tags} />
            ))}
          </Grid>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-ink font-serif text-xl font-semibold">用户评价</h2>
        {reviews.length === 0 ? (
          <EmptyState title="暂无评价" description="成为第一个评价该商家的用户。" />
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((review) => (
              <div key={review.id} className="border-line rounded-xs border p-4">
                <div className="flex items-center gap-2">
                  {review.verification === "verified_purchase" && (
                    <Badge tone="success">已验证购买</Badge>
                  )}
                  <span className="text-ink-faint text-xs">{"★".repeat(review.rating)}</span>
                </div>
                <p className="text-ink-muted mt-2 text-sm">{review.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </PageContainer>
  );
}
