/**
 * 演示数据：自定义代购需求。
 */
import type { CustomPurchaseRequest } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

export const mockCustomPurchaseRequests: CustomPurchaseRequest[] = [
  {
    id: "custom-purchase-1",
    userId: "profile-user-chenxi",
    productName: "Buccellati 风格纯银餐勺（同款或类似款）",
    brandName: null,
    referenceUrl: null,
    referenceImageUrls: ["/images/placeholder/custom-purchase/silver-spoon-ref.svg"],
    expectedSpec: "单柄纯银，长度约 18cm",
    budgetAmount: 300,
    budgetCurrency: "EUR",
    quantity: 2,
    shippingCity: "上海",
    expectedByDate: "2026-09-01T00:00:00+02:00",
    acceptsSimilarAlternatives: true,
    prefersPlatformTransaction: false,
    visibility: "all_verified_merchants",
    visibleMerchantIds: [],
    note: "希望能找到手工錾刻纹样的款式",
    status: "open",
    createdAt: "2026-07-12T10:00:00+02:00",
    updatedAt: "2026-07-12T10:00:00+02:00",
    ...base,
  },
];
