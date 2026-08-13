import { describe, expect, it } from "vitest";
import {
  assertInquiryTransition,
  canTransitionInquiryStatus,
} from "@/lib/services/inquiry-service";

describe("inquiry service", () => {
  it("allows the standard quote -> negotiate -> agreed flow", () => {
    expect(canTransitionInquiryStatus("pending_merchant_reply", "quoted")).toBe(true);
    expect(canTransitionInquiryStatus("quoted", "viewed_by_user")).toBe(true);
    expect(canTransitionInquiryStatus("viewed_by_user", "agreed")).toBe(true);
  });

  it("allows cancellation from any active state", () => {
    expect(canTransitionInquiryStatus("pending_merchant_reply", "cancelled")).toBe(true);
    expect(canTransitionInquiryStatus("negotiating", "cancelled")).toBe(true);
  });

  it("disallows transitions out of terminal states", () => {
    expect(canTransitionInquiryStatus("agreed", "negotiating")).toBe(false);
    expect(canTransitionInquiryStatus("cancelled", "quoted")).toBe(false);
    expect(canTransitionInquiryStatus("expired", "quoted")).toBe(false);
  });

  it("assertInquiryTransition throws on invalid transitions", () => {
    expect(() => assertInquiryTransition("agreed", "quoted")).toThrow();
    expect(() => assertInquiryTransition("pending_merchant_reply", "quoted")).not.toThrow();
  });
});
