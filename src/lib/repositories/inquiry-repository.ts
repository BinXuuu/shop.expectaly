import type { Inquiry, InquiryMessage, MerchantQuote, Result } from "@/types";
import { ok } from "@/types";
import { mockInquiries, mockInquiryMessages, mockMerchantQuotes } from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<Inquiry>(() => mockInquiries);

export const inquiryRepository = {
  ...base,

  async findByUser(userId: string): Promise<Result<Inquiry[]>> {
    return ok(mockInquiries.filter((i) => i.userId === userId && !i.deletedAt));
  },

  async findByMerchant(merchantId: string): Promise<Result<Inquiry[]>> {
    return ok(mockInquiries.filter((i) => i.merchantId === merchantId && !i.deletedAt));
  },

  async getMessages(inquiryId: string): Promise<Result<InquiryMessage[]>> {
    return ok(
      mockInquiryMessages
        .filter((m) => m.inquiryId === inquiryId && !m.deletedAt)
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    );
  },

  async getQuotes(inquiryId: string): Promise<Result<MerchantQuote[]>> {
    return ok(mockMerchantQuotes.filter((q) => q.inquiryId === inquiryId && !q.deletedAt));
  },
};
