import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import {
  merchantReviewRepository,
  productRepository,
  productReviewRepository,
} from "@/lib/repositories";

export const metadata: Metadata = { title: "评价管理" };

export default async function MerchantReviewsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const [productsResult, merchantReviewsResult] = await Promise.all([
    productRepository.findByMerchant(merchant.id),
    merchantReviewRepository.findByMerchant(merchant.id),
  ]);

  const products = productsResult.ok ? productsResult.data : [];
  const productReviewLists = await Promise.all(
    products.map(async (product) => {
      const reviewsResult = await productReviewRepository.findByProduct(product.id);
      return { product, reviews: reviewsResult.ok ? reviewsResult.data : [] };
    }),
  );
  const productReviews = productReviewLists.flatMap(({ product, reviews }) =>
    reviews.map((review) => ({ review, productName: product.name["zh-CN"] })),
  );

  const merchantReviews = merchantReviewsResult.ok ? merchantReviewsResult.data : [];

  const hasAny = productReviews.length > 0 || merchantReviews.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">评价管理</h1>
        <p className="text-ink-muted mt-1 text-sm">查看用户对你商品与店铺的评价。</p>
      </div>

      {!hasAny ? (
        <EmptyState title="暂无评价" description="用户完成交易后可能会留下评价，会展示在这里。" />
      ) : (
        <div className="flex flex-col gap-6">
          {productReviews.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">商品评价</h2>
              {productReviews.map(({ review, productName }) => (
                <div key={review.id} className="border-line rounded-xs border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-ink text-sm font-medium">{productName}</span>
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

          {merchantReviews.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">店铺评价</h2>
              {merchantReviews.map((review) => (
                <div key={review.id} className="border-line rounded-xs border p-4">
                  <div className="flex items-center gap-2">
                    {review.verification === "verified_purchase" && (
                      <Badge tone="success">已验证购买</Badge>
                    )}
                    <span className="text-ink-faint text-xs">{"★".repeat(review.rating)}</span>
                  </div>
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
