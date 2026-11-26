import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { PriceRange } from "@/components/ui/Price";
import { ProductImage } from "@/components/ui/ProductImage";
import { productCardMeta } from "@/lib/format";
import type { Product } from "@/types";

export function FeaturedSpotlight({ product }: { product: Product }) {
  const details = [
    product.surface ? `Surface: ${product.surface}` : "HPL or melamine surface",
    product.frame ? `Frame: ${product.frame}` : "Anodized aluminium frame",
    productCardMeta(product),
    "GST invoice with HSN included"
  ].filter(Boolean);

  return (
    <section className="bg-surface py-10 lg:py-20" aria-labelledby="featured-product-heading">
      <div className="pm-shell">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-8">
          <h2 id="featured-product-heading" className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]">
            Standard whiteboard specification
          </h2>
          <Link
            href="/shop"
            className="-my-2 hidden min-h-11 items-center gap-2 text-body-sm font-medium text-ink underline-offset-4 hover:underline sm:inline-flex lg:my-0 lg:min-h-0"
          >
            Shop all products
            <ArrowRight className="size-4" aria-hidden />
          </Link>
        </div>

        <div className="grid overflow-hidden rounded-md border border-line bg-surface lg:grid-cols-[1.05fr_0.95fr]">
          <Link
            href={`/product/${product.slug}`}
            className="flex min-h-[15rem] items-center justify-center border-b border-line bg-surface p-6 sm:min-h-[26rem] sm:p-12 lg:border-b-0 lg:border-r"
            aria-label={`View ${product.name}`}
          >
            <ProductImage
              asset={product.media[0] ?? null}
              name={product.name}
              categoryId={product.categoryId}
              sizes="(max-width: 1023px) 90vw, 52vw"
              priority
              className="h-full max-h-[26rem] w-full object-contain"
            />
          </Link>

          <div className="flex flex-col justify-center p-5 sm:p-10 lg:p-12">
            <h3 className="max-w-[18ch] font-display text-[1.375rem] font-extrabold leading-7 tracking-[-0.02em] text-ink sm:text-[clamp(1.75rem,3vw,2.5rem)] sm:leading-[1.08]">
              {product.name}
            </h3>
            <p className="mt-3 max-w-[46ch] text-body-sm leading-relaxed text-muted">
              Heavy-duty aluminium frame and marker-grade writing surface across 3 × 4 ft to 8 × 4 ft wall sizes.
            </p>
            <div className="mt-6">
              <PriceRange size="lg" product={product} />
            </div>
            <ul className="mt-5 grid gap-2 text-caption text-ink">
              {details.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              href={`/product/${product.slug}`}
              className="mt-7 inline-flex h-11 w-fit items-center justify-center gap-2 rounded-md bg-primary px-6 text-body-sm font-semibold text-onprimary transition-colors hover:bg-primary-strong sm:h-12"
            >
              Select size
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
