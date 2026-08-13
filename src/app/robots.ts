import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/internal", "/account", "/merchant", "/admin", "/cart", "/api"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
