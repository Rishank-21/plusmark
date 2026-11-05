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
  eyebrow,
  title,
  lead,
  aside,
  media,
  sansHeading = false,
  compact = false,
  bordered = true
}: {
  trail: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: string;
  aside?: React.ReactNode;
  /** Optional visual column — collection pages lead with a real product photo. */
  media?: React.ReactNode;
  /** Storefront collections use the regular sans face instead of the serif display. */
  sansHeading?: boolean;
  /** Dense form tools and legal pages use a smaller display step. */
  compact?: boolean;
  /** Collection pages run without hairline dividers between blocks. */
  bordered?: boolean;
}) {
  const copy = (
    <div className="flex min-w-0 flex-col gap-4">
      {eyebrow && <p className="pm-eyebrow">{eyebrow}</p>}
      <h1
        className={classNames(
          "balance max-w-[24ch]",
          sansHeading
            ? "font-sans font-normal text-h1 text-navy"
            : compact
              ? "font-display text-h1"
              : "font-display text-display"
        )}
      >
        {title}
      </h1>
      {lead && <p className="pretty max-w-reading text-body leading-relaxed text-graphite">{lead}</p>}
      {media && aside && <div className="flex min-w-0 flex-col gap-3 pt-1">{aside}</div>}
    </div>
  );

  return (
    <section
      className={classNames(
        "bg-canvas",
        bordered && "border-b border-hair",
        compact ? "py-xl lg:py-2xl" : "py-3xl lg:py-4xl"
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
  index,
  title,
  lead,
  tone = "canvas",
  actions,
  sansHeading = false,
  narrow = false,
  bordered = true,
  children
}: {
  id: string;
  index?: string;
  title: string;
  lead?: string;
  tone?: "canvas" | "sand" | "surface";
  actions?: React.ReactNode;
  sansHeading?: boolean;
  narrow?: boolean;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      className={classNames(
        "scroll-mt-48 py-3xl lg:scroll-mt-52 lg:py-4xl",
        bordered && "border-b border-hair",
        tone === "sand" && "bg-sand/35",
        tone === "surface" && "bg-surface",
        tone === "canvas" && "bg-canvas"
      )}
      aria-labelledby={headingId}
    >
      <div className={classNames(narrow ? "mx-auto w-full max-w-reading px-md sm:px-lg xl:px-2xl" : "pm-shell")}>
        <header className="mb-10 flex flex-col gap-3 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="flex min-w-0 flex-col gap-2">
            {index && <p className="pm-eyebrow">{index}</p>}
            <h2
              id={headingId}
              className={classNames(
                "balance max-w-[24ch]",
                sansHeading ? "font-sans font-normal text-h2 text-navy" : "font-display text-display-sm"
              )}
            >
              {title}
            </h2>
            {lead && <p className="pretty max-w-reading pt-1 text-body leading-relaxed text-graphite">{lead}</p>}
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
        "[&_a]:text-ink [&_a]:underline [&_a]:decoration-hair-strong [&_a]:underline-offset-4 [&_a]:hover:decoration-ink",
        "[&_h2]:pt-3 [&_h2]:font-display [&_h2]:text-h2 [&_h2]:leading-tight [&_h2]:text-ink",
        "[&_h3]:font-display [&_h3]:text-h3 [&_h3]:leading-snug [&_h3]:text-ink",
        "[&_li]:text-body-sm [&_li]:leading-relaxed [&_li]:text-graphite",
        "[&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
        "[&_p]:text-body-sm [&_p]:leading-relaxed [&_p]:text-graphite",
        "[&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Definition row used across institutional pages (term + plain detail). */
export function FactList({ rows }: { rows: { term: string; detail: React.ReactNode }[] }) {
  return (
    <dl className="divide-y divide-hair border-y border-hair">
      {rows.map((row) => (
        <div key={row.term} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,0.38fr)_minmax(0,0.62fr)] sm:gap-4">
          <dt className="text-body-sm font-medium text-ink">{row.term}</dt>
          <dd className="text-body-sm leading-relaxed text-graphite">{row.detail}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Editorial link rail — a plain hairline list, no cards, no icon squares. */
export function LinkRail({ links, title }: { title?: string; links: { label: string; href: string; note?: string }[] }) {
  return (
    <nav aria-label={title ?? "Related pages"} className="flex flex-col">
      {title && <p className="pm-eyebrow mb-3">{title}</p>}
      <ul className="divide-y divide-hair border-y border-hair">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <Link
              href={link.href}
              className="group flex min-h-11 items-center justify-between gap-4 rounded-xs py-3 text-body-sm text-ink transition-colors hover:text-navy-deep"
            >
              <span className="min-w-0">{link.label}</span>
              {link.note && <span className="shrink-0 text-caption text-graphite">{link.note}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
