import type { Order, OrderItem, OrderStatusHistory, PurchaseProgress, Result } from "@/types";
import { ok } from "@/types";
import {
  mockOrderItems,
  mockOrders,
  mockOrderStatusHistory,
  mockPurchaseProgress,
} from "@/data/mock";
import { createInMemoryRepository } from "./base";

const base = createInMemoryRepository<Order>(() => mockOrders);

export const orderRepository = {
  ...base,

  async findByUser(userId: string): Promise<Result<Order[]>> {
    return ok(mockOrders.filter((o) => o.userId === userId && !o.deletedAt));
  },

  async findByMerchant(merchantId: string): Promise<Result<Order[]>> {
    return ok(mockOrders.filter((o) => o.merchantId === merchantId && !o.deletedAt));
  },

  async getItems(orderId: string): Promise<Result<OrderItem[]>> {
    return ok(mockOrderItems.filter((i) => i.orderId === orderId && !i.deletedAt));
  },

  async getStatusHistory(orderId: string): Promise<Result<OrderStatusHistory[]>> {
    return ok(
      mockOrderStatusHistory
        .filter((h) => h.orderId === orderId)
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
    );
  },

  async getPurchaseProgress(orderId: string): Promise<Result<PurchaseProgress[]>> {
    return ok(
      mockPurchaseProgress
        .filter((p) => p.orderId === orderId)
        .sort((a, b) => a.occurredAt.localeCompare(b.occurredAt)),
    );
  },
};
