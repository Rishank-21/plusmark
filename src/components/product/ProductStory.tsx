"use client";

import Image from "next/image";
import { APLUS_BRAND_PANEL, aPlusPanelsFor } from "@/lib/local-assets";
import { cloudinaryLoader, imageUrl } from "@/lib/media";

/**
 * Product-specific A+ listing panels, kept inside the same centered reading
 * width as the rest of the product page.
 */
export function ProductStory({ slug, name }: { slug: string; name: string }) {
  const panels = aPlusPanelsFor(slug);
  if (panels.length === 0) return null;

  return (
    <section
      id="product-story"
      className="product-story py-12 lg:py-16"
      aria-labelledby="product-story-heading"
    >
      <h2 id="product-story-heading" className="font-sans text-2xl font-semibold leading-tight text-ink">
        Product Description
      </h2>
      <div className="product-story-panels mt-8 lg:mt-10">
        {panels.map((panel, index) => {
          const isBrand = panel === APLUS_BRAND_PANEL;
          return (
            <Image
              key={panel}
              src={imageUrl(panel, { fit: "scale", width: isBrand ? 1464 : 2000 })}
              loader={cloudinaryLoader}
              alt={isBrand ? "Plusmark" : `${name} — Plusmark A+ listing panel ${index}`}
              width={isBrand ? 1464 : 4100}
              height={isBrand ? 600 : 1680}
              sizes="(max-width: 639px) calc(100vw - 2rem), (max-width: 1439px) calc(100vw - 4rem), 1376px"
              className="block h-auto w-full"
            />
          );
        })}
      </div>
    </section>
  );
}
