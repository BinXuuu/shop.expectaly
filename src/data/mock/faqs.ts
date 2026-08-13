/**
 * 演示数据：常见问题。
 */
import type { Faq } from "@/types";

const base = {
  createdAt: "2026-05-01T09:00:00+02:00",
  updatedAt: "2026-05-01T09:00:00+02:00",
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  isVisible: true,
} as const;

export const mockFaqs: Faq[] = [
  {
    id: "faq-what-is-platform",
    category: "平台介绍",
    question: { "zh-CN": "「意料之中～意购」是一个什么样的平台？" },
    answer: {
      "zh-CN":
        "我们是意大利小众品牌、本地买手与代购资源的集合平台，同时也是平台自营商品的展示渠道。商品可能来自入驻商家自主发布，也可能是平台自营。",
    },
    sortOrder: 1,
    ...base,
  },
  {
    id: "faq-transaction-mode",
    category: "交易方式",
    question: { "zh-CN": "在平台下单是否等于平台担保交易？" },
    answer: {
      "zh-CN":
        "不一定。多数商品目前为「自主交易」，由用户与商家自行协商，平台不参与付款、发货和售后责任。仅少数标注支持平台担保的商品会在后续逐步开放平台交易。",
    },
    sortOrder: 2,
    ...base,
  },
  {
    id: "faq-payment-status",
    category: "支付说明",
    question: { "zh-CN": "为什么商品详情页没有「立即购买」按钮？" },
    answer: {
      "zh-CN":
        "平台担保交易正在逐步开放，当前请根据页面说明联系商家或提交询价，暂不支持站内直接付款下单。",
    },
    sortOrder: 3,
    ...base,
  },
  {
    id: "faq-merchant-apply",
    category: "商家入驻",
    question: { "zh-CN": "如何申请成为入驻商家？" },
    answer: {
      "zh-CN":
        "在「商家入驻」页面提交资料后，平台商家审核员将在数个工作日内完成资料审核，审核通过后即可发布商品。",
    },
    sortOrder: 4,
    ...base,
  },
  {
    id: "faq-price-reference",
    category: "价格说明",
    question: { "zh-CN": "人民币参考价格是如何计算的？" },
    answer: {
      "zh-CN":
        "人民币参考价格按平台后台配置的参考汇率换算，仅供参考，最终价格以商家或平台确认结果为准。",
    },
    sortOrder: 5,
    ...base,
  },
  {
    id: "faq-restricted-products",
    category: "受限制商品",
    question: { "zh-CN": "为什么有些商品需要先确认年龄？" },
    answer: {
      "zh-CN":
        "雪茄等受限制商品分类需要先确认已达到所在地区法定年龄才能查看联系方式或发起交易，平台不向未成年人销售此类商品。",
    },
    sortOrder: 6,
    ...base,
  },
];
