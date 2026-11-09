"use client";

import { classNames, formatInr, variantLabel } from "@/lib/format";
import { Check, ChevronDown } from "lucide-react";
import { DEMO_PRICING_ENABLED } from "@/lib/config";
import type { Product, Variant } from "@/types";

export function SizeSelector({
  product,
  selectedId,
  onSelect,
  showPrice = true,
  showLegend = true,
  showHelper = true,
  layout = "chips",
  variants
}: {
  product: Product;
  selectedId: string | null;
  onSelect: (variant: Variant) => void;
  showPrice?: boolean;
  showLegend?: boolean;
  showHelper?: boolean;
  /** Compact surfaces (quick view) use a single select instead of chips. */
  layout?: "chips" | "select";
  variants?: Variant[];
}) {
  const options = variants ?? product.variants;

  if (layout === "select") {
    return (
      <label className="flex flex-col gap-2">
        <span className={classNames("text-[0.875rem] font-semibold uppercase tracking-[0.12em] text-muted", !showLegend && "sr-only")}>
          Choose a size
        </span>
        <div className="relative">
          <select
            value={selectedId ?? ""}
            onChange={(event) => {
              const variant = options.find((option) => option.id === event.target.value);
              if (variant) onSelect(variant);
            }}
            className="h-12 w-full appearance-none rounded-md border border-line-strong bg-surface pl-3 pr-10 text-body-sm text-ink transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          >
            {options.map((variant) => {
              const price = showPrice && variant.priceInr !== null && DEMO_PRICING_ENABLED ? ` — ${formatInr(variant.priceInr)}` : "";
              return (
                <option key={variant.id} value={variant.id} disabled={!variant.available}>
                  {variantLabel(variant)}{price}{variant.available ? "" : " (unavailable)"}
                </option>
              );
            })}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        </div>
      </label>
    );
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={classNames("pb-1 text-[0.875rem] font-semibold uppercase tracking-[0.12em] text-muted", !showLegend && "sr-only")}>
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
                "flex min-h-12 min-w-[5.5rem] flex-col items-start justify-center gap-0.5 rounded-md border-2 px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                selected
                  ? "border-primary bg-primary-soft text-ink"
                  : "border-line bg-surface text-ink hover:border-graphite-light",
                !variant.available && "cursor-not-allowed opacity-45 hover:border-line"
              )}
            >
              <span className="flex items-center gap-1 text-[0.9375rem] font-semibold leading-tight">
                {variantLabel(variant)}
                {selected && <Check className="size-3.5 text-primary-strong sm:hidden" strokeWidth={2.5} aria-hidden />}
              </span>
              {showPrice && variant.priceInr !== null && DEMO_PRICING_ENABLED && (
                <span className={classNames("tabular text-caption leading-tight max-sm:text-[0.75rem]", selected ? "text-primary-strong" : "text-muted")}>
                  {formatInr(variant.priceInr)}
                </span>
              )}
              {(!variant.priceInr || !DEMO_PRICING_ENABLED) && (
                <span className={classNames("text-caption leading-tight max-sm:text-[0.75rem]", selected ? "text-primary-strong" : "text-muted")}>
                  On request
                </span>
              )}
            </button>
          );
        })}
      </div>
      {showHelper && (
        <p className="text-[0.9375rem] leading-relaxed text-muted">
          {product.variants[0]?.size.widthCm
            ? "Non-standard sizes are made to order — ask Plusmark for a price."
            : "This range is made in the size you specify. Share your dimensions with the Plusmark team."}
        </p>
      )}
    </fieldset>
  );
}
