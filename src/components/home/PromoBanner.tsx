import { ExternalLink } from "lucide-react";
import { B2B_SITE_URL } from "@/lib/config";

export function PromoBanner() {
  return (
    <section className="border-y border-line bg-subtle py-10 sm:py-12 lg:py-14" aria-labelledby="promo-heading">
      <div className="pm-shell flex flex-col items-start justify-between gap-5 md:flex-row md:items-center md:gap-8">
        <div>
          <h2
            id="promo-heading"
            className="font-display text-[1.375rem] font-extrabold leading-tight text-ink sm:text-h2"
          >
            Need a bulk quotation?
          </h2>
          <p className="mt-2 max-w-[50ch] text-body-sm leading-relaxed text-muted sm:text-body">
            Ordering boards for a school, institution, or office? Request bulk pricing and GST quotations directly on Plusmark Boards.
          </p>
        </div>
        <a
          href={B2B_SITE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md bg-primary px-6 text-body-sm font-semibold text-onprimary transition-colors hover:bg-primary-strong sm:h-12"
        >
          <span>Get bulk quotation on Plusmark Boards</span>
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </div>
    </section>
  );
}
