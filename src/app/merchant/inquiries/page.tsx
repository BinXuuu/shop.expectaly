import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { InquiryReplyDialog } from "@/components/merchant";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { inquiryRepository, productRepository } from "@/lib/repositories";
import type { InquiryStatus } from "@/types";

export const metadata: Metadata = { title: "询价管理" };

const STATUS_LABELS: Record<InquiryStatus, string> = {
  pending_merchant_reply: "待回复",
  quoted: "已报价",
  viewed_by_user: "用户已查看",
  negotiating: "协商中",
  agreed: "已达成",
  cancelled: "已取消",
  expired: "已过期",
};

const STATUS_TONES: Record<InquiryStatus, BadgeTone> = {
  pending_merchant_reply: "warning",
  quoted: "accent",
  viewed_by_user: "accent",
  negotiating: "accent",
  agreed: "success",
  cancelled: "muted",
  expired: "muted",
};

export default async function MerchantInquiriesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const inquiriesResult = await inquiryRepository.findByMerchant(merchant.id);
  const inquiries = inquiriesResult.ok
    ? [...inquiriesResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const details = await Promise.all(
    inquiries.map(async (inquiry) => {
      const productResult = await productRepository.findById(inquiry.productId);
      return { inquiry, product: productResult.ok ? productResult.data : null };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">询价管理</h1>
        <p className="text-ink-muted mt-1 text-sm">及时回复用户询价有助于提升成交率与店铺评分。</p>
      </div>

      {details.length === 0 ? (
        <EmptyState title="暂无询价" description="有用户对你的商品发起询价时会显示在这里。" />
      ) : (
        <div className="flex flex-col gap-3">
          {details.map(({ inquiry, product }) => (
            <div key={inquiry.id} className="border-line rounded-xs border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink text-sm font-medium">
                  {product?.name["zh-CN"] ?? "商品信息不可用"}
                </span>
                <Badge tone={STATUS_TONES[inquiry.status]}>{STATUS_LABELS[inquiry.status]}</Badge>
              </div>
              <p className="text-ink-muted mt-2 text-sm">{inquiry.message}</p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink-faint text-xs">
                  数量 {inquiry.quantity} ·{" "}
                  {new Date(inquiry.createdAt).toLocaleDateString("zh-CN")}
                </span>
                {inquiry.status === "pending_merchant_reply" && (
                  <InquiryReplyDialog
                    inquiryId={inquiry.id}
                    productName={product?.name["zh-CN"] ?? ""}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
