import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { getManagedMerchant } from "@/lib/services/merchant-context";
import { groupBuyRepository, productRepository } from "@/lib/repositories";
import type { GroupBuyStatus } from "@/types";

export const metadata: Metadata = { title: "拼单管理" };

const STATUS_LABELS: Record<GroupBuyStatus, string> = {
  open: "进行中",
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

export default async function MerchantGroupBuysPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  const merchant = await getManagedMerchant(profile.id);
  if (!merchant) return null;

  const groupBuysResult = await groupBuyRepository.findAll();
  const groupBuys = groupBuysResult.ok
    ? groupBuysResult.data.filter((g) => g.merchantId === merchant.id)
    : [];

  const details = await Promise.all(
    groupBuys.map(async (groupBuy) => {
      const productResult = await productRepository.findById(groupBuy.productId);
      const membersResult = await groupBuyRepository.getMembers(groupBuy.id);
      return {
        groupBuy,
        product: productResult.ok ? productResult.data : null,
        memberCount: membersResult.ok ? membersResult.data.length : 0,
      };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">拼单管理</h1>
        <p className="text-ink-muted mt-1 text-sm">达到目标数量后成团，可统一安排采购与发货。</p>
      </div>

      {details.length === 0 ? (
        <EmptyState
          title="暂无拼单"
          description="在商品发布时开启「加入拼单」交易方式后可在此管理。"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {details.map(({ groupBuy, product, memberCount }) => (
            <div key={groupBuy.id} className="border-line rounded-xs border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink text-sm font-medium">
                  {product?.name["zh-CN"] ?? "商品信息不可用"}
                </span>
                <Badge tone={STATUS_TONES[groupBuy.status]}>{STATUS_LABELS[groupBuy.status]}</Badge>
              </div>
              <p className="text-ink-muted mt-2 text-sm">
                进度：{groupBuy.currentQuantity} / {groupBuy.targetQuantity}（{memberCount} 人参与）
              </p>
              <p className="text-ink-faint mt-1 text-xs">
                截止时间：{new Date(groupBuy.endsAt).toLocaleDateString("zh-CN")}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
