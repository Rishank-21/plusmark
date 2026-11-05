import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PriceRange } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import type { Product } from "@/types";

export function FeaturedSpotlight({ product }: { product: Product }) {
  return (
    <section className="bg-surface py-14 lg:py-20" aria-labelledby="featured-product-heading">
      <div className="pm-shell !max-w-[105rem]">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 id="featured-product-heading" className="font-sans font-normal text-h1 text-navy">A customer favourite</h2>
          </div>
          <Link href="/shop" className="group -my-2 hidden min-h-11 items-center gap-2 text-body-sm font-medium text-blue hover:text-blue-deep sm:inline-flex lg:my-0 lg:min-h-0">
            Shop the range
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-2xl bg-white lg:grid-cols-[1.05fr_0.95fr]">
          <Link href={`/product/${product.slug}`} className="group relative flex min-h-[20rem] items-center justify-center bg-white p-8 sm:min-h-[28rem] sm:p-14" aria-label={`View ${product.name}`}>
            <ProductImage
              asset={product.media[0] ?? null}
              name={product.name}
              categoryId={product.categoryId}
              sizes="(max-width: 1023px) 90vw, 52vw"
              priority
              className="h-full max-h-[27rem] w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Link>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <h3 className="max-w-[16ch] font-sans text-[clamp(2rem,4vw,3.5rem)] font-normal leading-[1.05] tracking-[-0.02em] text-navy">
              {product.name}
            </h3>
            <p className="mt-4 max-w-[46ch] text-body-sm leading-relaxed text-graphite">
              A dependable writing surface for meetings, classrooms and everyday planning. Choose the size that fits your space.
            </p>
            <div className="mt-6 flex items-end justify-between gap-4 border-y border-hair py-4">
              <div>
                <p className="text-caption text-graphite">Starting from</p>
                <PriceRange size="lg" product={product} />
              </div>
            </div>
            <ul className="mt-5 grid gap-2 text-caption text-ink sm:grid-cols-2">
              {["Easy to maintain", "Built for daily use", "Multiple sizes", "GST invoice included"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-3.5 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={`/product/${product.slug}`} className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-brand px-6 text-body-sm font-semibold text-white transition-colors hover:bg-brand-deep">
              View product
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid gap-3 pt-5 sm:grid-cols-3">
          {[
            { title: "Quality checked", body: "Made for dependable everyday use." },
            { title: "Pan-India dispatch", body: "Ships from our Ahmedabad works." },
            { title: "Made for your space", body: "Custom sizes available on request." }
          ].map(({ title, body }) => (
            <div key={title} className="bg-white py-3 text-center sm:px-2">
              <p className="text-body font-semibold text-navy">{title}</p>
              <p className="mt-1 text-body-sm leading-relaxed text-graphite">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
