import { classNames } from "@/lib/format";
import { Button, ButtonLink } from "@/components/ui/Button";

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames("pm-skeleton rounded-xs", className)} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-3 w-2/5" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3" role="status" aria-live="polite">
      <span className="sr-only">Loading products</span>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="divide-y divide-line" role="status" aria-live="polite">
      <span className="sr-only">Loading table</span>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="grid gap-4 px-4 py-3.5" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }, (_, c) => (
            <Skeleton key={c} className="h-4" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
  icon,
  compact
}: {
  title: string;
  body: string;
  action?: { label: string; href?: string; onClick?: () => void };
  icon?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={classNames(
        "flex flex-col items-start gap-3 rounded-2xl border border-line bg-subtle/60",
        compact ? "p-5" : "p-8"
      )}
    >
      {icon && <div className="text-muted">{icon}</div>}
      <h3 className="font-display text-h3 font-bold leading-tight text-ink">{title}</h3>
      <p className="max-w-reading text-body-sm text-muted">{body}</p>
      {action &&
        (action.href ? (
          <ButtonLink href={action.href} size="sm" variant="secondary" className="mt-1">
            {action.label}
          </ButtonLink>
        ) : (
          <Button size="sm" variant="secondary" className="mt-1" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  body,
  onRetry,
  detail
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
  detail?: string;
}) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-danger/30 bg-danger-wash p-6">
      <h3 className="font-display text-h3 font-bold leading-tight text-danger">{title}</h3>
      <p className="max-w-reading text-body-sm text-ink">{body}</p>
      {detail && <p className="text-caption text-muted">{detail}</p>}
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}

export function Notice({
  tone = "neutral",
  title,
  children,
  icon
}: {
  tone?: "neutral" | "info" | "warning" | "success" | "danger";
  title?: React.ReactNode;
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  const tones = {
    neutral: "border-line bg-subtle/50 text-ink",
    info: "border-line bg-surface text-ink",
    warning: "border-warning/30 bg-warning-wash text-ink",
    success: "border-success/30 bg-success-wash text-ink",
    danger: "border-danger/30 bg-danger-wash text-ink"
  } as const;

  return (
    <div className={classNames("flex items-start gap-3 rounded-xl border px-4 py-3", tones[tone])}>
      {icon && <span className="mt-0.5 shrink-0 text-muted">{icon}</span>}
      <div className="flex flex-col gap-1">
        {title && <p className="text-body-sm font-semibold">{title}</p>}
        <div className="text-caption leading-relaxed text-muted">{children}</div>
      </div>
    </div>
  );
}
