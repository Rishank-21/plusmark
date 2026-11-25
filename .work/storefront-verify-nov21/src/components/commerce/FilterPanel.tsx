"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { Collapsible } from "@/components/ui/Accordion";
import { categories, seriesList } from "@/lib/catalog";
import { DEMO_PRICING_ENABLED } from "@/lib/config";
import { activeFilterCount, FILTER_SIZE_OPTIONS, PRICE_BANDS } from "@/lib/filters";
import { filtersToQuery } from "@/lib/listing-query";
import { classNames } from "@/lib/format";
import type { PriceBand, ProductFilterState, SortKey } from "@/types";

export interface FilterTarget {
  /** Route that renders the listing, e.g. `/shop` or `/shop/chalk-boards`. */
  basePath: string;
  /** Set when the route already fixes the category, so it is not re-offered. */
  lockedCategoryId?: string | null;
  lockedSubcategoryId?: string | null;
}

interface FilterPanelProps extends Omit<FilterTarget, "basePath"> {
  filters: ProductFilterState;
  sort: SortKey;
  onChange: (next: ProductFilterState) => void;
  onClear: () => void;
}

export function FilterPanel({ filters, sort, lockedCategoryId, lockedSubcategoryId, onChange, onClear }: FilterPanelProps) {
  const active = activeFilterCount(filters);
  const lockedCategory = categories.find((c) => c.id === lockedCategoryId) ?? null;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line pb-3">
        <h2 className="font-sans text-body font-semibold text-ink">Filters{active > 0 ? ` · ${active}` : ""}</h2>
        {active > 0 && (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1 text-caption font-medium text-primary underline decoration-primary/35 underline-offset-4 hover:text-primary-strong hover:decoration-primary"
          >
            <X className="size-3.5" aria-hidden />
            Clear all
          </button>
        )}
      </div>

      {!lockedCategory && (
        <Collapsible title="Category" defaultOpen>
          <ul className="flex flex-col gap-0.5">
            <li>
              <RowLink href={`/shop${filtersToQuery({ ...filters, categoryId: null, subcategoryId: null }, sort, 1)}`} active={!filters.categoryId}>
                All categories
              </RowLink>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <RowLink
                  href={`/shop/${category.slug}${filtersToQuery({ ...filters, categoryId: null, subcategoryId: null }, sort, 1)}`}
                  active={filters.categoryId === category.id}
                >
                  {category.name}
                </RowLink>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}

      {lockedCategory && lockedCategory.subcategories.length > 0 && (
        <Collapsible title="Subcategory" defaultOpen>
          <ul className="flex flex-col gap-0.5">
            <li>
              <RowLink href={`/shop/${lockedCategory.slug}${filtersToQuery({ ...filters, categoryId: null, subcategoryId: null }, sort, 1)}`} active={!lockedSubcategoryId}>
                All {lockedCategory.name.toLowerCase()}
              </RowLink>
            </li>
            {lockedCategory.subcategories.map((sub) => (
              <li key={sub.id}>
                <RowLink
                  href={`/shop/${lockedCategory.slug}/${sub.id}${filtersToQuery({ ...filters, categoryId: null, subcategoryId: null }, sort, 1)}`}
                  active={lockedSubcategoryId === sub.id}
                >
                  {sub.name}
                </RowLink>
              </li>
            ))}
          </ul>
        </Collapsible>
      )}

      <Collapsible title="Product series" defaultOpen>
        <ul className="flex flex-col gap-2">
          {seriesList.map((series) => (
            <li key={series.id}>
              <CheckRow
                label={series.name}
                hint={series.surface}
                checked={filters.seriesIds.includes(series.id)}
                onToggle={() =>
                  onChange({
                    ...filters,
                    seriesIds: filters.seriesIds.includes(series.id)
                      ? filters.seriesIds.filter((id) => id !== series.id)
                      : [...filters.seriesIds, series.id]
                  })
                }
              />
            </li>
          ))}
        </ul>
      </Collapsible>

      <Collapsible title="Dimensions">
        <ul className="grid grid-cols-2 gap-x-3 gap-y-2">
          {FILTER_SIZE_OPTIONS.map((size) => (
            <li key={size.id}>
              <CheckRow
                label={size.label}
                checked={filters.sizeIds.includes(size.id)}
                onToggle={() =>
                  onChange({
                    ...filters,
                    sizeIds: filters.sizeIds.includes(size.id)
                      ? filters.sizeIds.filter((id) => id !== size.id)
                      : [...filters.sizeIds, size.id]
                  })
                }
              />
            </li>
          ))}
        </ul>
      </Collapsible>

      <Collapsible title="Board type">
        <Segmented
          label="Board type"
          value={filters.boardType}
          options={[
            { value: "any", label: "Any" },
            { value: "non-magnetic", label: "Non-magnetic" },
            { value: "magnetic", label: "Magnetic" },
            { value: "ceramic", label: "Ceramic" }
          ]}
          onChange={(value) => onChange({ ...filters, boardType: value as ProductFilterState["boardType"] })}
        />
      </Collapsible>

      <Collapsible title="Writing surface">
        <Segmented
          label="Writing surface"
          value={filters.surfaceKind}
          options={[
            { value: "any", label: "Any" },
            { value: "marker", label: "Marker" },
            { value: "chalk", label: "Chalk" },
            { value: "pin-up", label: "Pin-up" }
          ]}
          onChange={(value) => onChange({ ...filters, surfaceKind: value as ProductFilterState["surfaceKind"] })}
        />
      </Collapsible>

      <Collapsible title="Sides">
        <Segmented
          label="Sides"
          value={filters.doubleSided}
          options={[
            { value: "any", label: "Any" },
            { value: "yes", label: "Both side" },
            { value: "no", label: "Single side" }
          ]}
          onChange={(value) => onChange({ ...filters, doubleSided: value as ProductFilterState["doubleSided"] })}
        />
      </Collapsible>

      <Collapsible title="Availability">
        <Segmented
          label="Availability"
          value={filters.availability}
          options={[
            { value: "any", label: "Any" },
            { value: "in_stock", label: "Ready to ship" },
            { value: "on_request", label: "Quoted on request" }
          ]}
          onChange={(value) => onChange({ ...filters, availability: value as ProductFilterState["availability"] })}
        />
      </Collapsible>

      {DEMO_PRICING_ENABLED && (
        <Collapsible title="Demo price band">
          <ul className="flex flex-col gap-2">
            {[...PRICE_BANDS, { value: "on_request", label: "Price on request" }].map((band) => (
              <li key={band.value}>
                <RadioRow
                  name="priceBand"
                  label={band.label}
                  checked={filters.priceBand === band.value}
                  onChange={() => onChange({ ...filters, priceBand: band.value as PriceBand })}
                />
              </li>
            ))}
          </ul>
          <p className="pt-2 text-caption leading-snug text-muted">
            Bands come from the prototype rate card. Plusmark quotes per series, size and quantity.
          </p>
        </Collapsible>
      )}
    </div>
  );
}

export function FilterDrawer({ open, onClose, ...panelProps }: FilterPanelProps & { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filters">
      <button type="button" className="absolute inset-0 bg-scrim/40" onClick={onClose} aria-label="Close filters" />
      <div className="absolute inset-y-0 left-0 flex w-[min(22rem,92vw)] flex-col bg-surface shadow-drawer">
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <span className="font-sans text-body font-semibold text-ink">Refine</span>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 items-center justify-center rounded-xs text-muted transition-colors hover:bg-subtle"
            aria-label="Close filters"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <FilterPanel {...panelProps} />
        </div>
        <div className="border-t border-line p-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-full items-center justify-center rounded-md bg-primary text-body-sm font-medium text-onprimary transition-colors hover:bg-primary-strong"
          >
            Show results
          </button>
        </div>
      </div>
    </div>
  );
}

function RowLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={classNames(
        "-mx-2 block rounded-xs px-2 py-1 text-body-sm transition-colors",
        active ? "bg-primary-soft font-semibold text-primary-strong" : "text-muted hover:bg-subtle/70 hover:text-ink"
      )}
    >
      {children}
    </Link>
  );
}

function CheckRow({ label, hint, checked, onToggle }: { label: string; hint?: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-body-sm text-muted hover:text-ink">
      <input type="checkbox" className="peer sr-only" checked={checked} onChange={onToggle} />
      <span
        className={classNames(
          "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-[2px] border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
          checked ? "border-primary bg-primary text-onprimary" : "border-line-strong bg-surface"
        )}
        aria-hidden
      >
        {checked && <Check className="size-3" />}
      </span>
      <span className="min-w-0">
        <span className="block leading-snug">{label}</span>
        {hint && <span className="block text-caption leading-snug text-muted">{hint}</span>}
      </span>
    </label>
  );
}

function RadioRow({ name, label, checked, onChange }: { name: string; label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-body-sm text-muted hover:text-ink">
      <input type="radio" name={name} className="peer sr-only" checked={checked} onChange={onChange} />
      <span
        className={classNames(
          "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2",
          checked ? "border-primary" : "border-line-strong"
        )}
        aria-hidden
      >
        {checked && <span className="size-2 rounded-full bg-primary" />}
      </span>
      {label}
    </label>
  );
}

function Segmented({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={classNames(
            "h-9 rounded-xs border px-3 text-caption font-medium transition-colors",
            value === option.value ? "border-primary bg-primary text-onprimary" : "border-line-strong text-muted hover:border-primary hover:text-primary"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
