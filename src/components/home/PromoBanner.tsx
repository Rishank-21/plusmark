import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PlainImage } from "@/components/ui/ProductImage";

export function PromoBanner() {
  return (
    <section className="border-y border-line bg-subtle py-10 lg:py-16" aria-labelledby="promo-heading">
      <div className="pm-shell">
        <div className="grid items-center gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
          <div>
            <h2
              id="promo-heading"
              className="max-w-[20ch] font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]"
            >
              Custom board sizes and dual layouts
            </h2>
            <p className="mt-3 max-w-[52ch] text-body-sm leading-relaxed text-muted lg:text-body">
              Sizes outside the listed 1 × 1 ft to 8 × 4 ft range, split notice/marker panels, printed grids and
              both-side frames are manufactured to specification in Ahmedabad.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/contact"
                className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-body-sm font-semibold text-onprimary transition-colors hover:bg-primary-strong sm:h-12 sm:px-6"
              >
                Request custom size
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/collections"
                className="inline-flex h-11 items-center rounded-md border border-line-strong bg-surface px-5 text-body-sm font-medium text-ink transition-colors hover:border-ink/45 hover:bg-subtle sm:h-12 sm:px-6"
              >
                Browse collections
              </Link>
            </div>
          </div>
          <div className="relative hidden aspect-[5/4] w-full max-w-[440px] overflow-hidden rounded-md border border-line bg-surface p-6 md:block lg:ml-auto">
            <PlainImage
              publicId="plusmark/products/eco-premium-both-side-board"
              alt="Plusmark double-sided board on a frame"
              width={1200}
              height={900}
              sizes="(max-width: 1023px) 88vw, 45vw"
              fit="scale"
              pendingLabel="Double-sided board"
              className="size-full object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
