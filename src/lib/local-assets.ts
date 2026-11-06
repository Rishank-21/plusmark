/**
 * Plusmark-supplied photography and A+ panels. The files live on Cloudinary;
 * this map only decides which public ids belong to each product or category.
 */

const PRODUCT_IMAGE_MAP: Record<string, string[]> = {
  "metallic-premium-white-board": [
    "metallic-premium-white-board",
    "metallic-premium-white-board-2",
    "metallic-premium-white-board-3",
    "metallic-premium-white-board-4",
    "metallic-premium-white-board-5",
    "metallic-premium-white-board-6",
    "metallic-premium-white-board-7"
  ],
  "metallic-premium-chalk-board": [
    "metallic-premium-chalk-board",
    "metallic-premium-chalk-board-2",
    "metallic-premium-chalk-board-3",
    "metallic-premium-chalk-board-4",
    "metallic-premium-chalk-board-5",
    "metallic-premium-chalk-board-6",
    "metallic-premium-chalk-board-7"
  ],
  "metallic-premium-magnetic-board": [
    "metallic-premium-magnetic-board",
    "metallic-premium-magnetic-board-2",
    "metallic-premium-magnetic-board-3",
    "metallic-premium-magnetic-board-4",
    "metallic-premium-magnetic-board-5",
    "metallic-premium-magnetic-board-6",
    "metallic-premium-magnetic-board-7"
  ],
  "metallic-premium-magnetic-chalk-board": [
    "metallic-premium-magnetic-chalk-board",
    "metallic-premium-magnetic-chalk-board-2",
    "metallic-premium-magnetic-chalk-board-3",
    "metallic-premium-magnetic-chalk-board-4",
    "metallic-premium-magnetic-chalk-board-5",
    "metallic-premium-magnetic-chalk-board-6",
    "metallic-premium-magnetic-chalk-board-7"
  ],
  "metallic-premium-ceramic-board": [
    "metallic-premium-ceramic-board",
    "metallic-premium-ceramic-board-2",
    "metallic-premium-ceramic-board-3",
    "metallic-premium-ceramic-board-4",
    "metallic-premium-ceramic-board-5",
    "metallic-premium-ceramic-board-6",
    "metallic-premium-ceramic-board-7"
  ],
  "metallic-premium-ceramic-chalk-board": [
    "metallic-premium-ceramic-chalk-board",
    "metallic-premium-ceramic-chalk-board-2",
    "metallic-premium-ceramic-chalk-board-3",
    "metallic-premium-ceramic-chalk-board-4",
    "metallic-premium-ceramic-chalk-board-5",
    "metallic-premium-ceramic-chalk-board-6",
    "metallic-premium-ceramic-chalk-board-7"
  ],
  "deluxe-standard-white-board": ["deluxe-standard-white-board"],
  "deluxe-standard-chalk-board": ["deluxe-standard-chalk-board-correct"],
  "eco-premium-white-board": [
    "eco-premium-white-board",
    "eco-premium-white-board-2",
    "eco-premium-white-board-3",
    "eco-premium-white-board-4",
    "eco-premium-white-board-5",
    "eco-premium-white-board-6",
    "eco-premium-white-board-7"
  ],
  "eco-regular-white-board": [
    "eco-regular-white-board-correct",
    "eco-regular-white-board-2",
    "eco-regular-white-board-3",
    "eco-regular-white-board-4",
    "eco-regular-white-board-5",
    "eco-regular-white-board-6",
    "eco-regular-white-board-7"
  ],
  "eco-premium-chalk-board": [
    "eco-premium-chalk-board",
    "eco-premium-chalk-board-2",
    "eco-premium-chalk-board-3",
    "eco-premium-chalk-board-4",
    "eco-premium-chalk-board-5",
    "eco-premium-chalk-board-6",
    "eco-premium-chalk-board-7"
  ],
  "eco-regular-chalk-board": [
    "eco-regular-chalk-board-correct",
    "eco-regular-chalk-board-2",
    "eco-regular-chalk-board-3",
    "eco-regular-chalk-board-4",
    "eco-regular-chalk-board-5",
    "eco-regular-chalk-board-6",
    "eco-regular-chalk-board-7"
  ],
  "eco-regular-magnetic-board": [
    "eco-regular-magnetic-board-correct",
    "eco-regular-magnetic-board-2",
    "eco-regular-magnetic-board-3",
    "eco-regular-magnetic-board-4",
    "eco-regular-magnetic-board-5",
    "eco-regular-magnetic-board-6",
    "eco-regular-magnetic-board-7"
  ],
  "eco-regular-magnetic-chalk-board": [
    "eco-regular-magnetic-chalk-board-correct",
    "eco-regular-magnetic-chalk-board-2",
    "eco-regular-magnetic-chalk-board-3",
    "eco-regular-magnetic-chalk-board-4",
    "eco-regular-magnetic-chalk-board-5",
    "eco-regular-magnetic-chalk-board-6",
    "eco-regular-magnetic-chalk-board-7"
  ],
  "metallic-premium-notice-board": [
    "metallic-premium-notice-board",
    "metallic-premium-notice-board-2",
    "metallic-premium-notice-board-3",
    "metallic-premium-notice-board-4",
    "metallic-premium-notice-board-5",
    "metallic-premium-notice-board-6",
    "metallic-premium-notice-board-7"
  ],
  "eco-premium-notice-board": [
    "eco-premium-notice-board",
    "eco-premium-notice-board-2",
    "eco-premium-notice-board-3",
    "eco-premium-notice-board-4",
    "eco-premium-notice-board-5",
    "eco-premium-notice-board-6",
    "eco-premium-notice-board-7"
  ],
  "deluxe-standard-notice-board": ["deluxe-standard-notice-board"],
  "eco-regular-notice-board": [
    "eco-regular-notice-board-correct",
    "eco-regular-notice-board-2",
    "eco-regular-notice-board-3",
    "eco-regular-notice-board-4",
    "eco-regular-notice-board-5",
    "eco-regular-notice-board-6",
    "eco-regular-notice-board-7"
  ],
  "eco-premium-both-side-board": [
    "eco-premium-both-side-board",
    "eco-premium-both-side-board-2",
    "eco-premium-both-side-board-3",
    "eco-premium-both-side-board-4",
    "eco-premium-both-side-board-5",
    "eco-premium-both-side-board-6",
    "eco-premium-both-side-board-7"
  ],
  "perforated-board": ["perforated-board"],
  "cork-notice-board": ["cork-notice-board"],
  "dry-wipe-schedule-board": ["dry-wipe-schedule-board"],
  "combination-board": ["combination-board"],
  "eco-adc-notice-board-single-door": ["eco-adc-notice-board-single-door"],
  "deluxe-45mm-adc-notice-board-double-door": ["deluxe-45mm-adc-notice-board-double-door"],
  "four-line-square-line-practice-board": ["four-line-square-line-practice-board"],
  "grooved-boards": ["grooved-boards"],
  "student-study-table": [
    "student-study-table",
    "student-study-table-2",
    "student-study-table-3",
    "student-study-table-4",
    "student-study-table-5",
    "student-study-table-6",
    "student-study-table-7",
    "student-study-table-8",
    "student-study-table-9",
    "student-study-table-10",
    "student-study-table-11",
    "student-study-table-12",
    "student-study-table-13"
  ],
  "three-leg-stand": ["three-leg-stand"],
  "four-leg-stand": ["four-leg-stand"],
  "telescopic-stand": ["telescopic-stand"],
  "magazine-stand": ["magazine-stand"],
  "newspaper-stand": ["newspaper-stand"],
  "first-aid-box": ["first-aid-box"],
  "letter-box": ["letter-box"],
  "file-rack": ["file-rack"],
  "acrylic-folder-display-board": ["acrylic-folder-display-board", "acrylic-folder-display-board-2", "acrylic-folder-display-board-3"],
  "laminate-mdf-base-clipboard": ["laminate-mdf-base-clipboard", "laminate-mdf-base-clipboard-2", "laminate-mdf-base-clipboard-3"],
  "pre-lam-mdf-base-clipboard": ["pre-lam-mdf-base-clipboard", "pre-lam-mdf-base-clipboard-2", "pre-lam-mdf-base-clipboard-3"],
  "crystal-clear-base-clipboard": ["crystal-clear-base-clipboard"],
  "crystal-colour-base-clipboard": ["crystal-colour-base-clipboard"],
  "pds-sb-807": ["pds-sb-807"],
  "pds-sb-810": ["pds-sb-810"],
  "pds-sb-804": ["pds-sb-804"],
  "pds-sb-812": ["pds-sb-812"],
  "pds-sb-801": ["pds-sb-801"],
  "pds-sb-802": ["pds-sb-802"],
  "pds-sb-803": ["pds-sb-803"],
  "pds-sb-805": ["pds-sb-805"],
  "pds-sb-806": ["pds-sb-806"],
  "pds-sb-808": ["pds-sb-808"],
  "pds-sb-809": ["pds-sb-809"],
  "pds-sb-811": ["pds-sb-811"],
  "pds-sb-813": ["pds-sb-813"],
  "pds-sb-814": ["pds-sb-814"],
  "pds-sb-815": ["pds-sb-815"]
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "white-boards": "metallic-premium-white-board",
  "chalk-boards": "metallic-premium-chalk-board",
  "notice-boards": "metallic-premium-notice-board",
  "acrylic-door-cover-notice-boards": "deluxe-45mm-adc-notice-board-double-door",
  "double-sided-boards": "eco-premium-both-side-board",
  "schedule-boards": "dry-wipe-schedule-board",
  "specialty-boards": "acrylic-folder-display-board",
  "display-boards": "grooved-boards",
  "board-study-essentials": "four-line-square-line-practice-board",
  "clipboards": "laminate-mdf-base-clipboard",
  "board-stands": "four-leg-stand",
  "school-benches": "pds-sb-807"
};

/** A+ panels Plusmark supplied per product family. */
const APLUS_MAP: Record<string, string> = {
  "metallic-premium-white-board": "metallic-white-board",
  "metallic-premium-chalk-board": "metallic-chalk-board",
  "metallic-premium-magnetic-board": "metallic-magnetic-white-board",
  "metallic-premium-magnetic-chalk-board": "metallic-magnetic-chalk-board",
  "metallic-premium-ceramic-board": "metallic-ceramic-white-board",
  "metallic-premium-ceramic-chalk-board": "metallic-ceramic-chalk-board",
  "metallic-premium-notice-board": "metallic-notice-board",
  "eco-premium-white-board": "eco-white-board",
  "eco-premium-chalk-board": "eco-chalk-board",
  "eco-premium-notice-board": "eco-notice-board",
  "eco-premium-both-side-board": "eco-both-side-board",
  "eco-regular-white-board": "eco-white-board",
  "eco-regular-chalk-board": "eco-chalk-board",
  "eco-regular-magnetic-board": "eco-magnetic-white-board",
  "eco-regular-magnetic-chalk-board": "eco-magnetic-chalk-board",
  "eco-regular-notice-board": "eco-notice-board"
};

/** Public ids of the Plusmark photography now hosted on Cloudinary. */
const PRODUCT_IMAGE_PREFIX = "plusmark/products/";

function productFile(base: string): string {
  return `${PRODUCT_IMAGE_PREFIX}${base}`;
}

export function localProductImages(slug: string): string[] | null {
  const bases = PRODUCT_IMAGE_MAP[slug];
  return bases ? bases.map(productFile) : null;
}

export function localCategoryImage(categoryId: string): string | null {
  const base = CATEGORY_IMAGE_MAP[categoryId];
  return base ? productFile(base) : null;
}

/** Brand banner that opens every product's A+ listing. */
export const APLUS_BRAND_PANEL = productFile("brand");

export function aPlusPanelsFor(slug: string): string[] {
  const family = APLUS_MAP[slug];
  if (!family) return [];
  const panels = Array.from(
    { length: 8 },
    (_, index) => `${PRODUCT_IMAGE_PREFIX}${family}/source-${index + 1}`
  );
  return [APLUS_BRAND_PANEL, ...panels];
}
