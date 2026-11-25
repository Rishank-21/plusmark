"use client";

import { useId, useState } from "react";
import { ProductCard } from "@/components/commerce/ProductCard";
import { QuickView } from "@/components/commerce/QuickView";
import type { Product } from "@/types";

export function RelatedProducts({ products, title }: { products: Product[]; title: string }) {
  const [quick, setQuick] = useState<Product | null>(null);
  const headingId = useId();
  if (products.length === 0) return null;

  return (
    <section aria-labelledby={headingId} className="pm-shell !max-w-[90rem] border-t border-line py-8 lg:py-16">
      <h2 id={headingId} className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]">
        {title}
      </h2>
      <div className="no-scrollbar -mx-md flex snap-x snap-mandatory scroll-pl-md gap-3 overflow-x-auto px-md pb-1 pt-5 sm:mx-0 sm:grid sm:scroll-pl-0 sm:grid-cols-2 sm:gap-x-6 sm:gap-y-10 sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-8 lg:grid-cols-4">
        {products.map((product) => (
          <div key={product.slug} className="w-[76%] shrink-0 snap-start sm:w-auto sm:min-w-0">
            <ProductCard product={product} onQuickView={setQuick} />
          </div>
        ))}
      </div>
      <QuickView product={quick} open={quick !== null} onClose={() => setQuick(null)} />
    </section>
  );
}
