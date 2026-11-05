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
    <section aria-labelledby={headingId} className="pm-shell !max-w-[90rem] border-t border-hair py-12 lg:py-16">
      <h2 id={headingId} className="font-sans font-normal text-h2 leading-tight text-navy">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-x-4 gap-y-10 pt-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} onQuickView={setQuick} />
        ))}
      </div>
      <QuickView product={quick} open={quick !== null} onClose={() => setQuick(null)} />
    </section>
  );
}
