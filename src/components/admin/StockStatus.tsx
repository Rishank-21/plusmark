import { Ban, PackageCheck, TriangleAlert, Boxes } from "lucide-react";
import { classNames } from "@/lib/format";
import type { StockState } from "@/components/admin/adminData";

const STATE_META: Record<StockState, { label: string; icon: typeof Ban; tone: string }> = {
  ok: { label: "In stock", icon: PackageCheck, tone: "text-success" },
  low: { label: "Low stock", icon: TriangleAlert, tone: "text-warning" },
  out: { label: "Out of stock", icon: Ban, tone: "text-danger" },
  untracked: { label: "Not tracked — made to order", icon: Boxes, tone: "text-graphite" }
};

/**
 * Stock state is always text plus an icon — the tone alone never carries the
 * meaning. "Not tracked" is Plusmark's real position: the works hold no
 * published on-hand quantity for made-to-order boards.
 */
export function StockStatus({
  state,
  count,
  threshold,
  className
}: {
  state: StockState;
  count?: number | null;
  threshold?: number;
  className?: string;
}) {
  const meta = STATE_META[state];
  const Icon = meta.icon;
  return (
    <span className={classNames("inline-flex items-center gap-1.5 whitespace-nowrap text-caption", meta.tone, className)}>
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="font-medium">{meta.label}</span>
      {state !== "untracked" && count !== undefined && count !== null && (
        <span className="tabular text-graphite">
          {count}
          {threshold !== undefined ? ` / reorder at ${threshold}` : ""}
        </span>
      )}
    </span>
  );
}
