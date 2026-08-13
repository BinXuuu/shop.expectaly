import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { merchantRepository } from "@/lib/repositories";
import type { MerchantStoreStatus } from "@/types";

export const metadata: Metadata = { title: "商家管理" };

const STATUS_LABELS: Record<MerchantStoreStatus, string> = {
  active: "正常营业",
  paused: "暂停营业",
  suspended: "已暂停",
  banned: "已封禁",
};

const STATUS_TONES: Record<MerchantStoreStatus, BadgeTone> = {
  active: "success",
  paused: "warning",
  suspended: "warning",
  banned: "danger",
};

export default async function AdminMerchantsPage() {
  const merchantsResult = await merchantRepository.findAll();
  const merchants = merchantsResult.ok ? merchantsResult.data : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">商家管理</h1>
        <p className="text-ink-muted mt-1 text-sm">共 {merchants.length} 个认证商家。</p>
      </div>

      {merchants.length === 0 ? (
        <EmptyState title="暂无商家数据" description="演示数据为空。" />
      ) : (
        <div className="border-line overflow-x-auto rounded-xs border">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface-muted text-ink-muted text-xs">
              <tr>
                <th className="px-4 py-3 font-medium">商家</th>
                <th className="px-4 py-3 font-medium">所在城市</th>
                <th className="px-4 py-3 font-medium">状态</th>
                <th className="px-4 py-3 font-medium">评分</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="border-line border-t">
                  <td className="text-ink px-4 py-3 font-medium">{merchant.name["zh-CN"]}</td>
                  <td className="text-ink-muted px-4 py-3">{merchant.city}</td>
                  <td className="px-4 py-3">
                    <Badge tone={STATUS_TONES[merchant.storeStatus]}>
                      {STATUS_LABELS[merchant.storeStatus]}
                    </Badge>
                  </td>
                  <td className="text-ink-muted px-4 py-3">
                    {merchant.ratingAverage.toFixed(1)}（{merchant.ratingCount}）
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/merchants/${merchant.slug}`}
                      className="focus-ring text-brand-700 text-xs underline"
                    >
                      查看店铺主页
                    </Link>
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
