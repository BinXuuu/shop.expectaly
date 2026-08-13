import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  customPurchaseRepository,
  inquiryRepository,
  notificationRepository,
  orderRepository,
  wishlistRepository,
} from "@/lib/repositories";

export default async function AccountOverviewPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [ordersRes, inquiriesRes, customPurchasesRes, unreadRes, wishlistRes] = await Promise.all([
    orderRepository.findByUser(profile.id),
    inquiryRepository.findByUser(profile.id),
    customPurchaseRepository.findByUser(profile.id),
    notificationRepository.countUnread(profile.id),
    wishlistRepository.findByUser(profile.id),
  ]);

  const wishlistItemsRes =
    wishlistRes.ok && wishlistRes.data
      ? await wishlistRepository.getItems(wishlistRes.data.id)
      : null;

  const stats = [
    { label: "订单", value: ordersRes.ok ? ordersRes.data.length : 0, href: "/account/orders" },
    {
      label: "询价中",
      value: inquiriesRes.ok ? inquiriesRes.data.length : 0,
      href: "/account/inquiries",
    },
    {
      label: "代购申请",
      value: customPurchasesRes.ok ? customPurchasesRes.data.length : 0,
      href: "/account/custom-purchases",
    },
    {
      label: "收藏商品",
      value: wishlistItemsRes?.ok ? wishlistItemsRes.data.length : 0,
      href: "/account/wishlist",
    },
    { label: "未读通知", value: unreadRes.ok ? unreadRes.data : 0, href: "/account/notifications" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">
          欢迎回来，{profile.displayName}
        </h1>
        <p className="text-ink-muted mt-1 text-sm">
          在这里管理你的订单、询价、代购需求与账号信息。
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
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
        提醒：多数商品为自主交易，平台不参与付款、发货和售后责任；平台担保交易正在逐步开放。详见
        <Link href="/how-it-works" className="text-brand-700 underline">
          代购流程说明
        </Link>
        。
      </div>
    </div>
  );
}
