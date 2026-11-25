import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { collections } from "@/components/static/collection-data";

const FEATURED_COLLECTIONS = ["metallic-premium", "eco-premium", "deluxe-standard", "eco-regular"];

export function ShopByCollection() {
  const featured = FEATURED_COLLECTIONS.map((slug) => collections.find((collection) => collection.slug === slug)).filter(Boolean);

  return (
    <section className="bg-surface py-10 lg:py-24" aria-labelledby="collections-heading">
      <div className="pm-shell">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-8 sm:gap-4">
          <div>
            <h2 id="collections-heading" className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]">Shop by Collection</h2>
          </div>
          <Link href="/collections" className="-my-2 inline-flex min-h-11 items-center gap-2 text-body-sm font-medium text-primary hover:text-primary-strong lg:my-0 lg:min-h-0">
            View all collections <ArrowRight className="size-4" aria-hidden />
          </Link>
        </header>
        <div className="no-scrollbar -mx-md flex snap-x snap-mandatory scroll-pl-md gap-3 overflow-x-auto px-md pb-1 sm:mx-0 sm:grid sm:scroll-pl-0 sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4">
          {featured.map((collection) => {
            if (!collection) return null;
            const collectionProducts = collection.select();
            const product = collectionProducts.find(
              (item) =>
                item.media.length > 0 &&
                (collection.slug === "deluxe-standard" || collection.slug === "eco-regular") &&
                ["white-boards", "chalk-boards", "notice-boards"].includes(item.categoryId)
            ) ?? collectionProducts.find((item) => item.media.length > 0);
            return (
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className="group w-[76%] shrink-0 snap-start sm:w-auto sm:min-w-0">
                <div className="aspect-[4/3] bg-surface">
                  {product && <ProductImage asset={product.media[0]} name={product.name} categoryId={product.categoryId} sizes="(max-width: 639px) 76vw, 23vw" className="size-full object-contain transition-transform duration-500 group-hover:scale-[1.03]" />}
                </div>
                <h3 className="mt-3 font-display text-[1.125rem] font-bold leading-6 text-ink group-hover:text-primary-strong sm:mt-4 sm:text-[1.35rem] sm:leading-tight">{collection.name}</h3>
                <p className="mt-1.5 line-clamp-2 text-caption leading-snug text-muted sm:mt-2 sm:text-body-sm sm:leading-relaxed">{collection.blurb}</p>
                <span className="mt-2 inline-flex items-center gap-2 text-caption font-semibold text-primary sm:mt-3 sm:text-body-sm">Shop now <ArrowRight className="size-4" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
