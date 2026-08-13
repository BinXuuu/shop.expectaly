import type { Metadata } from "next";
import { PageContainer, EmptyState } from "@/components/shared";
import { MerchantCard } from "@/components/merchant";
import { merchantRepository } from "@/lib/repositories";

export const metadata: Metadata = {
  title: "商家",
  description: "认证商家与本地买手档案，均经过平台商家审核员人工审核。",
  alternates: { canonical: "/merchants" },
};

export default async function MerchantsPage() {
  const merchantsResult = await merchantRepository.findActive();
  const merchants = merchantsResult.ok
    ? [...merchantsResult.data].sort((a, b) => b.ratingAverage - a.ratingAverage)
    : [];

  return (
    <PageContainer className="flex flex-col gap-8 py-10">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">商家</h1>
        <p className="text-ink-muted mt-2 max-w-2xl text-sm">
          均为通过平台商家审核员人工审核的入驻商家与本地买手，交易方式以各商家页面说明为准。
        </p>
      </div>
      {merchants.length === 0 ? (
        <EmptyState title="暂无商家" description="商家信息正在整理中，敬请期待。" />
      ) : (
        <div className="flex flex-col gap-3">
          {merchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      )}
    </PageContainer>
  );
}
