import type { BaseEntity, Currency, ID, Visibility } from "./common";

export type CustomPurchaseRequestStatus = "open" | "matched" | "closed" | "cancelled";

/** 对应数据库实体 custom_purchase_requests */
export interface CustomPurchaseRequest extends BaseEntity {
  userId: ID;
  productName: string;
  brandName: string | null;
  referenceUrl: string | null;
  referenceImageUrls: string[];
  expectedSpec: string | null;
  budgetAmount: number | null;
  budgetCurrency: Currency | null;
  quantity: number;
  shippingCity: string;
  expectedByDate: string | null;
  acceptsSimilarAlternatives: boolean;
  prefersPlatformTransaction: boolean;
  visibility: Visibility;
  visibleMerchantIds: ID[]; // visibility === "specific_merchants" 时生效
  note: string | null;
  status: CustomPurchaseRequestStatus;
}
