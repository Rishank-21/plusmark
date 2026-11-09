import { classNames } from "@/lib/format";
import { formatInr } from "@/lib/format";
import { DEMO_PRICING_ENABLED } from "@/lib/config";
import { DemoBadge } from "@/components/ui/Badge";
import type { Product, Variant } from "@/types";

/**
 * Renders a variant price, or the honest "Price on request" state. Plusmark
 * quotes per series, size and quantity, so a missing figure is normal — not an
 * error to paper over with a number.
 */
export function Price({
  product,
  variant,
  size = "md",
  showDemoBadge = true,
  className
}: {
  product: Product;
  variant?: Variant | null;
  size?: "sm" | "md" | "lg" | "xl";
  showDemoBadge?: boolean;
  className?: string;
}) {
  const amount = variant ? variant.priceInr : firstPrice(product);
  const onRequest = amount === null || !DEMO_PRICING_ENABLED;

  const scale = size === "xl" ? "text-[2.125rem] leading-none" : size === "lg" ? "text-price" : size === "sm" ? "text-body-sm" : "text-h4";

  if (onRequest) {
    return (
      <span className={classNames("inline-flex items-center gap-2", scale, className)}>
        <span className={classNames(size === "xl" ? "text-[2rem]" : "text-body-sm", "font-medium text-muted")}>Price on request</span>
      </span>
    );
  }

  return (
    <span className={classNames("inline-flex flex-wrap items-baseline gap-2", scale, className)}>
      <span className="tabular font-medium text-ink">{formatInr(amount)}</span>
      <span className={classNames(size === "xl" ? "text-[1rem]" : "text-caption", "text-muted")}>+ GST</span>
      {showDemoBadge && <DemoBadge label="Demo price" className={size === "xl" ? "text-[0.8125rem]" : undefined} />}
    </span>
  );
}

export function PriceRange({
  product,
  variant,
  size = "md",
  className
}: {
  product: Product;
  variant?: Variant | null;
  size?: "md" | "lg";
  className?: string;
}) {
  const values = product.variants
    .filter((v) => (v.packQty ?? 1) === 1)
    .map((v) => v.priceInr)
    .filter((v): v is number => v !== null);
  const amount = variant?.priceInr ?? (values.length ? Math.min(...values) : null);
  if (amount === null || !DEMO_PRICING_ENABLED) {
    return (
      <span className={classNames(size === "lg" ? "text-body" : "text-caption", "font-medium text-muted", className)}>
        Price on request
      </span>
    );
  }
  const multipleSizes = !variant && new Set(values).size > 1;
  return (
    <span className={classNames("inline-flex flex-wrap items-baseline gap-1.5", className)}>
      {multipleSizes && <span className={classNames(size === "lg" ? "text-[0.75rem] sm:text-body-sm" : "text-caption", "text-muted")}>From</span>}
      <span className="inline-flex items-baseline gap-1 whitespace-nowrap">
        <span className={classNames(size === "lg" ? "text-[1.1875rem] sm:text-price" : "text-body-sm", "tabular font-medium text-ink")}>
          {formatInr(amount)}
        </span>
        <span className={classNames(size === "lg" ? "text-[0.75rem] sm:text-body-sm" : "text-caption", "text-muted")}>+ GST</span>
      </span>
    </span>
  );
}

function firstPrice(product: Product): number | null {
  const v = product.variants.find((x) => x.priceInr !== null);
  return v?.priceInr ?? null;
}
