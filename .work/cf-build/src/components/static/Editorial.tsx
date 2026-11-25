import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Nav";
import { classNames } from "@/lib/format";

export type Crumb = { label: string; href?: string };

/**
 * Editorial page header used by every institutional and static page. Keeps the
 * numbered section rhythm of the homepage: eyebrow, serif display heading,
 * a single readable lead paragraph.
 */
export function PageHeader({
  trail,
  title,
  lead,
  aside,
  media,
  compact = false,
  bordered = true
}: {
  trail: Crumb[];
  title: string;
  lead?: React.ReactNode;
  aside?: React.ReactNode;
  /** Optional visual column — collection pages lead with a real product photo. */
  media?: React.ReactNode;
  /** Dense form tools and legal pages use a smaller display step. */
  compact?: boolean;
  /** Collection pages run without hairline dividers between blocks. */
  bordered?: boolean;
}) {
  const copy = (
    <div className="flex min-w-0 flex-col gap-4">
      <h1
        className={classNames(
          "balance max-w-[24ch] font-display font-extrabold text-ink",
          "text-h1"
        )}
      >
        {title}
      </h1>
      {lead && <p className="pretty max-w-reading text-body leading-relaxed text-muted">{lead}</p>}
      {media && aside && <div className="flex min-w-0 flex-col gap-3 pt-1">{aside}</div>}
    </div>
  );

  return (
    <section
      className={classNames(
        "bg-page",
        bordered && "border-b border-line",
        compact ? "py-10 lg:py-14" : "py-12 lg:py-16"
      )}
    >
      <div className="pm-shell flex flex-col gap-6">
        <Breadcrumbs trail={trail} />
        {media ? (
          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
            {copy}
            <div className="min-w-0">{media}</div>
          </div>
        ) : (
          <div className={classNames("grid gap-10", Boolean(aside) && "lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)] lg:items-end")}>
            {copy}
            {aside && <div className="flex min-w-0 flex-col gap-3">{aside}</div>}
          </div>
        )}
      </div>
    </section>
  );
}

/** Numbered editorial section — the same rhythm as the homepage story blocks. */
export function Section({
  id,
  title,
  lead,
  tone = "canvas",
  actions,
  narrow = false,
  bordered = true,
  tight = false,
  children
}: {
  id: string;
  title: string;
  lead?: string;
  tone?: "canvas" | "sand" | "surface";
  actions?: React.ReactNode;
  narrow?: boolean;
  bordered?: boolean;
  /** Tight vertical rhythm for sections that directly continue the page header. */
  tight?: boolean;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      className={classNames(
        "scroll-mt-48 lg:scroll-mt-52",
        tight ? "pb-16 pt-4 lg:pb-24 lg:pt-6" : "py-16 lg:py-24",
        bordered && "border-b border-line",
        tone === "sand" && "bg-subtle/60",
        tone === "surface" && "bg-surface",
        tone === "canvas" && "bg-page"
      )}
      aria-labelledby={headingId}
    >
      <div className={classNames(narrow ? "mx-auto w-full max-w-reading px-md sm:px-lg xl:px-2xl" : "pm-shell")}>
        <header className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8 lg:mb-10">
          <div className="flex min-w-0 flex-col gap-2">
            <h2
              id={headingId}
              className={classNames(
                "balance max-w-[24ch] font-display font-extrabold text-ink",
                "text-h2"
              )}
            >
              {title}
            </h2>
            {lead && <p className="pretty max-w-reading pt-1 text-body leading-relaxed text-muted">{lead}</p>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-3 pt-2 md:pt-0">{actions}</div>}
        </header>
        {children}
      </div>
    </section>
  );
}

/**
 * Typographic wrapper for long-form legal and policy copy. Headings stay in the
 * serif display face; body text is capped at the reading measure.
 */
export function Prose({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={classNames(
        "flex max-w-reading flex-col gap-5",
        "[&_a]:text-ink [&_a]:underline [&_a]:decoration-line-strong [&_a]:underline-offset-4 [&_a]:hover:decoration-primary",
        "[&_h2]:pt-3 [&_h2]:font-display [&_h2]:text-h2 [&_h2]:leading-tight [&_h2]:text-ink",
        "[&_h3]:font-display [&_h3]:text-h3 [&_h3]:leading-snug [&_h3]:text-ink",
        "[&_li]:text-body-sm [&_li]:leading-relaxed [&_li]:text-muted",
        "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_p]:text-body-sm [&_p]:leading-relaxed [&_p]:text-muted",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Definition row used across institutional pages (term + plain detail). */
export function FactList({ rows }: { rows: { term: string; detail: React.ReactNode; mobileHidden?: boolean }[] }) {
  return (
    <dl className="divide-y divide-line border-y border-line">
      {rows.map((row) => (
        <div key={row.term} className={classNames("grid gap-1 py-3.5 sm:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] sm:gap-4 sm:py-4", row.mobileHidden && "hidden sm:grid")}>
          <dt className="text-body-sm font-semibold text-ink">{row.term}</dt>
          <dd className="text-body-sm leading-relaxed text-muted">{row.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Editorial link rail — a plain hairline list, no cards, no icon squares. */
export function LinkRail({ links, title }: { title?: string; links: { label: string; shortLabel?: string; href: string; note?: string }[] }) {
  return (
    <nav aria-label={title ?? "Related pages"} className="flex flex-col">
      {title && <p className="mb-3 text-caption font-semibold text-muted">{title}</p>}
      <ul className="divide-y divide-line border-y border-line">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className="group flex min-h-11 items-center justify-between gap-4 rounded-md py-3 text-body-sm font-medium text-ink transition-colors hover:text-primary"
            >
              <span className="min-w-0">
                {link.shortLabel ? (
                  <>
                    <span className="sm:hidden">{link.shortLabel}</span>
                    <span className="hidden sm:inline">{link.label}</span>
                  </>
                ) : (
                  link.label
                )}
              </span>
              {link.note && <span className="hidden shrink-0 text-caption text-muted sm:inline">{link.note}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
