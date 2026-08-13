/**
 * 演示数据：法律与政策文本。全部为待法律顾问审核的模板，不构成正式法律意见。
 */
import type { LegalDocument, LegalDocumentSlug } from "@/types";

const base = {
  createdAt: "2026-05-01T09:00:00+02:00",
  updatedAt: "2026-05-01T09:00:00+02:00",
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  version: "0.1.0-draft",
  effectiveAt: "2026-05-01T00:00:00+02:00",
  isPendingLegalReview: true,
} as const;

const titles: Record<LegalDocumentSlug, string> = {
  "user-agreement": "用户协议",
  "privacy-policy": "隐私政策",
  "cookie-policy": "Cookie 政策",
  "merchant-agreement": "商家入驻协议",
  "self-negotiated-disclaimer": "自主交易免责声明",
  "platform-transaction-rules": "平台交易规则",
  "product-listing-guidelines": "商品发布规范",
  "ip-complaint-policy": "知识产权投诉政策",
  "restricted-products-policy": "受限制商品政策",
  "minor-protection-notice": "未成年人保护说明",
  "after-sales-dispute-rules": "售后及纠纷处理规则",
};

const slugs = Object.keys(titles) as LegalDocumentSlug[];

export const mockLegalDocuments: LegalDocument[] = slugs.map((slug) => ({
  id: `legal-${slug}`,
  slug,
  title: { "zh-CN": titles[slug] },
  body: {
    "zh-CN": `本文档为「${titles[slug]}」的初始模板内容，仅用于第一期开发演示，尚未经过法律顾问审核，不构成正式法律意见。正式发布前需由法务团队审阅并替换为最终文本。`,
  },
  ...base,
}));
