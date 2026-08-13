import type { Metadata } from "next";
import { EmptyState } from "@/components/shared";
import { Badge } from "@/components/ui/Badge";
import { ApplicationReviewDialog } from "@/components/admin/ApplicationReviewDialog";
import { merchantRepository, productRepository, systemSettingRepository } from "@/lib/repositories";
import { getProductStatusLabel, getProductStatusTone } from "@/lib/services/product-view";
import { findRiskKeywordMatches, parseRiskKeywords } from "@/lib/services/compliance-service";

export const metadata: Metadata = { title: "商品审核" };

export default async function AdminProductReviewsPage() {
  const [pendingResult, merchantsResult, riskKeywordsResult] = await Promise.all([
    productRepository.findPendingReview(),
    merchantRepository.findAll(),
    systemSettingRepository.findByKey("risk_keywords"),
  ]);
  const pendingProducts = pendingResult.ok ? pendingResult.data : [];
  const merchantNameById = new Map(
    (merchantsResult.ok ? merchantsResult.data : []).map((m) => [m.id, m.name["zh-CN"]]),
  );
  const riskKeywords =
    riskKeywordsResult.ok && riskKeywordsResult.data
      ? parseRiskKeywords(riskKeywordsResult.data.value)
      : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-ink font-serif text-2xl font-semibold">商品审核</h1>
        <p className="text-ink-muted mt-1 text-sm">
          共 {pendingProducts.length} 件商品待审核（待审核 +
          需修改）。商品发布前须经此流程通过后才会在商品发现页公开展示。
        </p>
      </div>

      {pendingProducts.length === 0 ? (
        <EmptyState title="当前没有待审核商品" description="所有商品均已完成审核。" />
      ) : (
        <div className="flex flex-col gap-3">
          {pendingProducts.map((product) => {
            const riskMatches = findRiskKeywordMatches(
              `${product.summary?.["zh-CN"] ?? ""} ${product.story?.["zh-CN"] ?? ""}`,
              riskKeywords,
            );
            return (
              <div
                key={product.id}
                className="border-line flex flex-wrap items-start justify-between gap-3 rounded-xs border p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-ink text-sm font-medium">{product.name["zh-CN"]}</span>
                    <Badge tone={getProductStatusTone(product.status)}>
                      {getProductStatusLabel(product.status)}
                    </Badge>
                    {product.compliance.ageRestricted && <Badge tone="warning">受限制商品</Badge>}
                    {riskMatches.length > 0 && (
                      <Badge tone="danger">命中风险关键词：{riskMatches.join("、")}</Badge>
                    )}
                  </div>
                  <p className="text-ink-muted mt-1 text-xs">
                    {product.publisherType === "platform"
                      ? "平台自营"
                      : (product.merchantId && merchantNameById.get(product.merchantId)) ||
                        "未知商家"}
                    {" · "}
                    {product.sourceCity}
                  </p>
                  {product.summary && (
                    <p className="text-ink-muted mt-2 max-w-xl text-xs leading-6">
                      {product.summary["zh-CN"]}
                    </p>
                  )}
                </div>
                <ApplicationReviewDialog title="商品审核" subject={product.name["zh-CN"]} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
