import { CATALOG_COPY } from "@/lib/catalog-copy";

const COLOUR_LINE = /^(?:felt )?colours\s*[—-]\s*(.+)$/i;

/**
 * Published colour choices for a product, taken verbatim from the catalogue's
 * own "Colours —" spec line. Products whose catalogue page names no fixed list
 * (or offers colour only as customisation) return an empty array.
 */
export function productColours(slug: string): string[] {
  const entry = CATALOG_COPY[slug];
  if (!entry) return [];
  for (const line of entry.built) {
    const match = line.match(COLOUR_LINE);
    if (!match) continue;
    return match[1]
      .split(/,\s*|\s+and\s+/)
      .map((colour) => colour.trim().replace(/\.$/, ""))
      .filter(Boolean);
  }
  return [];
}

export function cartItemColourLabel(colour: string | null | undefined): string {
  return colour ? ` · ${colour}` : "";
}
