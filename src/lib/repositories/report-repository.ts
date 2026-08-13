import type { Report, ReportStatus, Result } from "@/types";
import { ok } from "@/types";
import { mockReports } from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const reportRepository = {
  ...createInMemoryRepository<Report>(() => mockReports),

  async findByStatus(status: ReportStatus): Promise<Result<Report[]>> {
    return ok(mockReports.filter((r) => r.status === status));
  },
};
