/**
 * 演示数据：汇率。第一期使用后台可配置的模拟/手动汇率，
 * 换算结果均为参考值，最终价格以商家或平台确认结果为准。
 */
import type { ExchangeRate } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  source: "manual",
  isActive: true,
} as const;

export const mockExchangeRates: ExchangeRate[] = [
  {
    id: "rate-eur-cny",
    baseCurrency: "EUR",
    quoteCurrency: "CNY",
    rate: 7.85,
    effectiveAt: "2026-07-20T00:00:00+02:00",
    createdAt: "2026-07-20T08:00:00+02:00",
    updatedAt: "2026-07-20T08:00:00+02:00",
    ...base,
  },
  {
    id: "rate-cny-eur",
    baseCurrency: "CNY",
    quoteCurrency: "EUR",
    rate: 0.1274,
    effectiveAt: "2026-07-20T00:00:00+02:00",
    createdAt: "2026-07-20T08:00:00+02:00",
    updatedAt: "2026-07-20T08:00:00+02:00",
    ...base,
  },
  {
    id: "rate-eur-usd",
    baseCurrency: "EUR",
    quoteCurrency: "USD",
    rate: 1.09,
    effectiveAt: "2026-07-20T00:00:00+02:00",
    createdAt: "2026-07-20T08:00:00+02:00",
    updatedAt: "2026-07-20T08:00:00+02:00",
    ...base,
  },
];

export const EXCHANGE_RATE_DISCLAIMER = "参考汇率换算，最终价格以商家或平台确认结果为准。";
