import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { getCurrentProfile } from "@/lib/auth/session";
import { inquiryRepository, merchantRepository, productRepository } from "@/lib/repositories";
import { getInquiryStatusLabel, getInquiryStatusTone } from "@/lib/services/inquiry-view";

export const metadata: Metadata = { title: "询价记录", robots: { index: false, follow: false } };

export default async function AccountInquiriesPage() {
  const profile = await getCurrentProfile();
  if (!profile) return null;

  const inquiriesResult = await inquiryRepository.findByUser(profile.id);
  const inquiries = inquiriesResult.ok
    ? [...inquiriesResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];

  const details = await Promise.all(
    inquiries.map(async (inquiry) => {
      const [productRes, merchantRes] = await Promise.all([
        productRepository.findById(inquiry.productId),
        merchantRepository.findById(inquiry.merchantId),
      ]);
      return {
        inquiry,
        product: productRes.ok ? productRes.data : null,
        merchant: merchantRes.ok ? merchantRes.data : null,
      };
    }),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">询价记录</h1>
        <p className="text-ink-muted mt-1 text-sm">
          站内记录询价过程，实际沟通也可能转到微信继续。
        </p>
      </div>

      {details.length === 0 ? (
        <EmptyState
          title="暂无询价记录"
          description="在商品详情页发起人工询价后，记录会显示在这里。"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {details.map(({ inquiry, product, merchant }) => (
            <div key={inquiry.id} className="border-line rounded-xs border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                {product ? (
                  <Link
                    href={`/products/${product.slug}`}
                    className="text-ink hover:text-brand-700 text-sm font-medium"
                  >
                    {product.name["zh-CN"]}
                  </Link>
                ) : (
                  <span className="text-ink text-sm font-medium">商品信息不可用</span>
                )}
                <Badge tone={getInquiryStatusTone(inquiry.status)}>
                  {getInquiryStatusLabel(inquiry.status)}
                </Badge>
              </div>
              <p className="text-ink-muted mt-2 text-sm">{inquiry.message}</p>
              <div className="text-ink-faint mt-2 flex flex-wrap gap-4 text-xs">
                {merchant && <span>商家：{merchant.name["zh-CN"]}</span>}
                <span>数量：{inquiry.quantity}</span>
                <span>提交时间：{new Date(inquiry.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
