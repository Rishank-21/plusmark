"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, MoveHorizontal } from "lucide-react";
import { classNames } from "@/lib/format";
import { EmptyState, TableSkeleton } from "@/components/ui/States";
import { Pagination } from "@/components/ui/Nav";

export interface AdminColumn<T> {
  id: string;
  header: string;
  render: (row: T) => React.ReactNode;
  /** Providing this makes the column sortable via the header button. */
  sortValue?: (row: T) => string | number;
  align?: "left" | "right" | "center";
  /** Numeric columns get tabular figures and right alignment. */
  numeric?: boolean;
  /** Minimum width so a long cell never wraps into illegibility. */
  minWidth?: string;
  headClassName?: string;
  bodyClassName?: string;
}

interface DataTableProps<T> {
  caption: string;
  columns: AdminColumn<T>[];
  rows: T[];
  keyFor: (row: T) => string;
  emptyTitle: string;
  emptyBody: string;
  /** Changing this (a filter signature) returns the table to page 1. */
  resetKey?: string;
  pageSize?: number;
  loading?: boolean;
  defaultSort?: { id: string; dir: "asc" | "desc" };
  rowClassName?: (row: T) => string | undefined;
  /** Rendered under the table, above the pager: totals, notes, prototype states. */
  footer?: React.ReactNode;
}

type SortDir = "asc" | "desc";

export function DataTable<T>({
  caption,
  columns,
  rows,
  keyFor,
  emptyTitle,
  emptyBody,
  resetKey,
  pageSize,
  loading = false,
  defaultSort,
  rowClassName,
  footer
}: DataTableProps<T>) {
  const [sort, setSort] = useState<{ id: string; dir: SortDir } | null>(defaultSort ?? null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((c) => c.id === sort.id);
    if (!column?.sortValue) return rows;
    const factor = sort.dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = column.sortValue?.(a);
      const right = column.sortValue?.(b);
      if (typeof left === "number" && typeof right === "number") return (left - right) * factor;
      return String(left ?? "").localeCompare(String(right ?? ""), "en-IN", { numeric: true }) * factor;
    });
  }, [rows, sort, columns]);

  const usePager = pageSize !== undefined && pageSize > 0;
  const pageCount = usePager ? Math.max(1, Math.ceil(sorted.length / (pageSize as number))) : 1;
  const safePage = Math.min(Math.max(1, page), pageCount);
  const visible = usePager
    ? sorted.slice((safePage - 1) * (pageSize as number), safePage * (pageSize as number))
    : sorted;

  if (loading) {
    return (
      <div className="rounded-sm border border-hair bg-surface">
        <TableSkeleton rows={8} cols={Math.min(columns.length, 6)} />
      </div>
    );
  }

  if (!visible.length) {
    return <EmptyState title={emptyTitle} body={emptyBody} compact />;
  }

  const toggleSort = (id: string) => {
    setSort((current) => {
      if (current?.id !== id) return { id, dir: "asc" };
      if (current.dir === "asc") return { id, dir: "desc" };
      return null;
    });
  };

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3 border-t border-hair" aria-hidden>
        <span className="flex items-center gap-1.5 py-1 text-[0.6875rem] text-graphite-light xl:hidden">
          <MoveHorizontal className="size-3.5" aria-hidden />
          Table scrolls sideways — every column is reachable with the keyboard
        </span>
        <span className="hidden py-1 text-[0.6875rem] tabular text-graphite-light xl:inline">
          {sorted.length.toLocaleString("en-IN")} rows
        </span>
      </div>

      <div
        className="relative overflow-x-auto rounded-sm border border-hair bg-surface"
        role="region"
        aria-label={`${caption} — scrollable table`}
        tabIndex={0}
      >
        <table className="w-full min-w-max border-collapse text-left">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-hair-strong bg-sand/45">
              {columns.map((column) => {
                const active = sort?.id === column.id;
                const ariaSort = column.sortValue ? (active ? (sort?.dir === "asc" ? "ascending" : "descending") : "none") : undefined;
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={classNames(
                      "px-3 py-2.5 text-label font-medium uppercase tracking-[0.1em] text-graphite",
                      column.numeric && "text-right tabular",
                      column.align === "center" && "text-center",
                      column.headClassName
                    )}
                    style={column.minWidth ? { minWidth: column.minWidth } : undefined}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        className={classNames(
                          "-mx-1 inline-flex min-h-9 items-center gap-1.5 rounded-xs px-1 transition-colors hover:text-ink",
                          active ? "text-ink" : ""
                        )}
                      >
                        {column.header}
                        {active ? (
                          sort?.dir === "asc" ? (
                            <ArrowUp className="size-3" aria-hidden />
                          ) : (
                            <ArrowDown className="size-3" aria-hidden />
                          )
                        ) : (
                          <ArrowUpDown className="size-3 text-hair-strong" aria-hidden />
                        )}
                        <span className="sr-only">
                          {active ? ` (sorted ${sort?.dir === "asc" ? "ascending" : "descending"})` : " (sortable)"}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={keyFor(row)} className={classNames("border-b border-hair last:border-b-0", rowClassName?.(row))}>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={classNames(
                      "px-3 py-2.5 align-middle text-body-sm text-ink",
                      column.numeric && "text-right tabular",
                      column.align === "center" && "text-center",
                      column.bodyClassName
                    )}
                  >
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {footer}

      {usePager && pageCount > 1 && (
        <div className="flex flex-col items-center gap-1">
          <Pagination page={safePage} pageCount={pageCount} onChange={setPage} />
          <p className="tabular text-caption text-graphite">
            Showing {(safePage - 1) * (pageSize as number) + 1}–{Math.min(safePage * (pageSize as number), sorted.length)} of{" "}
            {sorted.length}
          </p>
        </div>
      )}
    </div>
  );
}

/** Link cell that stays a real anchor so rows are keyboard reachable. */
export function TableLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-xs font-medium text-ink underline decoration-hair-strong underline-offset-4 transition-colors hover:decoration-ink"
    >
      {children}
    </Link>
  );
}
