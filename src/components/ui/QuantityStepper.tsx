"use client";

import { Minus, Plus } from "lucide-react";
import { classNames } from "@/lib/format";

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 999,
  size = "md",
  disabled,
  label = "Quantity"
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  disabled?: boolean;
  label?: string;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));
  const dim = size === "sm" ? "h-10 lg:h-9" : "h-11";

  return (
    <div
      className={classNames(
        "inline-flex items-stretch overflow-hidden rounded-lg border border-hair-strong bg-surface",
        dim,
        disabled && "opacity-50"
      )}
    >
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={disabled || value <= min}
        aria-label={`Decrease ${label.toLowerCase()}`}
        className="flex w-10 items-center justify-center text-graphite transition-colors hover:bg-sand hover:text-ink disabled:opacity-35 lg:w-9"
      >
        <Minus className="size-4" aria-hidden />
      </button>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        min={min}
        max={max}
        disabled={disabled}
        aria-label={label}
        onChange={(e) => {
          const parsed = Number.parseInt(e.target.value, 10);
          if (Number.isNaN(parsed)) return onChange(min);
          onChange(clamp(parsed));
        }}
        className="tabular w-12 border-x border-hair bg-transparent text-center text-body-sm font-medium text-ink focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={disabled || value >= max}
        aria-label={`Increase ${label.toLowerCase()}`}
        className="flex w-10 items-center justify-center text-graphite transition-colors hover:bg-sand hover:text-ink disabled:opacity-35 lg:w-9"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </div>
  );
}
