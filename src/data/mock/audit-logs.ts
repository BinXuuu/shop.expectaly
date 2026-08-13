/**
 * 演示数据：平台后台与商家后台的敏感操作审计轨迹。
 */
import type { AuditLog } from "@/types";

const base = {
  deletedAt: null,
  createdBy: null,
  updatedBy: null,
} as const;

export const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-1",
    actorId: "profile-merchant-reviewer",
    actorRole: "merchant_reviewer",
    action: "merchant_application.approve",
    targetType: "merchant_application",
    targetId: "merchant-app-milano-atelier",
    metadata: { reviewNote: "资料齐全，企业资质已核实" },
    occurredAt: "2026-05-04T09:00:00+02:00",
    createdAt: "2026-05-04T09:00:00+02:00",
    updatedAt: "2026-05-04T09:00:00+02:00",
    ...base,
  },
  {
    id: "audit-2",
    actorId: "profile-merchant-reviewer",
    actorRole: "merchant_reviewer",
    action: "merchant_application.request_changes",
    targetType: "merchant_application",
    targetId: "merchant-app-chenxi-pending",
    metadata: { reviewNote: "请补充采购能力证明与更清晰的售后规则说明" },
    occurredAt: "2026-07-15T09:00:00+02:00",
    createdAt: "2026-07-15T09:00:00+02:00",
    updatedAt: "2026-07-15T09:00:00+02:00",
    ...base,
  },
  {
    id: "audit-3",
    actorId: "profile-customer-service",
    actorRole: "customer_service",
    action: "report.mark_investigating",
    targetType: "report",
    targetId: "report-1",
    metadata: { category: "false_information" },
    occurredAt: "2026-07-06T10:00:00+02:00",
    createdAt: "2026-07-06T10:00:00+02:00",
    updatedAt: "2026-07-06T10:00:00+02:00",
    ...base,
  },
  {
    id: "audit-4",
    actorId: "profile-super-admin",
    actorRole: "super_admin",
    action: "role.grant",
    targetType: "user",
    targetId: "profile-admin",
    metadata: { role: "admin" },
    occurredAt: "2026-05-01T09:00:00+08:00",
    createdAt: "2026-05-01T09:00:00+08:00",
    updatedAt: "2026-05-01T09:00:00+08:00",
    ...base,
  },
  {
    id: "audit-5",
    actorId: "profile-platform-operator",
    actorRole: "platform_operator",
    action: "exchange_rate.update",
    targetType: "exchange_rate",
    targetId: "rate-eur-cny",
    metadata: { rate: 7.85 },
    occurredAt: "2026-07-20T08:00:00+02:00",
    createdAt: "2026-07-20T08:00:00+02:00",
    updatedAt: "2026-07-20T08:00:00+02:00",
    ...base,
  },
];
