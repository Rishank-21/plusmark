"use client";

import { Search, X } from "lucide-react";
import { classNames } from "@/lib/format";

/**
 * One dense row of controls above every admin table: search, filters, reset.
 * Labels are real <label> elements even where the text is visually hidden.
 */
export function FilterBar({
  children,
  onReset,
  resultLabel,
  className
}: {
  children: React.ReactNode;
  onReset?: () => void;
  resultLabel?: string;
  className?: string;
}) {
  return (
    <div className={classNames("flex flex-col gap-3 pb-4", className)}>
      <div className="flex flex-wrap items-end gap-2.5 rounded-sm border border-hair bg-surface p-3">
        {children}
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xs border border-hair-strong px-3 text-body-sm font-medium text-ink transition-colors hover:bg-sand/60"
          >
            <X className="size-4" aria-hidden />
            Reset
          </button>
        )}
      </div>
      {resultLabel && (
        <p aria-live="polite" className="tabular text-caption text-graphite">
          {resultLabel}
        </p>
      )}
    </div>
  );
}

export function SearchControl({
  label,
  value,
  onChange,
  placeholder,
  className,
  width = "min-w-[13rem]"
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
}) {
  const id = `search-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <div className={classNames("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="text-caption font-medium text-ink">
        {label}
      </label>
      <span className={classNames("relative flex items-center", width)}>
        <Search className="pointer-events-none absolute left-3 size-4 text-graphite-light" aria-hidden />
        <input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-xs border border-hair-strong bg-surface pl-9 pr-8 text-body-sm text-ink placeholder:text-graphite-light transition-colors hover:border-graphite-light focus-visible:border-navy-deep"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label={`Clear ${label.toLowerCase()}`}
            className="absolute right-1.5 flex size-8 items-center justify-center rounded-xs text-graphite transition-colors hover:bg-sand hover:text-ink"
          >
            <X className="size-3.5" aria-hidden />
          </button>
        )}
      </span>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  onChange,
  options,
  className
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  /** First option is normally the "All …" choice. */
  options: { value: string; label: string }[];
  className?: string;
}) {
  const id = `filter-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <div className={classNames("flex min-w-0 flex-col gap-1", className)}>
      <label htmlFor={id} className="text-caption font-medium text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-[10rem] rounded-xs border border-hair-strong bg-surface px-3 text-body-sm text-ink transition-colors hover:border-graphite-light focus-visible:border-navy-deep"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DateControl({
  label,
  value,
  onChange,
  max,
  min
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  min?: string;
  max?: string;
}) {
  const id = `date-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label htmlFor={id} className="text-caption font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        className="tabular h-11 rounded-xs border border-hair-strong bg-surface px-3 text-body-sm text-ink transition-colors hover:border-graphite-light focus-visible:border-navy-deep"
      />
    </div>
  );
}
