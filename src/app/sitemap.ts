import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";
import {
  brandRepository,
  cityGuideRepository,
  editorialCollectionRepository,
  legalDocumentRepository,
  merchantRepository,
  productRepository,
} from "@/lib/repositories";

const STATIC_ROUTES = [
  "",
  "/discover",
  "/brands",
  "/merchants",
  "/cities",
  "/editorial",
  "/search",
  "/custom-purchase",
  "/about",
  "/how-it-works",
  "/merchant-apply",
  "/faq",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productsRes, brandsRes, merchantsRes, citiesRes, editorialRes, legalRes] =
    await Promise.all([
      productRepository.findPublished(),
      brandRepository.findAll(),
      merchantRepository.findActive(),
      cityGuideRepository.findVisible(),
      editorialCollectionRepository.findAll(),
      legalDocumentRepository.findAll(),
    ]);

  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${siteConfig.url}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.6,
  }));

  const productEntries: MetadataRoute.Sitemap = (productsRes.ok ? productsRes.data : []).map(
    (p) => ({
      url: `${siteConfig.url}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  const brandEntries: MetadataRoute.Sitemap = (brandsRes.ok ? brandsRes.data : []).map((b) => ({
    url: `${siteConfig.url}/brands/${b.slug}`,
    lastModified: new Date(b.updatedAt),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  const merchantEntries: MetadataRoute.Sitemap = (merchantsRes.ok ? merchantsRes.data : []).map(
    (m) => ({
      url: `${siteConfig.url}/merchants/${m.slug}`,
      lastModified: new Date(m.updatedAt),
      changeFrequency: "monthly",
      priority: 0.5,
    }),
  );

  const cityEntries: MetadataRoute.Sitemap = (citiesRes.ok ? citiesRes.data : []).map((c) => ({
    url: `${siteConfig.url}/cities/${c.slug}`,
    lastModified: new Date(c.updatedAt),
    changeFrequency: "monthly",
    priority: 0.4,
  }));

  const editorialEntries: MetadataRoute.Sitemap = (editorialRes.ok ? editorialRes.data : [])
    .filter((c) => c.status === "published")
    .map((c) => ({
      url: `${siteConfig.url}/editorial/${c.slug}`,
      lastModified: new Date(c.updatedAt),
      changeFrequency: "weekly",
      priority: 0.4,
    }));

  const legalEntries: MetadataRoute.Sitemap = (legalRes.ok ? legalRes.data : []).map((doc) => ({
    url: `${siteConfig.url}/legal/${doc.slug}`,
    lastModified: new Date(doc.updatedAt),
    changeFrequency: "yearly",
    priority: 0.2,
  }));

  return [
    ...staticEntries,
    ...productEntries,
    ...brandEntries,
    ...merchantEntries,
    ...cityEntries,
    ...editorialEntries,
    ...legalEntries,
  ];
}
