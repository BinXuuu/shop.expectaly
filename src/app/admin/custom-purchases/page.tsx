import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { customPurchaseRepository, profileRepository } from "@/lib/repositories";
import type { CustomPurchaseRequestStatus } from "@/types";

export const metadata: Metadata = { title: "代购需求" };

const STATUS_LABELS: Record<CustomPurchaseRequestStatus, string> = {
  open: "征集中",
  matched: "已匹配商家",
  closed: "已完成",
  cancelled: "已取消",
};

const STATUS_TONES: Record<CustomPurchaseRequestStatus, BadgeTone> = {
  open: "accent",
  matched: "success",
  closed: "muted",
  cancelled: "muted",
};

export default async function AdminCustomPurchasesPage() {
  const [requestsResult, profilesResult] = await Promise.all([
    customPurchaseRepository.findAll(),
    profileRepository.findAll(),
  ]);
  const requests = requestsResult.ok
    ? [...requestsResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const userNameById = new Map(
    (profilesResult.ok ? profilesResult.data : []).map((p) => [p.id, p.displayName]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">代购需求</h1>
        <p className="text-ink-muted mt-1 text-sm">
          全平台代购需求只读视图，共 {requests.length} 条。
        </p>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="暂无代购需求" description="演示数据为空。" />
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((request) => (
            <div key={request.id} className="border-line rounded-xs border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink text-sm font-medium">{request.productName}</span>
                <Badge tone={STATUS_TONES[request.status]}>{STATUS_LABELS[request.status]}</Badge>
              </div>
              {request.note && <p className="text-ink-muted mt-2 text-sm">{request.note}</p>}
              <div className="text-ink-faint mt-2 flex flex-wrap gap-4 text-xs">
                <span>提交用户：{userNameById.get(request.userId) ?? "—"}</span>
                <span>数量：{request.quantity}</span>
                <span>收货城市：{request.shippingCity}</span>
                <span>提交时间：{new Date(request.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
