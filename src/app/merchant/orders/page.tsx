import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { getOrderStatusLabel, getOrderStatusTone } from "@/lib/services/order-view";
import { orderRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "订单管理" };

const ORDER_KIND_LABELS = { platform: "平台订单", self_negotiated: "商家自主交易" } as const;

export default async function MerchantOrdersPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const ordersResult = await orderRepository.findByMerchant(merchant.id);
  const orders = ordersResult.ok
    ? [...ordersResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">订单管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          自主交易订单由你与用户自行协商完成，平台不参与付款、发货与售后责任。
        </p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="暂无订单" description="用户下单或达成自主交易后会显示在这里。" />
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <div key={order.id} className="border-line rounded-xs border p-4">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
