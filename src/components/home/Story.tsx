import Link from "next/link";
import { ArrowRight, Factory, PackageCheck, ReceiptText, Ruler } from "lucide-react";
import { brand } from "@/lib/catalog";

const HIGHLIGHTS = [
  { icon: Ruler, label: "1×1 to 8×4 ft sizes" },
  { icon: PackageCheck, label: "Single-unit orders" },
  { icon: ReceiptText, label: "GST invoice & HSN" },
  { icon: Factory, label: `Made in ${brand.city.split(",")[0]}` }
];

export function ProductBenefits() {
  return (
    <section className="border-t border-line bg-surface py-12 sm:py-16 lg:py-20" aria-labelledby="benefits-heading">
      <div className="pm-shell">
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <h2
            id="benefits-heading"
            className="font-display text-[1.5rem] font-extrabold leading-tight tracking-[-0.015em] text-ink sm:text-h2"
          >
            Built and dispatched in-house
          </h2>
          <p className="mt-2.5 max-w-[52ch] text-body-sm leading-relaxed text-muted sm:text-body">
            Cut, framed and packed at our Ahmedabad works—direct facility pickup or pan-India courier dispatch.
          </p>

          <ul className="mt-8 grid w-full grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-4 sm:gap-6">
            {HIGHLIGHTS.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.label} className="flex min-w-0 flex-col items-center gap-2.5 text-center">
                  <span className="flex size-11 items-center justify-center rounded-full bg-subtle text-ink sm:size-12">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="text-[0.8125rem] font-medium leading-snug text-ink sm:text-body-sm">
                    {item.label}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-body-sm font-semibold text-onprimary transition-colors hover:bg-primary-strong"
            >
              <span>Contact support</span>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-ink underline-offset-4 hover:underline"
            >
              <span>Read the FAQ</span>
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
