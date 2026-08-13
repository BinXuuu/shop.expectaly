import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { buttonClasses } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { customPurchaseRepository } from "@/lib/repositories";
import type { CustomPurchaseRequestStatus } from "@/types";

export const metadata: Metadata = { title: "代购申请", robots: { index: false, follow: false } };

const STATUS_LABELS: Record<CustomPurchaseRequestStatus, string> = {
  open: "征集中",
  matched: "已匹配商家",
  closed: "已完成",
  cancelled: "已取消",
};

const STATUS_TONES: Record<CustomPurchaseRequestStatus, BadgeTone> = {
  open: "accent",
  matched: "success",
  closed: "neutral",
  cancelled: "muted",
};

export default async function AccountCustomPurchasesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const result = await customPurchaseRepository.findByUser(profile.id);
  const requests = result.ok
    ? [...result.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-ink font-serif text-2xl font-semibold">代购申请</h1>
          <p className="text-ink-muted mt-1 text-sm">你提交的自定义代购需求与匹配进度。</p>
        </div>
        <Link href="/custom-purchase" className={buttonClasses("secondary", "sm")}>
          提交新需求
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          title="暂无代购申请"
          description="没有找到心仪的商品？提交一个自定义代购需求试试。"
        />
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
