import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Notice } from "@/components/ui/States";
import { classNames } from "@/lib/format";
import { DEMO_PRICING_ENABLED, DEMO_PRICING_LABEL } from "@/lib/config";
import { ProductCard } from "@/components/commerce/ProductCard";
import type { Product } from "@/types";

/**
 * Plusmark has not finalised freight, return windows or refund timelines, so
 * every unresolved value in a policy renders through this component instead of a
 * number. The label itself states that the desk has to confirm it.
 */
export function PendingValue({ label, context }: { label: string; context?: string }) {
  return (
    <span className="my-1 flex flex-wrap items-center gap-2">
      <span className="inline-flex items-center rounded-xs border border-dashed border-warning/50 bg-warning-wash px-2 py-1 text-caption font-medium text-warning">
        To be confirmed · {label}
      </span>
      {context && <span className="text-caption text-muted">{context}</span>}
    </span>
  );
}

/** Standing notice at the top of every draft policy page. */
export function DraftPolicyNotice({ page }: { page: string }) {
  return (
    <Notice
      tone="warning"
      title="Draft policy — pending business sign-off"
      icon={
        <span
          className={classNames("flex size-4 items-center justify-center rounded-full border border-warning/50 text-[0.625rem] font-semibold text-warning")}
          aria-hidden
        >
          !
        </span>
      }
    >
      <p>
        {page} is written for this prototype from the information Plusmark publishes today (catalogue, FAQ and contact
        details). Freight rules, delivery estimates, return windows and refund timelines have not been signed off by the
        business, so they are marked <em>to be confirmed</em> rather than guessed. Nothing on this page is a Plusmark
        commitment, and no certification or warranty period is asserted here.
      </p>
      <p className="pt-1">
        Confirm the terms that apply to your order with the Plusmark desk before placing it — see{" "}
        <Link href="/contact" className="underline decoration-line-strong underline-offset-4 hover:decoration-ink">
          contact &amp; support
        </Link>
        .
      </p>
    </Notice>
  );
}

/** Summary of what a draft policy can and cannot state. */
export function PolicyStatusPanel({
  confirmed,
  pending
}: {
  confirmed: string[];
  pending: string[];
}) {
  return (
    <div className="grid gap-px overflow-hidden rounded-sm border border-line bg-hair sm:grid-cols-2">
      <div className="bg-surface p-5">
        <p className="mb-3 text-caption font-semibold text-ink">Stated from published information</p>
        <ul className="flex flex-col gap-2">
          {confirmed.map((item) => (
            <li key={item} className="flex gap-2 text-body-sm leading-relaxed text-muted">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
      <div className="bg-subtle/50 p-5">
        <p className="mb-3 text-caption font-semibold text-muted">Awaiting business sign-off</p>
        <ul className="flex flex-col gap-2">
          {pending.map((item) => (
            <li key={item} className="flex gap-2 text-body-sm leading-relaxed text-muted">
              <span className="mt-2 size-1.5 shrink-0 rounded-full border border-warning" aria-hidden />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** Hairline section header for long-form policy copy. */
export function PolicySection({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-line pt-8" aria-labelledby={id}>
      <div className="mb-4 flex items-baseline gap-4">
        <span className="tabular text-caption font-semibold text-muted">{number}</span>
        <h2 id={id} className="font-display text-h2 leading-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

/**
 * Product rail shared by institutional and collection pages. Renders the real
 * catalogue cards so pricing, sizes and cart behaviour stay identical to shop.
 */
export function ProductGrid({ products, sizesNote }: { products: Product[]; sizesNote?: string }) {
  if (products.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-line-strong bg-subtle/35 p-5 text-body-sm text-muted">
        No catalogue items match this selection yet.
      </p>
    );
  }
  return (
    <>
      {sizesNote && <p className="mb-6 max-w-reading text-caption leading-relaxed text-muted">{sizesNote}</p>}
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
        {products.map((product) => (
          <li key={product.slug}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </>
  );
}

/**
 * Honest money-shaped disclaimer for any page that shows a demo rate-card
 * figure next to catalogue content. Plusmark publishes no list prices.
 */
export function DemoPricingNote({ className }: { className?: string }) {
  if (!DEMO_PRICING_ENABLED) {
    return (
      <p className={classNames("text-caption leading-relaxed text-muted", className)}>
        Every figure on this catalogue is quoted on request by the Plusmark desk. Plusmark publishes no list prices.
      </p>
    );
  }
  return (
    <p className={classNames("flex flex-wrap items-center gap-2 text-caption leading-relaxed text-muted", className)}>
      <Badge tone="demo">{DEMO_PRICING_LABEL}</Badge>
      <span>
        Demo rate-card figures are shown so the cart, GST breakdown and checkout can be exercised locally. They are not
        Plusmark prices and are never used as a real quote.
      </span>
    </p>
  );
}
