/**
 * Editable content for the six product detail sections on the PDP.
 *
 * Everything is optional: description paragraphs, feature bullets,
 * specifications and size rows are derived from the catalogue when an override
 * is not supplied. Add an entry only where the product needs copy the catalogue
 * does not already carry.
 */
import type { Product } from "@/types";

export type DetailApplicationIcon = "school" | "graduation" | "building" | "users" | "briefcase" | "home";

export interface DetailFeature {
  title: string;
  detail: string;
}

export interface DetailSpec {
  term: string;
  detail: string;
  /** Optional group heading, e.g. "Construction" or "Ordering". */
  group?: string;
}

export interface DetailCareCard {
  id: string;
  icon: "care" | "delivery";
  title: string;
  points: string[];
}

export interface DetailApplication {
  icon: DetailApplicationIcon;
  title: string;
  description: string;
}

export interface ProductDetailContent {
  description: string[];
  features: DetailFeature[];
  specs: DetailSpec[];
  care: { cards: DetailCareCard[]; note: string };
  applications: DetailApplication[];
}

interface DetailOverrides {
  description?: string[];
  features?: DetailFeature[];
  specRows?: DetailSpec[];
  care?: { cards?: DetailCareCard[]; note?: string };
  applications?: DetailApplication[];
}

const DEFAULT_CARE: ProductDetailContent["care"] = {
  cards: [
    {
      id: "care",
      icon: "care",
      title: "Care and maintenance",
      points: [
        "Wipe the writing surface with a dry eraser or duster after use, then a soft cloth if any ghosting remains.",
        "Use a slightly damp cloth on chalk surfaces and let the board dry before writing again.",
        "Avoid solvent-based or abrasive cleaners, and do not leave marker ink on the surface overnight.",
        "Do not use a writing board as a pin surface."
      ]
    },
    {
      id: "delivery",
      icon: "delivery",
      title: "Delivery and installation",
      points: [
        "Boards are made to order after the size, surface and price are confirmed.",
        "Pan-India dispatch from the Plusmark works in Ahmedabad.",
        "Pickup from the Narolgam works carries no transport charge.",
        "Freight and the delivery estimate for your pincode are confirmed when the invoice is raised."
      ]
    }
  ],
  note: "Not sure about the size or finish? The Plusmark order desk confirms the exact specification and price before the board goes into production."
};

const WRITING_APPLICATIONS: DetailApplication[] = [
  { icon: "school", title: "Schools", description: "Classrooms and daily teaching where the board is in use all day." },
  { icon: "graduation", title: "Colleges and universities", description: "Lecture halls, tutorial rooms and seminar spaces." },
  { icon: "building", title: "Offices", description: "Meeting rooms, training floors and workplace briefing areas." },
  { icon: "users", title: "Coaching centres", description: "Batch teaching and test review with frequent board changes." },
  { icon: "briefcase", title: "Training rooms", description: "Induction, safety and skills sessions run by instructors." },
  { icon: "home", title: "Home classrooms", description: "Study and tuition corners in a home setting." }
];

const NOTICE_APPLICATIONS: DetailApplication[] = [
  { icon: "school", title: "Schools", description: "Notices, timetables and student work in corridors and classrooms." },
  { icon: "graduation", title: "Colleges", description: "Department announcements, circulars and event schedules." },
  { icon: "building", title: "Offices", description: "Internal notices, charts and policy updates." },
  { icon: "users", title: "Housing societies", description: "Society notices and community announcements in shared areas." },
  { icon: "briefcase", title: "Factories and workshops", description: "SOP sheets, safety reminders and shift notices." },
  { icon: "home", title: "Home offices", description: "Bills, reminders and schedules in a home workspace." }
];

const DISPLAY_APPLICATIONS: DetailApplication[] = [
  { icon: "building", title: "Reception areas", description: "Information and branding visible to every visitor." },
  { icon: "briefcase", title: "Offices", description: "Schedules, charts and production data on display." },
  { icon: "users", title: "Hotels and hospitality", description: "Guest information and event notices." },
  { icon: "school", title: "Institutions", description: "Department boards, canteen notices and information points." },
  { icon: "graduation", title: "Coaching centres", description: "Batch schedules, results and announcement boards." },
  { icon: "home", title: "Home planning", description: "Dry-wipe schedules and planning boards at home." }
];

const APPLICATIONS_BY_CATEGORY: Record<string, DetailApplication[]> = {
  "white-boards": WRITING_APPLICATIONS,
  "chalk-boards": WRITING_APPLICATIONS,
  "double-sided-boards": WRITING_APPLICATIONS,
  "notice-boards": NOTICE_APPLICATIONS,
  "display-boards": DISPLAY_APPLICATIONS,
  "schedule-boards": DISPLAY_APPLICATIONS,
  "specialty-boards": DISPLAY_APPLICATIONS
};

export const PRODUCT_DETAIL_CONTENT: Record<string, DetailOverrides> = {
  "metallic-premium-chalk-board": {
    features: [
      { title: "Material", detail: "High-quality materials with rigid core construction." },
      { title: "Design", detail: "Heavy-duty aluminium framing with Signature Dual-Tone Corners." },
      { title: "Surface", detail: "Hardcore Chalk Grade HPL Sheet with enhanced scratch resistance." },
      { title: "Glare-free writing", detail: "Non-reflective finish with clear visibility from all angles." },
      { title: "Durability", detail: "Built for intensive daily institutional use." },
      { title: "Installation", detail: "Wall-mountable and easy to install." },
      { title: "Sizes", detail: "Five published sizes, with custom sizes made to order." },
      { title: "Dispatch", detail: "Made in Ahmedabad and dispatched pan-India." }
    ],
    specRows: [
      { term: "Writing surface", detail: "Chalk", group: "Construction" },
      { term: "Mounting", detail: "Wall-mounted", group: "Construction" }
    ],
    care: {
      cards: [
        {
          id: "care",
          icon: "care",
          title: "Care and maintenance",
          points: [
            "Wipe the board with a dry duster after each session; use a slightly damp cloth for a deeper clean and let the surface dry before writing again.",
            "Use chalk on the chalk-facing surface only — marker ink can stain it.",
            "Avoid abrasive pads, solvents and strong chemical cleaners.",
            "Do not use the board as a pin surface."
          ]
        },
        DEFAULT_CARE.cards[1]
      ]
    }
  }
};

export function parseFeature(feature: string): DetailFeature {
  const separator = feature.indexOf(" — ");
  if (separator < 0) return { title: feature, detail: "" };
  return { title: feature.slice(0, separator), detail: feature.slice(separator + 3) };
}

function splitDescription(description: string): string[] {
  return description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function buildSpecs(product: Product, extraRows: DetailSpec[]): DetailSpec[] {
  const physical: DetailSpec[] = [];
  if (product.surface) physical.push({ term: "Surface", detail: product.surface, group: "Construction" });
  if (product.frame) physical.push({ term: "Frame", detail: product.frame, group: "Construction" });
  if (product.corners) physical.push({ term: "Corners", detail: product.corners, group: "Construction" });
  for (const spec of product.specs) {
    if (physical.some((row) => row.term.toLowerCase() === spec.label.toLowerCase())) continue;
    physical.push({ term: spec.label, detail: spec.value, group: "Construction" });
  }

  return [
    ...physical,
    ...extraRows,
    { term: "Magnetic", detail: product.magnetic ? "Yes" : "No", group: "General" },
    { term: "Sides", detail: product.doubleSided ? "Both sides usable" : "Single side", group: "General" },
    ...(product.usage ? [{ term: "Typical use", detail: product.usage, group: "General" }] : []),
    ...(product.hsnCode ? [{ term: "HSN code", detail: product.hsnCode, group: "Ordering" }] : []),
    ...(product.enquiryOnly
      ? [{ term: "Ordering", detail: "Price on request — contact the Plusmark order desk", group: "Ordering" }]
      : [{ term: "Retail minimum", detail: "1 piece", group: "Ordering" }]),
    { term: "Custom sizes", detail: product.customisation ?? "Made to order", group: "Ordering" }
  ];
}

export function buildProductDetailContent(product: Product): ProductDetailContent {
  const overrides = PRODUCT_DETAIL_CONTENT[product.slug] ?? {};

  return {
    description: overrides.description?.length ? overrides.description : splitDescription(product.description),
    features: overrides.features?.length ? overrides.features : product.features.map(parseFeature),
    specs: buildSpecs(product, overrides.specRows ?? []),
    care: {
      cards: overrides.care?.cards ?? DEFAULT_CARE.cards,
      note: overrides.care?.note ?? DEFAULT_CARE.note
    },
    applications: overrides.applications ?? APPLICATIONS_BY_CATEGORY[product.categoryId] ?? []
  };
}
