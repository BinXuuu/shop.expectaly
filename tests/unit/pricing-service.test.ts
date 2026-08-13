import { describe, expect, it } from "vitest";
import { convertAmount } from "@/lib/services/pricing-service";

describe("pricing service", () => {
  it("returns the same money object when currencies match", async () => {
    const result = await convertAmount({ amount: 100, currency: "EUR" }, "EUR");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ amount: 100, currency: "EUR" });
    }
  });

  it("converts EUR to CNY using the active mock exchange rate", async () => {
    const result = await convertAmount({ amount: 100, currency: "EUR" }, "CNY");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.currency).toBe("CNY");
      // mock rate: 7.85
      expect(result.data.amount).toBeCloseTo(785, 1);
    }
  });

  it("returns a NOT_FOUND error when no active rate exists for the pair", async () => {
    // USD -> CNY 未在 mock 数据中配置
    const result = await convertAmount({ amount: 50, currency: "USD" }, "CNY");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });
});
