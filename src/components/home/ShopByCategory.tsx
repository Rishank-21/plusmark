"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { categories, products } from "@/lib/catalog";
import { cloudinaryLoader, imageUrl, isCloudinaryPublicId } from "@/lib/media";

function deliveryProps(publicId: string) {
  return isCloudinaryPublicId(publicId) ? { loader: cloudinaryLoader } : { unoptimized: true as const };
}

const FEATURED_CATEGORY_IDS = ["white-boards", "chalk-boards", "notice-boards", "white-boards-ceramic", "display-boards", "board-stands"];

export function ShopByCategory() {
  const featured = FEATURED_CATEGORY_IDS.map((id) => {
    const category = categories.find((item) => item.id === id);
    if (category) return { category, image: category.image, name: category.name, href: `/shop/${category.slug}`, subcategoryId: null };
    for (const parent of categories) {
      const subcategory = parent.subcategories.find((item) => item.id === id);
      if (subcategory) {
        return {
          category: parent,
          image: subcategory.image,
          name: "Ceramic Boards",
          href: `/shop/${parent.slug}/${subcategory.id}`,
          subcategoryId: subcategory.id
        };
      }
    }
    return null;
  }).filter((item): item is NonNullable<typeof item> => Boolean(item));
  const featuredCategoryIds = new Set(featured.map(({ category, subcategoryId }) => subcategoryId ? `${category.id}:${subcategoryId}` : category.id));
  const allCategoryItems = [
    ...featured,
    ...categories
      .filter((category) => !featuredCategoryIds.has(category.id))
      .map((category) => ({
        category,
        image: category.image,
        name: category.name,
        href: `/shop/${category.slug}`,
        subcategoryId: null
      }))
  ];

  return (
    <section className="bg-canvas py-10 lg:py-14" aria-labelledby="categories-heading">
      <div className="pm-shell !max-w-[105rem]">
        <header className="mb-7 flex flex-wrap items-end justify-between gap-4 pb-5">
          <div className="flex flex-col gap-2">
            <h2 id="categories-heading" className="font-sans font-normal text-h1 text-navy">Find the right board for your space</h2>
          </div>
          <Link href="/shop" className="group -my-2 inline-flex min-h-11 items-center gap-2 text-body-sm font-medium text-blue hover:text-blue-deep lg:my-0 lg:min-h-0">
            View all {products.length} products
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </header>

        <div className="grid grid-cols-2 gap-x-4 gap-y-8 pb-2 sm:grid-cols-3 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-6 lg:gap-x-6 lg:gap-y-12">
          {allCategoryItems.map(({ category, image, name, href }) => {
            return (
              <Link
                key={`${category.id}-${name}`}
                href={href}
                className="group flex min-w-0 flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-white">
                  {image && (
                    <Image
                      src={imageUrl(image, { fit: "scale", width: 900 })}
                      alt=""
                      fill
                      {...deliveryProps(image)}
                      sizes="(max-width: 1023px) 46vw, 24vw"
                      className="object-contain"
                    />
                  )}
                </div>
                <div className="flex flex-col pt-4">
                  <div className="flex justify-center gap-3 pt-1.5 text-center">
                    <h3 className="font-sans text-[1.35rem] font-normal leading-[1.15] tracking-[-0.01em] text-navy transition-colors group-hover:text-blue-deep sm:text-[1.5rem]">
                      {name}
                    </h3>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

      </div>
    </section>
  );
}
