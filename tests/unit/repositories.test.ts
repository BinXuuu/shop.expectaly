import { describe, expect, it } from "vitest";
import {
  brandRepository,
  cartRepository,
  categoryRepository,
  merchantRepository,
  productRepository,
} from "@/lib/repositories";

describe("product repository", () => {
  it("finds a published product by slug", async () => {
    const result = await productRepository.findBySlug("ferrari-f40-model");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.name["zh-CN"]).toContain("法拉利");
    }
  });

  it("returns null (not an error) for an unknown slug", async () => {
    const result = await productRepository.findBySlug("does-not-exist");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toBeNull();
    }
  });

  it("findById returns NOT_FOUND error for unknown id", async () => {
    const result = await productRepository.findById("not-a-real-id");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("NOT_FOUND");
    }
  });

  it("excludes the pending-review restricted product from findPublished", async () => {
    const result = await productRepository.findPublished();
    expect(result.ok).toBe(true);
    if (result.ok) {
      const slugs = result.data.map((p) => p.slug);
      expect(slugs).not.toContain("parma-cigar-collectors-set");
    }
  });

  it("getMedia returns media sorted by sortOrder with a cover image first", async () => {
    const productResult = await productRepository.findBySlug("favilli-enamel-earrings");
    expect(productResult.ok).toBe(true);
    if (!productResult.ok || !productResult.data) throw new Error("fixture missing");

    const mediaResult = await productRepository.getMedia(productResult.data.id);
    expect(mediaResult.ok).toBe(true);
    if (mediaResult.ok) {
      expect(mediaResult.data[0]?.isCover).toBe(true);
    }
  });
});

describe("brand and category repositories", () => {
  it("brandRepository.findBySlug resolves Favilli", async () => {
    const result = await brandRepository.findBySlug("favilli");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.name["zh-CN"]).toBe("Favilli");
    }
  });

  it("categoryRepository.findVisible returns categories sorted by sortOrder", async () => {
    const result = await categoryRepository.findVisible();
    expect(result.ok).toBe(true);
    if (result.ok) {
      const sortOrders = result.data.map((c) => c.sortOrder);
      const sorted = [...sortOrders].sort((a, b) => a - b);
      expect(sortOrders).toEqual(sorted);
    }
  });
});

describe("merchant repository", () => {
  it("findActive only returns merchants with storeStatus active", async () => {
    const result = await merchantRepository.findActive();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.every((m) => m.storeStatus === "active")).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
    }
  });
});

describe("cart repository", () => {
  it("finds the demo user's cart and its items", async () => {
    const cartResult = await cartRepository.findByUser("profile-user-zhangming");
    expect(cartResult.ok).toBe(true);
    if (!cartResult.ok || !cartResult.data) throw new Error("fixture missing");

    const itemsResult = await cartRepository.getItems(cartResult.data.id);
    expect(itemsResult.ok).toBe(true);
    if (itemsResult.ok) {
      expect(itemsResult.data.length).toBeGreaterThan(0);
    }
  });
});
