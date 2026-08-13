import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import {
  groupBuyRepository,
  inquiryRepository,
  orderRepository,
  productRepository,
} from "@/lib/repositories";

export default async function MerchantDashboardPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const productsResult = await productRepository.findByMerchant(merchant.id);
  const products = productsResult.ok ? productsResult.data : [];
  const published = products.filter((p) => p.status === "published").length;
  const pendingReview = products.filter(
    (p) => p.status === "pending_review" || p.status === "changes_requested",
  ).length;
  const drafts = products.filter((p) => p.status === "draft").length;

  const inquiriesResult = await inquiryRepository.findByMerchant(merchant.id);
  const pendingInquiries = inquiriesResult.ok
    ? inquiriesResult.data.filter((i) => i.status === "pending_merchant_reply").length
    : 0;

  const ordersResult = await orderRepository.findByMerchant(merchant.id);
  const orders = ordersResult.ok ? ordersResult.data : [];

  const groupBuysResult = await groupBuyRepository.findAll();
  const activeGroupBuys = groupBuysResult.ok
    ? groupBuysResult.data.filter((g) => g.merchantId === merchant.id && g.status === "open").length
    : 0;

  const stats = [
    { label: "已发布商品", value: published, href: "/merchant/products" },
    { label: "待审核商品", value: pendingReview, href: "/merchant/products" },
    { label: "商品草稿", value: drafts, href: "/merchant/products" },
    { label: "待回复询价", value: pendingInquiries, href: "/merchant/inquiries" },
    { label: "订单总数", value: orders.length, href: "/merchant/orders" },
    { label: "进行中拼单", value: activeGroupBuys, href: "/merchant/group-buys" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">数据概览</h1>
        <p className="text-ink-muted mt-1 text-sm">
          {merchant.name["zh-CN"]} · 评分 {merchant.ratingAverage.toFixed(1)}（
          {merchant.ratingCount} 条评价）
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="focus-ring border-line hover:border-brand-200 flex flex-col gap-1 rounded-xs border p-4"
          >
            <span className="text-ink font-serif text-2xl font-semibold">{stat.value}</span>
            <span className="text-ink-muted text-xs">{stat.label}</span>
          </Link>
        ))}
      </div>

      <div className="border-line bg-surface-muted text-ink-muted rounded-xs border p-5 text-sm">
        提醒：新商品发布后默认进入平台审核，审核通过前不会在商品发现页公开展示。
      </div>
    </div>
  );
}
