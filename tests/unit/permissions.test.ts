import { describe, expect, it } from "vitest";
import { can, assertPermission, isSuperAdmin } from "@/lib/permissions";
import { AppError } from "@/lib/errors/app-error";

describe("permission matrix", () => {
  it("allows guests to view public catalog resources only", () => {
    expect(can(["guest"], "product:view")).toBe(true);
    expect(can(["guest"], "cart:manage")).toBe(false);
    expect(can(["guest"], "product:create")).toBe(false);
  });

  it("allows merchants to create and manage their own products but not admin-only actions", () => {
    expect(can(["merchant"], "product:create")).toBe(true);
    expect(can(["merchant"], "product:update_own")).toBe(true);
    expect(can(["merchant"], "product:approve")).toBe(false);
    expect(can(["merchant"], "role:manage")).toBe(false);
  });

  it("allows product reviewers to approve/reject products but not manage merchants", () => {
    expect(can(["product_reviewer"], "product:approve")).toBe(true);
    expect(can(["product_reviewer"], "merchant_application:approve")).toBe(false);
  });

  it("grants admin broad management permissions but reserves role management for super_admin", () => {
    expect(can(["admin"], "product:manage")).toBe(true);
    expect(can(["admin"], "merchant:manage")).toBe(true);
    expect(can(["admin"], "role:manage")).toBe(false);
  });

  it("super_admin bypasses all permission checks", () => {
    expect(isSuperAdmin(["super_admin"])).toBe(true);
    expect(can(["super_admin"], "role:manage")).toBe(true);
    expect(can(["super_admin"], "product:manage")).toBe(true);
  });

  it("assertPermission throws AppError with PERMISSION_DENIED code when unauthorized", () => {
    expect(() => assertPermission(["user"], "product:create")).toThrowError(AppError);
    try {
      assertPermission(["user"], "product:create");
    } catch (error) {
      expect(error).toBeInstanceOf(AppError);
      expect((error as AppError).code).toBe("PERMISSION_DENIED");
    }
  });

  it("assertPermission does not throw when the role has the permission", () => {
    expect(() => assertPermission(["merchant"], "product:create")).not.toThrow();
  });
});
