"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Info, Plus, ShieldAlert, TriangleAlert, X } from "lucide-react";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { PaymentStep, type PaymentChoice } from "@/components/checkout/PaymentStep";
import { allLinesPriced, checkCoupon, clearDraft, localId, nextOrderReference, readDraft, writeDraft, type CheckoutDraft } from "@/components/checkout/cart-support";
import { useLiveCoupons } from "@/components/checkout/coupon-store";
import { useLiveShipping } from "@/components/checkout/shipping-store";
import { Badge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, PhoneField, TextField } from "@/components/ui/Field";
import { EmptyState, Notice, Skeleton } from "@/components/ui/States";
import { Breadcrumbs } from "@/components/ui/Nav";
import { DEMO_PRICING_LABEL } from "@/lib/config";
import { formatInr, variantLabel } from "@/lib/format";
import { computeTotals, gstBreakdownByRate, SHIPPING_METHODS } from "@/lib/pricing";
import { lookupPincode, type PincodePlace } from "@/lib/pincode";
import { validateEmail, validateName, validatePhone, validatePincode } from "@/lib/validation";
import { startRazorpayCheckout } from "@/lib/payments/razorpay-checkout";
import { getOrderByReference, saveOrder } from "@/lib/supabase/account";
import { useCart } from "@/state/cart";
import { useSession } from "@/state/session";
import { useToast } from "@/state/toast";
import type { AddressBookEntry, Order, ShippingMethod } from "@/types";

interface CheckoutFields {
  fullName: string;
  phone: string;
  email: string;
  pincode: string;
  line1: string;
  landmark: string;
  city: string;
  state: string;
}

const EMPTY_FIELDS: CheckoutFields = {
  fullName: "",
  phone: "",
  email: "",
  pincode: "",
  line1: "",
  landmark: "",
  city: "",
  state: ""
};

const FIELD_IDS: Record<keyof CheckoutFields, string> = {
  fullName: "checkout-name",
  phone: "checkout-phone",
  email: "checkout-email",
  pincode: "checkout-pincode",
  line1: "checkout-line1",
  landmark: "checkout-landmark",
  city: "checkout-city",
  state: "checkout-state"
};

const FOCUS_ORDER: (keyof CheckoutFields)[] = ["phone", "fullName", "email", "pincode", "city", "state", "line1"];

const FORM_STORAGE_KEY = "plusmark.checkout.fields.v1";

type FieldErrors = Partial<Record<keyof CheckoutFields, string | null>>;

type PinStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "found"; place: PincodePlace }
  | { state: "not_found" }
  | { state: "unavailable" };

/**
 * One-page checkout. Only the information a courier actually needs is asked
 * for, in the order it is needed; prices, freight, stock and tax stay
 * server-authoritative and nothing is charged from this page.
 */
export function CheckoutFlow() {
  const cart = useCart();
  const session = useSession();
  const toast = useToast();
  const router = useRouter();

  const [fields, setFields] = useState<CheckoutFields>(EMPTY_FIELDS);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [useSaved, setUseSaved] = useState(false);
  const [landmarkOpen, setLandmarkOpen] = useState(false);
  const [keepAddress, setKeepAddress] = useState(true);
  const [payment, setPayment] = useState<PaymentChoice>("cod");
  const [pinStatus, setPinStatus] = useState<PinStatus>({ state: "idle" });
  const [placing, setPlacing] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [placedReference, setPlacedReference] = useState<string | null>(null);
  const [openingPayment, setOpeningPayment] = useState<{ reference: string; id: string } | null>(null);
  const [recovery, setRecovery] = useState<CheckoutDraft | null>(null);
  const initialised = useRef(false);

  const couponFeed = useLiveCoupons();
  const shippingFeed = useLiveShipping();
  const [online, setOnline] = useState<{ enabled: boolean; reason: string }>({
    enabled: false,
    reason: "Checking whether online payment is configured…"
  });

  useEffect(() => {
    let alive = true;
    void fetch("/api/payments/razorpay/config", { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => null)) as
          | { enabled?: boolean; webhookConfigured?: boolean }
          | null;
        if (!alive) return;
        const enabled = Boolean(data?.enabled);
        setOnline({
          enabled,
          reason: enabled
            ? ""
            : "Online payment is not configured on this deployment. Cash on delivery is still available."
        });
      })
      .catch(() => {
        if (alive) {
          setOnline({
            enabled: false,
            reason: "The payment configuration could not be read. Cash on delivery is still available."
          });
        }
      });
    return () => {
      alive = false;
    };
  }, []);

  const signedIn = Boolean(session.user);
  const accountEmail = session.account?.email ?? session.user?.email ?? "";
  const savedAddress = useMemo<AddressBookEntry | null>(() => {
    const list = session.account?.addresses ?? [];
    return list.find((entry) => entry.isDefaultShipping) ?? list[0] ?? null;
  }, [session.account]);

  const dispatchOptions = useMemo<ShippingMethod[]>(
    () => (shippingFeed.state === "ready" ? shippingFeed.methods : SHIPPING_METHODS).filter((method) => method.available),
    [shippingFeed.state, shippingFeed.methods]
  );

  /* One-time prefill: saved address wins, then a half-finished draft, then the profile. */
  useEffect(() => {
    if (!session.hydrated || session.accountLoading || initialised.current) return;
    initialised.current = true;

    const stored = readFieldsDraft();
    const account = session.account;
    const preferred = account ? account.addresses.find((a) => a.isDefaultShipping) ?? account.addresses[0] ?? null : null;

    if (stored) {
      setFields({ ...stored, email: account ? account.email : stored.email });
      if (stored.landmark) setLandmarkOpen(true);
      const untouched = !stored.phone && !stored.fullName && !stored.line1 && !stored.pincode;
      if (untouched && preferred) setUseSaved(true);
      return;
    }
    if (preferred) {
      setUseSaved(true);
      setFields({
        ...EMPTY_FIELDS,
        fullName: account?.fullName ?? preferred.recipientName,
        phone: digitsOnly(preferred.phone),
        email: account?.email ?? ""
      });
      return;
    }
    if (account) {
      setFields({
        ...EMPTY_FIELDS,
        fullName: account.fullName,
        phone: digitsOnly(account.phone ?? ""),
        email: account.email
      });
    }
  }, [session.hydrated, session.accountLoading, session.account]);

  /* The draft survives a refresh or an accidental back button, tab-only. */
  useEffect(() => {
    if (!initialised.current) return;
    writeFieldsDraft(fields);
  }, [fields]);

  useEffect(() => {
    if (!cart.hydrated) return;
    if (cart.lines.length === 0) {
      setRecovery(readDraft());
      return;
    }
    setRecovery(null);
    writeDraft({
      savedAt: new Date().toISOString(),
      lines: cart.lines.map((line) => ({ productId: line.productId, variantId: line.variantId, colour: line.colour ?? null, quantity: line.quantity })),
      contact: { email: "", fullName: "", phone: "" },
      shippingMethodId: cart.shippingMethod.id
    });
  }, [cart.hydrated, cart.lines, cart.shippingMethod.id]);

  useEffect(() => {
    if (!placedReference) return;
    router.replace(`/order-confirmation?ref=${encodeURIComponent(placedReference)}`);
  }, [placedReference, router]);

  /* India Post lookup, debounced. A failure only means manual entry. */
  useEffect(() => {
    if (useSaved) return;
    const pincode = fields.pincode;
    if (!/^[1-9][0-9]{5}$/.test(pincode)) {
      setPinStatus({ state: "idle" });
      return;
    }

    const controller = new AbortController();
    setPinStatus({ state: "checking" });
    const timer = window.setTimeout(() => {
      void lookupPincode(pincode, controller.signal).then((result) => {
        if (controller.signal.aborted) return;
        if (result.status === "found") {
          setPinStatus({ state: "found", place: result.place });
          setFields((current) =>
            current.pincode === pincode
              ? { ...current, city: result.place.district, state: result.place.state }
              : current
          );
          setErrors((current) => ({ ...current, city: null, state: null }));
        } else {
          setPinStatus({ state: result.status });
        }
      });
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [fields.pincode, useSaved]);

  const coupon = useMemo(() => {
    if (!cart.couponCode) return null;
    const check = checkCoupon(cart.couponCode);
    return check.kind === "valid" ? check.coupon : null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.couponCode, couponFeed.coupons]);

  const totals = useMemo(
    () => computeTotals({ lines: cart.views, coupon, shippingMethod: cart.shippingMethod }),
    [cart.views, coupon, cart.shippingMethod]
  );

  const gstRows = useMemo(
    () => gstBreakdownByRate({ lines: cart.views, discountInr: totals.discountInr }),
    [cart.views, totals.discountInr]
  );

  const priced = allLinesPriced(cart.views);

  const onlineBlockedReason = !online.enabled
    ? online.reason
    : !signedIn
      ? "Sign in to pay online. Guest checkout can still pay cash on delivery."
      : totals.totalInr === null
        ? "The payable amount is not final until a dispatch charge is published. Choose cash on delivery, or pick pickup."
        : "";
  const onlineReady = onlineBlockedReason === "";

  const pinHint =
    pinStatus.state === "checking"
      ? "Checking this PIN with India Post…"
      : pinStatus.state === "found"
        ? `${pinStatus.place.district}, ${pinStatus.place.state}. Delivery timing is confirmed with dispatch.`
        : pinStatus.state === "not_found"
          ? "No India Post record for this PIN. Check it, or fill city and state manually."
          : pinStatus.state === "unavailable"
            ? "PIN lookup is unavailable right now. City and state remain editable."
            : "City and state fill in from the PIN; you can always edit them.";

  const updateField = (name: keyof CheckoutFields, value: string) => {
    setFields((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: null }));
    setSubmitError(null);
  };

  const validateField = (name: keyof CheckoutFields): string | null => {
    switch (name) {
      case "phone":
        return validatePhone(fields.phone) ? "Enter a 10-digit mobile number starting with 6, 7, 8 or 9." : null;
      case "fullName":
        return validateName(fields.fullName, "Full name");
      case "email":
        return signedIn ? null : validateEmail(fields.email);
      case "pincode":
        return validatePincode(fields.pincode);
      case "line1": {
        const value = fields.line1.trim();
        if (!value) return "Add the house or building number and street.";
        if (value.length < 5) return "Add a little more detail — house number and street.";
        return null;
      }
      case "city":
        return fields.city.trim() ? null : "Add the city or district.";
      case "state":
        return fields.state.trim() ? null : "Add the state.";
      default:
        return null;
    }
  };

  const blurField = (name: keyof CheckoutFields) => {
    setErrors((current) => ({ ...current, [name]: validateField(name) }));
  };

  const validateAll = (): FieldErrors => {
    const next: FieldErrors = {};
    for (const name of FOCUS_ORDER) next[name] = validateField(name);
    return next;
  };

  const focusField = (name: keyof CheckoutFields) => {
    window.requestAnimationFrame(() => {
      const element = document.getElementById(FIELD_IDS[name]);
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      element?.focus({ preventScroll: true });
    });
  };

  const shippingAddress = (): AddressBookEntry => {
    if (useSaved && savedAddress) return savedAddress;
    return {
      id: localId("addr"),
      label: "Home",
      recipientName: fields.fullName.trim(),
      phone: fields.phone,
      line1: fields.line1.trim(),
      line2: null,
      landmark: fields.landmark.trim() || null,
      city: fields.city.trim(),
      state: fields.state.trim(),
      pincode: fields.pincode.trim(),
      isDefaultShipping: true,
      isDefaultBilling: true
    };
  };

  const restoreCart = () => {
    if (!recovery) return;
    let added = 0;
    for (const line of recovery.lines) {
      const result = cart.add({ productId: line.productId, variantId: line.variantId, colour: line.colour ?? null, quantity: line.quantity });
      if (result.ok) added += 1;
    }
    if (added === 0) {
      toast.push("Those lines can no longer be added — the catalogue may have changed.", "error");
      return;
    }
    setRecovery(null);
    clearDraft();
    toast.push(`${added} line${added === 1 ? "" : "s"} put back into your cart.`, "success");
  };

  const place = async () => {
    if (placing) return;
    setSubmitError(null);

    if (!priced) {
      setSubmitError("The cart holds a line without a price, so no order can be recorded.");
      return;
    }
    if (payment === "razorpay" && !onlineReady) {
      setSubmitError(onlineBlockedReason || "Online payment is not enabled. Choose cash on delivery.");
      return;
    }
    if (!useSaved) {
      const checked = validateAll();
      setErrors(checked);
      const firstInvalid = FOCUS_ORDER.find((name) => checked[name]);
      if (firstInvalid) {
        setSubmitError("Check the highlighted fields.");
        focusField(firstInvalid);
        return;
      }
    }
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      setSubmitError("You appear to be offline. Reconnect and try again.");
      return;
    }

    setPlacing(true);
    try {
      const orderAddress = shippingAddress();
      const reference = nextOrderReference(session.orders);

      const order: Order = {
        id: localId("o"),
        reference,
        customerId: session.account?.id ?? null,
        email: (signedIn ? accountEmail : fields.email).trim().toLowerCase(),
        placedAt: new Date().toISOString(),
        status: payment === "razorpay" ? "payment_pending" : "confirmed",
        paymentStatus: payment === "razorpay" ? "pending" : "unpaid",
        paymentMethod: payment === "razorpay" ? "razorpay" : "cod_placeholder",
        lines: cart.views.flatMap((line) => {
          if (!line.variant || line.variant.priceInr === null || line.lineTotalInr === null) return [];
          return [
            {
              id: line.id,
              name: line.product.name,
              slug: line.product.slug,
              variantLabel: `${variantLabel(line.variant)}${line.colour ? ` · ${line.colour}` : ""}`,
              sku: line.variant.sku,
              quantity: line.quantity,
              unitPriceInr: line.variant.priceInr,
              lineTotalInr: line.lineTotalInr
            }
          ];
        }),
        totals,
        shippingAddress: orderAddress,
        billingAddress: orderAddress,
        shipment: null,
        couponCode: cart.couponCode,
        shippingMethodId: cart.shippingMethod.id,
        isDemo: true
      };

      /* Guests keep the order in this browser; a server order needs an account. */
      const placed = session.user ? await saveOrder(order) : order;
      session.placeOrder(placed);

      if (session.account && !useSaved && keepAddress) {
        try {
          await session.saveAddress({ ...orderAddress, isDefaultShipping: true, isDefaultBilling: true });
        } catch {
          /* The order is already recorded; the address can still be added later. */
        }
      }

      clearDraft();
      clearFieldsDraft();
      cart.clear();

      if (payment === "razorpay") {
        setOpeningPayment({ reference: placed.reference, id: placed.id });
        toast.push(`Order ${placed.reference} saved. Opening Razorpay test checkout.`, "success");
        try {
          const outcome = await startRazorpayCheckout({
            orderId: placed.id,
            onPaid: (result) => {
              toast.push(`Payment confirmed for ${result.reference}.`, "success");
              setPlacedReference(result.reference);
              void getOrderByReference(result.reference)
                .then((fresh) => {
                  if (fresh) session.placeOrder(fresh);
                })
                .catch(() => undefined);
            }
          });
          if (outcome === "dismissed") {
            toast.push(
              `Payment was closed before it completed. Order ${placed.reference} is saved as payment pending.`,
              "error"
            );
            router.push(`/account/orders/${placed.id}`);
          }
        } catch (reason) {
          toast.push(
            `${reason instanceof Error ? reason.message : "The payment could not be completed."} Order ${placed.reference} is saved as payment pending.`,
            "error"
          );
          router.push(`/account/orders/${placed.id}`);
        }
        return;
      }

      setPlacedReference(placed.reference);
      toast.push(
        session.user ? `Order ${placed.reference} saved to your account.` : `Order ${placed.reference} recorded on this device.`,
        "success"
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? `The order could not be recorded: ${error.message}. Nothing was submitted, so try again.`
          : "The order could not be recorded. Nothing was submitted, so try again."
      );
    } finally {
      setPlacing(false);
    }
  };

  if (!cart.hydrated) return <CheckoutSkeleton />;

  if (placedReference) return <PlacedPanel reference={placedReference} signedIn={signedIn} />;

  if (openingPayment) return <OpeningPaymentPanel order={openingPayment} />;

  if (cart.views.length === 0) {
    if (recovery && recovery.lines.length > 0) {
      return (
        <div className="pm-shell py-2xl lg:py-3xl">
          <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
          <h1 className="mt-md font-display text-h1 font-extrabold text-ink">Checkout</h1>
          <div className="mt-2xl">
            <Notice tone="warning" title="Your cart is empty, but this browser still holds the lines you checked out with" icon={<TriangleAlert className="size-4" aria-hidden />}>
              The cart record was cleared — a completed order clears it, and a storage reset can too. Put the lines back
              and start again. Nothing was lost on a Plusmark server: the cart only ever lived in this browser.
              <ul className="mt-2 list-disc pl-5">
                {recovery.lines.map((line) => (
                  <li key={line.variantId} className="tabular text-caption">
                    {line.productId} · {line.variantId.split("--")[1]?.replace(/-/g, " ")}
                    {line.colour ? ` · ${line.colour}` : ""} · ×{line.quantity}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={restoreCart}>
                  Put these lines back
                </Button>
                <ButtonLink href="/shop" size="sm" variant="secondary">
                  Start a new cart
                </ButtonLink>
              </div>
            </Notice>
          </div>
        </div>
      );
    }

    return (
      <div className="pm-shell py-2xl lg:py-3xl">
        <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
        <h1 className="mt-md font-display text-h1 font-extrabold text-ink">Checkout</h1>
        <div className="mt-2xl">
          <EmptyState
            title="There is nothing to check out"
            body="A cart has to hold at least one priced line before the delivery details make sense."
            action={{ label: "Browse the catalogue", href: "/shop" }}
            icon={<Info className="size-6" aria-hidden />}
          />
        </div>
      </div>
    );
  }

  if (!priced) {
    return (
      <div className="pm-shell py-2xl lg:py-3xl">
        <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Checkout" }]} />
        <h1 className="mt-md font-display text-h1 font-extrabold text-ink">Checkout</h1>
        <div className="mt-2xl flex flex-col gap-lg">
          <Notice tone="danger" title="Checkout is blocked: a line has no price" icon={<ShieldAlert className="size-4" aria-hidden />}>
            Plusmark publishes no list prices, so a line without a figure in the demo rate card cannot be totalled, and an
            unpriced cart cannot become an order. Change that size on the product page, or ask Plusmark to confirm the
            price.
            <div className="mt-3 flex flex-wrap gap-2">
              <ButtonLink href="/cart" size="sm" variant="secondary">
                Back to the cart
              </ButtonLink>
              <ButtonLink href="/contact" size="sm" variant="quiet">
                Ask about this size
              </ButtonLink>
            </div>
          </Notice>
          <OrderSummary lines={cart.views} totals={totals} shippingMethod={cart.shippingMethod} coupon={coupon} gstRows={gstRows} />
        </div>
      </div>
    );
  }

  const selectedDispatch = cart.shippingMethod;
  const totalLabel = totals.totalInr === null ? "To be confirmed" : formatInr(totals.totalInr);
  const placeLabel = payment === "razorpay" ? "Pay online" : "Place order";

  return (
    <div className="pm-shell py-2xl pb-0 lg:py-3xl">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Cart", href: "/cart" }, { label: "Checkout" }]} />

      <header className="mt-md flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-h1 font-extrabold text-ink">Checkout</h1>
        <p className="tabular text-caption text-muted">
          {cart.count} {cart.count === 1 ? "unit" : "units"} · {formatInr(totals.subtotalInr ?? 0)} of goods
        </p>
      </header>

      <details className="group mt-lg rounded-lg border border-line bg-surface lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-md py-3 text-body-sm">
          <span className="font-medium text-ink">Order summary</span>
          <span className="flex items-center gap-2">
            <span className="tabular text-body-sm font-medium text-ink">{totalLabel}</span>
            <ChevronDown className="size-4 text-muted transition-transform group-open:rotate-180" aria-hidden />
          </span>
        </summary>
        <div className="border-t border-line p-md">
          <OrderSummary
            lines={cart.views}
            totals={totals}
            shippingMethod={cart.shippingMethod}
            coupon={coupon}
            gstRows={gstRows}
            heading="Your order"
          >
            <ButtonLink href="/cart" variant="secondary" fullWidth>
              Edit the cart
            </ButtonLink>
          </OrderSummary>
        </div>
      </details>

      <div className="mt-lg grid items-start gap-xl lg:mt-2xl lg:grid-cols-[minmax(0,1fr)_21rem]">
        <form
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void place();
          }}
          className="flex flex-col gap-xl"
        >
          <section aria-labelledby="checkout-delivery" className="flex flex-col gap-md">
            <h2 id="checkout-delivery" className="font-display text-h2">
              Delivery
            </h2>

            {useSaved && savedAddress ? (
              <div className="flex flex-col gap-3 rounded-lg border border-line bg-surface p-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-body-sm font-medium text-ink">{savedAddress.recipientName}</p>
                    <p className="tabular text-caption text-muted">{savedAddress.phone}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = fieldsFromEntry(savedAddress);
                      setFields({ ...EMPTY_FIELDS, ...next, email: accountEmail });
                      setLandmarkOpen(Boolean(next.landmark));
                      setUseSaved(false);
                      setErrors({});
                    }}
                    className="text-caption font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
                  >
                    Change
                  </button>
                </div>
                <p className="text-body-sm leading-relaxed text-muted">
                  {savedAddress.line1}
                  {savedAddress.landmark ? `, ${savedAddress.landmark}` : ""}
                  <br />
                  {savedAddress.city}, {savedAddress.state} {savedAddress.pincode}
                </p>
                <p className="border-t border-line pt-3 text-caption text-muted">
                  Order updates go to <span className="text-ink">{accountEmail}</span>.
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-md">
                  <PhoneField
                    id={FIELD_IDS.phone}
                    label="Mobile number"
                    required
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    placeholder="9876543210"
                    value={fields.phone}
                    onChange={(event) => updateField("phone", digitsOnly(event.target.value))}
                    onBlur={() => blurField("phone")}
                    error={errors.phone}
                    hint="The delivery partner calls this number."
                  />
                  <TextField
                    id={FIELD_IDS.fullName}
                    label="Full name"
                    required
                    autoComplete="name"
                    maxLength={120}
                    value={fields.fullName}
                    onChange={(event) => updateField("fullName", event.target.value)}
                    onBlur={() => blurField("fullName")}
                    error={errors.fullName}
                    inputClassName="h-12"
                  />

                  {signedIn ? (
                    <p className="text-caption text-muted">
                      Order updates go to <span className="text-ink">{accountEmail}</span>.
                    </p>
                  ) : (
                    <TextField
                      id={FIELD_IDS.email}
                      label="Email"
                      required
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      value={fields.email}
                      onChange={(event) => updateField("email", event.target.value)}
                      onBlur={() => blurField("email")}
                      error={errors.email}
                      inputClassName="h-12"
                      hint="The invoice and tracking link are sent here."
                    />
                  )}

                  <div className="grid gap-md sm:grid-cols-2">
                    <TextField
                      id={FIELD_IDS.pincode}
                      label="PIN code"
                      required
                      type="text"
                      inputMode="numeric"
                      autoComplete="postal-code"
                      maxLength={6}
                      value={fields.pincode}
                      onChange={(event) => updateField("pincode", digitsOnly(event.target.value).slice(0, 6))}
                      onBlur={() => blurField("pincode")}
                      error={errors.pincode}
                      hint={pinHint}
                      inputClassName="h-12"
                    />
                    <TextField
                      id={FIELD_IDS.city}
                      label="City / district"
                      required
                      autoComplete="address-level2"
                      maxLength={80}
                      value={fields.city}
                      onChange={(event) => updateField("city", event.target.value)}
                      onBlur={() => blurField("city")}
                      error={errors.city}
                      inputClassName="h-12"
                    />
                  </div>

                  <div className="grid gap-md sm:grid-cols-2">
                    <TextField
                      id={FIELD_IDS.state}
                      label="State"
                      required
                      autoComplete="address-level1"
                      maxLength={60}
                      value={fields.state}
                      onChange={(event) => updateField("state", event.target.value)}
                      onBlur={() => blurField("state")}
                      error={errors.state}
                      inputClassName="h-12"
                    />
                  </div>

                  <TextField
                    id={FIELD_IDS.line1}
                    label="Address"
                    required
                    autoComplete="street-address"
                    maxLength={200}
                    placeholder="House / building no., street, area"
                    value={fields.line1}
                    onChange={(event) => updateField("line1", event.target.value)}
                    onBlur={() => blurField("line1")}
                    error={errors.line1}
                    inputClassName="h-12"
                  />

                  {landmarkOpen ? (
                    <div className="flex flex-col gap-1">
                      <TextField
                        id={FIELD_IDS.landmark}
                        label="Landmark"
                        optional
                        autoComplete="off"
                        maxLength={120}
                        placeholder="Nearby school, temple or junction"
                        value={fields.landmark}
                        onChange={(event) => updateField("landmark", event.target.value)}
                        inputClassName="h-12"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setLandmarkOpen(false);
                          updateField("landmark", "");
                        }}
                        className="inline-flex items-center gap-1 self-start text-caption text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
                      >
                        <X className="size-3.5" aria-hidden />
                        Remove landmark
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setLandmarkOpen(true);
                        window.requestAnimationFrame(() => document.getElementById(FIELD_IDS.landmark)?.focus());
                      }}
                      className="inline-flex items-center gap-1.5 self-start text-body-sm font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
                    >
                      <Plus className="size-4" aria-hidden />
                      Add landmark
                    </button>
                  )}

                  {signedIn && savedAddress && (
                    <button
                      type="button"
                      onClick={() => setUseSaved(true)}
                      className="self-start text-caption text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
                    >
                      Use my saved address instead
                    </button>
                  )}
                </div>

                {signedIn && (
                  <CheckboxField
                    id="checkout-keep-address"
                    label="Save this address"
                    hint="Saved to your account for the next order."
                    checked={keepAddress}
                    onChange={(event) => setKeepAddress(event.target.checked)}
                  />
                )}

                {!signedIn && (
                  <p className="text-caption leading-relaxed text-muted">
                    Checking out as a guest.{" "}
                    <Link href="/login?next=/checkout" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
                      Sign in
                    </Link>{" "}
                    to use a saved address and pay online.
                  </p>
                )}
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="checkout-dispatch" className="text-caption font-medium text-ink">
                Delivery option
              </label>
              <select
                id="checkout-dispatch"
                value={selectedDispatch.id}
                onChange={(event) => {
                  const method = dispatchOptions.find((option) => option.id === event.target.value);
                  if (method) cart.setShippingMethod(method);
                }}
                className="h-12 w-full rounded-lg border border-line-strong bg-surface px-3.5 text-body-sm text-ink transition-colors hover:border-graphite-light focus-visible:border-navy focus-visible:outline-none"
              >
                {dispatchOptions.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.name}
                  </option>
                ))}
              </select>
              <p className="text-caption text-muted">
                {selectedDispatch.priceInr === null
                  ? "Freight is confirmed on the invoice."
                  : selectedDispatch.priceInr === 0
                    ? "No delivery charge."
                    : `${formatInr(selectedDispatch.priceInr)} delivery charge.`}
              </p>
            </div>
          </section>

          <section aria-labelledby="checkout-payment" className="flex flex-col gap-md">
            <h2 id="checkout-payment" className="font-display text-h2">
              Payment
            </h2>
            <PaymentStep
              choice={payment}
              onChoose={(next) => {
                setPayment(next);
                setSubmitError(null);
              }}
              amountDue={totals.totalInr}
              onlineEnabled={onlineReady}
              onlineReason={onlineBlockedReason}
            />
          </section>

          {submitError && (
            <p role="alert" className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-wash px-4 py-3 text-body-sm text-danger">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
              {submitError}
            </p>
          )}
        </form>

        <aside className="hidden lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:block">
          <OrderSummary
            lines={cart.views}
            totals={totals}
            shippingMethod={cart.shippingMethod}
            coupon={coupon}
            gstRows={gstRows}
            heading="Your order"
          >
            <Button size="lg" fullWidth loading={placing} disabled={placing} onClick={() => void place()}>
              {placing ? (payment === "razorpay" ? "Opening Razorpay…" : "Placing the order…") : placeLabel}
            </Button>
            <TermsNote />
            <ButtonLink href="/cart" variant="secondary" fullWidth>
              Edit the cart
            </ButtonLink>
          </OrderSummary>
        </aside>
      </div>

      <div className="sticky bottom-0 z-20 -mx-md mt-xl border-t border-line bg-page/95 px-md py-3 backdrop-blur sm:-mx-lg sm:px-lg lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-caption text-muted">Total</span>
            <span className="tabular text-h4 font-medium text-ink">{totalLabel}</span>
          </div>
          <Button size="lg" loading={placing} disabled={placing} onClick={() => void place()} className="min-w-40">
            {placing ? "Placing…" : placeLabel}
          </Button>
        </div>
        <p className="mt-1.5 text-[0.6875rem] leading-snug text-muted">
          By placing this order you agree to our{" "}
          <Link href="/policies/terms" className="underline underline-offset-2 hover:text-ink">Terms</Link> and{" "}
          <Link href="/policies/privacy" className="underline underline-offset-2 hover:text-ink">Privacy Policy</Link>.
        </p>
      </div>

      <p className="hidden pb-2xl pt-md text-caption text-muted lg:block">{DEMO_PRICING_LABEL}.</p>
    </div>
  );
}

function TermsNote() {
  return (
    <p className="text-caption leading-relaxed text-muted">
      By placing this order you agree to our{" "}
      <Link href="/policies/terms" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
        Terms
      </Link>{" "}
      and{" "}
      <Link href="/policies/privacy" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
        Privacy Policy
      </Link>
      . Billing uses the same address.
    </p>
  );
}

function OpeningPaymentPanel({ order }: { order: { reference: string; id: string } }) {
  return (
    <div className="pm-shell py-3xl" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-reading flex-col items-start gap-4">
        <Badge tone="warning">Payment pending</Badge>
        <h1 className="font-display text-h2 font-extrabold text-ink">Opening secure payment</h1>
        <p className="text-body-sm text-muted">
          Order {order.reference} is saved. Razorpay&apos;s window should open on top of this page; the order stays
          payment pending until the server verifies the captured amount.
        </p>
        <p className="text-caption leading-relaxed text-muted">
          If the window was blocked or closed, nothing has been charged. No card or UPI details are entered on this page.
        </p>
        <ButtonLink href={`/account/orders/${order.id}`} variant="secondary">
          Open order {order.reference}
        </ButtonLink>
      </div>
    </div>
  );
}

function PlacedPanel({ reference, signedIn }: { reference: string; signedIn: boolean }) {
  return (
    <div className="pm-shell py-3xl" role="status" aria-live="polite">
      <div className="mx-auto flex max-w-reading flex-col items-start gap-4">
        <Badge tone="navy">Recorded</Badge>
        <h1 className="font-display text-h2 font-extrabold text-ink">Order {reference} is in</h1>
        <p className="text-body-sm text-muted">
          {signedIn
            ? "The order is saved to your account. Taking you to the confirmation now."
            : "The order is recorded on this browser. Taking you to the confirmation now."}
        </p>
        {!signedIn && (
          <p className="text-caption leading-relaxed text-muted">
            Create an account to keep this order and track future ones from any device.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <ButtonLink href={`/order-confirmation?ref=${encodeURIComponent(reference)}`}>Open the confirmation</ButtonLink>
          {!signedIn && (
            <ButtonLink href="/register?next=/account" variant="secondary">
              Create an account
            </ButtonLink>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="pm-shell py-2xl lg:py-3xl" role="status" aria-live="polite">
      <span className="sr-only">Loading checkout</span>
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-md h-12 w-72" />
      <div className="mt-2xl grid items-start gap-xl lg:grid-cols-[minmax(0,1fr)_21rem]">
        <Skeleton className="h-[28rem] w-full" />
        <Skeleton className="h-80 w-full" />
      </div>
    </div>
  );
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function fieldsFromEntry(entry: AddressBookEntry): CheckoutFields {
  return {
    fullName: entry.recipientName,
    phone: digitsOnly(entry.phone).slice(-10),
    email: "",
    pincode: entry.pincode,
    line1: entry.line1,
    landmark: entry.landmark ?? "",
    city: entry.city,
    state: entry.state
  };
}

function readFieldsDraft(): CheckoutFields | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(FORM_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CheckoutFields> | null;
    if (!parsed) return null;
    return {
      fullName: typeof parsed.fullName === "string" ? parsed.fullName : "",
      phone: typeof parsed.phone === "string" ? parsed.phone : "",
      email: typeof parsed.email === "string" ? parsed.email : "",
      pincode: typeof parsed.pincode === "string" ? parsed.pincode : "",
      line1: typeof parsed.line1 === "string" ? parsed.line1 : "",
      landmark: typeof parsed.landmark === "string" ? parsed.landmark : "",
      city: typeof parsed.city === "string" ? parsed.city : "",
      state: typeof parsed.state === "string" ? parsed.state : ""
    };
  } catch {
    return null;
  }
}

function writeFieldsDraft(fields: CheckoutFields): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(fields));
  } catch {
    /* Storage can be full or disabled; the form still works without the draft. */
  }
}

function clearFieldsDraft(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(FORM_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
