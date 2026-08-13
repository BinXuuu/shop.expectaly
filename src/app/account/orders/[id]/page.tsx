import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { OrderStatusHistoryList } from "@/components/account/OrderStatusHistoryList";
import { PurchaseProgressTimeline } from "@/components/account/PurchaseProgressTimeline";
import { getCurrentProfile } from "@/lib/auth/session";
import { getOrderStatusLabel, getOrderStatusTone } from "@/lib/services/order-view";
import { orderRepository, productRepository } from "@/lib/repositories";

export const metadata: Metadata = { title: "订单详情", robots: { index: false, follow: false } };

const ORDER_KIND_LABELS = { platform: "平台订单", self_negotiated: "商家自主交易" } as const;

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function AccountOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const orderResult = await orderRepository.findById(id);
  if (!orderResult.ok || orderResult.data.userId !== profile.id) {
    notFound();
  }
  const order = orderResult.data;

  const [itemsResult, historyResult, progressResult] = await Promise.all([
    orderRepository.getItems(order.id),
    orderRepository.getStatusHistory(order.id),
    orderRepository.getPurchaseProgress(order.id),
  ]);

  const items = itemsResult.ok ? itemsResult.data : [];
  const history = historyResult.ok ? historyResult.data : [];
  const progress = progressResult.ok ? progressResult.data : [];

  const itemsWithProduct = await Promise.all(
    items.map(async (item) => {
      const productResult = await productRepository.findById(item.productId);
      return { item, product: productResult.ok ? productResult.data : null };
    }),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/account/orders" className="text-ink-muted hover:text-ink text-xs">
          ← 返回我的订单
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <h1 className="text-ink font-serif text-2xl font-semibold">{order.orderNumber}</h1>
          <Badge tone={order.orderKind === "platform" ? "accent" : "neutral"}>
            {ORDER_KIND_LABELS[order.orderKind]}
          </Badge>
          <Badge tone={getOrderStatusTone(order.status)}>{getOrderStatusLabel(order.status)}</Badge>
        </div>
      </div>

      {order.orderKind === "self_negotiated" && (
        <div className="border-warning-200 bg-warning-50 text-ink-muted rounded-xs border p-4 text-sm">
          该订单为自主交易记录，由你与商家自行协商完成，平台不参与付款、发货和售后责任。
        </div>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-ink text-sm font-semibold">商品明细</h2>
        <div className="flex flex-col gap-2">
          {itemsWithProduct.map(({ item, product }) => (
            <div
              key={item.id}
              className="border-line flex flex-wrap items-center justify-between gap-2 rounded-xs border p-4"
            >
              {product ? (
                <Link
                  href={`/products/${product.slug}`}
                  className="text-ink hover:text-brand-700 text-sm"
                >
                  {item.productNameSnapshot}
                </Link>
              ) : (
                <span className="text-ink text-sm">{item.productNameSnapshot}</span>
              )}
              <span className="text-ink-muted text-sm">
                {item.quantity} × {item.unitPrice} {item.currency}
              </span>
            </div>
          ))}
        </div>
        <div className="text-ink flex justify-end text-sm">
          合计：{order.totalAmount} {order.currency}
        </div>
      </section>

      {order.orderKind === "platform" && progress.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-ink text-sm font-semibold">代购进度</h2>
          <PurchaseProgressTimeline entries={progress} />
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-ink text-sm font-semibold">状态记录</h2>
        <OrderStatusHistoryList entries={history} />
      </section>
    </div>
  );
}
