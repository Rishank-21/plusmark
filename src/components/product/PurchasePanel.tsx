"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Heart, MapPin, MessageCircle, Truck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { brand } from "@/lib/catalog";
import { STORAGE_KEYS } from "@/lib/config";
import { classNames, formatInr, variantLabel } from "@/lib/format";
import { readJson, writeJson } from "@/lib/storage";
import { useToast } from "@/state/toast";
import { useWishlist } from "@/state/wishlist";
import type { Product, Variant } from "@/types";

/**
 * The sticky purchase card. Prices, availability and the demo-pricing caveat
 * follow the same rules as the rest of the storefront: a missing figure stays
 * "Price on request", and no delivery date is promised until the order desk
 * confirms it against the pincode.
 */
export function PurchasePanel({
  product,
  variant,
  quantity,
  onQuantityChange,
  onAdd,
  onBuyNow
}: {
  product: Product;
  variant: Variant | null;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onAdd: () => void;
  onBuyNow: () => void;
}) {
  const [pincode, setPincode] = useState("");
  const [pincodeOpen, setPincodeOpen] = useState(false);
  const [pincodeDraft, setPincodeDraft] = useState("");
  const [pincodeError, setPincodeError] = useState("");
  const toast = useToast();
  const wishlist = useWishlist();
  const saved = wishlist.hydrated && wishlist.has(product.slug);

  useEffect(() => {
    setPincode(readJson<string>(STORAGE_KEYS.pincode, ""));
  }, []);

  const openPincode = () => {
    setPincodeDraft(pincode);
    setPincodeError("");
    setPincodeOpen(true);
  };

  const savePincode = (event: React.FormEvent) => {
    event.preventDefault();
    const value = pincodeDraft.trim();
    if (!/^\d{6}$/.test(value)) {
      setPincodeError("Enter a 6-digit PIN code.");
      return;
    }
    setPincode(value);
    writeJson(STORAGE_KEYS.pincode, value);
    setPincodeOpen(false);
    toast.push("Delivery PIN code saved for this browser.", "info");
  };

  const priced = product.enquiryOnly ? null : variant?.priceInr ?? firstListedPrice(product);
  const compareAt = variant?.compareAtInr ?? null;
  const total = priced === null ? null : priced * quantity;
  const madeToOrder = variant ? !variant.available || variant.trackInventory === false : true;
  const enquiryMessage = `Hi Plusmark, I would like a quotation for ${product.name}${
    variant ? ` (${variant.size.label})` : ""
  }, quantity ${quantity}.`;
  const whatsappHref = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(enquiryMessage)}`;
  const contactHref = `/contact?product=${encodeURIComponent(product.slug)}${
    variant ? `&size=${encodeURIComponent(variant.size.label)}` : ""
  }&quantity=${quantity}`;

  return (
    <aside
      id="buy-box"
      className="flex min-w-0 flex-col gap-4 rounded-2xl border border-line bg-surface p-4 shadow-card sm:gap-5 sm:p-6 md:col-start-2 md:row-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-52 xl:self-start"
      aria-label="Buy this board"
    >
      <div>
        {priced === null ? (
          <p className="font-display text-h3 font-bold text-ink">Price on request</p>
        ) : (
          <p className="flex items-baseline gap-1.5">
            {!variant && <span className="text-body-sm text-muted">From</span>}
            <Amount value={priced} size="lg" />
            <span className="text-body-sm text-muted">+ GST</span>
          </p>
        )}
        {compareAt !== null && priced !== null && compareAt > priced && (
          <p className="pt-1.5 text-caption text-muted">
            M.R.P. <span className="line-through">{formatInr(compareAt)}</span> ·{" "}
            <span className="font-semibold text-danger">-{Math.round((1 - priced / compareAt) * 100)}%</span>
          </p>
        )}
      </div>

      <div className="rounded-xl bg-subtle/70 p-3 text-[0.8125rem] leading-relaxed sm:p-4 sm:text-body-sm">
        <p className="flex items-start gap-2.5">
          <Truck className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            <span className="font-semibold text-ink">Pan-India dispatch</span> from the Ahmedabad works. Freight and the
            delivery date are confirmed by the order desk for your PIN code.{" "}
            <Link
              href="/policies/shipping"
              className="font-medium text-primary underline decoration-primary/30 underline-offset-4 hover:decoration-primary"
            >
              Shipping details
            </Link>
          </span>
        </p>
        <p className="mt-2 pl-[1.625rem] text-muted">Free pickup from the Ahmedabad works.</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 pl-[1.625rem] text-caption text-muted">
          <MapPin className="size-3.5 text-primary" aria-hidden />
          <span>
            Delivering to <strong className="font-semibold text-ink">{pincode ? pincode : "your PIN code"}</strong>
          </span>
          <button type="button" onClick={openPincode} className="font-medium text-primary underline-offset-4 hover:underline">
            · Update location
          </button>
        </div>
      </div>

      <div>
        <p className="flex items-center gap-2 text-body font-semibold text-ink">
          <CheckCircle2 className="size-4 text-success" aria-hidden />
          {variant ? (madeToOrder ? "Made to order" : "Available to order") : "Select a size"}
        </p>
        <p className="mt-1 pl-6 text-caption leading-relaxed text-muted">
          {variant
            ? "Plusmark confirms the specification, price and dispatch date before manufacturing."
            : "Pick a size to see its price and availability."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label htmlFor="pdp-quantity" className="text-body-sm font-semibold text-ink">
          Quantity
        </label>
        <select
          id="pdp-quantity"
          value={quantity}
          onChange={(event) => onQuantityChange(Number(event.target.value))}
          className="h-11 min-w-[4.5rem] rounded-md border border-line-strong bg-surface px-2.5 text-body-sm text-ink transition-colors hover:border-muted focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          aria-label="Quantity"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2.5">
        {product.enquiryOnly ? (
          <>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-body-sm font-semibold text-onprimary shadow-card transition-colors hover:bg-primary-strong"
            >
              <MessageCircle className="size-4" aria-hidden />
              Ask on WhatsApp
            </a>
            <Link
              href={contactHref}
              className="flex h-12 w-full items-center justify-center rounded-md border border-line-strong bg-surface text-body-sm font-semibold text-ink transition-colors hover:border-primary/50 hover:bg-subtle"
            >
              Send an enquiry
            </Link>
            <p className="text-center text-caption leading-relaxed text-muted">
              Price on request — the order desk quotes the exact size and quantity.
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onBuyNow}
              className="h-12 w-full rounded-md bg-primary text-body-sm font-semibold text-onprimary shadow-card transition-colors hover:bg-primary-strong"
            >
              Buy Now
            </button>
            <button
              type="button"
              onClick={onAdd}
              className="h-12 w-full rounded-md border border-line-strong bg-surface text-body-sm font-semibold text-ink transition-colors hover:border-primary/50 hover:bg-subtle"
            >
              Add to cart
            </button>
            {total !== null && (
              <p className="text-center text-caption text-muted">
                Total for {quantity}: <span className="tabular font-semibold text-ink">{formatInr(total)}</span> + GST
              </p>
            )}
          </>
        )}
      </div>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-2 rounded-xl bg-subtle/70 p-3 text-[0.75rem] sm:p-4 sm:text-caption">
        <InfoRow label="Ships from" value="Plusmark, Ahmedabad" />
        <InfoRow label="Sold by" value="Plusmark Boards" />
        <InfoRow label="GST invoice" value="With HSN" />
        <InfoRow label="Payment" value="Demo checkout — no real payment" />
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            const result = wishlist.toggle(product.slug);
            toast.push(result.message, result.saved ? "success" : "info");
          }}
          aria-pressed={saved}
          className={classNames(
            "inline-flex h-11 items-center gap-1.5 rounded-md px-2 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page lg:h-9",
            saved ? "text-primary" : "text-muted hover:text-ink"
          )}
        >
          <Heart className={classNames("size-4", saved && "fill-current")} aria-hidden />
          {saved ? "Saved" : "Add to wishlist"}
        </button>
        <Link href={product.enquiryOnly ? contactHref : "/contact"} className="-my-2 inline-flex min-h-11 items-center text-caption font-medium text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-ink lg:my-0 lg:min-h-0">
          Ask about this board
        </Link>
      </div>

      <p className="text-[0.75rem] leading-relaxed text-muted">
        {product.enquiryOnly
          ? "This product is quoted individually. Share the size, quantity and delivery city and the order desk confirms the price."
          : "Demo price — not a Plusmark quotation. Prices, stock and GST are confirmed by the order desk for the exact size and quantity."}{" "}
        {variant ? `Selected: ${variantLabel(variant)}.` : ""}
      </p>

      <Modal open={pincodeOpen} onClose={() => setPincodeOpen(false)} title="Check delivery" description="Save a PIN code for this browser. Nothing is sent to Plusmark." size="sm">
        <form onSubmit={savePincode} className="flex flex-col gap-3">
          <label htmlFor="pdp-pincode" className="text-body-sm font-medium text-ink">
            Delivery PIN code
          </label>
          <input
            id="pdp-pincode"
            value={pincodeDraft}
            onChange={(event) => {
              setPincodeDraft(event.target.value.replace(/\D/g, "").slice(0, 6));
              setPincodeError("");
            }}
            inputMode="numeric"
            autoComplete="postal-code"
            placeholder="e.g. 380009"
            aria-invalid={Boolean(pincodeError)}
            aria-describedby={pincodeError ? "pdp-pincode-error" : undefined}
            className="h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-body-sm text-ink focus:border-primary focus:outline-none"
          />
          {pincodeError && (
            <p id="pdp-pincode-error" role="alert" className="text-caption font-medium text-danger">
              {pincodeError}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPincodeOpen(false)}
              className="h-10 rounded-full border border-line-strong px-4 text-caption font-medium text-ink hover:bg-subtle"
            >
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-full bg-primary px-4 text-caption font-semibold text-onprimary hover:bg-primary-strong">
              Save PIN code
            </button>
          </div>
          <p className="text-caption leading-relaxed text-muted">
            Freight and delivery timing are quoted for this PIN code by the order desk; they are not calculated here.
          </p>
        </form>
      </Modal>
    </aside>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-muted">{label}</dt>
      <dd className="text-right text-ink">{value}</dd>
    </>
  );
}

function firstListedPrice(product: Product): number | null {
  const prices = product.variants
    .filter((item) => (item.packQty ?? 1) === 1)
    .map((item) => item.priceInr)
    .filter((value): value is number => value !== null);
  return prices.length ? Math.min(...prices) : null;
}

export function Amount({ value, size = "md" }: { value: number; size?: "md" | "lg" }) {
  const [whole, paise] = value.toFixed(2).split(".");
  const formatted = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(Number(whole));
  return (
    <span className={classNames("tabular inline-flex items-baseline font-display font-bold leading-none text-ink", size === "lg" ? "text-[2rem]" : "text-body")}>
      <span className={classNames(size === "lg" ? "text-body-sm" : "text-caption")}>₹</span>
      <span>{formatted}</span>
      <sup className={classNames("text-[0.6em] font-semibold text-muted", paise === "00" && "max-sm:hidden")}>.{paise}</sup>
    </span>
  );
}
