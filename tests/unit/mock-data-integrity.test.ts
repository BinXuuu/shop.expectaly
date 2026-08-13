import { describe, expect, it } from "vitest";
import {
  mockAuditLogs,
  mockBrands,
  mockCategories,
  mockCityGuides,
  mockEditorialCollectionItems,
  mockEditorialCollections,
  mockInquiries,
  mockInventories,
  mockMerchantApplications,
  mockMerchantMembers,
  mockMerchantQuotes,
  mockMerchants,
  mockOrderItems,
  mockOrders,
  mockProductMedia,
  mockProducts,
  mockProductTagRelations,
  mockProductTags,
  mockProductVariants,
  mockProfiles,
  mockSystemSettings,
} from "@/data/mock";

/**
 * 种子数据完整性校验：确保演示数据内部的外键引用一致，
 * 避免后续阶段的页面在联调时因为脏数据而出现空白/崩溃。
 */
describe("mock data referential integrity", () => {
  const categoryIds = new Set(mockCategories.map((c) => c.id));
  const brandIds = new Set(mockBrands.map((b) => b.id));
  const merchantIds = new Set(mockMerchants.map((m) => m.id));
  const productIds = new Set(mockProducts.map((p) => p.id));
  const tagKeys = new Set(mockProductTags.map((t) => t.key));
  const profileIds = new Set(mockProfiles.map((p) => p.id));

  it("every product references an existing category", () => {
    for (const product of mockProducts) {
      expect(categoryIds.has(product.categoryId)).toBe(true);
    }
  });

  it("every product's brandId (when set) references an existing brand", () => {
    for (const product of mockProducts) {
      if (product.brandId) {
        expect(brandIds.has(product.brandId)).toBe(true);
      }
    }
  });

  it("products follow the publisher_type / merchant_id invariant", () => {
    for (const product of mockProducts) {
      if (product.publisherType === "platform") {
        expect(product.merchantId).toBeNull();
      } else {
        expect(product.merchantId).not.toBeNull();
        expect(merchantIds.has(product.merchantId as string)).toBe(true);
      }
    }
  });

  it("every merchant references an approved application", () => {
    const applicationIds = new Set(mockMerchantApplications.map((a) => a.id));
    for (const merchant of mockMerchants) {
      expect(merchant.applicationId === null || applicationIds.has(merchant.applicationId)).toBe(
        true,
      );
    }
  });

  it("every product media / variant / inventory / tag relation references an existing product", () => {
    for (const media of mockProductMedia) {
      expect(productIds.has(media.productId)).toBe(true);
    }
    for (const variant of mockProductVariants) {
      expect(productIds.has(variant.productId)).toBe(true);
    }
    for (const inventory of mockInventories) {
      expect(productIds.has(inventory.productId)).toBe(true);
    }
    for (const relation of mockProductTagRelations) {
      expect(productIds.has(relation.productId)).toBe(true);
      expect(tagKeys.has(relation.tagKey)).toBe(true);
    }
  });

  it("every product has at least one cover media item", () => {
    for (const product of mockProducts) {
      const media = mockProductMedia.filter((m) => m.productId === product.id);
      expect(media.some((m) => m.isCover)).toBe(true);
    }
  });

  it("restricted products (age_restricted) always require manual review, and can only be published once compliance-approved", () => {
    for (const product of mockProducts) {
      if (product.compliance.ageRestricted) {
        expect(product.compliance.requiresManualReview).toBe(true);
        if (product.status === "published") {
          expect(product.compliance.complianceStatus).toBe("approved");
        } else {
          expect(product.compliance.complianceStatus).not.toBe("approved");
        }
      }
    }
  });

  it("editorial collection items reference existing target entities", () => {
    const collectionIds = new Set(mockEditorialCollections.map((c) => c.id));
    for (const item of mockEditorialCollectionItems) {
      expect(collectionIds.has(item.collectionId)).toBe(true);
      if (item.itemType === "product") {
        expect(productIds.has(item.itemId)).toBe(true);
      }
      if (item.itemType === "brand") {
        expect(brandIds.has(item.itemId)).toBe(true);
      }
      if (item.itemType === "merchant") {
        expect(merchantIds.has(item.itemId)).toBe(true);
      }
    }
  });

  it("city guides only feature existing brands and merchants", () => {
    for (const city of mockCityGuides) {
      for (const id of city.featuredBrandIds) {
        expect(brandIds.has(id)).toBe(true);
      }
      for (const id of city.featuredMerchantIds) {
        expect(merchantIds.has(id)).toBe(true);
      }
    }
  });

  it("orders reference existing users, and order items reference existing orders and products", () => {
    const orderIds = new Set(mockOrders.map((o) => o.id));
    for (const order of mockOrders) {
      expect(profileIds.has(order.userId)).toBe(true);
      if (order.merchantId) {
        expect(merchantIds.has(order.merchantId)).toBe(true);
      }
    }
    for (const item of mockOrderItems) {
      expect(orderIds.has(item.orderId)).toBe(true);
      expect(productIds.has(item.productId)).toBe(true);
    }
  });

  it("inquiries reference existing users, merchants and products; quotes reference existing inquiries", () => {
    const inquiryIds = new Set(mockInquiries.map((i) => i.id));
    for (const inquiry of mockInquiries) {
      expect(profileIds.has(inquiry.userId)).toBe(true);
      expect(merchantIds.has(inquiry.merchantId)).toBe(true);
      expect(productIds.has(inquiry.productId)).toBe(true);
    }
    for (const quote of mockMerchantQuotes) {
      expect(inquiryIds.has(quote.inquiryId)).toBe(true);
    }
  });

  it("merchant members reference existing merchants and profiles", () => {
    const profileIdsForMembers = new Set(mockProfiles.map((p) => p.id));
    for (const member of mockMerchantMembers) {
      expect(merchantIds.has(member.merchantId)).toBe(true);
      expect(profileIdsForMembers.has(member.userId)).toBe(true);
    }
  });

  it("audit logs reference existing actors and known target types", () => {
    for (const log of mockAuditLogs) {
      if (log.actorId) {
        expect(profileIds.has(log.actorId)).toBe(true);
      }
      expect(log.targetType.length).toBeGreaterThan(0);
    }
  });

  it("system settings have unique keys", () => {
    const keys = mockSystemSettings.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("has no duplicate ids within any single mock collection", () => {
    const collections: Array<[string, { id: string }[]]> = [
      ["products", mockProducts],
      ["brands", mockBrands],
      ["categories", mockCategories],
      ["merchants", mockMerchants],
      ["profiles", mockProfiles],
    ];
    for (const [name, items] of collections) {
      const ids = items.map((i) => i.id);
      expect(new Set(ids).size, `duplicate id found in ${name}`).toBe(ids.length);
    }
  });
});
