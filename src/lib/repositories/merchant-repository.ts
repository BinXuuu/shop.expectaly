import type {
  Merchant,
  MerchantApplication,
  MerchantApplicationStatus,
  MerchantMember,
  Result,
} from "@/types";
import { ok } from "@/types";
import { mockMerchantApplications, mockMerchantMembers, mockMerchants } from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<Merchant>(() => mockMerchants);
const applicationBase = createInMemoryRepository<MerchantApplication>(
  () => mockMerchantApplications,
);

export const merchantRepository = {
  ...base,

  async findBySlug(slug: string): Promise<Result<Merchant | null>> {
    return ok(mockMerchants.find((m) => m.slug === slug && !m.deletedAt) ?? null);
  },

  async findActive(): Promise<Result<Merchant[]>> {
    return ok(mockMerchants.filter((m) => m.storeStatus === "active" && !m.deletedAt));
  },
};

export const merchantApplicationRepository = {
  ...applicationBase,

  async findByApplicant(applicantUserId: string): Promise<Result<MerchantApplication[]>> {
    return ok(mockMerchantApplications.filter((a) => a.applicantUserId === applicantUserId));
  },

  async findByStatus(status: MerchantApplicationStatus): Promise<Result<MerchantApplication[]>> {
    return ok(mockMerchantApplications.filter((a) => a.status === status));
  },
};

export const merchantMemberRepository = {
  ...createInMemoryRepository<MerchantMember>(() => mockMerchantMembers),

  async findByUser(userId: string): Promise<Result<MerchantMember[]>> {
    return ok(mockMerchantMembers.filter((m) => m.userId === userId && !m.deletedAt));
  },

  async findByMerchant(merchantId: string): Promise<Result<MerchantMember[]>> {
    return ok(mockMerchantMembers.filter((m) => m.merchantId === merchantId && !m.deletedAt));
  },
};
