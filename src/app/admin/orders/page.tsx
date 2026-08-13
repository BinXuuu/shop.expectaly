import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { merchantRepository, orderRepository, profileRepository } from "@/lib/repositories";
import { getOrderStatusLabel, getOrderStatusTone } from "@/lib/services/order-view";

export const metadata: Metadata = { title: "订单管理" };

export default async function AdminOrdersPage() {
  const [ordersResult, profilesResult, merchantsResult] = await Promise.all([
    orderRepository.findAll(),
    profileRepository.findAll(),
    merchantRepository.findAll(),
  ]);
  const orders = ordersResult.ok
    ? [...ordersResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const userNameById = new Map(
    (profilesResult.ok ? profilesResult.data : []).map((p) => [p.id, p.displayName]),
  );
  const merchantNameById = new Map(
    (merchantsResult.ok ? merchantsResult.data : []).map((m) => [m.id, m.name["zh-CN"]]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">订单管理</h1>
        <p className="text-ink-muted mt-1 text-sm">全平台订单只读视图，共 {orders.length} 条。</p>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="暂无订单数据" description="演示数据为空。" />
      ) : (
        <div className="border-line overflow-x-auto rounded-xs border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">用户</th>
                <th className="px-4 py-3 font-medium">商家</th>
                <th className="px-4 py-3 font-medium">类型</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">下单时间</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-line border-t">
                  <td className="text-ink px-4 py-3 font-medium">
                    {userNameById.get(order.userId) ?? "—"}
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {order.merchantId
                      ? (merchantNameById.get(order.merchantId) ?? "—")
                      : "平台自营"}
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {order.orderKind === "self_negotiated" ? "自主交易" : "平台订单"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={getOrderStatusTone(order.status)}>
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </td>
                  <td className="text-ink-faint px-4 py-3 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("zh-CN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
