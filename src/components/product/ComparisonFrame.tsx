"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { classNames } from "@/lib/format";

/**
 * The table itself is rendered on the server; this wrapper only flips the
 * "differences only" view so no catalogue data reaches the client bundle.
 */
export function ComparisonFrame({
  differentRows,
  children
}: {
  differentRows: number;
  children: ReactNode;
}) {
  const [differencesOnly, setDifferencesOnly] = useState(false);

  if (differentRows === 0) return <>{children}</>;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <p className="text-caption text-muted lg:hidden">Swipe sideways to see every board.</p>
        <button
          type="button"
          aria-pressed={differencesOnly}
          onClick={() => setDifferencesOnly((value) => !value)}
          className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-sm text-body-sm font-medium text-ink-soft hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:min-h-9"
        >
          <span
            aria-hidden
            className={classNames(
              "flex size-4 items-center justify-center rounded-[4px] border transition-colors",
              differencesOnly ? "border-primary bg-primary text-onprimary" : "border-line-strong bg-surface"
            )}
          >
            {differencesOnly && <Check className="size-3" strokeWidth={3} />}
          </span>
          Show differences only
          <span className="tabular text-muted">({differentRows})</span>
        </button>
      </div>
      <div className={differencesOnly ? "[&_tbody_tr[data-same]]:hidden" : undefined}>{children}</div>
    </div>
  );
}
