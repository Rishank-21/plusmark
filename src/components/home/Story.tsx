import Link from "next/link";
import { CreditCard, Ruler, ShieldCheck, Truck } from "lucide-react";
import { brand } from "@/lib/catalog";

const BENEFITS = [
  {
    icon: Ruler,
    title: "Sizes and series to choose from",
    short: "Sizes & series",
    detail: "Every product lists its published sizes and the series it belongs to, so you can match the board to the wall before you order."
  },
  {
    icon: CreditCard,
    title: "Order online, one board at a time",
    short: "Order online",
    detail: "Pick a size, add it to the cart and check out with your delivery details. There is no minimum order."
  },
  {
    icon: ShieldCheck,
    title: "Clear product information",
    short: "Clear specs",
    detail: "Writing face, frame and corner are described on every product page, exactly as Plusmark publishes them."
  },
  {
    icon: Truck,
    title: "Made in Ahmedabad, dispatched across India",
    short: "Made in India",
    detail: `Boards are manufactured at the Narolgam works in ${brand.city} and dispatched to your pincode.`
  }
];

export function ProductBenefits() {
  return (
    <section className="bg-surface py-10 lg:py-24" aria-labelledby="benefits-heading">
      <div className="pm-shell">
        <header className="grid gap-3 sm:gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-2">
            <h2 id="benefits-heading" className="max-w-[24ch] font-display text-[1.375rem] font-extrabold leading-7 text-ink balance sm:text-h2 sm:leading-[1.15]">
              Straightforward to choose, easy to order
            </h2>
          </div>
          <p className="line-clamp-2 max-w-[54ch] text-body-sm leading-relaxed text-muted sm:line-clamp-none sm:text-[1.0625rem] lg:pb-1">
            {brand.legalName} is an Ahmedabad manufacturer established in {brand.foundingYear ?? "2015"}. These are the
            things the storefront can actually stand behind today — anything still being finalised is marked as such
            rather than guessed at.
          </p>
        </header>

        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-6 sm:mt-12 sm:gap-x-10 sm:gap-y-10 lg:mt-16 lg:gap-x-14 xl:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li key={benefit.title} className="flex flex-col items-start gap-3 sm:items-center sm:gap-0 sm:text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-primary sm:size-12">
                  <Icon className="size-5 text-onprimary sm:size-6" strokeWidth={1.5} aria-hidden />
                </span>
                <div className="flex flex-col gap-1 sm:contents">
                  <h3 className="font-display text-[0.8125rem] font-bold leading-snug text-ink sm:mt-4 sm:max-w-[30ch] sm:text-body">
                    <span className="sm:hidden">{benefit.short}</span>
                    <span className="hidden sm:inline">{benefit.title}</span>
                  </h3>
                  <p className="line-clamp-2 text-[0.75rem] leading-snug text-muted sm:hidden">{benefit.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 border-t border-line pt-6 sm:mt-14 sm:border-0 sm:pt-8">
          <p className="max-w-[56ch] text-caption text-muted sm:text-body-sm">
            Questions before you order? The Plusmark team answers by phone, email and WhatsApp.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/contact" className="inline-flex h-11 items-center rounded-md bg-primary px-5 text-body-sm font-medium text-onprimary transition-colors hover:bg-primary-strong sm:h-12 sm:px-6">
              Contact support
            </Link>
            <Link href="/faq" className="inline-flex h-11 items-center rounded-md border border-primary/25 px-5 text-body-sm font-medium text-brand transition-colors hover:border-primary hover:bg-primary-soft sm:h-12 sm:px-6">
              Read the FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
