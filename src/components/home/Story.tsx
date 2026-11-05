import Link from "next/link";
import { CreditCard, Ruler, ShieldCheck, Truck } from "lucide-react";
import { brand } from "@/lib/catalog";

const BENEFITS = [
  {
    icon: Ruler,
    title: "Sizes and series to choose from",
    detail: "Every product lists its published sizes and the series it belongs to, so you can match the board to the wall before you order."
  },
  {
    icon: CreditCard,
    title: "Order online, one board at a time",
    detail: "Pick a size, add it to the cart and check out with your delivery details. There is no minimum order."
  },
  {
    icon: ShieldCheck,
    title: "Clear product information",
    detail: "Writing face, frame and corner are described on every product page, exactly as Plusmark publishes them."
  },
  {
    icon: Truck,
    title: "Made in Ahmedabad, dispatched across India",
    detail: `Boards are manufactured at the Narolgam works in ${brand.city} and dispatched to your pincode.`
  }
];

export function ProductBenefits() {
  return (
    <section className="bg-surface py-14 lg:py-24" aria-labelledby="benefits-heading">
      <div className="pm-shell !max-w-[105rem]">
        <header className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-2">
            <h2 id="benefits-heading" className="max-w-[24ch] font-sans font-normal text-h1 text-navy balance">
              Straightforward to choose, easy to order
            </h2>
          </div>
          <p className="max-w-[54ch] text-[1.0625rem] leading-relaxed text-graphite lg:pb-1">
            {brand.legalName} is an Ahmedabad manufacturer established in {brand.foundingYear ?? "2015"}. These are the
            things the storefront can actually stand behind today — anything still being finalised is marked as such
            rather than guessed at.
          </p>
        </header>

        <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:mt-16 lg:gap-x-14 xl:grid-cols-4">
          {BENEFITS.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <li key={benefit.title} className="flex flex-col items-center text-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-blue">
                  <Icon className="size-6 text-white" strokeWidth={1.5} aria-hidden />
                </span>
                <h3 className="mt-4 max-w-[30ch] font-sans font-normal text-body leading-snug text-navy">{benefit.title}</h3>
              </li>
            );
          })}
        </ul>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-4 pt-8">
          <p className="max-w-[56ch] text-body-sm text-graphite">
            Questions before you order? The Plusmark team answers by phone, email and WhatsApp.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/contact" className="inline-flex h-12 items-center rounded-md bg-brand px-6 text-body-sm font-medium text-white transition-colors hover:bg-brand-deep">
              Contact support
            </Link>
            <Link href="/faq" className="inline-flex h-12 items-center rounded-md border border-brand/25 px-6 text-body-sm font-medium text-brand transition-colors hover:border-brand hover:bg-brand-wash">
              Read the FAQ
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
