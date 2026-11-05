import { classNames } from "@/lib/format";
import { DEMO_PRICING_LABEL } from "@/lib/config";

type Tone = "neutral" | "navy" | "success" | "danger" | "warning" | "demo";

const TONES: Record<Tone, string> = {
  neutral: "border-hair bg-sand/70 text-ink",
  navy: "border-navy/30 bg-navy-wash text-navy-deep",
  success: "border-success/30 bg-success-wash text-success",
  danger: "border-danger/30 bg-danger-wash text-danger",
  warning: "border-warning/30 bg-warning-wash text-warning",
  demo: "border-dashed border-graphite/40 bg-transparent text-graphite"
};

export function Badge({
  tone = "neutral",
  children,
  className,
  icon
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1.5 rounded-xs border px-2 py-1 text-label font-medium uppercase tracking-[0.1em]",
        TONES[tone],
        className
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** Marks any figure or record that the prototype invented, never Plusmark data. */
export function DemoBadge({ label, className }: { label?: string; className?: string }) {
  return (
    <span
      title={DEMO_PRICING_LABEL}
      className={classNames(
        "inline-flex items-center rounded-xs border border-dashed border-graphite/40 px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.1em] text-graphite",
        className
      )}
    >
      {label ?? "Demo"}
    </span>
  );
}

const STATUS_LABEL: Record<string, { label: string; tone: Tone }> = {
  placed: { label: "Order placed", tone: "neutral" },
  payment_pending: { label: "Payment pending", tone: "warning" },
  payment_failed: { label: "Payment failed", tone: "danger" },
  confirmed: { label: "Payment confirmed", tone: "navy" },
  processing: { label: "Processing", tone: "navy" },
  dispatched: { label: "Dispatched", tone: "navy" },
  delivered: { label: "Delivered", tone: "success" },
  cancelled: { label: "Cancelled", tone: "danger" },
  return_requested: { label: "Return requested", tone: "warning" },
  refund_processing: { label: "Refund processing", tone: "warning" },
  refunded: { label: "Refunded", tone: "neutral" },
  unpaid: { label: "Unpaid", tone: "neutral" },
  pending: { label: "Pending", tone: "warning" },
  paid: { label: "Paid", tone: "success" },
  failed: { label: "Failed", tone: "danger" },
  new: { label: "New", tone: "navy" },
  contacted: { label: "Contacted", tone: "neutral" },
  quote_sent: { label: "Quote sent", tone: "navy" },
  negotiation: { label: "Negotiation", tone: "warning" },
  accepted: { label: "Accepted", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  draft: { label: "Draft", tone: "neutral" },
  sent: { label: "Sent", tone: "navy" },
  converted: { label: "Converted to order", tone: "success" },
  active: { label: "Active", tone: "success" },
  blocked: { label: "Blocked", tone: "danger" }
};

export function StatusBadge({ status, demo }: { status: string; demo?: boolean }) {
  const entry = STATUS_LABEL[status] ?? { label: status.replace(/_/g, " "), tone: "neutral" as Tone };
  return (
    <span className="inline-flex items-center gap-1.5">
      <Badge tone={entry.tone}>{entry.label}</Badge>
      {demo && <DemoBadge />}
    </span>
  );
}
