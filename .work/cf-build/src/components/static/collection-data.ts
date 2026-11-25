import { getSeries, products } from "@/lib/catalog";
import type { Product } from "@/types";

export type CollectionKind = "Series" | "Board type" | "Use" | "Format";

export interface EditorialCollection {
  slug: string;
  name: string;
  kind: CollectionKind;
  /** What the selection is for, written only from catalogue facts. */
  blurb: string;
  /** How the members were chosen — always a structural query, never sales data. */
  basis: string;
  select: () => Product[];
}

const inCategory = (...categoryIds: string[]): Product[] => products.filter((p) => categoryIds.includes(p.categoryId));

const hasSize = (...labels: string[]): Product[] =>
  products.filter((p) => p.variants.some((v) => labels.includes(v.size.label)));

function pickFrom(list: Product[], slugs: string[]): Product[] {
  return slugs.map((slug) => list.find((p) => p.slug === slug)).filter((p): p is Product => Boolean(p));
}

/**
 * Curated collections. Plusmark publishes no sales data, so every member here is
 * a structural query against the catalogue (series, category, size, magnetic
 * flag) or a manual editorial pick from the published ranges. Nothing is a
 * bestseller, trending or top-rated claim.
 */
export const collections: EditorialCollection[] = [
  {
    slug: "metallic-premium",
    name: "The Metallic Premium range",
    kind: "Series",
    blurb:
      "Plusmark's heavy-duty range: high gloss marker grade HPL face, heavy-duty anodized aluminium frame and Signature Dual-Tone corners.",
    basis: "Every published product carrying the Metallic Premium series, across white, navy, magnetic, ceramic, notice and double-sided boards.",
    select: () => products.filter((p) => p.seriesId === "metallic-premium")
  },
  {
    slug: "eco-premium",
    name: "The Eco Premium range",
    kind: "Series",
    blurb: "Marker grade HPL face on a ribbed anodized aluminium frame with ABS Dual-Tone corners, for everyday use.",
    basis: "Every published product carrying the Eco Premium series.",
    select: () => products.filter((p) => p.seriesId === "eco-premium")
  },
  {
    slug: "deluxe-standard",
    name: "The Deluxe Standard range",
    kind: "Series",
    blurb: "High gloss melamine face, deluxe anodized aluminium frame and electroplated chrome corners — the dependable everyday range.",
    basis: "Every published product carrying the Deluxe Standard series.",
    select: () => products.filter((p) => p.seriesId === "deluxe-standard")
  },
  {
    slug: "eco-regular",
    name: "The Eco Regular range",
    kind: "Series",
    blurb: "Lightweight ribbed frame with standard plastic corners, and the widest size ladder in the catalogue — 1 × 1 ft upward.",
    basis: "Every published product carrying the Eco Regular series.",
    select: () => products.filter((p) => p.seriesId === "eco-regular")
  },

  {
    slug: "chalk-boards",
    name: "Chalk boards, glare-free",
    kind: "Board type",
    blurb:
      "Plusmark's navy faces are non-reflective navy grade surfaces, made for classrooms where the back bench has to read the board.",
    basis: "Every product in the Chalk Boards category, magnetic and non-magnetic, across all four series.",
    select: () => inCategory("chalk-boards")
  },
  {
    slug: "white-boards",
    name: "White boards for marker use",
    kind: "Board type",
    blurb: "HPL and melamine marker faces, from 1 × 1 ft desk boards to 8 × 4 ft lecture-hall boards.",
    basis: "Every product in the White Boards category, including the ceramic steel boards.",
    select: () => inCategory("white-boards")
  },
  {
    slug: "notice-boards",
    name: "Notice & display boards",
    kind: "Board type",
    blurb: "Cork, fabric, combination and acrylic door cover boards for corridors, staff rooms and reception.",
    basis: "Every product in the Notice Boards category.",
    select: () => inCategory("notice-boards")
  },
  {
    slug: "magnetic-boards",
    name: "Magnetic boards",
    kind: "Board type",
    blurb: "Resin coated steel and ceramic steel faces that hold charts, timetables, notices and markers.",
    basis: "Every catalogue product flagged magnetic by Plusmark, in navy and marker versions.",
    select: () => products.filter((p) => p.magnetic)
  },
  {
    slug: "double-sided-boards",
    name: "Double-sided boards",
    kind: "Board type",
    blurb: "Two writing faces on one frame — the range Plusmark shows as both side boards.",
    basis: "Every catalogue product flagged double sided, plus the Double-Sided Boards category.",
    select: () => products.filter((p) => p.doubleSided || p.categoryId === "double-sided-boards")
  },
  {
    slug: "ceramic-boards",
    name: "Ceramic steel boards",
    kind: "Board type",
    blurb:
      "Ceramic steel / porcelain enamel surfaces — hard, non-porous, made for continuous writing and frequent cleaning.",
    basis: "Catalogue products listed in the ceramic subcategories of the white and navy board ranges.",
    select: () => products.filter((p) => p.slug.includes("ceramic"))
  },

  {
    slug: "classroom-writing",
    name: "Classroom writing set-up",
    kind: "Use",
    blurb: "The boards and classroom accessories a school orders together when it fits out or refits a set of rooms.",
    basis: "Editorial selection from the navy, white, practice, schedule and study-essentials ranges.",
    select: () =>
      pickFrom(products, [
        "metallic-premium-chalk-board",
        "eco-premium-chalk-board",
        "eco-regular-white-board",
        "deluxe-standard-white-board",
        "four-line-square-line-practice-board",
        "dry-wipe-schedule-board",
        "letters-and-figures-set",
        "cork-notice-board"
      ])
  },
  {
    slug: "staff-room-display",
    name: "Staff room & corridor display",
    kind: "Use",
    blurb: "Notice, schedule and folder boards for offices, departments and reception walls.",
    basis: "Editorial selection from the notice board, schedule board and display board categories.",
    select: () =>
      pickFrom(products, [
        "metallic-premium-notice-board",
        "combination-board",
        "fabric-notice-board",
        "deluxe-45mm-adc-notice-board-double-door",
        "dry-wipe-schedule-board",
        "acrylic-folder-display-board",
        "deluxe-standard-magnetic-board"
      ])
  },
  {
    slug: "shop-floor-and-safety",
    name: "Shop floor & industrial display",
    kind: "Use",
    blurb: "Perforated, grooved and key hanger boards plus folder displays for production data and safety notices.",
    basis: "Editorial selection from the specialty, display and notice board ranges.",
    select: () =>
      pickFrom(products, [
        "perforated-board",
        "grooved-boards",
        "key-hanger-board",
        "acrylic-folder-display-board",
        "metallic-premium-magnetic-chalk-board",
        "first-aid-box",
        "eco-regular-notice-board"
      ])
  },
  {
    slug: "exams-and-invigilation",
    name: "Exams & invigilation",
    kind: "Use",
    blurb: "Clipboards and answer-pad supports in MDF base and acrylic base versions, made in standard and to-order sizes.",
    basis: "Every product in the Clipboards category.",
    select: () => inCategory("clipboards")
  },
  {
    slug: "stands-and-storage",
    name: "Stands, racks & storage",
    kind: "Use",
    blurb: "Mobile and fixed stands, file, magazine and newspaper racks, letter boxes — boards up to 8 ft as listed.",
    basis: "Every product in the Board Stands & Storage category.",
    select: () => inCategory("board-stands")
  },

  {
    slug: "large-format-boards",
    name: "Large format boards, 8 × 4 ft",
    kind: "Format",
    blurb: "The boards Plusmark publishes in 8 × 4 ft, the size used for lecture halls and assembly halls.",
    basis: "Every catalogue product with an 8 × 4 ft variant.",
    select: () => hasSize("8 x 4 ft")
  },
  {
    slug: "compact-boards",
    name: "Compact boards, 1 × 1 ft upward",
    kind: "Format",
    blurb: "Small-format boards for desks, counters, reception and practice — the sizes at the bottom of the ladder.",
    basis: "Every catalogue product with a 1 × 1 ft, 2 × 2 ft or 2 × 3 ft variant.",
    select: () => hasSize("1 x 1 ft", "2 x 2 ft", "2 x 3 ft")
  }
];

export function getCollection(slug: string): EditorialCollection | undefined {
  return collections.find((c) => c.slug === slug);
}

export function collectionsByKind(): { kind: CollectionKind; items: EditorialCollection[] }[] {
  const kinds: CollectionKind[] = ["Series", "Board type", "Use", "Format"];
  return kinds
    .map((kind) => ({ kind, items: collections.filter((c) => c.kind === kind) }))
    .filter((group) => group.items.length > 0);
}

/** Related collections for a collection page: same kind first, then a series. */
export function relatedCollections(collection: EditorialCollection, limit = 3): EditorialCollection[] {
  const sameKind = collections.filter((c) => c.kind === collection.kind && c.slug !== collection.slug);
  const others = collections.filter((c) => c.kind !== collection.kind && c.slug !== collection.slug);
  return [...sameKind, ...others].slice(0, limit);
}

/** Series detail for a series collection page — all facts from catalog.ts. */
export function seriesFacts(id: string | null) {
  return id ? getSeries(id) ?? null : null;
}
