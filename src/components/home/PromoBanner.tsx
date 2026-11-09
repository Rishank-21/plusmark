import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageSquareText, Ruler } from "lucide-react";
import { imageUrl } from "@/lib/media";

export function PromoBanner() {
  return (
    <section className="bg-surface py-8 lg:py-16" aria-labelledby="promo-heading">
      <div className="pm-shell">
        <div className="flex min-h-[4.5rem] items-center gap-3 rounded-lg bg-subtle p-4 md:hidden">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary" aria-hidden>
            <Ruler className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[0.875rem] font-extrabold leading-5 text-ink">Boards are cut to order.</p>
            <p className="mt-0.5 text-[0.75rem] leading-4 text-muted">Looking for a size that is not listed?</p>
          </div>
          <Link
            href="/contact"
            aria-label="Ask about a custom size"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-onprimary transition-colors hover:bg-primary-strong"
          >
            <MessageSquareText className="size-5" aria-hidden />
          </Link>
        </div>

        <div className="relative hidden overflow-hidden rounded-2xl bg-shell px-5 py-8 sm:rounded-xl sm:px-12 sm:py-12 md:block lg:px-16 lg:py-16">
          <div className="absolute -right-24 -top-28 size-[26rem] rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-6 sm:gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <div>
              <span className="inline-block h-1 w-10 rounded-full bg-rating" aria-hidden />
              <h2 id="promo-heading" className="mt-3 max-w-[20ch] font-display text-[1.375rem] font-extrabold leading-7 text-shell-on balance sm:mt-4 sm:text-h2 sm:leading-[1.15] lg:text-[2.5rem] lg:leading-[1.08] xl:text-[3rem] xl:leading-[1.06]">
                Find the Right Board for Your Space.
              </h2>
              <p className="mt-3 max-w-[54ch] text-body-sm leading-relaxed text-shell-on/80 sm:mt-4 lg:text-body">
                Explore writing and display boards designed for everyday use at home, at work and in the classroom.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                <Link
                  href="/shop"
                  className="inline-flex h-11 items-center gap-2 rounded-md bg-shell-on px-5 text-body-sm font-semibold text-shell transition-colors hover:bg-shell-on/90 sm:h-12 sm:px-6"
                >
                  Explore All Products
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex h-11 items-center rounded-md border border-shell-on/40 px-5 text-body-sm font-medium text-shell-on transition-colors hover:border-shell-on hover:bg-white/10 sm:h-12 sm:px-6"
                >
                  Browse collections
                </Link>
              </div>
            </div>
            <div className="relative mx-auto hidden aspect-[5/4] w-full max-w-[460px] overflow-hidden rounded-lg sm:block sm:bg-surface sm:p-6 lg:mx-0 lg:aspect-auto lg:h-[22rem] lg:max-w-none lg:p-8">
              <Image
                src={imageUrl("plusmark/products/eco-premium-both-side-board", { fit: "scale", width: 1200 })}
                alt="Plusmark double-sided board on a frame"
                fill
                sizes="(max-width: 1023px) 88vw, 45vw"
                unoptimized
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
