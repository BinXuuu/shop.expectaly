/**
 * 演示数据：商品与商家评价。仅平台确认订单才标记为「已验证购买」。
 */
import type { MerchantReview, ProductReview } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  isHidden: false,
} as const;

export const mockProductReviews: ProductReview[] = [
  {
    id: "review-product-1",
    productId: "product-favilli-enamel-earrings",
    userId: "profile-user-zhangming",
    orderId: "order-self-negotiated-1",
    rating: 5,
    title: "配色比预期更好看",
    body: "颜色比图片看到的更有层次，商家沟通也很及时，推荐。",
    imageUrls: [],
    verification: "verified_purchase",
    merchantReply: "谢谢喜欢，我们会持续带来新配色～",
    merchantRepliedAt: "2026-06-20T10:00:00+02:00",
    createdAt: "2026-06-18T10:00:00+02:00",
    updatedAt: "2026-06-20T10:00:00+02:00",
    ...base,
  },
  {
    id: "review-product-2",
    productId: "product-ferrari-f40-model",
    userId: "profile-user-zhangming",
    orderId: null,
    rating: 5,
    title: "细节还原度很高",
    body: "开合车门和内饰细节都很到位，摩德纳车库的验货视频也让人很放心。",
    imageUrls: [],
    verification: "unverified_experience",
    merchantReply: null,
    merchantRepliedAt: null,
    createdAt: "2026-06-25T10:00:00+02:00",
    updatedAt: "2026-06-25T10:00:00+02:00",
    ...base,
  },
  {
    id: "review-product-3",
    productId: "product-leather-keychain",
    userId: "profile-user-chenxi",
    orderId: null,
    rating: 4,
    title: "皮质不错",
    body: "植鞣革手感很好，包浆需要时间，期待越用越好看。",
    imageUrls: [],
    verification: "unverified_experience",
    merchantReply: null,
    merchantRepliedAt: null,
    createdAt: "2026-05-20T10:00:00+02:00",
    updatedAt: "2026-05-20T10:00:00+02:00",
    ...base,
  },
];

export const mockMerchantReviews: MerchantReview[] = [
  {
    id: "review-merchant-1",
    merchantId: "merchant-modena-collectors-garage",
    userId: "profile-user-zhangming",
    orderId: null,
    rating: 5,
    body: "沟通专业，验货视频很详细，对藏家非常友好。",
    verification: "unverified_experience",
    createdAt: "2026-06-26T10:00:00+02:00",
    updatedAt: "2026-06-26T10:00:00+02:00",
    ...base,
  },
  {
    id: "review-merchant-2",
    merchantId: "merchant-milano-atelier-store",
    userId: "profile-user-chenxi",
    orderId: "order-self-negotiated-1",
    rating: 5,
    body: "回复很快，商品与描述一致。",
    verification: "verified_purchase",
    createdAt: "2026-06-21T10:00:00+02:00",
    updatedAt: "2026-06-21T10:00:00+02:00",
    ...base,
  },
];
