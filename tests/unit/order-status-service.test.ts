import { describe, expect, it } from "vitest";
import {
  assertOrderTransition,
  canTransitionOrderStatus,
} from "@/lib/services/order-status-service";

describe("order status service", () => {
  it("allows valid self-negotiated transitions", () => {
    expect(canTransitionOrderStatus("self_negotiated", "contacted_merchant", "negotiating")).toBe(
      true,
    );
    expect(
      canTransitionOrderStatus("self_negotiated", "agreed_with_merchant", "user_marked_completed"),
    ).toBe(true);
  });

  it("rejects invalid self-negotiated transitions (cannot skip backwards from terminal state)", () => {
    expect(
      canTransitionOrderStatus("self_negotiated", "user_marked_completed", "negotiating"),
    ).toBe(false);
    expect(canTransitionOrderStatus("self_negotiated", "cancelled", "contacted_merchant")).toBe(
      false,
    );
  });

  it("allows valid platform order transitions along the fulfillment pipeline", () => {
    expect(canTransitionOrderStatus("platform", "paid", "sourcing_in_italy")).toBe(true);
    expect(
      canTransitionOrderStatus("platform", "international_shipping", "customs_clearance"),
    ).toBe(true);
  });

  it("rejects skipping stages in the platform fulfillment pipeline", () => {
    expect(canTransitionOrderStatus("platform", "submitted", "completed")).toBe(false);
  });

  it("rejects cross-kind transitions (self_negotiated status is not valid for platform orders)", () => {
    expect(canTransitionOrderStatus("platform", "contacted_merchant", "negotiating")).toBe(false);
  });

  it("assertOrderTransition throws AppError CONFLICT on invalid transition", () => {
    expect(() => assertOrderTransition("platform", "cancelled", "paid")).toThrowError(/无法从/);
  });
});
