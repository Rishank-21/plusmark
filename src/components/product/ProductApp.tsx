"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgePercent,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Headset,
  MapPin,
  MessageCircle,
  Package,
  ReceiptText,
  Star,
  Tags,
  Truck
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Gallery } from "@/components/product/Gallery";
import { PurchasePanel, Amount } from "@/components/product/PurchasePanel";
import { ProductDetailSections } from "@/components/product/ProductDetailSections";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductStory } from "@/components/product/ProductStory";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { Modal } from "@/components/ui/Modal";
import { Breadcrumbs } from "@/components/ui/Nav";
import { SizeSelector } from "@/components/commerce/SizeSelector";
import { brand, categories, getSeries } from "@/lib/catalog";
import { aPlusPanelsFor } from "@/lib/local-assets";
import { GOOGLE_REVIEW_SUMMARY } from "@/lib/reviews";
import { classNames, formatInr, variantLabel } from "@/lib/format";
import { useCart } from "@/state/cart";
import { useToast } from "@/state/toast";
import type { Product, Variant } from "@/types";

/**
 * Editable PDP content. Offers are informational — Plusmark has not published
 * bank or EMI promotions, so none are invented here.
 */
const PDP_OFFERS = [
  {
    id: "gst",
    title: "GST invoice",
    description: "Get a GST invoice with HSN on every order. Eligible businesses can claim input tax credit.",
    countLabel: "1 offer"
  },
  {
    id: "bulk",
    title: "Bulk pricing",
    description: "Ordering several boards for a school, office or site? Ask the Plusmark desk for a bulk rate.",
    countLabel: "1 offer"
  },
  {
    id: "custom",
    title: "Made to order",
    description: "Non-standard sizes and layouts are manufactured after the specification and price are confirmed.",
    countLabel: "1 offer"
  }
] as const;

const PDP_SERVICES: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "dispatch", label: "Pan-India dispatch", icon: Truck },
  { id: "pickup", label: "Free Ahmedabad pickup", icon: MapPin },
  { id: "gst", label: "GST invoice with HSN", icon: ReceiptText },
  { id: "single", label: "Order a single board", icon: Package },
  { id: "bulk", label: "Bulk pricing on request", icon: Tags },
  { id: "support", label: "Order desk support", icon: Headset }
];

/** Set a badge only when a real merchandising flag exists for the product. */
const PRODUCT_BADGES: Record<string, { label: string; context?: string }> = {};

/** A factual purchase line, e.g. a verified dispatch volume. Empty until supplied. */
const PRODUCT_SOCIAL_PROOF: Record<string, string> = {};

export function ProductApp({ product, related }: { product: Product; related: Product[] }) {
  const [variantId, setVariantId] = useState<string | null>(
    product.variants.filter((item) => (item.packQty ?? 1) === 1).length === 1
      ? product.variants.find((item) => (item.packQty ?? 1) === 1)?.id ?? null
      : null
  );
  const [sizeError, setSizeError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [offersOpen, setOffersOpen] = useState(false);
  const sizeRef = useRef<HTMLDivElement>(null);
  const cart = useCart();
  const toast = useToast();
  const router = useRouter();

  const selectable = product.variants.filter((item) => (item.packQty ?? 1) === 1);
  const variant: Variant | null = product.variants.find((item) => item.id === variantId) ?? null;
  const series = getSeries(product.seriesId);
  const category = categories.find((item) => item.id === product.categoryId);
  const badge = PRODUCT_BADGES[product.slug];
  const socialProof = PRODUCT_SOCIAL_PROOF[product.slug];

  const prices = selectable.map((item) => item.priceInr).filter((value): value is number => value !== null);
  const price = product.enquiryOnly ? null : variant?.priceInr ?? (prices.length ? Math.min(...prices) : null);
  const mrp = variant?.compareAtInr ?? null;
  const discount = mrp !== null && price !== null && mrp > price ? Math.round((1 - price / mrp) * 100) : null;

  const selectVariant = (next: Variant) => {
    setVariantId(next.id);
    setSizeError(false);
  };

  const requestSize = () => {
    setSizeError(true);
    sizeRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
    sizeRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
    toast.push("Choose a size before adding this to the cart.", "error");
  };

  const addToCart = (then: "drawer" | "checkout") => {
    if (product.enquiryOnly) {
      toast.push("This product is quoted on request. Use WhatsApp or send an enquiry.", "info");
      return;
    }
    if (!variant) {
      requestSize();
      return;
    }
    const result = cart.add({ productId: product.slug, variantId: variant.id, quantity });
    if (!result.ok) {
      toast.push(result.message, "error");
      return;
    }
    if (then === "checkout") {
      router.push("/checkout");
      return;
    }
    cart.openDrawer();
  };

  useEffect(() => {
    const listed = product.variants.filter((item) => (item.packQty ?? 1) === 1);
    setVariantId(listed.length === 1 ? listed[0].id : null);
    setSizeError(false);
    setQuantity(1);
  }, [product.slug, product.variants]);

  return (
    <>
      <div className="product-page-shell">
        <div className="pm-shell !max-w-[90rem] py-3 lg:py-6">
          <Breadcrumbs
            trail={[
              { label: "Home", href: "/" },
              { label: category?.name ?? "Shop", href: `/shop/${category?.slug ?? ""}` },
              { label: product.name }
            ]}
          />
        </div>

        <div className="pm-shell !max-w-[90rem] pb-0 lg:pb-10">
          <div id="pdp-main" className="grid min-w-0 gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:items-start md:gap-x-6 md:gap-y-6 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,1fr)] lg:gap-x-8 lg:gap-y-6 xl:grid-cols-[minmax(0,1.18fr)_minmax(0,1fr)_18rem] xl:gap-6">
            <div className="min-w-0 md:sticky md:top-40 md:self-start lg:static lg:row-span-2 lg:self-stretch xl:row-span-1">
              <Gallery product={product} />
            </div>

            <div className="flex min-w-0 flex-col gap-4">
              <div>
                <h1 className="line-clamp-3 font-display text-[1.75rem] font-bold leading-[1.2] tracking-[-0.015em] text-ink sm:text-[1.625rem] lg:text-[1.875rem]">{product.name}</h1>
                <Link href="/shop" className="-my-2 mt-1 inline-flex min-h-10 items-center text-body-sm text-primary-strong underline-offset-4 hover:underline">
                  Visit the Plusmark Store
                </Link>
              </div>

              <a
                href="#customer-reviews"
                aria-label={`${GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)} (${GOOGLE_REVIEW_SUMMARY.count}) ratings — rated ${GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)} out of 5`}
                className="-my-2 flex min-h-10 w-fit items-center gap-1.5 rounded-sm text-body-sm text-primary-strong"
              >
                <span className="font-medium text-ink">{GOOGLE_REVIEW_SUMMARY.rating.toFixed(1)}</span>
                <RatingStars rating={GOOGLE_REVIEW_SUMMARY.rating} />
                <ChevronDown className="size-3.5" aria-hidden />
                <span className="underline-offset-4 hover:underline">({GOOGLE_REVIEW_SUMMARY.count}) ratings</span>
              </a>

              {badge && (
                <p className="flex flex-wrap items-center gap-2 text-body-sm text-muted">
                  <span className="rounded-sm bg-danger px-2 py-0.5 text-caption font-semibold text-onprimary">{badge.label}</span>
                  <span>
                    in <span className="text-primary-strong">{badge.context ?? category?.name ?? "Plusmark boards"}</span>
                  </span>
                </p>
              )}

              {socialProof && <p className="text-body-sm text-ink">{socialProof}</p>}

              <div className="border-t border-line pt-4">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                  {discount !== null && (
                    <span className="text-[1.5rem] leading-none text-danger">-{discount}%</span>
                  )}
                  {!variant && price !== null && <span className="text-[0.75rem] text-muted sm:text-body-sm">From</span>}
                  {price !== null ? <Amount value={price} size="lg" /> : <span className="text-h3 font-medium text-muted">Price on request</span>}
                  {price !== null && <span className="text-[0.75rem] text-muted sm:text-body-sm">+ GST extra</span>}
                </div>
                {mrp !== null && price !== null && (
                  <p className="pt-1 text-[0.75rem] leading-relaxed text-muted sm:text-caption">
                    M.R.P.: <span className="line-through">{formatInr(mrp)}</span>
                  </p>
                )}
                <p className="pt-1 text-[0.75rem] leading-relaxed text-muted sm:text-caption">
                  {product.enquiryOnly
                    ? "This product is quoted by the Plusmark order desk for the exact size and quantity."
                    : variant
                      ? "Price for the selected size, excluding GST. Plusmark confirms the final figure before dispatch."
                      : "Select a size to see its exact price. Prices exclude GST."}
                </p>
              </div>

              <OffersRow onOpen={() => setOffersOpen(true)} />

              <ServicesRow />

              <div ref={sizeRef} className="scroll-mt-56 border-t border-line pt-4">
                <p className="pb-2.5 text-body-sm">
                  <span className="text-muted">Size: </span>
                  <span className="font-semibold text-ink">{variant ? variantLabel(variant) : "Select a size"}</span>
                </p>
                <SizeSelector
                  product={product}
                  variants={selectable}
                  selectedId={variant?.id ?? null}
                  onSelect={selectVariant}
                  showLegend={false}
                />
                {sizeError && (
                  <p role="alert" className="pt-2 text-body-sm font-medium text-danger">
                    Select a size so we can price and reserve the right board.
                  </p>
                )}
                <p className="pt-2 text-[0.75rem] leading-relaxed text-muted">
                  {product.enquiryOnly
                    ? "Quoted individually by the order desk."
                    : "Demo price — not a Plusmark quotation."}{" "}
                  Sizes outside the published range are made to order.
                  {series ? ` ${series.name} series.` : ""}
                </p>
              </div>
            </div>

            <PurchasePanel
              product={product}
              variant={variant}
              quantity={quantity}
              onQuantityChange={setQuantity}
              onAdd={() => addToCart("drawer")}
              onBuyNow={() => addToCart("checkout")}
            />
          </div>
        </div>

        <ProductDetailSections
          product={product}
          selectedId={variant?.id ?? null}
          onSelect={selectVariant}
          hasStory={aPlusPanelsFor(product.slug).length > 0}
        >
          <ProductStory slug={product.slug} name={product.name} />
          <ProductReviews productName={product.name} productSlug={product.slug} />
        </ProductDetailSections>
        <RelatedProducts products={related} title="You May Also Like" />
      </div>

      <StickyBuyBar
        product={product}
        variant={variant}
        quantity={quantity}
        onAdd={() => addToCart("drawer")}
        onBuyNow={() => addToCart("checkout")}
      />

      <Modal
        open={offersOpen}
        onClose={() => setOffersOpen(false)}
        title="Offers and order terms"
        description="What Plusmark publishes today. No bank, coupon or EMI promotion is being claimed."
      >
        <ul className="flex flex-col divide-y divide-line">
          {PDP_OFFERS.map((offer) => (
            <li key={offer.id} className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0">
              <span className="text-body-sm font-semibold text-ink">{offer.title}</span>
              <span className="text-body-sm leading-relaxed text-muted">{offer.description}</span>
            </li>
          ))}
        </ul>
      </Modal>
    </>
  );
}

function RatingStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-hidden>
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, rating - index));
        return (
          <span key={index} className="relative inline-flex size-4 items-center justify-center">
            <Star className="absolute size-4 text-hair-strong" strokeWidth={1.5} />
            <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className="size-4 fill-current text-primary" strokeWidth={0} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function OffersRow({ onOpen }: { onOpen: () => void }) {
  const track = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const element = track.current;
    if (!element) return;
    setCanLeft(element.scrollLeft > 4);
    setCanRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const scroll = (direction: -1 | 1) => track.current?.scrollBy({ left: direction * 220, behavior: "smooth" });

  return (
    <section className="border-t border-line pt-4" aria-labelledby="pdp-offers-heading">
      <div className="flex items-center justify-between gap-3">
        <h2 id="pdp-offers-heading" className="flex items-center gap-1.5 text-body font-semibold text-ink">
          <BadgePercent className="size-4 text-primary-strong" aria-hidden />
          Offers
        </h2>
        <div className="hidden items-center gap-1.5 lg:flex">
          <ScrollArrow direction="left" disabled={!canLeft} onClick={() => scroll(-1)} label="Scroll offers left" />
          <ScrollArrow direction="right" disabled={!canRight} onClick={() => scroll(1)} label="Scroll offers right" />
        </div>
      </div>

      <div ref={track} onScroll={update} className="mt-2 flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 no-scrollbar lg:snap-none">
        {PDP_OFFERS.map((offer) => (
          <button
            key={offer.id}
            type="button"
            onClick={onOpen}
            className="flex w-56 shrink-0 snap-start flex-col gap-1 rounded-lg border border-line bg-surface p-3 text-left transition-colors hover:border-line-strong sm:w-64"
          >
            <span className="text-body-sm font-semibold text-ink">{offer.title}</span>
            <span className="line-clamp-3 text-caption leading-relaxed text-muted">{offer.description}</span>
            <span className="pt-1 text-caption text-primary-strong">{offer.countLabel} ›</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function ServicesRow() {
  const track = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const element = track.current;
    if (!element) return;
    setCanLeft(element.scrollLeft > 4);
    setCanRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 4);
  };

  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return (
    <section className="relative border-t border-line pt-4" aria-label="Plusmark service information">
      <h2 className="pb-3 text-body font-semibold text-ink">Service information</h2>
      <div
        ref={track}
        onScroll={update}
        tabIndex={0}
        role="group"
        aria-label="Service highlights"
        className="grid grid-cols-3 gap-x-2 gap-y-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:flex lg:gap-5 lg:overflow-x-auto lg:pb-1 lg:no-scrollbar"
      >
        {PDP_SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.id} className="flex min-w-0 flex-col items-center gap-1.5 text-center lg:w-[4.75rem] lg:shrink-0">
              <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-ink">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-[0.75rem] leading-snug text-primary-strong">{service.label}</span>
            </div>
          );
        })}
      </div>
      {canLeft && (
        <button
          type="button"
          onClick={() => track.current?.scrollBy({ left: -200, behavior: "smooth" })}
          aria-label="Scroll services left"
          className="absolute -left-2 top-[62%] hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-card hover:bg-subtle lg:flex"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => track.current?.scrollBy({ left: 200, behavior: "smooth" })}
          aria-label="Scroll services right"
          className="absolute -right-2 top-[62%] hidden size-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-card hover:bg-subtle lg:flex"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      )}
    </section>
  );
}

function ScrollArrow({
  direction,
  onClick,
  label,
  disabled
}: {
  direction: "left" | "right";
  onClick: () => void;
  label: string;
  disabled: boolean;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={disabled}
      className="flex size-7 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-card transition-opacity hover:bg-subtle disabled:opacity-40"
    >
      <Icon className="size-3.5" aria-hidden />
    </button>
  );
}

function StickyBuyBar({
  product,
  variant,
  quantity,
  onAdd,
  onBuyNow
}: {
  product: Product;
  variant: Variant | null;
  quantity: number;
  onAdd: () => void;
  onBuyNow: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const prices = product.variants
    .filter((item) => (item.packQty ?? 1) === 1)
    .map((item) => item.priceInr)
    .filter((value): value is number => value !== null);
  const price = product.enquiryOnly ? null : variant?.priceInr ?? (prices.length ? Math.min(...prices) : null);
  const enquiryMessage = `Hi Plusmark, I would like a quotation for ${product.name}${
    variant ? ` (${variant.size.label})` : ""
  }, quantity ${quantity}.`;
  const whatsappHref = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(enquiryMessage)}`;
  const contactHref = `/contact?product=${encodeURIComponent(product.slug)}${
    variant ? `&size=${encodeURIComponent(variant.size.label)}` : ""
  }&quantity=${quantity}`;

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={classNames(
        "fixed inset-x-0 bottom-0 z-[210] border-t border-line bg-surface/97 px-4 pt-2.5 backdrop-blur-sm transition-transform duration-300 lg:hidden",
        visible ? "translate-y-0" : "translate-y-full invisible"
      )}
      aria-hidden={!visible}
      inert={!visible}
    >
      <div className="mx-auto flex max-w-page items-center gap-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.75rem] leading-4 text-muted">
            {variant ? variantLabel(variant) : "Select a size"} · Qty {quantity}
          </p>
          <p className="truncate text-[1rem] font-semibold leading-5 text-ink">
            {price !== null ? formatInr(price) : "Price on request"}
            {price !== null && <span className="pl-1 text-[0.75rem] font-normal text-muted">+ GST</span>}
          </p>
        </div>
        {product.enquiryOnly ? (
          <>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 shrink-0 items-center gap-1.5 rounded-full border border-primary bg-surface px-3 text-[0.8125rem] font-semibold text-brand"
            >
              <MessageCircle className="size-4" aria-hidden />
              WhatsApp
            </a>
            <Link
              href={contactHref}
              className="flex h-11 shrink-0 items-center rounded-full bg-primary px-4 text-[0.8125rem] font-semibold text-onprimary hover:bg-primary-strong"
            >
              Enquire
            </Link>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={onAdd}
              className="h-11 shrink-0 rounded-full border border-primary bg-surface px-3 text-[0.8125rem] font-semibold text-primary-strong hover:bg-primary-soft"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={onBuyNow}
              className="h-11 shrink-0 rounded-full bg-primary px-4 text-[0.8125rem] font-semibold text-onprimary hover:bg-primary-strong"
            >
              Buy Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
