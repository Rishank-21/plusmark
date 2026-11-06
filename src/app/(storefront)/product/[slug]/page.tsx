import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductApp } from "@/components/product/ProductApp";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { getCategory, getProduct, getSeries, products, productsInCategory, relatedProducts } from "@/lib/catalog";
import { DEMO_PRICING_ENABLED } from "@/lib/config";
import { imageUrl, ogImageUrl } from "@/lib/media";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  const series = getSeries(product.seriesId);

  return pageMetadata({
    title: product.name,
    path: `/product/${product.slug}`,
    description: `${product.blurb} ${series ? `${series.name} — ${series.surface}.` : ""}`.trim(),
    image: product.media[0] ? ogImageUrl(product.media[0].publicId) : undefined,
    imageAlt: product.media[0]?.alt
  });
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

  // Plusmark quotes real orders itself, so prices only enter the markup while
  // the demo rate card is on. An enquiry-only product gets no offer at all.
  const priceValues = product.enquiryOnly
    ? []
    : product.variants.map((variant) => variant.priceInr).filter((value): value is number => value !== null);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    url: absoluteUrl(`/product/${product.slug}`),
    ...(product.variants[0]?.sku ? { sku: product.variants[0].sku } : {}),
    brand: { "@type": "Brand", name: "Plusmark" },
    category: category?.name,
    image: product.media.map((asset) => imageUrl(asset.publicId, { fit: "scale", width: 1200 })),
    ...(DEMO_PRICING_ENABLED && priceValues.length
      ? {
          offers: {
            "@type": "AggregateOffer",
            priceCurrency: "INR",
            lowPrice: Math.min(...priceValues),
            highPrice: Math.max(...priceValues),
            offerCount: product.variants.length,
            availability: product.variants.some((variant) => variant.available)
              ? "https://schema.org/InStock"
              : "https://schema.org/MadeToOrder"
          }
        }
      : {})
  };
  const breadcrumbs = breadcrumbJsonLd([
    { name: "Home", path: "/" },
    { name: category?.name ?? "Shop", path: category ? `/shop/${category.slug}` : "/shop" },
    { name: product.name, path: `/product/${product.slug}` }
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <ProductApp product={product} related={related} />
      {companions.length > 0 && <RelatedProducts products={companions} title="Completes the setup" />}
    </>
  );
}
