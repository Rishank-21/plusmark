export const revalidate = 60;
import { ensureHeroConfig, ensureLiveCatalog } from "@/lib/backend/server";
import { ServiceStickersRow } from "@/components/commerce/ServiceStickersRow";
import { ProductBenefits } from "@/components/home/Story";
import { FaqSection } from "@/components/home/FaqSection";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedSpotlight } from "@/components/home/FeaturedSpotlight";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Reviews } from "@/components/home/Reviews";
import { Selection } from "@/components/home/Selection";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { ShopByCollection } from "@/components/home/ShopByCollection";
import type { Metadata } from "next";
import { categories, products, seriesList } from "@/lib/catalog";
import { buildCollectionSeriesCards } from "@/lib/collection-cards";
import { buildShopCategoryItems } from "@/lib/category-cards";
import { META_TITLE_SUFFIX } from "@/lib/config";
import { pageMetadata } from "@/lib/seo";
import type { Product } from "@/types";

export const metadata: Metadata = pageMetadata({
  title: META_TITLE_SUFFIX,
  absoluteTitle: true,
  path: "/",
  description:
    "Shop Plusmark writing boards, chalk boards, notice boards, magnetic and ceramic boards, stands and school benches. Made in Ahmedabad and delivered across India."
});

// "Bestselling" and "new arrival" are not data Plusmark publishes, so both rails
// are honest cross-sections of ranges that carry photography, and the second
// rail continues where the first one stops.
function selectionFromCatalogue(count: number, skip: number): Product[] {
  const photographed = products.filter((product) => product.media.length > 0);
  const bySeries = new Map<string, Product[]>();
  for (const product of photographed) {
    const key = product.seriesId ?? "other";
    bySeries.set(key, [...(bySeries.get(key) ?? []), product]);
  }
  const buckets = [...bySeries.values()];
  const picked: Product[] = [];
  for (let round = 0; picked.length < count + skip; round += 1) {
    let added = false;
    for (const bucket of buckets) {
      const next = bucket[round];
      if (next && picked.length < count + skip) {
        picked.push(next);
        added = true;
      }
    }
    if (!added) break;
  }
  return picked.slice(skip, count + skip);
}

export default async function HomePage() {
  const [, heroConfig] = await Promise.all([ensureLiveCatalog(), ensureHeroConfig()]);
  const featured = selectionFromCatalogue(8, 0);
  const more = selectionFromCatalogue(8, featured.length);
  const spotlight = products.find((product) => product.slug === "metallic-premium-white-board") ?? featured[0];
  const categoryItems = buildShopCategoryItems(categories, products);
  const collectionItems = buildCollectionSeriesCards(seriesList, products);

  return (
    <>
      <HeroCarousel initialConfig={heroConfig} />
      <ServiceStickersRow variant="hero-strip" />
      <ShopByCategory items={categoryItems} totalProducts={products.length} />
      <ShopByCollection items={collectionItems} />
      {spotlight && <FeaturedSpotlight product={spotlight} />}
      <Selection
        products={featured}
        id="featured"
        heading="A board from every series"
        lead=""
        tone="surface"
      />
      <Selection
        products={more}
        id="more"
        heading="Keep browsing the catalogue"
        lead=""
        tone="canvas"
        showCustomSizeNote={false}
      />
      <ProductBenefits />
      <Reviews />
      <FaqSection />
      <PromoBanner />
    </>
  );
}
