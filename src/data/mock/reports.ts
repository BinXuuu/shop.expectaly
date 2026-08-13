/**
 * 演示数据：举报记录。
 */
import type { Report } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

export const mockReports: Report[] = [
  {
    id: "report-1",
    reportedType: "review",
    reportedId: "review-product-2",
    reporterId: "profile-user-chenxi",
    category: "false_information",
    description: "怀疑该评价并非真实购买体验，描述与商品实际规格不符。",
    status: "investigating",
    handledBy: "profile-customer-service",
    handledAt: null,
    resolutionNote: null,
    createdAt: "2026-07-05T10:00:00+02:00",
    updatedAt: "2026-07-06T10:00:00+02:00",
    ...base,
  },
  {
    id: "report-2",
    reportedType: "product",
    reportedId: "product-ferrari-f40-model",
    reporterId: "profile-user-zhangming",
    category: "restricted_product",
    description: "怀疑该车模为高仿复刻件，并非官方限量编号版本，建议核实采购凭证。",
    status: "pending",
    handledBy: null,
    handledAt: null,
    resolutionNote: null,
    createdAt: "2026-07-19T09:00:00+08:00",
    updatedAt: "2026-07-19T09:00:00+08:00",
    ...base,
  },
];
