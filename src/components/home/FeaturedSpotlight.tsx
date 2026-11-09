import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PriceRange } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import type { Product } from "@/types";

export function FeaturedSpotlight({ product }: { product: Product }) {
  return (
    <section className="bg-surface py-10 lg:py-24" aria-labelledby="featured-product-heading">
      <div className="pm-shell">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8 lg:mb-10">
          <h2 id="featured-product-heading" className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]">
            A customer favourite
          </h2>
          <Link
            href="/shop"
            className="group -my-2 hidden min-h-11 items-center gap-2 text-body-sm font-semibold text-primary hover:text-primary-strong sm:inline-flex lg:my-0 lg:min-h-0"
          >
            Shop the range
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-2xl border border-line bg-surface shadow-card lg:grid-cols-[1.05fr_0.95fr]">
          <Link
            href={`/product/${product.slug}`}
            className="group relative flex min-h-[15rem] items-center justify-center bg-surface p-6 sm:min-h-[28rem] sm:p-14"
            aria-label={`View ${product.name}`}
          >
            <ProductImage
              asset={product.media[0] ?? null}
              name={product.name}
              categoryId={product.categoryId}
              sizes="(max-width: 1023px) 90vw, 52vw"
              priority
              className="h-full max-h-[27rem] w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Link>

          <div className="flex flex-col justify-center p-5 sm:p-10 lg:p-14">
            <h3 className="max-w-[16ch] font-display text-[1.375rem] font-extrabold leading-7 tracking-[-0.02em] text-ink sm:text-[clamp(1.9rem,3.4vw,2.75rem)] sm:leading-[1.06]">
              {product.name}
            </h3>
            <p className="mt-4 max-w-[46ch] text-body-sm leading-relaxed text-muted">
              A dependable writing surface for meetings, classrooms and everyday planning. Choose the size that fits your space.
            </p>
            <div className="mt-7">
              <p className="text-caption font-medium text-muted">Starting from</p>
              <PriceRange size="lg" product={product} />
            </div>
            <ul className="mt-6 grid gap-2.5 text-caption text-ink sm:grid-cols-2">
              {["Easy to maintain", "Built for daily use", "Multiple sizes", "GST invoice included"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-3.5 shrink-0 text-success" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href={`/product/${product.slug}`}
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-6 text-body-sm font-semibold text-onprimary shadow-card transition-colors hover:bg-primary-strong"
            >
              View product
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid gap-6 pt-8 sm:grid-cols-3 lg:gap-10 lg:pt-10">
          {[
            { title: "Quality checked", body: "Made for dependable everyday use." },
            { title: "Pan-India dispatch", body: "Ships from our Ahmedabad works." },
            { title: "Made for your space", body: "Custom sizes available on request." }
          ].map(({ title, body }) => (
            <div key={title}>
              <p className="font-display text-body font-bold text-ink">{title}</p>
              <p className="mt-1 text-body-sm leading-relaxed text-muted">{body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
