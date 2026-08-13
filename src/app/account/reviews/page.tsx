import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  merchantRepository,
  merchantReviewRepository,
  productRepository,
  productReviewRepository,
} from "@/lib/repositories";

export const metadata: Metadata = { title: "我的评价", robots: { index: false, follow: false } };

export default async function AccountReviewsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [productReviewsRes, merchantReviewsRes] = await Promise.all([
    productReviewRepository.findByUser(profile.id),
    merchantReviewRepository.findByUser(profile.id),
  ]);

  const productReviews = productReviewsRes.ok ? productReviewsRes.data : [];
  const merchantReviews = merchantReviewsRes.ok ? merchantReviewsRes.data : [];

  const productReviewDetails = await Promise.all(
    productReviews.map(async (review) => {
      const productRes = await productRepository.findById(review.productId);
      return { review, product: productRes.ok ? productRes.data : null };
    }),
  );

  const merchantReviewDetails = await Promise.all(
    merchantReviews.map(async (review) => {
      const merchantRes = await merchantRepository.findById(review.merchantId);
      return { review, merchant: merchantRes.ok ? merchantRes.data : null };
    }),
  );

  const hasAny = productReviewDetails.length > 0 || merchantReviewDetails.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">我的评价</h1>
        <p className="text-ink-muted mt-1 text-sm">只有平台确认的订单才会标记为「已验证购买」。</p>
      </div>

      {!hasAny ? (
        <EmptyState title="暂无评价" description="完成交易后可以在商品或商家页面留下你的评价。" />
      ) : (
        <div className="flex flex-col gap-6">
          {productReviewDetails.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">商品评价</h2>
              {productReviewDetails.map(({ review, product }) => (
                <div key={review.id} className="border-line rounded-xs border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {product ? (
                      <Link
                        href={`/products/${product.slug}`}
                        className="text-ink hover:text-brand-700 text-sm font-medium"
                      >
                        {product.name["zh-CN"]}
                      </Link>
                    ) : (
                      <span className="text-ink text-sm font-medium">商品信息不可用</span>
                    )}
                    {review.verification === "verified_purchase" && (
                      <Badge tone="success">已验证购买</Badge>
                    )}
                  </div>
                  <span className="text-ink-faint mt-1 block text-xs">
                    {"★".repeat(review.rating)}
                  </span>
                  <p className="text-ink-muted mt-1 text-sm">{review.body}</p>
                </div>
              ))}
            </section>
          )}

          {merchantReviewDetails.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">商家评价</h2>
              {merchantReviewDetails.map(({ review, merchant }) => (
                <div key={review.id} className="border-line rounded-xs border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    {merchant ? (
                      <Link
                        href={`/merchants/${merchant.slug}`}
                        className="text-ink hover:text-brand-700 text-sm font-medium"
                      >
                        {merchant.name["zh-CN"]}
                      </Link>
                    ) : (
                      <span className="text-ink text-sm font-medium">商家信息不可用</span>
                    )}
                    {review.verification === "verified_purchase" && (
                      <Badge tone="success">已验证购买</Badge>
                    )}
                  </div>
                  <span className="text-ink-faint mt-1 block text-xs">
                    {"★".repeat(review.rating)}
                  </span>
                  <p className="text-ink-muted mt-1 text-sm">{review.body}</p>
                </div>
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
