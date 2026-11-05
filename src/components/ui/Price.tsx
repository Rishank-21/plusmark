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
        <span className={classNames(size === "xl" ? "text-[2rem]" : "text-body-sm", "font-medium text-graphite")}>Price on request</span>
      </span>
    );
  }

  return (
    <span className={classNames("inline-flex flex-wrap items-baseline gap-2", scale, className)}>
      <span className="tabular font-medium text-ink">{formatInr(amount)}</span>
      <span className={classNames(size === "xl" ? "text-[1rem]" : "text-caption", "text-graphite")}>+ GST</span>
      {showDemoBadge && <DemoBadge label="Demo price" className={size === "xl" ? "text-[0.8125rem]" : undefined} />}
    </span>
  );
}

export function PriceRange({
  product,
  variant,
  size = "md",
  className,
  showDiscount = false
}: {
  product: Product;
  variant?: Variant | null;
  size?: "md" | "lg";
  className?: string;
  showDiscount?: boolean;
}) {
  const values = product.variants
    .filter((v) => (v.packQty ?? 1) === 1)
    .map((v) => v.priceInr)
    .filter((v): v is number => v !== null);
  const amount = variant?.priceInr ?? (values.length ? Math.min(...values) : null);
  if (amount === null || !DEMO_PRICING_ENABLED) {
    return (
      <span className={classNames(size === "lg" ? "text-body" : "text-caption", "font-medium text-graphite", className)}>
        Price on request
      </span>
    );
  }
  const discountPercent = 10;
  const originalPrice = Math.ceil(amount / (1 - discountPercent / 100));
  return (
    <span className={classNames("inline-flex flex-wrap items-baseline gap-2", className)}>
      {showDiscount && (
        <span className="text-body-sm font-semibold text-terra">{discountPercent}% off</span>
      )}
      {showDiscount && (
        <span className="text-body-sm text-graphite line-through">{formatInr(originalPrice)}</span>
      )}
      <span className={classNames(size === "lg" ? "text-price" : "text-body-sm", "tabular font-medium text-ink")}>
        {formatInr(amount)}
      </span>
    </span>
  );
}

function firstPrice(product: Product): number | null {
  const v = product.variants.find((x) => x.priceInr !== null);
  return v?.priceInr ?? null;
}
