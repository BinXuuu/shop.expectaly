import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { groupBuyRepository, merchantRepository, productRepository } from "@/lib/repositories";
import type { GroupBuyStatus } from "@/types";

export const metadata: Metadata = { title: "拼单管理" };

const STATUS_LABELS: Record<GroupBuyStatus, string> = {
  open: "拼团中",
  succeeded: "已成团",
  failed: "未成团",
  cancelled: "已取消",
};

const STATUS_TONES: Record<GroupBuyStatus, BadgeTone> = {
  open: "accent",
  succeeded: "success",
  failed: "muted",
  cancelled: "muted",
};

export default async function AdminGroupBuysPage() {
  const [groupBuysResult, merchantsResult, productsResult] = await Promise.all([
    groupBuyRepository.findAll(),
    merchantRepository.findAll(),
    productRepository.findAll(),
  ]);
  const groupBuys = groupBuysResult.ok
    ? [...groupBuysResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const merchantNameById = new Map(
    (merchantsResult.ok ? merchantsResult.data : []).map((m) => [m.id, m.name["zh-CN"]]),
  );
  const productNameById = new Map(
    (productsResult.ok ? productsResult.data : []).map((p) => [p.id, p.name["zh-CN"]]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">拼单管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          全平台拼单只读视图，共 {groupBuys.length} 条。
        </p>
      </div>

      {groupBuys.length === 0 ? (
        <EmptyState title="暂无拼单数据" description="演示数据为空。" />
      ) : (
        <div className="border-line overflow-x-auto rounded-xs border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">商品</th>
                <th className="px-4 py-3 font-medium">商家</th>
                <th className="px-4 py-3 font-medium">进度</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">截止时间</th>
              </tr>
            </thead>
            <tbody>
              {groupBuys.map((groupBuy) => (
                <tr key={groupBuy.id} className="border-line border-t">
                  <td className="text-ink px-4 py-3 font-medium">
                    {productNameById.get(groupBuy.productId) ?? "—"}
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {merchantNameById.get(groupBuy.merchantId) ?? "—"}
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {groupBuy.currentQuantity} / {groupBuy.targetQuantity}
                  </td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[groupBuy.status]}>
                      {STATUS_LABELS[groupBuy.status]}
                    </Badge>
                  </td>
                  <td className="text-ink-faint px-4 py-3 text-xs">
                    {new Date(groupBuy.endsAt).toLocaleDateString("zh-CN")}
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
