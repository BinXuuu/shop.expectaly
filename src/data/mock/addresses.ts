/**
 * 演示数据：用户收货地址簿。
 */
import type { Address } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
  country: "中国",
} as const;

export const mockAddresses: Address[] = [
  {
    id: "address-1",
    userId: "profile-user-zhangming",
    recipientName: "张明",
    phone: "+86 138 0000 1001",
    province: "上海市",
    city: "上海市",
    district: "静安区",
    detail: "南京西路 1266 号",
    postalCode: "200040",
    isDefault: true,
    label: "家",
    createdAt: "2026-05-02T10:00:00+08:00",
    updatedAt: "2026-05-02T10:00:00+08:00",
    ...base,
  },
];
