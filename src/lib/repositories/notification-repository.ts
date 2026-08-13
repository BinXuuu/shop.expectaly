import type { Notification, Result } from "@/types";
import { ok } from "@/types";
import { mockNotifications } from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const notificationRepository = {
  ...createInMemoryRepository<Notification>(() => mockNotifications),

  async findByUser(userId: string): Promise<Result<Notification[]>> {
    return ok(
      mockNotifications
        .filter((n) => n.userId === userId && !n.deletedAt)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    );
  },

  async countUnread(userId: string): Promise<Result<number>> {
    return ok(
      mockNotifications.filter((n) => n.userId === userId && !n.isRead && !n.deletedAt).length,
    );
  },
};
