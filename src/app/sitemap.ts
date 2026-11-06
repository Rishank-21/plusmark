import type { MetadataRoute } from "next";
import { collections } from "@/components/static/collection-data";
import { policies } from "@/components/static/policy-data";
import { categories, products } from "@/lib/catalog";
import { SITE_URL } from "@/lib/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE_URL.replace(/\/$/, "");
  const staticRoutes = ["", "/shop", "/collections", "/contact", "/faq", "/policies"];
  return [
    ...staticRoutes.map((route) => ({ url: `${base}${route}`, changeFrequency: route === "" ? "weekly" as const : "monthly" as const, priority: route === "" ? 1 : 0.7 })),
    ...products.map((product) => ({ url: `${base}/product/${product.slug}`, lastModified: product.createdAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...categories.map((category) => ({ url: `${base}/shop/${category.slug}`, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...categories.flatMap((category) =>
      category.subcategories.map((sub) => ({
        url: `${base}/shop/${category.slug}/${sub.id}`,
        changeFrequency: "weekly" as const,
        priority: 0.6
      }))
    ),
    ...collections.map((collection) => ({ url: `${base}/collections/${collection.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...policies.map((policy) => ({ url: `${base}/policies/${policy.slug}`, changeFrequency: "yearly" as const, priority: 0.3 }))
  ];
}
