"use client";

import { useState } from "react";
import { Database, PenLine, TriangleAlert } from "lucide-react";
import { Badge, DemoBadge } from "@/components/ui/Badge";
import { classNames } from "@/lib/format";

/**
 * The frontend is never authoritative. Anything that would need to write to
 * Supabase/Postgres renders this instead of a success toast.
 */
export function PrototypeResult({
  action,
  details,
  children,
  className
}: {
  /** Past-tense attempt, e.g. "Save product requested". */
  action: string;
  /** Exactly what would have changed server-side. */
  details: string[];
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames("flex flex-col gap-2.5 rounded-sm border border-warning/35 bg-warning-wash p-4", className)}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-wrap items-center gap-2">
        <TriangleAlert className="size-4 shrink-0 text-warning" aria-hidden />
        <p className="text-body-sm font-medium text-ink">{action} — prototype only, nothing was written</p>
        <DemoBadge label="No server call" />
      </div>
      <p className="text-caption leading-relaxed text-graphite">
        This action needs the Supabase / PostgreSQL service layer (an authenticated RPC plus a row-level-policy check on
        the admin role). No API was called, no record changed, and the figures above are demonstration data.
      </p>
      <ul className="flex flex-col gap-1 border-t border-warning/25 pt-2.5">
        {details.map((detail) => (
          <li key={detail} className="flex gap-2 text-caption leading-relaxed text-ink">
            <Database className="mt-0.5 size-3.5 shrink-0 text-graphite" aria-hidden />
            <span>{detail}</span>
          </li>
        ))}
      </ul>
      {children}
    </div>
  );
}

/** Standard shape: hold the last requested change and render it honestly. */
export function usePrototypeAction() {
  const [request, setRequest] = useState<{ action: string; details: string[] } | null>(null);
  return {
    request,
    clear: () => setRequest(null),
    record: (action: string, details: string[]) => setRequest({ action, details })
  };
}

/**
 * A control that cannot work yet is rendered disabled with its reason, never
 * as a decorative button.
 */
export function DisabledAction({
  label,
  reason,
  className
}: {
  label: string;
  reason: string;
  className?: string;
}) {
  return (
    <span className={classNames("inline-flex max-w-[20rem] flex-col items-start gap-1", className)}>
      <button
        type="button"
        disabled
        aria-disabled="true"
        title={reason}
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xs border border-hair bg-sand/50 px-4 text-body-sm font-medium text-graphite"
      >
        <PenLine className="size-4" aria-hidden />
        {label}
      </button>
      <span className="text-left text-[0.6875rem] leading-snug text-graphite-light">{reason}</span>
    </span>
  );
}

/** Inline marker for a value the admin has changed in memory only. */
export function LocalChangeTag({ children }: { children?: React.ReactNode }) {
  return (
    <Badge tone="demo" className="whitespace-nowrap">
      {children ?? "Local preview"}
    </Badge>
  );
}

/** One-liner used on screens whose numbers all come from demo-data.ts. */
export function DemoSourceNote({ source }: { source: string }) {
  return (
    <p className="text-[0.6875rem] leading-relaxed text-graphite-light">
      Every figure on this screen is generated in <span className="font-medium text-graphite">{source}</span>. It is
      synthetic demonstration data for the prototype review, not Plusmark business history.
    </p>
  );
}
