import type { UsageLevel } from "@/types";

/**
 * Curation layered on top of the published catalogue. Every field here is a
 * restatement of something the catalogue copy or a product spec already says;
 * nothing new is asserted. A product needs no entry unless its published
 * wording cannot be derived automatically.
 */

export interface CompareCuration {
  /** Short "best for" line, in the catalogue's own terms. */
  bestFor?: string;
  usageLevel?: UsageLevel;
  lockable?: boolean;
  /** Only set when Plusmark publishes an official marketplace listing. */
  amazonUrl?: string;
}

/** Series positioning, stated in the printed catalogue. */
export const SERIES_USAGE_LEVEL: Record<string, UsageLevel> = {
  "metallic-premium": "daily-intensive",
  "eco-premium": "regular",
  "deluxe-standard": "regular",
  "eco-regular": "light"
};

export const COMPARE_CURATION: Record<string, CompareCuration> = {
  // Eco Premium ADC boards are positioned for regular indoor use, unlike the
  // light-use Eco Regular writing boards.
  "eco-adc-notice-board-single-door": { usageLevel: "regular", lockable: true },
  "deluxe-45mm-adc-notice-board-single-door": { lockable: true },
  "deluxe-45mm-adc-notice-board-double-door": { lockable: true },
  "key-hanger-board": { lockable: true }
};

const GUIDE_DIR = "https://plusmarkboards.com/blog";

export interface Guide {
  label: string;
  href: string;
}

export const GUIDES = {
  series: { label: "Board series guide", href: `${GUIDE_DIR}/board-series-explained` },
  surface: { label: "White board surface guide", href: `${GUIDE_DIR}/white-board-surface-guide` },
  magneticWhite: {
    label: "Magnetic vs non-magnetic white board guide",
    href: `${GUIDE_DIR}/magnetic-vs-non-magnetic-white-board`
  },
  ceramic: { label: "Ceramic steel white board guide", href: `${GUIDE_DIR}/ceramic-steel-white-board-guide` },
  chalkVsWhite: { label: "Chalk board vs white board guide", href: `${GUIDE_DIR}/chalk-board-vs-white-board` },
  magneticChalk: { label: "Magnetic chalk board guide", href: `${GUIDE_DIR}/magnetic-chalk-board-guide` },
  doubleSided: { label: "Double-sided board guide", href: `${GUIDE_DIR}/double-sided-board-guide` },
  notice: { label: "Notice board types guide", href: `${GUIDE_DIR}/notice-board-types-guide` },
  adc: { label: "Acrylic door cover notice board guide", href: `${GUIDE_DIR}/acrylic-door-cover-notice-board-guide` },
  stands: { label: "Board stands guide", href: `${GUIDE_DIR}/board-stands-types-guide` },
  clipboards: { label: "MDF vs acrylic clipboard guide", href: `${GUIDE_DIR}/clipboards-mdf-vs-acrylic` },
  benches: { label: "School bench guide", href: `${GUIDE_DIR}/school-bench-and-classroom-seating-guide` },
  display: { label: "Grooved and perforated board guide", href: `${GUIDE_DIR}/grooved-and-perforated-display-boards` },
  schedule: { label: "Custom schedule board guide", href: `${GUIDE_DIR}/schedule-board-custom-design` },
  keyHanger: { label: "Key hanger board guide", href: `${GUIDE_DIR}/key-hanger-board-guide` },
  homeworkTable: { label: "Homework table guide", href: `${GUIDE_DIR}/homework-table-guide` },
  practice: { label: "Handwriting practice board guide", href: `${GUIDE_DIR}/practice-board-handwriting-guide` },
  combination: { label: "Combination board guide", href: `${GUIDE_DIR}/combination-board-guide` },
  buying: { label: "Plusmark buying guide", href: "https://plusmarkboards.com/buying-guide" }
} satisfies Record<string, Guide>;

/** Products whose guide is decided by name rather than category. */
export const SLUG_GUIDES: Record<string, Guide> = {
  "combination-board": GUIDES.combination,
  "cork-notice-board": GUIDES.notice,
  "fabric-notice-board": GUIDES.notice,
  "key-hanger-board": GUIDES.keyHanger,
  "four-line-square-line-practice-board": GUIDES.practice,
  "student-study-table": GUIDES.homeworkTable,
  "letters-and-figures-set": GUIDES.buying
};
