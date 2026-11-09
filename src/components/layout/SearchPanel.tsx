"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { searchCatalog } from "@/lib/filters";
import { imageUrl } from "@/lib/media";
import { STORAGE_KEYS } from "@/lib/config";
import { readJson, writeJson } from "@/lib/storage";
import { classNames } from "@/lib/format";
import type { SearchSuggestion } from "@/types";

export function SearchPanel({
  id,
  className,
  label,
  autoFocus = false,
  variant = "dropdown"
}: {
  id: string;
  className?: string;
  label: string;
  autoFocus?: boolean;
  variant?: "dropdown" | "inline";
}) {
  const inline = variant === "inline";
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [expanded, setExpanded] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (expanded || inline) setRecent(readJson<string[]>(STORAGE_KEYS.recentSearches, []));
  }, [expanded, inline]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(query.trim());
      setLoading(query.trim().length > 0);
    }, 180);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    if (!debounced) return;
    const id = window.setTimeout(() => setLoading(false), 220);
    return () => window.clearTimeout(id);
  }, [debounced]);

  const suggestions = useMemo(() => (debounced ? searchCatalog(debounced) : []), [debounced]);
  useEffect(() => setActiveIndex(-1), [debounced]);

  const commit = (suggestion?: SearchSuggestion) => {
    const term = suggestion?.label ?? debounced;
    if (term) {
      setRecent((current) => [term, ...current.filter((t) => t !== term)].slice(0, 6));
      writeJson(STORAGE_KEYS.recentSearches, [term, ...recent.filter((t) => t !== term)].slice(0, 6));
    }
    setExpanded(false);
    inputRef.current?.blur();
    if (suggestion) {
      router.push(suggestion.href);
      return;
    }
    if (debounced) router.push(`/search?q=${encodeURIComponent(debounced)}`);
  };

  return (
    <div
      className={classNames("relative min-w-0", className)}
      onFocusCapture={() => setExpanded(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setExpanded(false);
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(activeIndex >= 0 ? suggestions[activeIndex] : undefined);
        }}
        role="search"
        aria-label={label}
        className="relative"
      >
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, -1));
            } else if (e.key === "Escape") {
              setExpanded(false);
              inputRef.current?.blur();
            }
          }}
          type="search"
          role="combobox"
          aria-haspopup="listbox"
          placeholder="Search boards, sizes, series or SKU"
          aria-label="Search products"
          aria-expanded={expanded || inline}
          aria-controls={id}
          aria-autocomplete="list"
          autoFocus={autoFocus}
          className={classNames(
            "h-12 w-full rounded-full border border-line-strong bg-page/55 pl-10 pr-10 text-body-sm text-ink placeholder:text-muted focus:border-line-strong focus:bg-surface focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 [&::-webkit-search-cancel-button]:hidden",
            inline && "text-center"
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-ink"
          >
            <X className="size-4" aria-hidden />
          </button>
        )}
      </form>

      {(expanded || inline) && (
        <div
          id={id}
          className={classNames(
            "rounded-lg border border-line bg-surface p-4",
            inline
              ? "mt-3"
              : "absolute inset-x-0 top-[calc(100%+0.5rem)] z-[70] shadow-lift"
          )}
          role="listbox"
          aria-label="Search suggestions"
        >
          {loading && (
            <ul className="flex flex-col gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <li key={i} className="pm-skeleton h-12 rounded-xs" />
              ))}
            </ul>
          )}

          {!loading && !debounced && (
            <div className="flex flex-wrap items-center gap-2">
              <p className="pm-eyebrow mr-1">Recent</p>
              {recent.length === 0 ? (
                <p className="text-caption text-muted">Nothing searched yet. Try “8 x 4 ft”, “magnetic” or “clipboard”.</p>
              ) : (
                recent.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="h-8 rounded-full border border-line px-3 text-caption text-muted transition-colors hover:border-line-strong hover:text-ink"
                  >
                    {term}
                  </button>
                ))
              )}
            </div>
          )}

          {!loading && debounced && suggestions.length === 0 && (
            <div className="rounded-sm border border-dashed border-line-strong bg-subtle/40 p-5">
              <p className="font-display text-h4">No matches for “{debounced}”.</p>
              <p className="mt-1 text-body-sm text-muted">
                Plusmark makes boards to order in non-standard sizes. Check the spelling, use a shorter word, or ask the
                Plusmark team about what you need.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/shop" className="h-9 rounded-xs border border-line-strong px-3 text-caption font-medium text-ink transition-colors hover:bg-subtle">
                  Browse all products
                </Link>
                <Link href="/contact" className="h-9 rounded-xs border border-line-strong px-3 text-caption font-medium text-ink transition-colors hover:bg-subtle">
                  Ask about this product
                </Link>
              </div>
            </div>
          )}

          {!loading && suggestions.length > 0 && (
            <ul className="max-h-[22rem] divide-y divide-line overflow-y-auto">
              {suggestions.map((s, i) => (
                <li key={`${s.kind}-${s.href}`} role="option" aria-selected={i === activeIndex}>
                  <Link
                    href={s.href}
                    onClick={() => commit(s)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={classNames(
                      "flex items-center gap-3 px-1 py-2.5 transition-colors",
                      i === activeIndex ? "bg-subtle/70" : "hover:bg-subtle/40"
                    )}
                  >
                    <span className="size-11 shrink-0 overflow-hidden rounded-xs bg-surface">
                      {s.imagePublicId && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl(
                            s.imagePublicId,
                            s.kind === "product"
                              ? { fit: "scale", width: 88 }
                              : { fit: "fill", width: 88, height: 88 }
                          )}
                          alt=""
                          className={classNames("size-full", s.kind === "product" ? "object-contain" : "object-cover")}
                          loading="lazy"
                        />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-body-sm font-medium text-ink">{s.label}</span>
                      <span className="truncate text-caption text-muted">
                        {s.kind === "product" ? s.sublabel : s.kind === "category" ? `Category · ${s.sublabel}` : `Series · ${s.sublabel}`}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <button
                  type="button"
                  onClick={() => commit()}
                  className="w-full rounded-xs border border-line px-3 py-2 text-caption font-medium text-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  See all results for “{debounced}”
                </button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
