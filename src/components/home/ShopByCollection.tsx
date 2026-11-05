import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProductImage } from "@/components/ui/ProductImage";
import { collections } from "@/components/static/collection-data";

const FEATURED_COLLECTIONS = ["metallic-premium", "eco-premium", "deluxe-standard", "eco-regular"];

export function ShopByCollection() {
  const featured = FEATURED_COLLECTIONS.map((slug) => collections.find((collection) => collection.slug === slug)).filter(Boolean);

  return (
    <section className="bg-white py-14 lg:py-20" aria-labelledby="collections-heading">
      <div className="pm-shell !max-w-[105rem]">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="collections-heading" className="font-sans font-normal text-h1 text-navy">Shop by Collection</h2>
          </div>
          <Link href="/collections" className="-my-2 inline-flex min-h-11 items-center gap-2 text-body-sm font-medium text-blue hover:text-blue-deep lg:my-0 lg:min-h-0">
            View all collections <ArrowRight className="size-4" aria-hidden />
          </Link>
        </header>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
              <Link key={collection.slug} href={`/collections/${collection.slug}`} className="group min-w-0">
                <div className="aspect-[4/3] bg-white">
                  {product && <ProductImage asset={product.media[0]} name={product.name} categoryId={product.categoryId} sizes="(max-width: 639px) 90vw, 23vw" className="size-full object-contain transition-transform duration-500 group-hover:scale-[1.03]" />}
                </div>
                <h3 className="mt-4 font-sans text-[1.35rem] font-normal leading-tight text-navy group-hover:text-blue-deep">{collection.name}</h3>
                <p className="mt-2 line-clamp-2 text-body-sm leading-relaxed text-graphite">{collection.blurb}</p>
                <span className="mt-3 inline-flex items-center gap-2 text-body-sm font-semibold text-blue">Shop now <ArrowRight className="size-4" /></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
