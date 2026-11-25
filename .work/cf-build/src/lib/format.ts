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
