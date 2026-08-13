import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { preorderRepository, productRepository } from "@/lib/repositories";
import type { PreorderStatus } from "@/types";

export const metadata: Metadata = { title: "预订管理" };

const STATUS_LABELS: Record<PreorderStatus, string> = {
  pending: "待确认",
  confirmed: "已确认",
  fulfilled: "已交付",
  cancelled: "已取消",
};

const STATUS_TONES: Record<PreorderStatus, BadgeTone> = {
  pending: "warning",
  confirmed: "accent",
  fulfilled: "success",
  cancelled: "muted",
};

export default async function MerchantPreordersPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const preordersResult = await preorderRepository.findByMerchant(merchant.id);
  const preorders = preordersResult.ok ? preordersResult.data : [];

  const details = await Promise.all(
    preorders.map(async (preorder) => {
      const productResult = await productRepository.findById(preorder.productId);
      return { preorder, product: productResult.ok ? productResult.data : null };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">预订管理</h1>
        <p className="text-ink-muted mt-1 text-sm">跟进预订定金与预计到货时间，及时与用户确认。</p>
      </div>

      {details.length === 0 ? (
        <EmptyState
          title="暂无预订"
          description="在商品发布时开启「加入预订」交易方式后可在此管理。"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {details.map(({ preorder, product }) => (
            <div key={preorder.id} className="border-line rounded-xs border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink text-sm font-medium">
                  {product?.name["zh-CN"] ?? "商品信息不可用"}
                </span>
                <Badge tone={STATUS_TONES[preorder.status]}>{STATUS_LABELS[preorder.status]}</Badge>
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
      )}
    </div>
  );
}
