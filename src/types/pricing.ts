import type { BaseEntity, Currency, ID } from "./common";

/**
 * 对应数据库实体 exchange_rates。
 * 第一期使用后台可配置的模拟/手动汇率，为未来接入汇率 API 预留 lib/services/pricing-service.ts 适配层。
 */
export interface ExchangeRate extends BaseEntity {
  baseCurrency: Currency;
  quoteCurrency: Currency;
  rate: number;
  source: "manual" | "external_api";
  effectiveAt: string;
  isActive: boolean;
}

/**
 * 对应数据库实体 price_snapshots：下单/询价/报价时刻的价格快照，
 * 防止后续汇率或商品价格变动影响历史订单展示。
 */
export interface PriceSnapshot extends BaseEntity {
  productId: ID;
  variantId: ID | null;
  originalPrice: number;
  originalCurrency: Currency;
  cnyReferencePrice: number | null;
  eurReferencePrice: number | null;
  exchangeRateId: ID | null;
  capturedAt: string;
  context: "cart" | "inquiry" | "order" | "quote";
}
