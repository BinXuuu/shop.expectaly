import type { Metadata } from "next";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { orderRepository, productRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "数据统计" };

export default async function MerchantAnalyticsPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const [productsResult, ordersResult] = await Promise.all([
    productRepository.findByMerchant(merchant.id),
    orderRepository.findByMerchant(merchant.id),
  ]);

  const products = productsResult.ok ? productsResult.data : [];
  const orders = ordersResult.ok ? ordersResult.data : [];

  const totalViews = products.reduce((sum, p) => sum + p.viewCount, 0);
  const totalFavorites = products.reduce((sum, p) => sum + p.favoriteCount, 0);
  const completedOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "user_marked_completed",
  ).length;

  const maxViews = Math.max(...products.map((p) => p.viewCount), 1);

  const stats = [
    { label: "商品浏览总量", value: totalViews },
    { label: "商品收藏总量", value: totalFavorites },
    { label: "累计订单数", value: orders.length },
    { label: "已完成交易", value: completedOrders },
    { label: "店铺评分", value: merchant.ratingAverage.toFixed(1) },
    { label: "评价数量", value: merchant.ratingCount },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">数据统计</h1>
        <p className="text-ink-muted mt-1 text-sm">
          了解店铺整体表现，第一期为基础统计数字，图表化展示留待后续迭代。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="border-line rounded-xs border p-4">
            <p className="text-ink font-serif text-2xl font-semibold">{stat.value}</p>
            <p className="text-ink-muted mt-1 text-xs">{stat.label}</p>
          </div>
        ))}
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-ink text-sm font-semibold">商品浏览量排行</h2>
        <div className="flex flex-col gap-2">
          {[...products]
            .sort((a, b) => b.viewCount - a.viewCount)
            .slice(0, 6)
            .map((product) => (
              <div key={product.id} className="flex items-center gap-3">
                <span className="text-ink-muted w-32 shrink-0 truncate text-xs">
                  {product.name["zh-CN"]}
                </span>
                <div className="bg-surface-muted h-2 flex-1 rounded-xs">
                  <div
                    className="bg-brand-700 h-2 rounded-xs"
                    style={{ width: `${Math.max((product.viewCount / maxViews) * 100, 4)}%` }}
                  />
                </div>
                <span className="text-ink-faint w-10 shrink-0 text-right text-xs">
                  {product.viewCount}
                </span>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
