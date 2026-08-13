import type { AuditLog, Result } from "@/types";
import { ok } from "@/types";
import { mockAuditLogs } from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const auditLogRepository = {
  ...createInMemoryRepository<AuditLog>(() => mockAuditLogs),

  async findRecent(limit: number): Promise<Result<AuditLog[]>> {
    return ok(
      [...mockAuditLogs].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)).slice(0, limit),
    );
  },
};
