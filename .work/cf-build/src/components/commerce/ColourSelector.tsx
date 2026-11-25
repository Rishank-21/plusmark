"use client";

import { ChevronDown } from "lucide-react";

export function ColourSelector({
  colours,
  value,
  onChange
}: {
  colours: string[];
  value: string;
  onChange: (colour: string) => void;
}) {
  if (colours.length === 0) return null;
  return (
    <label className="flex flex-col gap-2">
      <span className="text-[0.875rem] font-semibold uppercase tracking-[0.12em] text-muted">Choose a colour</span>
      <div className="relative">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full appearance-none rounded-md border border-line-strong bg-surface pl-3 pr-10 text-body-sm text-ink transition-colors hover:border-primary focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
        >
          {colours.map((colour) => (
            <option key={colour} value={colour}>
              {colour}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
      </div>
    </label>
  );
}
