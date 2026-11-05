"use client";

import { classNames, formatInr, variantLabel } from "@/lib/format";
import { DEMO_PRICING_ENABLED } from "@/lib/config";
import type { Product, Variant } from "@/types";

export function SizeSelector({
  product,
  selectedId,
  onSelect,
  showPrice = true,
  showLegend = true,
  variants
}: {
  product: Product;
  selectedId: string | null;
  onSelect: (variant: Variant) => void;
  showPrice?: boolean;
  showLegend?: boolean;
  variants?: Variant[];
}) {
  const options = variants ?? product.variants;

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={classNames("pb-1 text-[0.875rem] font-semibold uppercase tracking-[0.12em] text-graphite", !showLegend && "sr-only")}>
        Choose a size
      </legend>
      <div className="flex flex-wrap gap-2">
        {options.map((variant) => {
          const selected = variant.id === selectedId;
          return (
            <button
              key={variant.id}
              type="button"
              onClick={() => onSelect(variant)}
              aria-pressed={selected}
              disabled={!variant.available}
              className={classNames(
                "flex min-h-12 min-w-[5.5rem] flex-col items-start justify-center gap-0.5 rounded-md border-2 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2",
                selected
                  ? "border-blue bg-blue-wash text-navy"
                  : "border-hair bg-surface text-ink hover:border-graphite-light",
                !variant.available && "cursor-not-allowed opacity-45 hover:border-hair"
              )}
            >
              <span className="text-[0.9375rem] font-semibold leading-tight">{variantLabel(variant)}</span>
              {showPrice && variant.priceInr !== null && DEMO_PRICING_ENABLED && (
                <span className={classNames("tabular text-caption leading-tight", selected ? "text-blue-deep" : "text-graphite")}>
                  {formatInr(variant.priceInr)}
                </span>
              )}
              {(!variant.priceInr || !DEMO_PRICING_ENABLED) && (
                <span className={classNames("text-caption leading-tight", selected ? "text-blue-deep" : "text-graphite-light")}>
                  On request
                </span>
              )}
            </button>
          );
        })}
      </div>
      <p className="text-[0.9375rem] leading-relaxed text-graphite">
        {product.variants[0]?.size.widthCm
          ? "Non-standard sizes are made to order — ask Plusmark for a price."
          : "This range is made in the size you specify. Share your dimensions with the Plusmark team."}
      </p>
    </fieldset>
  );
}
