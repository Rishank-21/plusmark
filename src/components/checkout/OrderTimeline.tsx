"use client";

import { Ban, Check, Circle, Clock, Home, Minus, Package, RotateCcw, Truck } from "lucide-react";
import { classNames, formatDate, formatDateTime } from "@/lib/format";
import { buildTimeline, type StepState } from "@/components/checkout/order-display";
import type { Order, OrderStatus } from "@/types";

const STEP_ICONS: Record<string, typeof Check> = {
  placed: Circle,
  confirmed: Check,
  processing: Package,
  dispatched: Truck,
  out_for_delivery: Truck,
  delivered: Home,
  payment_pending: Clock,
  payment_failed: Ban,
  cancelled: Ban,
  return_requested: RotateCcw,
  refund_processing: Clock,
  refunded: Check
};

const STATE_LABEL: Record<StepState, string> = {
  complete: "Done",
  current: "Current",
  upcoming: "Pending",
  not_recorded: "Not recorded",
  halted: "Stopped"
};

const STATE_CLASS: Record<StepState, string> = {
  complete: "border-navy bg-navy text-canvas",
  current: "border-blue bg-blue text-white",
  upcoming: "border-hair-strong bg-surface text-graphite-light",
  not_recorded: "border-dashed border-hair-strong bg-surface text-graphite-light",
  halted: "border-danger bg-danger-wash text-danger"
};

/**
 * Fulfilment timeline. Every stage is text plus icon — colour is never the only
 * signal — and stages with no logged event are labelled "not recorded" rather
 * than implied.
 */
export function OrderTimeline({ order, compact = false }: { order: Order; compact?: boolean }) {
  const steps = buildTimeline(order);

  return (
    <ol className="relative flex flex-col">
      {steps.map((entry, index) => {
        const Icon = STEP_ICONS[entry.key] ?? Circle;
        const last = index === steps.length - 1;
        const muted = entry.state === "upcoming" || entry.state === "not_recorded";
        return (
          <li key={entry.key} className="relative flex gap-4 pb-lg last:pb-0">
            {!last && (
              <span
                aria-hidden
                className={classNames(
                  "absolute left-[0.8125rem] top-8 h-[calc(100%-2rem)] w-px",
                  entry.state === "complete" ? "bg-navy/40" : "bg-hair"
                )}
              />
            )}
            <span
              aria-hidden
              className={classNames(
                "relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border",
                STATE_CLASS[entry.state]
              )}
            >
              {entry.state === "not_recorded" ? <Minus className="size-3.5" aria-hidden /> : <Icon className="size-3.5" aria-hidden />}
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className={classNames("text-body-sm font-medium", muted ? "text-graphite" : "text-ink")}>
                  {entry.label}
                </p>
                <span
                  className={classNames(
                    "rounded-xs border px-1.5 py-0.5 text-[0.625rem] font-medium uppercase tracking-[0.1em]",
                    entry.state === "complete" && "border-navy/30 bg-navy-wash text-navy-deep",
                    entry.state === "current" && "border-blue bg-blue text-white",
                    entry.state === "upcoming" && "border-hair bg-surface text-graphite-light",
                    entry.state === "not_recorded" && "border-dashed border-hair-strong bg-surface text-graphite-light",
                    entry.state === "halted" && "border-danger/30 bg-danger-wash text-danger"
                  )}
                >
                  {STATE_LABEL[entry.state]}
                </span>
                {entry.at && (
                  <span className="tabular text-caption text-graphite">
                    {compact ? formatDate(entry.at) : formatDateTime(entry.at)}
                  </span>
                )}
              </div>
              <p className="text-caption leading-relaxed text-graphite">{entry.detail}</p>
              {entry.location && (
                <p className="text-caption text-graphite-light">
                  {entry.state === "complete" || entry.state === "current" ? "Place: " : ""}
                  {entry.location}
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Plain-text fallback of the same path, used by tracking for screen readers. */
export function timelineSummary(order: Order): string {
  const steps = buildTimeline(order);
  const reached = steps.filter((s) => s.state === "complete" || s.state === "current");
  return `${reached.length} of ${steps.length} recorded stages. Latest: ${reached.at(-1)?.label ?? order.status.replace(/_/g, " ")}.`;
}

export function statusToLabel(status: OrderStatus): string {
  return status.replace(/_/g, " ");
}
