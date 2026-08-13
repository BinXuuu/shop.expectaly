import type { Currency, ProductPricing } from "@/types";
import { EXCHANGE_RATE_DISCLAIMER, formatMoney } from "@/lib/services/pricing-service";
import { cn } from "@/lib/utils/cn";

export interface PriceProps {
  pricing: ProductPricing;
  className?: string;
  showDisclaimer?: boolean;
}

function resolveAmount(currency: Currency, pricing: ProductPricing): number | null {
  if (pricing.originalCurrency === currency) return pricing.originalPrice;
  if (currency === "CNY") return pricing.cnyReferencePrice;
  if (currency === "EUR") return pricing.eurReferencePrice;
  return null;
}

/**
 * 商品价格展示组件：根据商家选择的 displayMode 渲染欧元/人民币价格、
 * 参考价换算说明或询价引导，不得让用户误以为参考价是最终成交价。
 */
export function Price({ pricing, className, showDisclaimer = true }: PriceProps) {
  if (pricing.displayMode === "inquiry_only") {
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <span className="text-ink font-serif text-lg font-semibold">价格详询</span>
        <span className="text-ink-muted text-xs">未展示固定价格，请发起人工询价</span>
      </div>
    );
  }

  if (pricing.displayMode === "reference_only") {
    const referenceAmount = resolveAmount("CNY", pricing) ?? resolveAmount("EUR", pricing);
    const referenceCurrency: Currency = resolveAmount("CNY", pricing) !== null ? "CNY" : "EUR";
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <div className="flex items-baseline gap-1.5">
          <span className="text-ink-muted text-xs">参考价格</span>
          <span className="text-ink font-serif text-lg font-semibold">
            {referenceAmount !== null
              ? formatMoney({ amount: referenceAmount, currency: referenceCurrency })
              : "—"}
          </span>
        </div>
        {showDisclaimer && (
          <span className="text-ink-faint text-[11px]">{EXCHANGE_RATE_DISCLAIMER}</span>
        )}
      </div>
    );
  }

  if (pricing.displayMode === "cny_only" || pricing.displayMode === "eur_only") {
    const currency: Currency = pricing.displayMode === "cny_only" ? "CNY" : "EUR";
    const amount = resolveAmount(currency, pricing);
    const isConverted = pricing.originalCurrency !== currency;
    return (
      <div className={cn("flex flex-col gap-0.5", className)}>
        <span className="text-ink font-serif text-lg font-semibold">
          {amount !== null ? formatMoney({ amount, currency }) : "—"}
        </span>
        {isConverted && showDisclaimer && (
          <span className="text-ink-faint text-[11px]">{EXCHANGE_RATE_DISCLAIMER}</span>
        )}
      </div>
    );
  }

  // displayMode === "both"：原始货币为主，另一币种作为参考副标
  const secondaryCurrency: Currency = pricing.originalCurrency === "EUR" ? "CNY" : "EUR";
  const secondaryAmount = resolveAmount(secondaryCurrency, pricing);

  return (
    <div className={cn("flex flex-col gap-0.5", className)}>
      <span className="text-ink font-serif text-lg font-semibold">
        {formatMoney({ amount: pricing.originalPrice, currency: pricing.originalCurrency })}
      </span>
      {secondaryAmount !== null && (
        <span className="text-ink-muted text-xs">
          约 {formatMoney({ amount: secondaryAmount, currency: secondaryCurrency })}
        </span>
      )}
      {secondaryAmount !== null && showDisclaimer && (
        <span className="text-ink-faint text-[11px]">{EXCHANGE_RATE_DISCLAIMER}</span>
      )}
    </div>
  );
}
