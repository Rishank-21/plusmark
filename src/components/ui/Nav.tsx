import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { classNames } from "@/lib/format";

export function Breadcrumbs({ trail }: { trail: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-caption text-muted">
        {trail.map((crumb, i) => {
          const last = i === trail.length - 1;
          return (
            <li key={`${crumb.label}-${i}`} className="flex items-center gap-1.5">
              {crumb.href && !last ? (
                <Link href={crumb.href} className="-my-2.5 inline-flex min-h-10 items-center rounded-xs py-2.5 transition-colors hover:text-ink hover:underline hover:decoration-line-strong hover:underline-offset-4">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={classNames(last && "text-ink")}>
                  {crumb.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3 text-hair-strong" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Pagination({
  page,
  pageCount,
  onChange,
  variant = "buttons"
}: {
  page: number;
  pageCount: number;
  onChange: (next: number) => void;
  variant?: "buttons" | "load-more";
}) {
  if (pageCount <= 1) return null;

  if (variant === "load-more") {
    if (page >= pageCount) {
      return <p className="py-6 text-center text-caption text-muted">You have seen every product in this selection.</p>;
    }
    return (
      <div className="flex flex-col items-center gap-2 py-8">
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          className="h-11 rounded-xs border border-line-strong px-7 text-body-sm font-medium text-ink transition-colors hover:border-ink hover:bg-subtle/60"
        >
          Load more products
        </button>
        <p className="tabular text-caption text-muted">
          Page {page} of {pageCount}
        </p>
      </div>
    );
  }

  const pages = Pages(page, pageCount);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1.5 py-8">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="h-9 rounded-xs border border-line px-3 text-caption font-medium text-ink transition-colors hover:border-line-strong disabled:opacity-40"
      >
        Previous
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1 text-caption text-muted">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p as number)}
            aria-current={p === page ? "page" : undefined}
            className={classNames(
              "tabular h-9 min-w-9 rounded-xs border px-2.5 text-caption font-medium transition-colors",
              p === page ? "border-primary bg-primary text-onprimary" : "border-line text-ink hover:border-primary/50"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        onClick={() => onChange(Math.min(pageCount, page + 1))}
        disabled={page === pageCount}
        className="h-9 rounded-xs border border-line px-3 text-caption font-medium text-ink transition-colors hover:border-line-strong disabled:opacity-40"
      >
        Next
      </button>
    </nav>
  );
}

function Pages(page: number, count: number): (number | "…")[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(count - 1, page + 1);
  if (start > 2) out.push("…");
  for (let p = start; p <= end; p += 1) out.push(p);
  if (end < count - 1) out.push("…");
  out.push(count);
  return out;
}

export { Pagination as Pager };
