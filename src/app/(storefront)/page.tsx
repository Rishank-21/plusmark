import { ProductBenefits } from "@/components/home/Story";
import { FaqSection } from "@/components/home/FaqSection";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { FeaturedSpotlight } from "@/components/home/FeaturedSpotlight";
import { PromoBanner } from "@/components/home/PromoBanner";
import { Reviews } from "@/components/home/Reviews";
import { Selection } from "@/components/home/Selection";
import { ShopByCategory } from "@/components/home/ShopByCategory";
import { ShopByCollection } from "@/components/home/ShopByCollection";
import { products } from "@/lib/catalog";
import type { Product } from "@/types";

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

export default function HomePage() {
  const featured = selectionFromCatalogue(8, 0);
  const more = selectionFromCatalogue(8, featured.length);
  const spotlight = products.find((product) => product.slug === "metallic-premium-white-board") ?? featured[0];
  const heroProducts = {
    main: products.find((product) => product.slug === "metallic-premium-white-board") ?? featured[0],
    chalk: products.find((product) => product.slug === "metallic-premium-chalk-board") ?? featured[1],
    notice: products.find((product) => product.slug === "metallic-premium-notice-board") ?? featured[2],
    ceramic: products.find((product) => product.slug === "metallic-premium-ceramic-board") ?? featured[3]
  };

  return (
    <>
      <HeroCarousel products={heroProducts} />
      <ShopByCategory />
      <ShopByCollection />
      {spotlight && <FeaturedSpotlight product={spotlight} />}
      <Selection
        products={featured}
        id="featured"
        heading="A board from every series"
        eyebrow=""
        lead=""
        normalHeading
      />
      <PromoBanner />
      <Selection
        products={more}
        id="more"
        eyebrow=""
        heading="Keep browsing the catalogue"
        lead=""
        normalHeading
        tone="canvas"
        showCustomSizeNote={false}
      />
      <ProductBenefits />
      <Reviews />
      <FaqSection />
    </>
  );
}
