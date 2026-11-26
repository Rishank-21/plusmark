import Link from "next/link";
import { brand } from "@/lib/catalog";

const BENEFITS = [
  {
    title: "Published sizes and series",
    detail: "Every product lists its wall sizes, writing surface and frame series so you can match the board to the room."
  },
  {
    title: "Single-unit online ordering",
    detail: "No wholesale floor: order a single board directly with transparent GST pricing by state."
  },
  {
    title: "Specifications and HSN",
    detail: "Frame material, corner finish, magnetic rating and GST HSN code are published on every product page."
  },
  {
    title: `Manufactured in ${brand.city}`,
    detail: `Built at the Narolgam works since ${brand.foundingYear ?? "2015"} for pickup or pan-India courier dispatch.`
  }
];

export function ProductBenefits() {
  return (
    <section className="border-t border-line bg-surface py-10 lg:py-20" aria-labelledby="benefits-heading">
      <div className="pm-shell">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="benefits-heading" className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]">
              Built and dispatched in-house
            </h2>
            <p className="mt-2 max-w-[54ch] text-body-sm leading-relaxed text-muted">
              {brand.legalName} — direct from our Ahmedabad facility with phone, email and WhatsApp order-desk support.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/contact" className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-body-sm font-semibold text-onprimary transition-colors hover:bg-primary-strong">
              Contact support
            </Link>
            <Link href="/faq" className="inline-flex h-11 items-center rounded-md border border-line-strong bg-surface px-5 text-body-sm font-medium text-ink transition-colors hover:border-ink/45 hover:bg-subtle">
              Read the FAQ
            </Link>
          </div>
        </header>

        <dl className="mt-8 grid gap-6 border-t border-line pt-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          {BENEFITS.map((benefit) => (
            <div key={benefit.title} className="flex flex-col gap-1.5">
              <dt className="font-display text-body font-bold text-ink">{benefit.title}</dt>
              <dd className="text-body-sm leading-relaxed text-muted">{benefit.detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
