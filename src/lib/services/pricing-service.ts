import type { Currency, Money, Result } from "@/types";
import { err, ok } from "@/types";
import { exchangeRateRepository } from "@/lib/repositories";

export const EXCHANGE_RATE_DISCLAIMER = "参考汇率换算，最终价格以商家或平台确认结果为准。";

/**
 * 按后台配置的参考汇率换算金额。汇率来源见 lib/repositories/exchange-rate-repository.ts，
 * 第一期为后台可配置的模拟/手动汇率，未来可在此函数内部无缝切换为外部汇率 API 适配层。
 */
export async function convertAmount(money: Money, toCurrency: Currency): Promise<Result<Money>> {
  if (money.currency === toCurrency) {
    return ok(money);
  }

  const rateResult = await exchangeRateRepository.findActiveRate(money.currency, toCurrency);
  if (!rateResult.ok) {
    return err(rateResult.error);
  }

  return ok({
    amount: roundToCents(money.amount * rateResult.data.rate),
    currency: toCurrency,
  });
}

function roundToCents(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatMoney(money: Money, locale: string = "zh-CN"): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: money.currency }).format(
    money.amount,
  );
}
