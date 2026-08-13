/**
 * 演示数据：平台说明类静态内容页（对应后台「首页内容 / 平台说明」管理）。
 */
import type { ContentPage } from "@/types";

const base = {
  createdAt: "2026-05-01T09:00:00+02:00",
  updatedAt: "2026-05-01T09:00:00+02:00",
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  status: "published",
  publishedAt: "2026-05-01T09:00:00+02:00",
} as const;

export const mockContentPages: ContentPage[] = [
  {
    id: "content-platform-intro",
    slug: "platform-intro",
    title: { "zh-CN": "平台介绍" },
    body: {
      "zh-CN":
        "「意料之中～意购」是意大利小众品牌、本地买手与代购资源的集合平台，同时承载平台自营商品的展示。我们的首要价值是资源整合与流量撮合，不强制平台抽成，也不强制用户必须在平台内付款。",
    },
    seoTitle: "平台介绍 | 意料之中～意购",
    seoDescription: "了解「意料之中～意购」的平台定位、商品来源与交易方式。",
    ...base,
  },
  {
    id: "content-how-it-works",
    slug: "how-it-works",
    title: { "zh-CN": "代购流程说明" },
    body: {
      "zh-CN":
        "1. 浏览商品或提交自定义代购需求；2. 与商家联系或发起人工询价；3. 双方协商价格、运费与交付方式；4. 自主交易由用户与商家自行完成，平台不参与付款与售后责任；5. 支持平台担保的商品将在功能开放后逐步接入站内交易。",
    },
    seoTitle: "代购流程说明 | 意料之中～意购",
    seoDescription: "了解如何在意料之中～意购完成询价、代购与自主交易流程。",
    ...base,
  },
  {
    id: "content-merchant-apply-intro",
    slug: "merchant-apply-intro",
    title: { "zh-CN": "商家入驻说明" },
    body: {
      "zh-CN":
        "个人买手或企业均可申请入驻。提交资料后由商家审核员进行人工审核，审核通过后可发布商品、管理店铺并接入询价与代购需求。",
    },
    seoTitle: "商家入驻说明 | 意料之中～意购",
    seoDescription: "了解商家入驻流程、所需资料与审核标准。",
    ...base,
  },
  {
    id: "content-risk-notice",
    slug: "risk-and-fees-notice",
    title: { "zh-CN": "费用与风险提示" },
    body: {
      "zh-CN":
        "商品价格可能不含运费、税费或代购服务费，具体以商品详情页标注为准。跨境代购可能受进口、税务、运输与海关政策影响，平台不鼓励规避税费或监管，请用户与商家自行遵守所在地法律法规。",
    },
    seoTitle: "费用与风险提示 | 意料之中～意购",
    seoDescription: "了解代购交易中的费用构成与潜在风险。",
    ...base,
  },
];
