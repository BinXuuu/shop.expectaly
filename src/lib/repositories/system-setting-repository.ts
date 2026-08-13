import type { Result, SystemSetting } from "@/types";
import { ok } from "@/types";
import { mockSystemSettings } from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const systemSettingRepository = {
  ...createInMemoryRepository<SystemSetting>(() => mockSystemSettings),

  async findByKey(key: string): Promise<Result<SystemSetting | null>> {
    return ok(mockSystemSettings.find((s) => s.key === key && !s.deletedAt) ?? null);
  },
};
