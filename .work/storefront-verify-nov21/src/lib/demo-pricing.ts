import type { ProductSize } from "@/types";
import liveCatalog from "@/data/live-catalog.json";

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

type LiveVariant = { id: string; title: string; amount: number | null; original: number | null; available: boolean; stock: number | null };

/** The backend variant for a product handle and size label, if the live sync has one. */
export function liveVariantFor(slug: string, sizeLabel: string): LiveVariant | null {
  const entry = (liveCatalog as { products?: Record<string, { variants?: LiveVariant[] }> }).products?.[slug];
  return entry?.variants?.find((v) => v.title === sizeLabel) ?? null;
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
