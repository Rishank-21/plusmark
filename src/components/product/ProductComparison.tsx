import Link from "next/link";
import { ComparisonFrame } from "@/components/product/ComparisonFrame";
import { ProductImage } from "@/components/ui/ProductImage";
import { buildCompareRows, getCompareEntry, getSimilarProducts } from "@/lib/compare";
import { classNames } from "@/lib/format";

function listAnd(items: string[]): string {
  if (items.length <= 1) return items[0] ?? "";
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export function ProductComparison({ slug }: { slug: string }) {
  const current = getCompareEntry(slug);
  if (!current) return null;

  const peers = getSimilarProducts(slug, 3);
  if (peers.length === 0) return null;

  const columns = [current, ...peers];
  const rows = buildCompareRows(columns);
  if (rows.length < 2) return null;

  const differing = rows.filter((row) => !row.same);
  // A table of identical rows (or a lone model number) is padding, not help.
  if (differing.length < 2) return null;

  const differentRows = differing.length;
  const peerNames = listAnd(peers.map((entry) => entry.name));
  const guide = current.guide;

  return (
    <section id="compare-similar" aria-labelledby="compare-similar-heading" className="pm-shell !max-w-[90rem] border-t border-line py-8 lg:py-14">
      <h2
        id="compare-similar-heading"
        className="font-display text-[1.375rem] font-extrabold leading-7 text-ink sm:text-h2 sm:leading-[1.15]"
      >
        Compare with similar products
      </h2>

      <p className="max-w-3xl pt-3 text-body-sm leading-relaxed text-ink-soft">
        Compare {current.name} with {peerNames}.
        {guide && (
          <>
            {" "}
            <a
              href={guide.href}
              className="font-medium text-primary-strong underline-offset-4 hover:underline"
            >
              Read the {guide.label}
            </a>
            .
          </>
        )}
      </p>

      <div className="pt-4">
        <ComparisonFrame differentRows={differentRows}>
          <div className="overflow-x-auto rounded-xl border border-line bg-surface">
            {/* relative anchors sr-only cell text inside the scroller, so it cannot widen the document */}
            <table className="relative w-full min-w-[70rem] table-fixed border-collapse text-left sm:table-auto">
              <caption className="sr-only">
                Side-by-side comparison of the {current.name}, {peerNames}
              </caption>
              <colgroup>
                <col className="w-[8.5rem] sm:w-[10rem]" />
                {columns.map((entry) => (
                  <col key={entry.slug} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="sticky left-0 z-20 border-b border-r border-line bg-surface p-3 align-bottom text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-muted sm:p-4"
                  >
                    Specification
                  </th>
                  {columns.map((entry, index) => (
                    <th
                      key={entry.slug}
                      scope="col"
                      className={classNames(
                        "border-b border-line p-3 align-top sm:p-4",
                        index === 0 ? "bg-primary-soft/40" : "bg-surface"
                      )}
                    >
                      <div className="flex flex-col gap-2.5">
                        <div className="flex h-48 w-full items-center justify-center rounded-lg bg-white p-2 sm:size-64 sm:p-3">
                          <ProductImage
                            asset={entry.image}
                            name={entry.name}
                            categoryId={entry.categoryId}
                            sizes="(min-width: 640px) 232px, 206px"
                            preset="thumb"
                            className="h-full w-full object-contain"
                          />
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          {index === 0 && (
                            <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-onprimary">
                              This product
                            </span>
                          )}
                          <span className="rounded-sm bg-subtle px-1.5 py-0.5 text-[0.6875rem] font-medium text-ink-soft">
                            {entry.series ?? entry.categoryName}
                          </span>
                        </div>
                        <Link
                          href={entry.url}
                          className="font-display text-body font-bold leading-snug text-ink underline-offset-2 hover:underline"
                        >
                          {entry.name}
                        </Link>
                        <Link
                          href={entry.url}
                          className="inline-flex min-h-11 items-center text-caption font-semibold text-primary-strong underline-offset-4 hover:underline lg:min-h-0"
                        >
                          View details
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} data-same={row.same ? "true" : undefined}>
                    <th
                      scope="row"
                      className="sticky left-0 z-10 border-b border-r border-line bg-surface p-3 text-left text-[0.8125rem] font-medium leading-snug text-muted sm:p-4"
                    >
                      {row.label}
                    </th>
                    {row.values.map((value, index) => {
                      const differs = !row.same && index > 0;
                      return (
                        <td
                          key={columns[index].slug}
                          className={classNames(
                            "border-b border-line p-3 align-top text-[0.875rem] leading-relaxed sm:p-4",
                            index === 0 ? "bg-primary-soft/25 font-medium text-ink" : "text-ink-soft",
                            differs && "bg-subtle/60"
                          )}
                        >
                          {value === null ? (
                            <span className="text-muted">—</span>
                          ) : (
                            <>
                              {differs && (
                                <span aria-hidden className="mr-1.5 inline-block size-1.5 rounded-full bg-primary align-middle" />
                              )}
                              {value}
                            </>
                          )}
                          {differs && <span className="sr-only"> (differs from this product)</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComparisonFrame>
      </div>
    </section>
  );
}
