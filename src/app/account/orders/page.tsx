import Link from "next/link";
import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import {
  groupBuyRepository,
  orderRepository,
  preorderRepository,
  productRepository,
} from "@/lib/repositories";
import { getOrderStatusLabel, getOrderStatusTone } from "@/lib/services/order-view";
import type { GroupBuyStatus, PreorderStatus } from "@/types";

export const metadata: Metadata = { title: "我的订单", robots: { index: false, follow: false } };

const ORDER_KIND_LABELS = { platform: "平台订单", self_negotiated: "商家自主交易" } as const;

const GROUP_BUY_STATUS_LABELS: Record<GroupBuyStatus, string> = {
  open: "拼单进行中",
  succeeded: "已成团",
  failed: "未成团",
  cancelled: "已取消",
};

const GROUP_BUY_STATUS_TONES: Record<GroupBuyStatus, BadgeTone> = {
  open: "accent",
  succeeded: "success",
  failed: "muted",
  cancelled: "muted",
};

const PREORDER_STATUS_LABELS: Record<PreorderStatus, string> = {
  pending: "待确认",
  confirmed: "已确认",
  fulfilled: "已交付",
  cancelled: "已取消",
};

const PREORDER_STATUS_TONES: Record<PreorderStatus, BadgeTone> = {
  pending: "warning",
  confirmed: "accent",
  fulfilled: "success",
  cancelled: "muted",
};

export default async function AccountOrdersPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const [ordersResult, preordersResult] = await Promise.all([
    orderRepository.findByUser(profile.id),
    preorderRepository.findByUser(profile.id),
  ]);

  const orders = ordersResult.ok
    ? [...ordersResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  // 拼单没有直接的「按用户查」仓库方法，这里通过全部拼单 + 成员关系筛选出当前用户参与的记录
  const allGroupBuysResult = await groupBuyRepository.findAll();
  const allGroupBuys = allGroupBuysResult.ok ? allGroupBuysResult.data : [];
  const myGroupBuyEntries = (
    await Promise.all(
      allGroupBuys.map(async (groupBuy) => {
        const membersResult = await groupBuyRepository.getMembers(groupBuy.id);
        const myMembership = membersResult.ok
          ? membersResult.data.find((m) => m.userId === profile.id)
          : undefined;
        if (!myMembership) return null;
        const productResult = await productRepository.findById(groupBuy.productId);
        return {
          groupBuy,
          membership: myMembership,
          product: productResult.ok ? productResult.data : null,
        };
      }),
    )
  ).filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const preorders = preordersResult.ok ? preordersResult.data : [];
  const preorderEntries = await Promise.all(
    preorders.map(async (preorder) => {
      const productResult = await productRepository.findById(preorder.productId);
      return { preorder, product: productResult.ok ? productResult.data : null };
    }),
  );

  const hasAny = orders.length > 0 || myGroupBuyEntries.length > 0 || preorderEntries.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">我的订单</h1>
        <p className="text-ink-muted mt-1 text-sm">
          区分「平台订单」「商家自主交易」「拼单」与「预订」——自主交易由你与商家自行协商，平台不参与付款与售后责任。
        </p>
      </div>

      {!hasAny ? (
        <EmptyState title="暂无订单" description="去发现页看看有没有心仪的商品吧。" />
      ) : (
        <>
          {orders.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">订单</h2>
              <div className="flex flex-col gap-3">
                {orders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/account/orders/${order.id}`}
                    className="focus-ring border-line hover:border-brand-200 block rounded-xs border p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-ink text-sm font-medium">{order.orderNumber}</span>
                        <Badge tone={order.orderKind === "platform" ? "accent" : "neutral"}>
                          {ORDER_KIND_LABELS[order.orderKind]}
                        </Badge>
                      </div>
                      <Badge tone={getOrderStatusTone(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="text-ink-muted mt-3 flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span>
                        金额：{order.totalAmount} {order.currency}
                      </span>
                      <span>创建时间：{new Date(order.createdAt).toLocaleDateString("zh-CN")}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {myGroupBuyEntries.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">我参与的拼单</h2>
              <div className="flex flex-col gap-3">
                {myGroupBuyEntries.map(({ groupBuy, membership, product }) => (
                  <div key={groupBuy.id} className="border-line rounded-xs border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-ink text-sm font-medium">
                        {product?.name["zh-CN"] ?? "商品信息不可用"}
                      </span>
                      <Badge tone={GROUP_BUY_STATUS_TONES[groupBuy.status]}>
                        {GROUP_BUY_STATUS_LABELS[groupBuy.status]}
                      </Badge>
                    </div>
                    <p className="text-ink-muted mt-2 text-sm">
                      我参与数量：{membership.quantity} · 拼单进度：{groupBuy.currentQuantity} /{" "}
                      {groupBuy.targetQuantity}
                    </p>
                    <p className="text-ink-faint mt-1 text-xs">
                      截止时间：{new Date(groupBuy.endsAt).toLocaleDateString("zh-CN")}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {preorderEntries.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-ink text-sm font-semibold">我的预订</h2>
              <div className="flex flex-col gap-3">
                {preorderEntries.map(({ preorder, product }) => (
                  <div key={preorder.id} className="border-line rounded-xs border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-ink text-sm font-medium">
                        {product?.name["zh-CN"] ?? "商品信息不可用"}
                      </span>
                      <Badge tone={PREORDER_STATUS_TONES[preorder.status]}>
                        {PREORDER_STATUS_LABELS[preorder.status]}
                      </Badge>
                    </div>
                    <p className="text-ink-muted mt-2 text-sm">数量：{preorder.quantity}</p>
                    {preorder.expectedArrivalAt && (
                      <p className="text-ink-faint mt-1 text-xs">
                        预计到货：{new Date(preorder.expectedArrivalAt).toLocaleDateString("zh-CN")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
