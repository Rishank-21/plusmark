"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Accordion, type AccordionEntry } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/States";
import { classNames } from "@/lib/format";
import type { FaqItem } from "@/types";

const ALL = "all";

/**
 * Searchable, sectioned FAQ. Verified answers and configurable placeholders are
 * never presented the same way: the source label travels with every entry.
 */
export function FaqExplorer({ items }: { items: FaqItem[] }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState(ALL);

  const sections = useMemo(() => [ALL, ...Array.from(new Set(items.map((item) => item.section)))], [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (section !== ALL && item.section !== section) return false;
      if (!q) return true;
      return `${item.question} ${item.answer} ${item.section}`.toLowerCase().includes(q);
    });
  }, [items, query, section]);

  const grouped = useMemo(() => {
    const map = new Map<string, FaqItem[]>();
    for (const item of filtered) {
      map.set(item.section, [...(map.get(item.section) ?? []), item]);
    }
    return [...map.entries()];
  }, [filtered]);

  const verifiedCount = filtered.filter((item) => item.source === "verified").length;
  const placeholderCount = filtered.length - verifiedCount;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-5 rounded-sm border border-line bg-surface p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="w-full lg:max-w-md">
            <label htmlFor="faq-search" className="text-caption font-medium text-ink">
              Search the questions
            </label>
            <div className="relative mt-1.5">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
              <input
                id="faq-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Size, magnetic, surface, warranty, delivery"
                className="h-11 w-full rounded-xs border border-line-strong bg-surface pl-9 pr-3 text-body-sm text-ink placeholder:text-muted focus-visible:border-navy-deep"
              />
            </div>
          </div>

          <p aria-live="polite" className="text-caption text-muted">
            {filtered.length === 0
              ? "No questions match your search."
              : `Showing ${filtered.length} ${filtered.length === 1 ? "question" : "questions"} — ${verifiedCount} answered by Plusmark${
                  placeholderCount > 0 ? `, ${placeholderCount} pending the desk` : ""
                }.`}
          </p>
        </div>

        <div role="group" aria-label="Filter by section" className="flex flex-wrap gap-2">
          {sections.map((option) => {
            const active = option === section;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setSection(option)}
                className={classNames(
                  "min-h-11 rounded-xs border px-3.5 text-caption font-medium transition-colors",
                  active ? "border-primary bg-primary text-onprimary" : "border-line-strong text-ink hover:bg-subtle/70"
                )}
              >
                {option === ALL ? "All sections" : option}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
          <span className="flex items-center gap-2 text-caption text-muted">
            <Badge tone="navy">As answered by Plusmark</Badge>
            taken from the FAQ published on plusmarkboards.com
          </span>
          <span className="flex items-center gap-2 text-caption text-muted">
            <Badge tone="demo">Awaiting the desk</Badge>
            the answer is not published yet — shown as a placeholder, never invented
          </span>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={`Nothing matches ${query ? `“${query}”` : "this filter"}.`}
          body="Plusmark answers size, layout and freight questions for a specific requirement rather than in a general list. Send the detail to the desk or ask on the phone number on the contact page."
          action={{ label: "Ask the Plusmark desk", href: "/contact" }}
        />
      ) : (
        <div className="flex flex-col gap-12">
          {grouped.map(([name, groupItems]) => {
            const entries: AccordionEntry[] = groupItems.map((item) => ({
              id: item.id,
              question: item.question,
              meta: item.source === "verified" ? "As answered by Plusmark" : "Awaiting the desk",
              answer: (
                <div className="flex flex-col gap-3">
                  <p>{item.answer}</p>
                  {item.source === "demo" && (
                    <p className="rounded-sm border border-dashed border-graphite/40 bg-subtle/40 px-3 py-2 text-caption text-muted">
                      Configurable answer — Plusmark has not published this yet. The desk handling your order confirms it;
                      see <Link href="/contact" className="underline decoration-line-strong underline-offset-4">contact &amp; support</Link>.
                    </p>
                  )}
                </div>
              )
            }));
            return (
              <section key={name} aria-labelledby={`faq-section-${name.replace(/\W+/g, "-").toLowerCase()}`}>
                <h2 id={`faq-section-${name.replace(/\W+/g, "-").toLowerCase()}`} className="mb-4 font-display text-h3">
                  {name}
                </h2>
                <Accordion items={entries} />
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
