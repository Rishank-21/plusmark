import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { imageUrl } from "@/lib/media";

export function PromoBanner() {
  return (
    <section className="bg-surface py-12 lg:py-16" aria-labelledby="promo-heading">
      <div className="pm-shell !max-w-[105rem]">
        <div className="relative overflow-hidden rounded-xl bg-brand px-6 py-12 sm:px-12 lg:px-16 lg:py-16">
          <div className="absolute -right-24 -top-28 size-[26rem] rounded-full bg-white/10 blur-3xl" aria-hidden />
          <div className="relative grid items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
            <div>
              <span className="inline-block h-1 w-10 rounded-full bg-terra" aria-hidden />
              <h2 id="promo-heading" className="mt-4 max-w-[20ch] font-sans text-h2 font-normal text-white balance lg:text-[2.5rem] lg:leading-[1.08] xl:text-[3rem] xl:leading-[1.06]">
                Find the Right Board for Your Space.
              </h2>
              <p className="mt-4 max-w-[54ch] text-body-sm leading-relaxed text-white/80 lg:text-body">
                Explore writing and display boards designed for everyday use at home, at work and in the classroom.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-6 text-body-sm font-medium text-brand transition-colors hover:bg-white/90"
                >
                  Explore All Products
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <Link
                  href="/collections"
                  className="inline-flex h-12 items-center rounded-md border border-white/40 px-6 text-body-sm font-medium text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  Browse collections
                </Link>
              </div>
            </div>
            <div className="relative mx-auto aspect-[5/4] w-full max-w-[460px] rounded-lg bg-white p-4 sm:p-6 lg:mx-0 lg:aspect-auto lg:h-[22rem] lg:max-w-none lg:p-8">
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
