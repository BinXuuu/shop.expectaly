import type { CustomPurchaseRequest, Result } from "@/types";
import { ok } from "@/types";
import { mockCustomPurchaseRequests } from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<CustomPurchaseRequest>(() => mockCustomPurchaseRequests);

export const customPurchaseRepository = {
  ...base,

  async findByUser(userId: string): Promise<Result<CustomPurchaseRequest[]>> {
    return ok(mockCustomPurchaseRequests.filter((r) => r.userId === userId && !r.deletedAt));
  },

  async findVisibleToMerchant(merchantId: string): Promise<Result<CustomPurchaseRequest[]>> {
    return ok(
      mockCustomPurchaseRequests.filter(
        (r) =>
          !r.deletedAt &&
          r.status === "open" &&
          (r.visibility === "all_verified_merchants" ||
            (r.visibility === "specific_merchants" && r.visibleMerchantIds.includes(merchantId))),
      ),
    );
  },
};
