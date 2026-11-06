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
      className="flex min-w-0 flex-col gap-4 rounded-xl border border-hair bg-surface p-4 shadow-[0_1px_2px_rgb(var(--c-shadow)/0.04)] sm:p-5 md:col-start-2 md:row-start-2 xl:col-start-3 xl:row-start-1 xl:sticky xl:top-52 xl:self-start"
      aria-label="Buy this board"
    >
      <div>
        {priced === null ? (
          <p className="text-h3 font-medium text-graphite">Price on request</p>
        ) : (
          <p className="flex items-baseline gap-1.5">
            {!variant && <span className="text-body-sm text-graphite">From</span>}
            <Amount value={priced} size="lg" />
            <span className="text-body-sm text-graphite">+ GST</span>
          </p>
        )}
        {compareAt !== null && priced !== null && compareAt > priced && (
          <p className="pt-1 text-caption text-graphite">
            M.R.P. <span className="line-through">{formatInr(compareAt)}</span> ·{" "}
            <span className="font-medium text-danger">-{Math.round((1 - priced / compareAt) * 100)}%</span>
          </p>
        )}
      </div>

      <div className="border-t border-hair pt-3 text-body-sm leading-relaxed">
        <p className="flex items-start gap-2">
          <Truck className="mt-0.5 size-4 shrink-0 text-graphite" aria-hidden />
          <span>
            <span className="font-medium text-ink">Pan-India dispatch</span> from the Ahmedabad works. Freight and the
            delivery date are confirmed by the order desk for your PIN code.{" "}
            <Link
              href="/policies/shipping"
              className="text-blue-deep underline decoration-blue-deep/40 underline-offset-4 hover:decoration-blue-deep"
            >
              Shipping details
            </Link>
          </span>
        </p>
        <p className="mt-2 pl-6 text-graphite">Free pickup from the Ahmedabad works.</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 pl-6 text-caption text-graphite">
          <MapPin className="size-3.5" aria-hidden />
          <span>
            Delivering to <strong className="font-medium text-ink">{pincode ? pincode : "your PIN code"}</strong>
          </span>
          <button type="button" onClick={openPincode} className="text-blue-deep underline-offset-4 hover:underline">
            · Update location
          </button>
        </div>
      </div>

      <div className="border-t border-hair pt-3">
        <p className="flex items-center gap-1.5 text-body font-medium text-success">
          <CheckCircle2 className="size-4" aria-hidden />
          {variant ? (madeToOrder ? "Made to order" : "Available to order") : "Select a size"}
        </p>
        <p className="pl-5 text-caption leading-relaxed text-graphite">
          {variant
            ? "Plusmark confirms the specification, price and dispatch date before manufacturing."
            : "Pick a size to see its price and availability."}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hair pt-3">
        <label htmlFor="pdp-quantity" className="text-body-sm font-medium text-ink">
          Quantity
        </label>
        <select
          id="pdp-quantity"
          value={quantity}
          onChange={(event) => onQuantityChange(Number(event.target.value))}
          className="h-11 min-w-[4.5rem] rounded-lg border border-hair-strong bg-surface px-2.5 text-body-sm text-ink focus:border-blue focus:outline-none"
          aria-label="Quantity"
        >
          {Array.from({ length: 10 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {product.enquiryOnly ? (
          <>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-body-sm font-semibold text-white transition-colors hover:bg-brand-deep"
            >
              <MessageCircle className="size-4" aria-hidden />
              Ask on WhatsApp
            </a>
            <Link
              href={contactHref}
              className="flex h-11 w-full items-center justify-center rounded-full border border-blue bg-surface text-body-sm font-semibold text-blue-deep transition-colors hover:bg-blue-wash"
            >
              Send an enquiry
            </Link>
            <p className="text-center text-caption leading-relaxed text-graphite">
              Price on request — the order desk quotes the exact size and quantity.
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onAdd}
              className="h-11 w-full rounded-full border border-blue bg-surface text-body-sm font-semibold text-blue-deep transition-colors hover:bg-blue-wash"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              className="h-11 w-full rounded-full bg-blue text-body-sm font-semibold text-white transition-colors hover:bg-blue-deep"
            >
              Buy Now
            </button>
            {total !== null && (
              <p className="text-center text-caption text-graphite">
                Total for {quantity}: <span className="tabular font-medium text-ink">{formatInr(total)}</span> + GST
              </p>
            )}
          </>
        )}
      </div>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-hair pt-3 text-caption">
        <InfoRow label="Ships from" value="Plusmark, Ahmedabad" />
        <InfoRow label="Sold by" value="Plusmark Boards" />
        <InfoRow label="GST invoice" value="With HSN" />
        <InfoRow label="Payment" value="Demo checkout — no real payment" />
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hair pt-3">
        <button
          type="button"
          onClick={() => {
            const result = wishlist.toggle(product.slug);
            toast.push(result.message, result.saved ? "success" : "info");
          }}
          aria-pressed={saved}
          className={classNames(
            "inline-flex h-11 items-center gap-1.5 rounded-full px-2 text-caption font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2 lg:h-9",
            saved ? "text-blue" : "text-graphite hover:text-navy"
          )}
        >
          <Heart className={classNames("size-4", saved && "fill-current")} aria-hidden />
          {saved ? "Saved" : "Add to wishlist"}
        </button>
        <Link href={product.enquiryOnly ? contactHref : "/contact"} className="-my-2 inline-flex min-h-11 items-center text-caption text-graphite underline decoration-hair-strong underline-offset-4 hover:text-ink lg:my-0 lg:min-h-0">
          Ask about this board
        </Link>
      </div>

      <p className="text-[0.6875rem] leading-relaxed text-graphite">
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
            className="h-11 w-full rounded-lg border border-hair-strong bg-surface px-3 text-body-sm text-ink focus:border-blue focus:outline-none"
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
              className="h-10 rounded-full border border-hair-strong px-4 text-caption font-medium text-ink hover:bg-sand"
            >
              Cancel
            </button>
            <button type="submit" className="h-10 rounded-full bg-blue px-4 text-caption font-semibold text-white hover:bg-blue-deep">
              Save PIN code
            </button>
          </div>
          <p className="text-caption leading-relaxed text-graphite">
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
      <dt className="text-graphite">{label}</dt>
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
    <span className={classNames("tabular inline-flex items-baseline font-medium text-ink", size === "lg" ? "text-[1.875rem] leading-none" : "text-body")}>
      <span className={classNames(size === "lg" ? "text-body-sm" : "text-caption")}>₹</span>
      <span>{formatted}</span>
      <sup className="text-[0.6em] font-medium text-graphite">.{paise}</sup>
    </span>
  );
}
