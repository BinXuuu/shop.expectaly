/**
 * 演示数据：商家团队成员关系（用户账号 <-> 所属商家）。
 */
import type { MerchantMember } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  role: "owner",
} as const;

export const mockMerchantMembers: MerchantMember[] = [
  {
    id: "merchant-member-milano-atelier-owner",
    merchantId: "merchant-milano-atelier-store",
    userId: "profile-merchant-milano-atelier-owner",
    createdAt: "2026-05-05T09:00:00+02:00",
    updatedAt: "2026-05-05T09:00:00+02:00",
    ...base,
  },
  {
    id: "merchant-member-modena-collectors-owner",
    merchantId: "merchant-modena-collectors-garage",
    userId: "profile-merchant-modena-collectors-owner",
    createdAt: "2026-03-15T09:00:00+02:00",
    updatedAt: "2026-03-15T09:00:00+02:00",
    ...base,
  },
];
