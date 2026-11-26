"use client";

import { classNames } from "@/lib/format";

/** Small form and layout pieces shared by the admin screens. */
export const inputCls =
  "h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-body-sm text-ink transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:bg-subtle disabled:text-muted";

export function Labelled({ label, hint, children, className }: { label: string; hint?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={classNames("flex min-w-0 flex-col gap-1", className)}>
      <span className="text-caption font-medium text-ink">{label}</span>
      {children}
      {hint && <span className="text-caption text-muted">{hint}</span>}
    </label>
  );
}

export function Input({
  label,
  hint,
  className,
  ...rest
}: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <Labelled label={label} hint={hint} className={className}>
      <input {...rest} className={inputCls} />
    </Labelled>
  );
}

export function Area({
  label,
  hint,
  className,
  ...rest
}: { label: string; hint?: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <Labelled label={label} hint={hint} className={className}>
      <textarea {...rest} className={classNames(inputCls, "h-auto min-h-24 py-2")} />
    </Labelled>
  );
}

export function Pick({
  label,
  value,
  onChange,
  options,
  className,
  hint,
  disabled
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
  className?: string;
  hint?: string;
  disabled?: boolean;
}) {
  return (
    <Labelled label={label} hint={hint} className={className}>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </Labelled>
  );
}

export function Check({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (value: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-2 text-body-sm text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1 size-4 accent-[var(--color-primary,#0f766e)]" />
      <span>
        {label}
        {hint && <span className="block text-caption text-muted">{hint}</span>}
      </span>
    </label>
  );
}

const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-800 border-emerald-200",
  amber: "bg-amber-50 text-amber-900 border-amber-200",
  red: "bg-red-50 text-red-800 border-red-200",
  blue: "bg-sky-50 text-sky-800 border-sky-200",
  grey: "bg-subtle text-ink-soft border-line"
};

export function Pill({ tone = "grey", children }: { tone?: keyof typeof TONES | string; children: React.ReactNode }) {
  return (
    <span className={classNames("inline-flex items-center rounded-full border px-2 py-0.5 text-caption font-medium", TONES[tone] ?? TONES.grey)}>
      {children}
    </span>
  );
}

export function statusTone(status: string): string {
  if (["delivered", "paid", "confirmed", "published", "captured", "processed", "sent", "refunded", "approved", "received"].includes(status)) return "green";
  if (["cancelled", "failed", "payment_failed", "rejected", "returned"].includes(status)) return "red";
  if (["payment_pending", "pending", "requested", "return_requested", "refund_processing", "partially_refunded", "needs_attention"].includes(status)) return "amber";
  if (["dispatched", "processing", "in_transit", "out_for_delivery", "pickup_scheduled"].includes(status)) return "blue";
  return "grey";
}

export function Section({ title, aside, children }: { title: string; aside?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-line bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <h2 className="font-display text-h4 font-bold text-ink">{title}</h2>
        {aside}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

export function SimpleTable({
  head,
  rows,
  empty = "Nothing here yet."
}: {
  head: string[];
  rows: React.ReactNode[][];
  empty?: string;
}) {
  if (!rows.length) return <p className="py-6 text-center text-body-sm text-muted">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-left text-body-sm">
        <thead>
          <tr className="border-b border-line text-caption uppercase tracking-[0.06em] text-muted">
            {head.map((h) => (
              <th key={h} className="px-2 py-2 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, i) => (
            <tr key={i} className="border-b border-line/60 align-top last:border-0">
              {cells.map((cell, j) => (
                <td key={j} className="px-2 py-2">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Loading({ what = "Loading" }: { what?: string }) {
  return (
    <p role="status" className="py-8 text-center text-body-sm text-muted">
      {what}…
    </p>
  );
}

export function ErrorLine({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-body-sm text-red-800">
      <span>{message}</span>
      {onRetry && (
        <button type="button" onClick={onRetry} className="font-medium underline underline-offset-4">
          Try again
        </button>
      )}
    </div>
  );
}
