import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import {
  inquiryRepository,
  merchantRepository,
  productRepository,
  profileRepository,
} from "@/lib/repositories";
import { getInquiryStatusLabel, getInquiryStatusTone } from "@/lib/services/inquiry-view";

export const metadata: Metadata = { title: "询价管理" };

export default async function AdminInquiriesPage() {
  const [inquiriesResult, profilesResult, merchantsResult, productsResult] = await Promise.all([
    inquiryRepository.findAll(),
    profileRepository.findAll(),
    merchantRepository.findAll(),
    productRepository.findAll(),
  ]);
  const inquiries = inquiriesResult.ok
    ? [...inquiriesResult.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    : [];
  const userNameById = new Map(
    (profilesResult.ok ? profilesResult.data : []).map((p) => [p.id, p.displayName]),
  );
  const merchantNameById = new Map(
    (merchantsResult.ok ? merchantsResult.data : []).map((m) => [m.id, m.name["zh-CN"]]),
  );
  const productNameById = new Map(
    (productsResult.ok ? productsResult.data : []).map((p) => [p.id, p.name["zh-CN"]]),
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">询价管理</h1>
        <p className="text-ink-muted mt-1 text-sm">
          全平台询价只读视图，共 {inquiries.length} 条。
        </p>
      </div>

      {inquiries.length === 0 ? (
        <EmptyState title="暂无询价数据" description="演示数据为空。" />
      ) : (
        <div className="flex flex-col gap-3">
          {inquiries.map((inquiry) => (
            <div key={inquiry.id} className="border-line rounded-xs border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-ink text-sm font-medium">
                  {productNameById.get(inquiry.productId) ?? "商品信息不可用"}
                </span>
                <Badge tone={getInquiryStatusTone(inquiry.status)}>
                  {getInquiryStatusLabel(inquiry.status)}
                </Badge>
              </div>
              <div className="text-ink-faint mt-2 flex flex-wrap gap-4 text-xs">
                <span>用户：{userNameById.get(inquiry.userId) ?? "—"}</span>
                <span>商家：{merchantNameById.get(inquiry.merchantId) ?? "—"}</span>
                <span>提交时间：{new Date(inquiry.createdAt).toLocaleDateString("zh-CN")}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
