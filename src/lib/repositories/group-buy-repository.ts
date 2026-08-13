import type { GroupBuy, GroupBuyMember, Preorder, Result } from "@/types";
import { ok } from "@/types";
import { mockGroupBuyMembers, mockGroupBuys, mockPreorders } from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const groupBuyRepository = {
  ...createInMemoryRepository<GroupBuy>(() => mockGroupBuys),

  async findOpenByProduct(productId: string): Promise<Result<GroupBuy | null>> {
    return ok(
      mockGroupBuys.find((g) => g.productId === productId && g.status === "open" && !g.deletedAt) ??
        null,
    );
  },

  async getMembers(groupBuyId: string): Promise<Result<GroupBuyMember[]>> {
    return ok(mockGroupBuyMembers.filter((m) => m.groupBuyId === groupBuyId && !m.deletedAt));
  },
};

export const preorderRepository = {
  ...createInMemoryRepository<Preorder>(() => mockPreorders),

  async findByUser(userId: string): Promise<Result<Preorder[]>> {
    return ok(mockPreorders.filter((p) => p.userId === userId && !p.deletedAt));
  },

  async findByMerchant(merchantId: string): Promise<Result<Preorder[]>> {
    return ok(mockPreorders.filter((p) => p.merchantId === merchantId && !p.deletedAt));
  },
};
