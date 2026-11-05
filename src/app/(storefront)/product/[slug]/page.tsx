import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductApp } from "@/components/product/ProductApp";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getCategory, getProduct, getSeries, products, productsInCategory, relatedProducts } from "@/lib/catalog";
import { DEMO_PRICING_ENABLED, META_TITLE_SUFFIX, SITE_URL } from "@/lib/config";
import { imageUrl, ogImageUrl } from "@/lib/media";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const series = getSeries(product.seriesId);

  return {
    title: `${product.name}${META_TITLE_SUFFIX}`,
    description: `${product.blurb} ${series ? `${series.name} — ${series.surface}.` : ""}`.trim(),
    alternates: { canonical: `${SITE_URL}/product/${product.slug}` },
    openGraph: {
      title: product.name,
      description: product.blurb,
      url: `${SITE_URL}/product/${product.slug}`,
      type: "website",
      images: product.media[0]
        ? [{ url: ogImageUrl(product.media[0].publicId), width: 1200, height: 630, alt: product.media[0].alt }]
        : undefined
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description: product.blurb,
      images: product.media[0] ? [ogImageUrl(product.media[0].publicId)] : undefined
    }
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = getCategory(product.categoryId);
  const related = relatedProducts(product, 6);
  // A stand is a factual companion for a wall board, not a sales suggestion:
  // Plusmark publishes no basket data, so this pairing is by product type only.
  const companions = ["white-boards", "chalk-boards", "notice-boards", "display-boards", "ceramic-boards"].includes(
    product.categoryId
  )
    ? productsInCategory("board-stands").slice(0, 3)
    : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "Plusmark" },
    category: category?.name,
    image: product.media.map((asset) => imageUrl(asset.publicId, { fit: "scale", width: 1200 })),
    offers: {
      "@type": "AggregateOffer",
      offerCount: product.variants.length,
      availability: product.variants.some((variant) => variant.available)
        ? "https://schema.org/InStock"
        : "https://schema.org/MadeAvailable",
      // Prices are published in the markup only while the demo rate card is on;
      // Plusmark's real prices are quoted per order, so they must never appear here.
      ...(() => {
        const values = product.variants.map((variant) => variant.priceInr).filter((value): value is number => value !== null);
        if (!DEMO_PRICING_ENABLED || values.length === 0) {
          return { priceCurrency: "INR" as const };
        }
        return { lowPrice: Math.min(...values), highPrice: Math.max(...values) };
      })()
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductApp product={product} related={related} />
      {companions.length > 0 && <RelatedProducts products={companions} title="Completes the setup" />}
    </>
  );
}
