const INR = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const INR_EXACT = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function formatInr(amount: number, exact = false): string {
  return (exact ? INR_EXACT : INR).format(amount);
}

/**
 * Prices are not published by Plusmark. Anything that is not a confirmed
 * figure renders as "Price on request" rather than a guessed number.
 */
export function formatPrice(amountInr: number | null): { text: string; onRequest: boolean; demo: boolean } {
  if (amountInr === null) return { text: "Price on request", onRequest: true, demo: false };
  return { text: formatInr(amountInr), onRequest: false, demo: false };
}

export function formatDimension(widthCm: number | null, heightCm: number | null): string {
  if (!widthCm || !heightCm) return "Size on request";
  return `${widthCm} × ${heightCm} cm`;
}

export function formatCount(noun: string, count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : noun}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function relativeDay(iso: string): string {
  const diff = Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return diff > 0 ? `In ${diff} days` : `${Math.abs(diff)} days ago`;
}

export function classNames(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function pluralise(count: number, one: string, many = `${one}s`): string {
  return count === 1 ? one : many;
}

/** "1 x 1 ft" for a single board, "Pack of 4 · 1 x 1 ft" for a pack. */
export function variantLabel(variant: { size: { label: string }; packQty?: number }): string {
  return variant.packQty && variant.packQty > 1
    ? `Pack of ${variant.packQty} · ${variant.size.label}`
    : variant.size.label;
}

function compactSize(label: string): string {
  return label.replace(/\s*x\s*/gi, "×");
}

function shortFrame(frame: string | null): string | null {
  if (!frame) return null;
  const f = frame.toLowerCase();
  if (f.includes("heavy-duty")) return "Heavy aluminium frame";
  if (f.includes("ribbed")) return "Ribbed aluminium frame";
  if (f.includes("deluxe")) return "Deluxe aluminium frame";
  if (f.includes("aluminium") || f.includes("aluminum")) return "Aluminium frame";
  return frame.length <= 28 ? frame : null;
}

/** Concise plain-text category attributes for product cards and comparison rows. */
export function productCardMeta(product: {
  name: string;
  boardType: string;
  magnetic: boolean;
  doubleSided: boolean;
  frame: string | null;
  enquiryOnly: boolean;
  variants: { size: { label: string; widthCm: number | null; heightCm: number | null }; packQty?: number }[];
}): string {
  const singleSizes = [
    ...new Set(
      product.variants
        .filter((v) => (v.packQty ?? 1) === 1)
        .map((v) => v.size.label)
        .filter((label) => label !== "Made to order")
    )
  ];

  let sizePart = "";
  if (singleSizes.length > 1) {
    const first = compactSize(singleSizes[0]).replace(/\s*ft$/i, "");
    const last = compactSize(singleSizes[singleSizes.length - 1]);
    sizePart = `${first} – ${last}`;
  } else if (singleSizes.length === 1) {
    const only = product.variants.find((v) => (v.packQty ?? 1) === 1)?.size;
    if (only?.widthCm && only?.heightCm) {
      sizePart = `${compactSize(only.label)} (${only.widthCm} × ${only.heightCm} cm)`;
    } else {
      sizePart = compactSize(singleSizes[0]);
    }
  } else {
    sizePart = product.enquiryOnly ? "Quoted by size" : "Custom size";
  }

  let boardTrait: string | null = null;
  if (product.boardType === "ceramic") boardTrait = "Ceramic";
  else if (product.boardType === "magnetic" || product.magnetic) boardTrait = "Magnetic";
  else if (product.doubleSided) boardTrait = "Double-sided";
  else if (product.boardType === "non-magnetic") boardTrait = "Non-magnetic";

  const frameTrait = shortFrame(product.frame);
  return [sizePart, boardTrait, frameTrait].filter(Boolean).slice(0, 3).join(" · ");
}
