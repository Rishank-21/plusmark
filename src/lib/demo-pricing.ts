import type { ProductSize, Series } from "@/types";

/**
 * A fabricated rate card. It exists so the cart, GST breakdown, checkout and
 * order-total code paths can be exercised end to end; every figure rendered
 * from it is badged as a demo price in the UI. Plusmark quotes per series,
 * size and quantity, so none of these numbers are shop prices.
 */

interface SeriesBase {
  /** Roughly ₹ per square foot of writing face, before size handling. */
  perSqFt: number;
  frameHandlingInr: number;
}

const SERIES_BASE: Record<string, SeriesBase> = {
  "metallic-premium": { perSqFt: 260, frameHandlingInr: 900 },
  "eco-premium": { perSqFt: 200, frameHandlingInr: 700 },
  "deluxe-standard": { perSqFt: 165, frameHandlingInr: 600 },
  "eco-regular": { perSqFt: 130, frameHandlingInr: 450 }
};

const NON_BOARD_UNIT: Record<string, number> = {
  clipboards: 420,
  "board-stands": 3800,
  "school-benches": 6400,
  "board-study-essentials": 690,
  "specialty-boards": 2400,
  "display-boards": 2900,
  "schedule-boards": 3400,
  "notice-boards": 2600,
  "double-sided-boards": 4200
};

/** Parse "6 x 4 ft" — the only size labels that carry real dimensions. */
export function sizeFootArea(label: string): number | null {
  const match = label.match(/^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*ft$/i);
  if (!match) return null;
  return Number.parseFloat(match[1]) * Number.parseFloat(match[2]);
}

export function sizeToCm(label: string): { widthCm: number | null; heightCm: number | null } {
  const match = label.match(/^(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)\s*ft$/i);
  if (!match) return { widthCm: null, heightCm: null };
  const toCm = (ft: string) => Math.round(Number.parseFloat(ft) * 30.48);
  return { widthCm: toCm(match[2]), heightCm: toCm(match[1]) };
}

export function buildSize(id: string, label: string): ProductSize {
  return { id, label, ...sizeToCm(label) };
}

export function demoUnitPriceInr(input: {
  slug: string;
  categoryId: string;
  series: Series | null;
  sizeLabel: string;
}): number {
  const area = sizeFootArea(input.sizeLabel);
  const seriesBase = input.series ? SERIES_BASE[input.series.id] : undefined;

  if (seriesBase && area) {
    const raw = seriesBase.perSqFt * area + seriesBase.frameHandlingInr;
    return roundToTen(raw);
  }

  const fallback = NON_BOARD_UNIT[input.categoryId] ?? 2200;
  // Category without a series: a flat unit, nudged by slug so identical
  // products do not all collapse onto the same number.
  return roundToTen(fallback * (0.85 + slugFactor(input.slug) * 0.4));
}

/**
 * Pack rates still have to come from Plusmark, so this table stays empty until
 * they are supplied. A missing entry leaves the pack priced on request.
 * Key format: "<product slug>|<size label>".
 */
const PACK_PRICE_INR: Record<string, Record<number, number>> = {};

export function demoPackPriceInr(input: {
  slug: string;
  sizeLabel: string;
  packQty: number;
}): number | null {
  return PACK_PRICE_INR[`${input.slug}|${input.sizeLabel}`]?.[input.packQty] ?? null;
}

function slugFactor(slug: string): number {
  let sum = 0;
  for (let i = 0; i < slug.length; i += 1) sum += slug.charCodeAt(i);
  return (sum % 100) / 100;
}

function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}
