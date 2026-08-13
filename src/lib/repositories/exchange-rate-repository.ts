import type { Currency, ExchangeRate, Result } from "@/types";
import { err, ok } from "@/types";
import { AppError, toAppErrorShape } from "@/lib/errors/app-error";
import { mockExchangeRates } from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const exchangeRateRepository = {
  ...createInMemoryRepository<ExchangeRate>(() => mockExchangeRates),

  async findActiveRate(
    baseCurrency: Currency,
    quoteCurrency: Currency,
  ): Promise<Result<ExchangeRate>> {
    try {
      const found = mockExchangeRates.find(
        (r) =>
          r.baseCurrency === baseCurrency &&
          r.quoteCurrency === quoteCurrency &&
          r.isActive &&
          !r.deletedAt,
      );
      if (!found) {
        return err(
          AppError.notFound(`未找到 ${baseCurrency} -> ${quoteCurrency} 的可用汇率`).toShape(),
        );
      }
      return ok(found);
    } catch (error) {
      return err(toAppErrorShape(error));
    }
  },
};
