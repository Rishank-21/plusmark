"use client";

import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Nav";
import { DemoBadge } from "@/components/ui/Badge";
import { classNames } from "@/lib/format";

/**
 * Page furniture shared by every admin screen: serif title, breadcrumb trail,
 * optional lede and a right-aligned action slot.
 */
export function AdminPageHeader({
  title,
  lede,
  crumbs,
  actions,
  demo,
  className
}: {
  title: string;
  lede?: string;
  crumbs: { label: string; href?: string }[];
  actions?: React.ReactNode;
  /** Marks the whole screen as prototype figures rather than Plusmark data. */
  demo?: boolean;
  className?: string;
}) {
  return (
    <header className={classNames("flex flex-col gap-3 pb-5", className)}>
      <Breadcrumbs trail={crumbs} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex min-w-0 flex-col gap-1.5">
          <h1 className="flex flex-wrap items-center gap-2.5 font-display text-h1 leading-tight text-ink">
            <span className="min-w-0">{title}</span>
            {demo && <DemoBadge label="Demo data" />}
          </h1>
          {lede && <p className="max-w-reading text-body-sm text-graphite">{lede}</p>}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{actions}</div>
        )}
      </div>
    </header>
  );
}

/** Hairline-divided metric strip: density without the pastel KPI-card look. */
export function StatStrip({
  items,
  caption
}: {
  items: { label: string; value: string; note?: string; href?: string }[];
  caption?: string;
}) {
  return (
    <section aria-label={caption ?? "Key figures"}>
      {caption && <h2 className="pm-eyebrow pb-2">{caption}</h2>}
      <dl className="grid grid-cols-2 gap-px border border-hair bg-hair sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col gap-1 bg-surface px-3.5 py-3">
            <dt className="text-label font-medium uppercase tracking-[0.1em] text-graphite">{item.label}</dt>
            <dd className="tabular text-price leading-none text-ink">
              {item.href ? (
                <Link
                  href={item.href}
                  className="rounded-xs underline decoration-hair-strong underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {item.value}
                </Link>
              ) : (
                item.value
              )}
            </dd>
            {item.note && <p className="text-[0.6875rem] leading-snug text-graphite-light">{item.note}</p>}
          </div>
        ))}
      </dl>
    </section>
  );
}

/** Compact bordered table of label/value rows. */
export function MetricsTable({
  title,
  rows,
  note
}: {
  title: string;
  rows: { label: string; value: string; href?: string }[];
  note?: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <h2 className="pm-eyebrow">{title}</h2>
      <div className="overflow-hidden rounded-sm border border-hair bg-surface">
        <table className="w-full border-collapse text-left">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-hair last:border-b-0">
                <th scope="row" className="w-1/2 px-3.5 py-2.5 text-body-sm font-normal text-graphite">
                  {row.href ? (
                    <Link
                      href={row.href}
                      className="rounded-xs text-ink underline decoration-hair-strong underline-offset-4 transition-colors hover:decoration-ink"
                    >
                      {row.label}
                    </Link>
                  ) : (
                    row.label
                  )}
                </th>
                <td className="px-3.5 py-2.5 text-right tabular text-body-sm font-medium text-ink">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="text-[0.6875rem] leading-snug text-graphite-light">{note}</p>}
    </section>
  );
}

/**
 * Bars for the reports screen. Lengths are real counts divided by the largest
 * count in the same set — nothing here is invented.
 */
export function DemoBars({
  title,
  rows,
  unit,
  note
}: {
  title: string;
  rows: { label: string; value: number; secondary?: string }[];
  unit: string;
  note?: string;
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <section className="flex min-w-0 flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="pm-eyebrow">{title}</h2>
        <span className="text-[0.625rem] uppercase tracking-[0.1em] text-graphite-light">{unit}</span>
      </div>
      <ul className="flex flex-col divide-y divide-hair rounded-sm border border-hair bg-surface">
        {rows.map((row) => (
          <li key={row.label} className="flex flex-col gap-1.5 px-3.5 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="min-w-0 text-body-sm text-ink">{row.label}</span>
              <span className="shrink-0 tabular text-body-sm font-medium text-ink">
                {row.value.toLocaleString("en-IN")}
                {row.secondary && <span className="ml-2 font-normal text-graphite">{row.secondary}</span>}
              </span>
            </div>
            <div className="h-2 w-full border border-hair bg-sand/40">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.round((row.value / max) * 100)}%` }}
                role="img"
                aria-label={`${row.label}: ${row.value} ${unit} (${Math.round((row.value / max) * 100)}% of the largest in this set)`}
              />
            </div>
          </li>
        ))}
      </ul>
      {note && <p className="text-[0.6875rem] leading-snug text-graphite-light">{note}</p>}
    </section>
  );
}

/** Card with a hairline border and a quiet header — the default admin panel. */
export function AdminPanel({
  title,
  description,
  aside,
  children,
  className,
  padded = true
}: {
  title: string;
  description?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={classNames("flex min-w-0 flex-col rounded-sm border border-hair bg-surface", className)}>
      <div className="flex flex-col gap-1 border-b border-hair px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2 className="font-display text-h4 leading-tight text-ink">{title}</h2>
          {description && <p className="text-caption text-graphite">{description}</p>}
        </div>
        {aside && <div className="flex shrink-0 items-center gap-2 pt-1 sm:pt-0">{aside}</div>}
      </div>
      <div className={classNames("min-w-0", padded && "p-4")}>{children}</div>
    </section>
  );
}
