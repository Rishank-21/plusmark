import { Check, Circle, Clock } from "lucide-react";
import { classNames, formatDateTime } from "@/lib/format";
import { ORDER_STATUS_LABEL } from "@/components/admin/adminData";
import type { OrderStatus, Shipment } from "@/types";

/**
 * Fulfilment timeline. Events only exist where demo-data.ts created a shipment,
 * so an order that never moved shows the honest "no dispatch events yet" line
 * rather than a fabricated history.
 */
export function StatusTimeline({
  events,
  currentStatus
}: {
  events: Shipment["events"];
  currentStatus: OrderStatus;
}) {
  if (!events.length) {
    return (
      <p className="flex items-start gap-2 rounded-sm border border-dashed border-hair-strong bg-sand/35 p-3 text-caption leading-relaxed text-graphite">
        <Circle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        No dispatch events recorded for this order yet. In production this list is written by the fulfilment service as
        each stage completes.
      </p>
    );
  }

  const sorted = [...events].sort((a, b) => a.at.localeCompare(b.at));
  const lastIndex = sorted.length - 1;

  return (
    <ol className="flex flex-col">
      {sorted.map((event, index) => {
        const done = index < lastIndex;
        const isCurrent = index === lastIndex;
        return (
          <li key={`${event.at}-${event.status}`} className="relative flex gap-3 pb-4 last:pb-0">
            {index !== lastIndex && (
              <span className="absolute left-[0.6875rem] top-5 h-full w-px bg-hair" aria-hidden />
            )}
            <span
              className={classNames(
                "relative z-10 mt-0.5 flex size-[1.375rem] shrink-0 items-center justify-center rounded-full border",
                done ? "border-navy/40 bg-navy-wash text-navy-deep" : isCurrent ? "border-blue bg-blue text-onprimary" : "border-hair-strong bg-surface text-graphite"
              )}
            >
              {done ? (
                <Check className="size-3" aria-hidden />
              ) : isCurrent ? (
                <Clock className="size-3" aria-hidden />
              ) : (
                <Circle className="size-2" aria-hidden />
              )}
              <span className="sr-only">{done ? "Completed:" : isCurrent ? "Current stage:" : "Recorded:"}</span>
            </span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="text-body-sm font-medium text-ink">
                {ORDER_STATUS_LABEL[event.status] ?? event.status.replace(/_/g, " ")}
              </p>
              <p className="text-caption text-graphite">{event.note}</p>
              <p className="tabular text-[0.6875rem] text-graphite-light">
                {formatDateTime(event.at)}
                {event.location ? ` · ${event.location}` : ""}
              </p>
            </div>
          </li>
        );
      })}
      <li className="mt-1 border-t border-hair pt-2 text-[0.6875rem] leading-snug text-graphite-light">
        Current status on this record: <span className="font-medium text-graphite">{ORDER_STATUS_LABEL[currentStatus]}</span>.
        Advancing it needs the order service — see the status control above.
      </li>
    </ol>
  );
}
