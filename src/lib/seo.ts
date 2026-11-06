import type { Metadata } from "next";
import { META_TITLE_SUFFIX, SITE_URL } from "@/lib/config";
import { ogImageUrl } from "@/lib/media";

/** Absolute URL with a single slash between origin and path. */
export function absoluteUrl(path = "/"): string {
  const base = SITE_URL.replace(/\/$/, "");
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/** 1200 × 630 social card used when a page has no product photo. */
export const DEFAULT_OG_IMAGE = ogImageUrl("plusmark/banners/plusmark-retail");

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  imageAlt = "Plusmark writing and display boards",
  noindex = false,
  absoluteTitle = false
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  noindex?: boolean;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const fullTitle = absoluteTitle ? title : `${title} · ${META_TITLE_SUFFIX}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Plusmark",
      url,
      title: fullTitle,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }]
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image]
    },
    ...(noindex ? { robots: { index: false, follow: false } } : {})
  };
}

export function breadcrumbJsonLd(items: { name: string; path?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.path ? { item: absoluteUrl(item.path) } : {})
    }))
  };
}

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer }
    }))
  };
}
