import { describe, expect, it } from "vitest";
import { getCartSummary } from "@/lib/services/cart-service";

describe("cart service", () => {
  it("groups cart items by merchant and never merges different merchants into one group", async () => {
    const result = await getCartSummary("profile-user-zhangming");
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    const merchantIds = result.data.groups.map((g) => g.merchantId);
    expect(new Set(merchantIds).size).toBe(merchantIds.length);
    for (const group of result.data.groups) {
      for (const line of group.lines) {
        expect(line.product.merchantId).toBe(group.merchantId);
      }
    }
  });

  it("returns an empty summary for a user without a cart", async () => {
    const result = await getCartSummary("profile-user-with-no-cart");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.groups).toEqual([]);
      expect(result.data.totalQuantity).toBe(0);
    }
  });
});
