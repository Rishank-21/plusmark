"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import {
  Briefcase,
  Building2,
  Check,
  ChevronDown,
  ChevronRight,
  Columns2,
  CornerDownRight,
  Droplets,
  Factory,
  Frame,
  GraduationCap,
  Home,
  Info,
  Layers,
  Magnet,
  Package,
  PenLine,
  ReceiptText,
  Ruler,
  School,
  Truck,
  Users,
  Wrench
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildProductDetailContent } from "@/lib/product-details";
import type { DetailApplicationIcon, DetailSpec } from "@/lib/product-details";
import { classNames, formatInr, variantLabel } from "@/lib/format";
import type { Product, Variant } from "@/types";

const DESCRIPTION_LINES = 5;
const VISIBLE_FEATURES = 6;
const BAR_HEIGHT = 52;

const APPLICATION_ICONS: Record<DetailApplicationIcon, LucideIcon> = {
  school: School,
  graduation: GraduationCap,
  building: Building2,
  users: Users,
  briefcase: Briefcase,
  home: Home
};

const SPEC_ICONS: Record<string, LucideIcon> = {
  "Writing surface": PenLine,
  Surface: Layers,
  Frame,
  Corners: CornerDownRight,
  Magnetic: Magnet,
  Sides: Columns2,
  Mounting: Wrench,
  "Typical use": Users,
  "HSN code": ReceiptText,
  "Retail minimum": Package,
  "Custom sizes": Ruler
};

const GLANCE_PRIORITY = [
  "Writing surface",
  "Surface",
  "Frame",
  "Magnetic",
  "Sides",
  "Custom sizes",
  "HSN code",
  "Corners",
  "Mounting",
  "Typical use",
  "Retail minimum"
];

interface SectionLink {
  id: string;
  label: string;
  show: boolean;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function pickGlanceSpecs(specs: DetailSpec[]): DetailSpec[] {
  const picked: DetailSpec[] = [];
  const add = (row: DetailSpec | undefined) => {
    if (!row || picked.length >= 6) return;
    if (picked.some((item) => item.detail === row.detail)) return;
    picked.push(row);
  };
  GLANCE_PRIORITY.forEach((term) => add(specs.find((row) => row.term === term)));
  specs.forEach(add);
  return picked.slice(0, 6);
}

function groupSpecs(specs: DetailSpec[]): Array<{ name: string | null; rows: DetailSpec[] }> {
  const groups: Array<{ name: string | null; rows: DetailSpec[] }> = [];
  specs.forEach((row) => {
    const name = row.group ?? null;
    const existing = name ? groups.find((group) => group.name === name) : undefined;
    if (existing) existing.rows.push(row);
    else groups.push({ name, rows: [row] });
  });
  return groups;
}

export function ProductDetailSections({
  product,
  selectedId,
  onSelect,
  hasStory = false,
  children
}: {
  product: Product;
  selectedId: string | null;
  onSelect: (variant: Variant) => void;
  hasStory?: boolean;
  children?: ReactNode;
}) {
  const content = useMemo(() => buildProductDetailContent(product), [product]);
  const selectable = useMemo(
    () => product.variants.filter((item) => (item.packQty ?? 1) === 1),
    [product.variants]
  );
  const glanceSpecs = useMemo(() => pickGlanceSpecs(content.specs), [content.specs]);
  const specGroups = useMemo(() => groupSpecs(content.specs), [content.specs]);
  const hasSpecGroups = useMemo(() => content.specs.some((row) => row.group), [content.specs]);

  const [headerH, setHeaderH] = useState(175);
  const [active, setActive] = useState<string | null>(null);
  const [stuck, setStuck] = useState(false);
  const [indicator, setIndicator] = useState<{ left: number; width: number } | null>(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descLimit, setDescLimit] = useState(0);
  const [descFull, setDescFull] = useState(0);
  const [featuresExpanded, setFeaturesExpanded] = useState(false);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  // Below 1024px the detail sections become accordions, matching the mobile
  // brief; the desktop tab bar and open sections stay exactly as published.
  const [mobile, setMobile] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const links: SectionLink[] = useMemo(
    () => [
      { id: "pdp-description", label: "Description", show: content.description.length > 0 },
      { id: "pdp-features", label: "Key Features", show: content.features.length > 0 },
      { id: "pdp-specs", label: "Specifications", show: content.specs.length > 0 },
      { id: "pdp-sizes", label: "Sizes & SKUs", show: selectable.length > 0 },
      { id: "pdp-care", label: "Care & Delivery", show: content.care.cards.length > 0 },
      { id: "pdp-applications", label: "Applications", show: content.applications.length > 0 },
      { id: "product-story", label: "Product Description", show: hasStory },
      { id: "customer-reviews", label: "Customer reviews", show: true }
    ],
    [content, selectable.length, hasStory]
  );
  const visibleLinks = useMemo(() => links.filter((link) => link.show), [links]);
  const linksKey = visibleLinks.map((link) => link.id).join("|");
  const offset = headerH + BAR_HEIGHT;

  useEffect(() => {
    const measure = () => {
      const header = document.querySelector("header");
      if (header) setHeaderH(header.getBoundingClientRect().height);
    };
    measure();
    window.addEventListener("resize", measure);
    void document.fonts?.ready.then(measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    setActive((current) =>
      current && visibleLinks.some((link) => link.id === current) ? current : visibleLinks[0]?.id ?? null
    );
  }, [linksKey, visibleLinks]);

  useEffect(() => {
    const nodes = linksKey
      .split("|")
      .map((id) => document.getElementById(id))
      .filter((node): node is HTMLElement => Boolean(node));
    if (!nodes.length) return;

    const inView = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) inView.add(entry.target.id);
          else inView.delete(entry.target.id);
        });
        const next = linksKey.split("|").find((id) => inView.has(id));
        if (next) setActive(next);
      },
      { rootMargin: `-${offset + 8}px 0px -55% 0px`, threshold: 0 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [linksKey, offset]);

  useEffect(() => {
    const update = () => {
      const node = barRef.current;
      if (!node) return;
      setStuck(node.getBoundingClientRect().top <= headerH + 0.5);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [headerH, linksKey]);

  useEffect(() => {
    const update = () => {
      const link = active ? linkRefs.current[active] : null;
      if (!link) return setIndicator(null);
      setIndicator({ left: link.offsetLeft, width: link.offsetWidth });
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [active, linksKey]);

  useEffect(() => {
    const nav = navRef.current;
    const link = active ? linkRefs.current[active] : null;
    if (!nav || !link) return;
    if (nav.scrollWidth <= nav.clientWidth + 1) return;
    const target = link.offsetLeft - (nav.clientWidth - link.offsetWidth) / 2;
    nav.scrollTo({ left: Math.max(0, target), behavior: prefersReducedMotion() ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-reveal-id]"));
    if (!nodes.length) return;

    if (prefersReducedMotion()) {
      setRevealed(Object.fromEntries(nodes.map((node) => [node.dataset.revealId as string, true])));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = (entry.target as HTMLElement).dataset.revealId;
          if (!id) return;
          setRevealed((previous) => (previous[id] ? previous : { ...previous, [id]: true }));
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [product.slug]);

  useEffect(() => {
    const element = descRef.current;
    if (!element) return;
    const measure = () => {
      const lineHeight = Number.parseFloat(getComputedStyle(element).lineHeight) || 24;
      setDescLimit(lineHeight * DESCRIPTION_LINES);
      setDescFull(element.scrollHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [content.description]);

  useEffect(() => {
    setDescExpanded(false);
    setFeaturesExpanded(false);
  }, [product.slug]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023px)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  const scrollTo = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  const handleAnchor = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault();
    scrollTo(id);
    window.history.replaceState(null, "", `#${id}`);
    setActive(id);
    setRevealed((previous) => (previous[id] ? previous : { ...previous, [id]: true }));
  };

  const choose = (next: Variant) => {
    onSelect(next);
    if (!window.matchMedia("(min-width: 1024px)").matches) return;
    scrollTo("pdp-main");
  };

  const sizeRows = selectable.map((variant) => ({
    variant,
    mm:
      variant.size.widthCm && variant.size.heightCm
        ? `${Math.round(variant.size.widthCm * 10)} × ${Math.round(variant.size.heightCm * 10)} mm`
        : "On request",
    price: variant.priceInr === null ? "On request" : formatInr(variant.priceInr)
  }));

  const highlights = [
    { icon: Factory, label: "Made to order" },
    { icon: Package, label: "Order a single board" },
    { icon: ReceiptText, label: product.hsnCode ? "GST invoice with HSN" : "GST invoice" },
    { icon: Truck, label: "Free Ahmedabad pickup" }
  ];

  const sectionStyle = { scrollMarginTop: `${offset}px` };
  const visibleFeatures = featuresExpanded ? content.features : content.features.slice(0, VISIBLE_FEATURES);
  const hasMoreFeatures = content.features.length > VISIBLE_FEATURES;
  const descOverflow = descLimit > 0 && descFull > descLimit + 2;
  const descStyle =
    descExpanded && descFull > 0
      ? { maxHeight: descFull }
      : !descExpanded && descOverflow
        ? { maxHeight: descLimit }
        : undefined;
  const revealClass = (id: string) => (revealed[id] ? "animate-fade-up" : "opacity-0");

  return (
    <div ref={rootRef} className="pm-shell !max-w-[90rem] pb-2 pt-6">
      {visibleLinks.length > 0 && (
        <>
          <div
            ref={barRef}
            className={classNames("sticky z-40 hidden bg-surface transition-shadow lg:block", stuck && "shadow-card")}
            style={{ top: headerH }}
          >
            <div className="relative border-b border-line">
              <nav ref={navRef} aria-label="Product information sections" className="relative flex overflow-x-auto no-scrollbar">
                {visibleLinks.map((link) => {
                  const isActive = active === link.id;
                  return (
                    <a
                      key={link.id}
                      href={`#${link.id}`}
                      ref={(node) => {
                        linkRefs.current[link.id] = node;
                      }}
                      onClick={(event) => handleAnchor(event, link.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={classNames(
                        "relative flex h-[52px] shrink-0 items-center px-3.5 text-[0.8125rem] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary",
                        isActive ? "font-semibold text-primary" : "font-medium text-muted hover:text-ink"
                      )}
                    >
                      {link.label}
                    </a>
                  );
                })}
                {indicator && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-primary transition-[left,width] duration-300 ease-out motion-reduce:transition-none"
                    style={{ left: indicator.left, width: indicator.width }}
                  />
                )}
              </nav>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-surface to-transparent sm:hidden"
              />
              <span
                aria-hidden
                className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-surface to-transparent sm:hidden"
              />
            </div>
          </div>
        </>
      )}

      {content.description.length > 0 && (
        <details
          open={!mobile}
          id="pdp-description"
          aria-labelledby="pdp-description-heading"
          data-reveal-id="pdp-description"
          className={classNames("group py-3 lg:py-7", revealClass("pdp-description"))}
          style={sectionStyle}
        >
          <DisclosureSummary id="pdp-description-heading" title="Description" />
          <div className="grid gap-6 pt-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-10 lg:pt-5 xl:gap-16">
            <div className="min-w-0">
              <div className="relative">
                <div
                  id="pdp-description-body"
                  ref={descRef}
                  style={descStyle}
                  className={classNames(
                    "max-w-reading space-y-3 overflow-hidden text-[0.9375rem] leading-[1.7] text-ink-soft transition-[max-height] duration-300 ease-out pretty motion-reduce:transition-none",
                    descExpanded && "pb-1"
                  )}
                >
                  {content.description.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {descOverflow && !descExpanded && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-0 h-[3.4em] bg-gradient-to-t from-surface via-surface/85 to-transparent"
                  />
                )}
              </div>
              {descOverflow && (
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setDescExpanded((value) => !value)}
                    aria-expanded={descExpanded}
                    aria-controls="pdp-description-body"
                    className="inline-flex h-11 items-center gap-1 rounded-sm text-[0.875rem] font-semibold text-primary-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:h-8"
                  >
                    {descExpanded ? "Read less" : "Read more"}
                    <ChevronDown
                      className={classNames("size-4 transition-transform", descExpanded && "rotate-180")}
                      strokeWidth={1.75}
                      aria-hidden
                    />
                  </button>
                </div>
              )}
              <ul className="mt-6 flex flex-wrap gap-2">
                {highlights.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-1.5 rounded-md bg-primary-soft px-2.5 py-1.5 text-[0.8125rem] font-medium leading-none text-primary-strong"
                  >
                    <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {glanceSpecs.length > 0 && (
              <aside
                aria-labelledby="pdp-glance-heading"
                className="lg:sticky"
                style={{ top: `${offset + 20}px` }}
              >
                <div className="overflow-hidden rounded-lg border border-line bg-surface">
                  <div className="flex items-center gap-2 border-b border-line bg-primary-soft/60 px-4 py-3">
                    <Info className="size-4 shrink-0 text-primary-strong" strokeWidth={1.75} aria-hidden />
                    <h3 id="pdp-glance-heading" className="font-display text-body font-bold text-ink">
                      At a glance
                    </h3>
                  </div>
                  <dl className="divide-y divide-line">
                    {glanceSpecs.map((spec) => {
                      const Icon = SPEC_ICONS[spec.term] ?? Info;
                      return (
                        <div key={spec.term} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 px-4 py-2.5">
                          <Icon className="mt-0.5 size-4 shrink-0 text-muted" strokeWidth={1.75} aria-hidden />
                          <dt className="col-start-2 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-muted">
                            {spec.term}
                          </dt>
                          <dd className="col-start-2 mt-0.5 text-[0.875rem] font-medium leading-snug text-ink-soft">{spec.detail}</dd>
                        </div>
                      );
                    })}
                  </dl>
                  <a
                    href="#pdp-specs"
                    onClick={(event) => handleAnchor(event, "pdp-specs")}
                    className="flex items-center justify-between gap-2 border-t border-line px-4 py-3 text-[0.8125rem] font-semibold text-primary-strong transition-colors hover:bg-subtle/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary"
                  >
                    View all specifications
                    <ChevronRight className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                  </a>
                </div>
              </aside>
            )}
          </div>
        </details>
      )}

      {content.features.length > 0 && (
        <details
          open={!mobile}
          id="pdp-features"
          aria-labelledby="pdp-features-heading"
          data-reveal-id="pdp-features"
          className={classNames("group py-3 lg:py-7", revealClass("pdp-features"))}
          style={sectionStyle}
        >
          <DisclosureSummary id="pdp-features-heading" title="About this item" />
          <div className="pt-4 lg:pt-5">
          <ul className="grid gap-3 sm:grid-cols-2">
            {visibleFeatures.map((feature, index) => (
              <li
                key={`${feature.title}-${index}`}
                className="flex h-full gap-3 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong"
              >
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
                  <Check className="size-3.5" strokeWidth={1.75} aria-hidden />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-body font-bold leading-snug text-ink">{feature.title}</h3>
                  {feature.detail ? (
                    <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">{feature.detail}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
          {hasMoreFeatures && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setFeaturesExpanded((value) => !value)}
                aria-expanded={featuresExpanded}
                className="inline-flex h-11 items-center gap-1 rounded-sm text-[0.875rem] font-semibold text-primary-strong hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface lg:h-8"
              >
                {featuresExpanded ? "Show less" : "See more"}
                <ChevronDown
                  className={classNames("size-4 transition-transform", featuresExpanded && "rotate-180")}
                  strokeWidth={1.75}
                  aria-hidden
                />
              </button>
            </div>
          )}
          </div>
        </details>
      )}

      {content.specs.length > 0 && (
        <details
          open={!mobile}
          id="pdp-specs"
          aria-labelledby="pdp-specs-heading"
          data-reveal-id="pdp-specs"
          className={classNames("group py-3 lg:py-7", revealClass("pdp-specs"))}
          style={sectionStyle}
        >
          <DisclosureSummary id="pdp-specs-heading" title="Specifications" />
          <div className="pt-4 lg:pt-5">
          <div className="overflow-hidden rounded-lg border border-line">
            <table className="w-full table-fixed border-collapse text-left max-lg:[&>tbody>tr:nth-child(odd)]:bg-subtle/30 [&>tbody>tr:first-child]:border-t-0">
              <caption className="sr-only">Technical details for {product.name}</caption>
              <colgroup>
                <col className="w-[34%]" />
                <col />
              </colgroup>
              <tbody>
                {specGroups.map((group, groupIndex) => (
                  <Fragment key={group.name ?? `group-${groupIndex}`}>
                    {hasSpecGroups && group.name && (
                      <tr className="border-t border-line">
                        <th
                          scope="colgroup"
                          colSpan={2}
                          className="bg-subtle/80 px-4 py-2 text-left text-[0.75rem] font-semibold uppercase tracking-[0.08em] text-muted"
                        >
                          {group.name}
                        </th>
                      </tr>
                    )}
                    {group.rows.map((row, rowIndex) => (
                      <tr key={`${row.term}-${rowIndex}`} className="border-t border-line">
                        <th
                          scope="row"
                          className="border-r border-line bg-subtle/40 px-4 py-3 align-top text-[0.875rem] font-medium leading-relaxed text-ink-soft"
                        >
                          {row.term}
                        </th>
                        <td className="px-4 py-3 align-top text-[0.875rem] leading-relaxed text-ink-soft">{row.detail}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </details>
      )}

      {selectable.length > 0 && (
        <details
          open={!mobile}
          id="pdp-sizes"
          aria-labelledby="pdp-sizes-heading"
          data-reveal-id="pdp-sizes"
          className={classNames("group py-3 lg:py-7", revealClass("pdp-sizes"))}
          style={sectionStyle}
        >
          <DisclosureSummary id="pdp-sizes-heading" title="Sizes & SKUs" />
          <div className="pt-4 lg:pt-5">
          <div
            className="relative overflow-x-auto rounded-lg border border-line lg:overflow-x-clip"
            style={{ "--pdp-offset": `${offset}px` } as CSSProperties}
          >
            <table className="w-full min-w-[46rem] border-collapse text-left lg:min-w-0 [&>tbody>tr:first-child]:border-t-0">
              <caption className="sr-only">Sizes, SKUs, dimensions and prices for {product.name}</caption>
              <colgroup>
                <col className="w-[22%]" />
                <col className="w-[26%]" />
                <col className="w-[22%]" />
                <col className="w-[18%]" />
                <col className="w-[12%]" />
              </colgroup>
              <thead>
                <tr>
                  {["Size", "SKU", "Dimensions (mm)", "Price (+ GST)"].map((label, index) => (
                    <th
                      key={label}
                      scope="col"
                      className={classNames(
                        "bg-subtle px-4 py-3 text-[0.8125rem] font-semibold text-muted",
                        index === 0
                          ? "sticky left-0 z-30 border-r border-line lg:top-[var(--pdp-offset)]"
                          : "lg:sticky lg:top-[var(--pdp-offset)] lg:z-20"
                      )}
                    >
                      {label}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="bg-subtle px-4 py-3 text-right text-[0.8125rem] font-semibold text-muted lg:sticky lg:top-[var(--pdp-offset)] lg:z-20"
                  >
                    <span className="sr-only">Select this size</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sizeRows.map(({ variant, mm, price }) => {
                  const selected = variant.id === selectedId;
                  return (
                    <tr
                      key={variant.id}
                      onClick={() => choose(variant)}
                      className={classNames(
                        "group cursor-pointer border-t border-line transition-colors",
                        selected ? "bg-primary-soft/70" : "hover:bg-subtle/40"
                      )}
                    >
                      <th
                        scope="row"
                        className={classNames(
                          "sticky left-0 z-10 border-r border-line px-4 py-3 text-left text-[0.875rem] font-medium text-ink transition-colors",
                          selected ? "bg-primary-soft" : "bg-surface group-hover:bg-subtle/40"
                        )}
                      >
                        {selected && <span aria-hidden className="absolute inset-y-0 left-0 w-[3px] bg-primary" />}
                        <span className="relative flex flex-wrap items-center gap-2">
                          {variantLabel(variant)}
                          {selected && (
                            <span className="rounded-sm bg-primary px-1.5 py-0.5 text-[0.6875rem] font-semibold leading-none text-onprimary">
                              Selected
                            </span>
                          )}
                        </span>
                      </th>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-[0.875rem] text-muted">{variant.sku}</td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-[0.875rem] text-muted">{mm}</td>
                      <td className="tabular whitespace-nowrap px-4 py-3 text-[0.875rem] font-medium text-ink">
                        {price}
                        {variant.priceInr !== null && <span className="font-normal text-muted"> + GST</span>}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            choose(variant);
                          }}
                          aria-pressed={selected}
                          className={classNames(
                            "h-11 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:h-8",
                            selected
                              ? "border-primary bg-primary text-onprimary"
                              : "border-line-strong bg-surface text-ink hover:border-primary hover:text-primary-strong"
                          )}
                        >
                          {selected ? "Selected" : "Select"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[0.875rem] leading-relaxed text-muted">
            Custom sizes are made to order. Confirm the exact specification before dispatch.
          </p>
          </div>
        </details>
      )}

      {content.care.cards.length > 0 && (
        <details
          open={!mobile}
          id="pdp-care"
          aria-labelledby="pdp-care-heading"
          data-reveal-id="pdp-care"
          className={classNames("group py-3 lg:py-7", revealClass("pdp-care"))}
          style={sectionStyle}
        >
          <DisclosureSummary id="pdp-care-heading" title="Care & Delivery" />
          <div className="pt-4 lg:pt-5">
          <div className="grid gap-4 sm:grid-cols-2">
            {content.care.cards.map((card) => {
              const Icon = card.icon === "care" ? Droplets : Truck;
              return (
                <div
                  key={card.id}
                  className="flex h-full flex-col rounded-lg border border-line bg-surface p-5 transition-colors hover:border-line-strong"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
                      <Icon className="size-[1.125rem]" strokeWidth={1.75} aria-hidden />
                    </span>
                    <h3 className="font-display text-body font-bold text-ink">{card.title}</h3>
                  </div>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {card.points.map((point) => (
                      <li key={point} className="flex gap-2.5 text-[0.875rem] leading-relaxed text-ink-soft">
                        <Check className="mt-0.5 size-3.5 shrink-0 text-primary" strokeWidth={1.75} aria-hidden />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-line bg-subtle/50 px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-primary-strong" strokeWidth={1.75} aria-hidden />
            <p className="text-[0.875rem] leading-relaxed text-ink-soft">{content.care.note}</p>
          </div>
          </div>
        </details>
      )}

      {content.applications.length > 0 && (
        <details
          open={!mobile}
          id="pdp-applications"
          aria-labelledby="pdp-applications-heading"
          data-reveal-id="pdp-applications"
          className={classNames("group py-3 lg:py-7", revealClass("pdp-applications"))}
          style={sectionStyle}
        >
          <DisclosureSummary id="pdp-applications-heading" title="Applications" />
          <div className="pt-4 lg:pt-5">
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {content.applications.map((application) => {
              const Icon = APPLICATION_ICONS[application.icon];
              return (
                <li
                  key={application.title}
                  className="flex h-full gap-3 rounded-lg border border-line bg-surface p-4 transition-colors hover:border-line-strong"
                >
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary-strong">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-body font-bold leading-snug text-ink">
                      {application.title}
                    </h3>
                    <p className="mt-1 text-[0.875rem] leading-relaxed text-muted">{application.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
          </div>
        </details>
      )}

      {children}
    </div>
  );
}

function DisclosureSummary({ id, title }: { id: string; title: string }) {
  return (
    <summary
      onClick={(event) => {
        if (window.matchMedia("(min-width: 1024px)").matches) event.preventDefault();
      }}
      className="flex min-h-12 list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden lg:pointer-events-none lg:min-h-0"
    >
      <h2 id={id} className="font-display text-[1.125rem] font-extrabold leading-6 text-ink lg:text-h2 lg:leading-[1.15]">
        {title}
      </h2>
      <ChevronDown className="size-5 shrink-0 text-muted transition-transform group-open:rotate-180 lg:hidden" aria-hidden />
    </summary>
  );
}
