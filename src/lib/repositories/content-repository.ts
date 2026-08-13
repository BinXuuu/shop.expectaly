import type {
  CityGuide,
  ContentPage,
  EditorialCollection,
  EditorialCollectionItem,
  Faq,
  LegalDocument,
  LegalDocumentSlug,
  Result,
} from "@/types";
import { ok } from "@/types";
import {
  mockCityGuides,
  mockContentPages,
  mockEditorialCollectionItems,
  mockEditorialCollections,
  mockFaqs,
  mockLegalDocuments,
} from "@/data/mock";
import { createInMemoryRepository } from "./base";

export const contentPageRepository = {
  ...createInMemoryRepository<ContentPage>(() => mockContentPages),

  async findBySlug(slug: string): Promise<Result<ContentPage | null>> {
    return ok(mockContentPages.find((p) => p.slug === slug && p.status === "published") ?? null);
  },
};

export const editorialCollectionRepository = {
  ...createInMemoryRepository<EditorialCollection>(() => mockEditorialCollections),

  async findBySlug(slug: string): Promise<Result<EditorialCollection | null>> {
    return ok(
      mockEditorialCollections.find((c) => c.slug === slug && c.status === "published") ?? null,
    );
  },

  async findFeatured(): Promise<Result<EditorialCollection[]>> {
    return ok(
      mockEditorialCollections
        .filter((c) => c.isFeatured && c.status === "published")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },

  async getItems(collectionId: string): Promise<Result<EditorialCollectionItem[]>> {
    return ok(
      mockEditorialCollectionItems
        .filter((i) => i.collectionId === collectionId)
        .sort((a, b) => a.sortOrder - b.sortOrder),
    );
  },
};

export const cityGuideRepository = {
  ...createInMemoryRepository<CityGuide>(() => mockCityGuides),

  async findBySlug(slug: string): Promise<Result<CityGuide | null>> {
    return ok(mockCityGuides.find((c) => c.slug === slug && c.isVisible) ?? null);
  },

  async findVisible(): Promise<Result<CityGuide[]>> {
    return ok(mockCityGuides.filter((c) => c.isVisible).sort((a, b) => a.sortOrder - b.sortOrder));
  },
};

export const faqRepository = {
  ...createInMemoryRepository<Faq>(() => mockFaqs),

  async findVisible(): Promise<Result<Faq[]>> {
    return ok(mockFaqs.filter((f) => f.isVisible).sort((a, b) => a.sortOrder - b.sortOrder));
  },
};

export const legalDocumentRepository = {
  ...createInMemoryRepository<LegalDocument>(() => mockLegalDocuments),

  async findBySlug(slug: LegalDocumentSlug): Promise<Result<LegalDocument | null>> {
    return ok(mockLegalDocuments.find((d) => d.slug === slug) ?? null);
  },
};
