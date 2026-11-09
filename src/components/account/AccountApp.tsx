"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  Package,
  Pencil,
  Plus,
  Trash2,
  type LucideIcon
} from "lucide-react";
import { AddressBlock, DispatchBlock, OrderLinesTable, PaymentStateNote, TotalsTable } from "@/components/checkout/OrderRecordParts";
import { OrderTimeline } from "@/components/checkout/OrderTimeline";
import { AddressFields, addressDraftErrors, draftFromEntry, draftToEntry, emptyAddressDraft, type AddressDraft } from "@/components/checkout/AddressFields";
import { OrderActions } from "@/components/account/OrderActions";
import { WishlistView } from "@/components/account/WishlistView";
import { StatusBadge } from "@/components/ui/Badge";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, TextField } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/Modal";
import { Breadcrumbs } from "@/components/ui/Nav";
import { ProductImage } from "@/components/ui/ProductImage";
import { Notice, Skeleton } from "@/components/ui/States";
import { getProduct } from "@/lib/catalog";
import { formatDate, formatInr } from "@/lib/format";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { changeEmail, listOrders } from "@/lib/supabase/account";
import { validateEmail, validateName, validatePhone } from "@/lib/validation";
import { useSession } from "@/state/session";
import { useToast } from "@/state/toast";
import { useWishlist } from "@/state/wishlist";
import type { AddressBookEntry, CustomerAccount, Order } from "@/types";

export type AccountSection = "overview" | "orders" | "order" | "addresses" | "wishlist";

const NAV: { id: Exclude<AccountSection, "order">; label: string; href: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", href: "/account", icon: LayoutDashboard },
  { id: "orders", label: "Orders", href: "/account/orders", icon: Package },
  { id: "addresses", label: "Addresses", href: "/account/addresses", icon: MapPin },
  { id: "wishlist", label: "Saved boards", href: "/account/wishlist", icon: Heart }
];

const CARD = "rounded-[12px] border border-line bg-surface shadow-card";
const FOCUS = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";
const PAGE = "bg-page pm-account-fade";
const WIDTH = "mx-auto w-full max-w-[74rem] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10";

/* ------------------------------ Orders data ------------------------------ */

function useAccountOrders() {
  const session = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!session.user) {
      setOrders([]);
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    void listOrders()
      .then((rows) => {
        if (!alive) return;
        const ids = new Set(rows.map((order) => order.id));
        const references = new Set(rows.map((order) => order.reference));
        const localOnly = session.orders.filter((order) => !ids.has(order.id) && !references.has(order.reference));
        setOrders([...localOnly, ...rows].sort((a, b) => b.placedAt.localeCompare(a.placedAt)));
      })
      .catch((cause) => {
        if (alive) setError(cause instanceof Error ? cause.message : "Your orders could not be loaded.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [session.user, session.orders, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);
  return { orders, loading, error, reload };
}

/* --------------------------------- Shell --------------------------------- */

export function AccountApp({ section, orderId }: { section: AccountSection; orderId?: string }) {
  const session = useSession();
  const account = session.account;

  if (!session.hydrated || (session.accountLoading && !account)) {
    return <AccountSkeleton label="Loading your account" />;
  }

  if (!account) {
    return (
      <div className={PAGE}>
        <div className={WIDTH}>
          <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Account" }]} />
          <div className={`${CARD} mt-6 p-5 sm:p-8`}>
            <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,18rem)] md:items-start">
              <div className="min-w-0">
                <h1 className="text-[1.75rem] font-semibold leading-tight tracking-[-0.01em] text-ink sm:text-[2rem]">My account</h1>
                <p className="mt-2 max-w-reading text-body-sm leading-relaxed text-muted">
                  Sign in to see your orders, saved addresses and saved boards. Checkout also works as a guest.
                </p>
                {session.accountError && (
                  <p className="mt-3 rounded-lg border border-danger/30 bg-danger-wash px-3 py-2 text-caption text-ink" role="alert">
                    {session.accountError}
                  </p>
                )}
                {!isSupabaseConfigured && (
                  <div className="mt-3">
                    <Notice tone="warning" title="Account backend is not connected in this build">
                      Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then run the migration in
                      supabase/migrations. Nothing is stored until then.
                    </Notice>
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <ButtonLink href="/login?next=/account" fullWidth className="h-12 rounded-lg">
                  Sign in <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink href="/register?next=/account" variant="secondary" fullWidth className="h-12 rounded-lg">
                  Create an account
                </ButtonLink>
                <ButtonLink href="/track-order" variant="ghost" fullWidth className="h-11 rounded-lg">
                  Track a guest order
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <AccountShell account={account} section={section} orderId={orderId} />;
}

function AccountSkeleton({ label }: { label: string }) {
  return (
    <div className={PAGE} role="status">
      <span className="sr-only">{label}</span>
      <div className={WIDTH}>
        <Skeleton className="h-4 w-40" />
        <div className="mt-6 flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-56" />
          </div>
        </div>
        <div className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
          <Skeleton className="h-24 rounded-[12px]" />
          <Skeleton className="h-24 rounded-[12px]" />
          <Skeleton className="h-24 rounded-[12px]" />
        </div>
        <div className="mt-4 grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)]">
          <Skeleton className="hidden h-56 rounded-[12px] lg:block" />
          <Skeleton className="h-72 rounded-[12px]" />
        </div>
      </div>
    </div>
  );
}

function AccountShell({ account, section, orderId }: { account: CustomerAccount; section: AccountSection; orderId?: string }) {
  const session = useSession();
  const router = useRouter();
  const activeTabRef = useRef<HTMLAnchorElement | null>(null);
  const orderData = useAccountOrders();

  useEffect(() => {
    activeTabRef.current?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [section]);

  const initials =
    account.fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "PM";

  const activeId = section === "order" ? "orders" : section;

  return (
    <div className={PAGE}>
      <div className={WIDTH}>
        <Breadcrumbs
          trail={[
            { label: "Home", href: "/" },
            { label: "Account", href: "/account" },
            ...(section !== "overview" ? [{ label: NAV.find((item) => item.id === activeId)?.label ?? "Order" }] : [])
          ]}
        />

        <header className="mt-6 flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span
              className="grid size-14 shrink-0 place-items-center rounded-full bg-primary-soft text-[1.125rem] font-semibold tracking-[0.02em] text-brand sm:size-16 sm:text-[1.375rem]"
              aria-hidden
            >
              {initials}
            </span>
            <div className="min-w-0">
              <h1 className="truncate font-display text-[1.5rem] font-bold leading-tight tracking-[-0.01em] text-ink sm:text-[1.6875rem]">
                {account.fullName}
              </h1>
              <p className="mt-0.5 truncate text-body-sm text-muted">{account.email}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="md"
            onClick={async () => {
              await session.signOut();
              router.replace("/login");
              router.refresh();
            }}
            aria-label="Sign out"
            className="!h-11 shrink-0 !gap-1.5 rounded-lg !px-3 text-[0.8125rem] sm:!h-10 sm:!gap-2 sm:!px-4 sm:text-body-sm"
          >
            <LogOut className="size-4" aria-hidden />
            <span>Sign out</span>
          </Button>
        </header>

        {session.legacyPrompt && section === "overview" && <LegacyImportBanner onImported={orderData.reload} />}

        <div className="sticky top-[var(--pm-header-h)] z-30 -mx-4 mt-5 overflow-x-auto bg-page/95 px-4 py-2 backdrop-blur [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:-mx-6 sm:px-6 lg:hidden">
          <nav aria-label="Account sections" className="flex w-max snap-x snap-mandatory scroll-pl-4 gap-1.5">
            {NAV.map((item) => {
              const active = activeId === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  ref={active ? activeTabRef : undefined}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full border px-4 text-caption font-medium transition-colors ${FOCUS} ${
                    active ? "border-primary/20 bg-primary-soft text-brand" : "border-line bg-surface text-muted hover:text-ink"
                  }`}
                >
                  <Icon className="size-4" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-4 grid items-start gap-4 lg:mt-6 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-6">
          <nav
            aria-label="Account sections"
            className="hidden lg:sticky lg:top-[13.75rem] lg:flex lg:flex-col lg:gap-1 lg:self-start lg:rounded-[12px] lg:border lg:border-line lg:bg-surface lg:p-2 lg:shadow-card"
          >
            {NAV.map((item) => {
              const active = activeId === item.id;
              const Icon = item.icon;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex h-11 items-center gap-3 rounded-lg px-3 text-body-sm font-medium transition-colors ${FOCUS} ${
                    active
                      ? "bg-primary-soft text-brand before:absolute before:bottom-2 before:left-0 before:top-2 before:w-[3px] before:rounded-full before:bg-primary"
                      : "text-muted hover:bg-subtle/70 hover:text-ink"
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <main className="min-w-0">
            <div key={section} className="pm-account-panel">
              {section === "overview" && <Overview account={account} orderCount={orderData.loading ? null : orderData.orders.length} />}
              {section === "orders" && (
                <OrderHistory orders={orderData.orders} loading={orderData.loading} error={orderData.error} onRetry={orderData.reload} />
              )}
              {section === "order" && (
                <OrderDetail orders={orderData.orders} loading={orderData.loading} error={orderData.error} orderId={orderId ?? ""} onRetry={orderData.reload} />
              )}
              {section === "addresses" && <AddressBook account={account} />}
              {section === "wishlist" && <WishlistView inAccount />}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function LegacyImportBanner({ onImported }: { onImported: () => void }) {
  const session = useSession();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const snapshot = session.legacyPrompt;
  if (!snapshot) return null;

  const parts = [
    snapshot.fullName || snapshot.phone ? "profile details" : null,
    snapshot.addresses.length ? `${snapshot.addresses.length} address${snapshot.addresses.length === 1 ? "" : "es"}` : null,
    snapshot.wishlist.length ? `${snapshot.wishlist.length} saved board${snapshot.wishlist.length === 1 ? "" : "s"}` : null,
    snapshot.orders.length ? `${snapshot.orders.length} order${snapshot.orders.length === 1 ? "" : "s"}` : null
  ].filter(Boolean) as string[];

  const run = async () => {
    setBusy(true);
    try {
      const result = await session.importLegacy();
      if (!result) return;
      const copied = result.profileUpdated || result.addressesImported || result.boardsImported || result.ordersImported;
      toast.push(
        copied
          ? `Moved onto your account: ${[
              result.profileUpdated ? "profile" : null,
              result.addressesImported ? `${result.addressesImported} address${result.addressesImported === 1 ? "" : "es"}` : null,
              result.boardsImported ? `${result.boardsImported} board${result.boardsImported === 1 ? "" : "s"}` : null,
              result.ordersImported ? `${result.ordersImported} order${result.ordersImported === 1 ? "" : "s"}` : null
            ]
              .filter(Boolean)
              .join(", ")}.`
          : "Nothing could be copied automatically. Check the details in your account.",
        copied ? "success" : "error"
      );
      if (result.skipped.length > 0) {
        toast.push(`${result.skipped.length} old item${result.skipped.length === 1 ? "" : "s"} could not be copied: ${result.skipped[0]}`, "info");
      }
      onImported();
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "The old profile could not be imported.", "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mt-5 rounded-[12px] border border-primary/15 bg-surface px-4 py-3.5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-body-sm font-semibold text-ink">This browser still has an old Plusmark profile</p>
          <p className="mt-0.5 text-caption leading-relaxed text-muted">
            {parts.join(", ")}. Move what is still valid onto your account — nothing is deleted until the copy succeeds.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" className="h-10 rounded-lg" onClick={run} disabled={busy}>
            {busy ? "Moving…" : "Move to my account"}
          </Button>
          <Button size="sm" variant="ghost" className="h-10 rounded-lg" onClick={session.dismissLegacy} disabled={busy}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- Overview ------------------------------- */

function Overview({ account, orderCount }: { account: CustomerAccount; orderCount: number | null }) {
  const session = useSession();
  const wishlist = useWishlist();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(account.fullName);
  const [phone, setPhone] = useState(account.phone ?? "");
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [saving, setSaving] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newEmail, setNewEmail] = useState(account.email);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailNotice, setEmailNotice] = useState<string | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  const defaultAddress = account.addresses.find((entry) => entry.isDefaultShipping) ?? account.addresses[0] ?? null;

  const startEditing = () => {
    setFullName(account.fullName);
    setPhone(account.phone ?? "");
    setErrors({});
    setEditing(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving) return;
    const next = {
      fullName: validateName(fullName),
      phone: validatePhone(phone)
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setSaving(true);
    try {
      await session.updateProfile({ fullName: fullName.trim(), phone: phone.trim() });
      setEditing(false);
      toast.push("Profile updated.", "success");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Your profile could not be saved.", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    if (emailBusy) return;
    const emailValidation = validateEmail(newEmail);
    setEmailError(emailValidation);
    if (emailValidation) return;
    setEmailBusy(true);
    try {
      const message = await changeEmail(newEmail);
      setEmailNotice(message);
      setEditingEmail(false);
      toast.push("Confirmation email sent.", "success");
    } catch (error) {
      setEmailError(error instanceof Error ? error.message : "The email could not be changed right now.");
    } finally {
      setEmailBusy(false);
    }
  };

  const completeness = [
    Boolean(account.fullName.trim()),
    Boolean(account.email),
    Boolean(account.phone),
    Boolean(defaultAddress)
  ].filter(Boolean).length;
  const percent = Math.round((completeness / 4) * 100);
  const missing = [!account.phone ? "mobile number" : null, !defaultAddress ? "default delivery address" : null].filter(Boolean) as string[];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <AccountStat icon={Package} label="Orders" shortLabel="Orders" value={orderCount} href="/account/orders" />
        <AccountStat icon={MapPin} label="Saved addresses" shortLabel="Addresses" value={account.addresses.length} href="/account/addresses" />
        <AccountStat icon={Heart} label="Saved boards" shortLabel="Saved" value={wishlist.slugs.length} href="/account/wishlist" />
      </div>

      <section
        className={`${CARD} p-4 sm:p-5${percent === 100 ? " max-lg:hidden" : ""}`}
        aria-labelledby="profile-completeness"
      >
        <div className="flex items-center justify-between gap-3">
          <p id="profile-completeness" className="text-caption font-semibold text-ink">
            Profile completeness
          </p>
          <span className="tabular text-caption font-semibold text-brand">{percent}%</span>
        </div>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-subtle"
          role="progressbar"
          aria-labelledby="profile-completeness"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-2 text-caption leading-relaxed text-muted">
          {missing.length === 0
            ? "Your phone number and delivery address are on file for faster checkout."
            : `Add your ${missing.join(" and ")} for faster checkout.`}
        </p>
      </section>

      <section aria-labelledby="profile-details" className={`${CARD} p-4 sm:p-6`}>
        <div className="flex items-center justify-between gap-3">
          <h2 id="profile-details" className="text-[1.25rem] font-semibold leading-tight text-ink">
            Profile details
          </h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => (editing ? setEditing(false) : startEditing())}
            aria-expanded={editing}
            className="h-10 shrink-0 rounded-lg"
          >
            <Pencil className="size-3.5" aria-hidden />
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>

        {editing ? (
          <form onSubmit={save} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
            <TextField
              id="profile-name"
              label="Full name"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              error={errors.fullName}
            />
            <TextField
              id="profile-phone"
              label="Mobile number"
              required
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              error={errors.phone}
            />
            <p className="text-caption leading-relaxed text-muted sm:col-span-2">
              Email changes need a confirmation link, so they are handled separately below.
            </p>
            <div className="flex flex-wrap gap-3 sm:col-span-2">
              <Button type="submit" className="rounded-lg" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              <Button type="button" variant="secondary" className="rounded-lg" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <dl className="mt-5 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            <ProfileRow term="Full name" detail={account.fullName} onAdd={startEditing} />
            <ProfileRow term="Email" detail={account.email} badge="Primary" action={{ label: "Change", onClick: () => setEditingEmail((value) => !value) }} />
            <ProfileRow term="Phone" detail={account.phone} onAdd={startEditing} />
            <ProfileRow
              term="Default delivery address"
              detail={defaultAddress ? `${defaultAddress.line1}, ${defaultAddress.city}, ${defaultAddress.state} ${defaultAddress.pincode}` : null}
              action={{ label: "+ Add", href: "/account/addresses" }}
            />
          </dl>
        )}

        {editingEmail && (
          <form onSubmit={saveEmail} noValidate className="mt-5 flex flex-col gap-3 rounded-lg border border-line bg-subtle/30 p-4">
            <TextField
              id="profile-email"
              label="New email"
              required
              type="email"
              inputMode="email"
              autoComplete="email"
              value={newEmail}
              onChange={(event) => setNewEmail(event.target.value)}
              error={emailError}
              hint="We send a confirmation link to the new address before anything changes."
            />
            <div className="flex flex-wrap gap-3">
              <Button type="submit" size="sm" className="h-10 rounded-lg" disabled={emailBusy}>
                {emailBusy ? "Sending…" : "Send confirmation link"}
              </Button>
              <Button type="button" size="sm" variant="secondary" className="h-10 rounded-lg" onClick={() => setEditingEmail(false)} disabled={emailBusy}>
                Cancel
              </Button>
            </div>
          </form>
        )}

        {emailNotice && (
          <p className="mt-4 rounded-lg border border-success/30 bg-success-wash px-3 py-2 text-caption text-ink" role="status">
            {emailNotice}
          </p>
        )}
      </section>

      <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center">
        <ButtonLink href="/shop" className="h-12 rounded-lg sm:h-11">
          Continue shopping <ArrowRight className="size-4" aria-hidden />
        </ButtonLink>
        <ButtonLink href="/account/wishlist" variant="secondary" className="h-12 rounded-lg sm:h-11">
          <Heart className="size-4" aria-hidden />
          Open saved boards
        </ButtonLink>
      </div>
    </div>
  );
}

function AccountStat({ icon: Icon, label, shortLabel, value, href }: { icon: LucideIcon; label: string; shortLabel: string; value: number | null; href: string }) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-2 rounded-[12px] border border-line bg-surface p-3 shadow-card transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:p-5 ${FOCUS}`}
    >
      <span className="grid size-8 place-items-center rounded-lg bg-primary-soft text-brand sm:size-10">
        <Icon className="size-4 sm:size-5" aria-hidden />
      </span>
      <span className="flex items-end justify-between gap-2">
        <span className="tabular text-[1.375rem] font-semibold leading-none text-ink sm:text-[1.875rem]">
          {value === null ? <span className="inline-block h-6 w-8 animate-pulse rounded bg-subtle sm:h-8" aria-hidden /> : value}
        </span>
        <ArrowUpRight className="hidden size-4 text-muted opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:block" aria-hidden />
      </span>
      <span className="text-caption leading-snug text-muted">
        <span className="sm:hidden">{shortLabel}</span>
        <span className="hidden sm:inline">{label}</span>
      </span>
    </Link>
  );
}

function ProfileRow({
  term,
  detail,
  badge,
  onAdd,
  action
}: {
  term: string;
  detail: string | null;
  badge?: string;
  onAdd?: () => void;
  action?: { label: string; onClick?: () => void; href?: string };
}) {
  return (
    <div className="min-w-0">
      <dt className="text-caption text-muted">{term}</dt>
      {detail ? (
        <dd className="mt-1 flex flex-wrap items-center gap-2 text-body-sm font-medium text-ink">
          <span className="break-words">{detail}</span>
          {badge && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.6875rem] font-medium text-brand">{badge}</span>}
          {action && (
            <span className="text-caption font-medium">
              {action.href ? (
                <Link href={action.href} className={`rounded text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand ${FOCUS}`}>
                  {action.label}
                </Link>
              ) : (
                <button type="button" onClick={action.onClick} className={`rounded text-brand underline decoration-brand/30 underline-offset-2 hover:decoration-brand ${FOCUS}`}>
                  {action.label}
                </button>
              )}
            </span>
          )}
        </dd>
      ) : (
        <dd className="mt-1 flex flex-wrap items-center gap-2">
          <span className="text-body-sm italic text-muted">Not added</span>
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className={`rounded text-caption font-medium text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand ${FOCUS}`}
            >
              + Add
            </button>
          )}
        </dd>
      )}
    </div>
  );
}

function AccountEmpty({
  icon: Icon,
  title,
  body,
  action
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { label: string; href?: string; onClick?: () => void };
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-line-strong bg-surface px-6 py-10 text-center sm:py-12">
      <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-brand">
        <Icon className="size-5" aria-hidden />
      </span>
      <h3 className="text-h4 font-semibold text-ink">{title}</h3>
      <p className="max-w-[38ch] text-body-sm leading-relaxed text-muted">{body}</p>
      {action &&
        (action.href ? (
          <ButtonLink href={action.href} size="sm" className="mt-1 h-11 rounded-lg px-4">
            {action.label}
          </ButtonLink>
        ) : (
          <Button size="sm" className="mt-1 h-11 rounded-lg px-4" onClick={action.onClick}>
            {action.label}
          </Button>
        ))}
    </div>
  );
}

/* --------------------------------- Orders -------------------------------- */

function OrdersSkeleton() {
  return (
    <div className="flex flex-col gap-4" role="status" aria-live="polite">
      <span className="sr-only">Loading orders</span>
      {Array.from({ length: 2 }, (_, index) => (
        <div key={index} className={`${CARD} p-4 sm:p-5`}>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-56" />
          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="size-14 rounded-lg" />
            <div className="flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderHistory({
  orders,
  loading,
  error,
  onRetry
}: {
  orders: Order[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[1.25rem] font-semibold leading-tight text-ink">Order history</h2>
        <p className="mt-1 text-caption leading-relaxed text-muted">
          Orders placed with this account. Payment status is shown exactly as the store has recorded it — an order is never
          marked paid just because a browser said so.
        </p>
      </div>

      {loading ? (
        <OrdersSkeleton />
      ) : error ? (
        <Notice tone="danger" title="Orders could not be loaded">
          {error}
          <div className="mt-2">
            <Button size="sm" variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          </div>
        </Notice>
      ) : orders.length === 0 ? (
        <AccountEmpty
          icon={Package}
          title="No orders yet"
          body="Orders placed while signed in appear here. Start with one board — there is no minimum order."
          action={{ label: "Start shopping", href: "/shop" }}
        />
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className={`${CARD} p-4 sm:p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link href={`/account/orders/${order.id}`} className={`text-body font-semibold text-ink transition-colors hover:text-brand ${FOCUS}`}>
                    {order.reference}
                  </Link>
                  <p className="mt-1 text-caption text-muted">
                    {formatDate(order.placedAt)} · {order.lines.length} {order.lines.length === 1 ? "item" : "items"} ·{" "}
                    {order.lines.reduce((sum, line) => sum + line.quantity, 0)} units
                  </p>
                </div>
                <StatusBadge status={order.status} demo />
              </div>

              {order.lines.length > 0 && (
                <ul className="mt-4 flex flex-col divide-y divide-line">
                  {order.lines.map((line) => {
                    const product = getProduct(line.slug);
                    return (
                      <li key={line.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                        <Link
                          href={`/product/${line.slug}`}
                          className={`relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg border border-line bg-surface ${FOCUS}`}
                          aria-label={`${line.name} — view product`}
                        >
                          <ProductImage asset={product?.media[0] ?? null} name={line.name} categoryId={product?.categoryId} preset="thumb" sizes="64px" className="h-full w-full object-contain" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link href={`/product/${line.slug}`} className="line-clamp-2 text-body-sm font-medium text-ink transition-colors hover:text-brand">
                            {line.name}
                          </Link>
                          <p className="mt-0.5 text-caption leading-relaxed text-muted">
                            {line.variantLabel} · Qty {line.quantity}
                            {line.quantity > 1 ? ` · ${formatInr(line.unitPriceInr)} each` : ""}
                          </p>
                        </div>
                        <span className="tabular shrink-0 text-caption font-medium text-ink">{formatInr(line.lineTotalInr)}</span>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 sm:flex-row-reverse">
                <ButtonLink href={`/account/orders/${order.id}`} variant="secondary" size="sm" className="h-11 rounded-lg sm:h-10">
                  View details <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <p className="text-caption text-muted">
                  Total <span className="tabular ml-1 text-body-sm font-semibold text-ink">{order.totals.totalInr === null ? "Freight open" : formatInr(order.totals.totalInr)}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function OrderDetail({
  orders,
  loading,
  error,
  orderId,
  onRetry
}: {
  orders: Order[];
  loading: boolean;
  error: string | null;
  orderId: string;
  onRetry: () => void;
}) {
  if (loading) {
    return (
      <div className={`${CARD} p-4 sm:p-6`} role="status">
        <span className="sr-only">Loading order</span>
        <Skeleton className="h-5 w-32" />
        <Skeleton className="mt-3 h-7 w-48" />
        <Skeleton className="mt-2 h-4 w-36" />
        <Skeleton className="mt-6 h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Notice tone="danger" title="This order could not be loaded">
        {error}
        <div className="mt-2">
          <Button size="sm" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      </Notice>
    );
  }

  const order = orders.find((item) => item.id === orderId);

  if (!order) {
    return (
      <AccountEmpty
        icon={Package}
        title="This order is not in your account"
        body="It may have been placed as a guest. Look it up with the order reference and the email used at checkout."
        action={{ label: "Track an order", href: "/track-order" }}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className={`${CARD} p-4 sm:p-6`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-caption text-muted">Order</p>
            <h2 className="mt-1 break-all text-[1.25rem] font-semibold leading-tight text-ink">{order.reference}</h2>
            <p className="mt-1 text-caption text-muted">Placed {formatDate(order.placedAt)}</p>
          </div>
          <StatusBadge status={order.status} demo />
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <ButtonLink href={`/track-order?ref=${encodeURIComponent(order.reference)}`} variant="secondary" size="sm" className="h-10 rounded-lg">
            Track this order
          </ButtonLink>
          <p className="text-caption text-muted">
            Total <span className="tabular ml-1 text-body-sm font-semibold text-ink">{order.totals.totalInr === null ? "Freight open" : formatInr(order.totals.totalInr)}</span>
          </p>
        </div>
        <div className="mt-4 border-t border-line pt-4">
          <OrderActions order={order} onUpdated={onRetry} />
        </div>
      </div>

      {order.status === "return_requested" && (
        <Notice tone="warning" title="Return request under review">
          {order.returnReason ? `You reported: “${order.returnReason}”` : "The team has your return request."} Refunds are
          not issued automatically; a team member will confirm the next step.
        </Notice>
      )}

      <div className={`${CARD} p-4 sm:p-6`}>
        <h3 className="text-h4 font-semibold text-ink">Items</h3>
        <div className="mt-3">
          <OrderLinesTable order={order} />
        </div>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_19rem]">
        <div className={`${CARD} flex flex-col gap-lg p-4 sm:p-6`}>
          <OrderTimeline order={order} compact />
          <div className="grid gap-4 md:grid-cols-2">
            <DispatchBlock order={order} />
            <PaymentStateNote order={order} settled={order.paymentStatus === "paid"} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <AddressBlock title="Deliver to" address={order.shippingAddress} />
            <AddressBlock title="Invoice to" address={order.billingAddress} />
          </div>
        </div>
        <aside className={`${CARD} p-4 sm:p-6`}>
          <TotalsTable order={order} />
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------- Addresses ------------------------------ */

function AddressBook({ account }: { account: CustomerAccount }) {
  const session = useSession();
  const toast = useToast();
  const [draft, setDraft] = useState<AddressDraft>(emptyAddressDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<AddressBookEntry | null>(null);

  const startNew = () => {
    setDraft({ ...emptyAddressDraft, recipientName: account.fullName, phone: account.phone ?? "" });
    setEditingId(null);
    setErrors({});
    setShowForm(true);
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const next = addressDraftErrors(draft);
    setErrors(next);
    if (Object.values(next).some(Boolean)) return;
    setBusy(true);
    try {
      await session.saveAddress(draftToEntry(draft, editingId ?? ""));
      setShowForm(false);
      setEditingId(null);
      toast.push(editingId ? "Address updated." : "Address saved.", "success");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "That address could not be saved.", "error");
    } finally {
      setBusy(false);
    }
  };

  const makeDefault = async (address: AddressBookEntry) => {
    if (address.isDefaultShipping) return;
    try {
      await session.saveAddress({ ...address, isDefaultShipping: true, isDefaultBilling: true });
      toast.push("Default delivery address updated.", "success");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "The default address could not be changed.", "error");
    }
  };

  const remove = async () => {
    if (!pendingDelete) return;
    const target = pendingDelete;
    setPendingDelete(null);
    try {
      await session.removeAddress(target.id);
      toast.push("Address removed.", "info");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "That address could not be removed.", "error");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-[1.25rem] font-semibold leading-tight text-ink">Address book</h2>
        <p className="mt-1 text-caption leading-relaxed text-muted">
          Delivery addresses attached to your account. Checkout offers the default one first.
        </p>
      </div>

      {account.addresses.length === 0 && !showForm ? (
        <AccountEmpty icon={MapPin} title="No saved addresses" body="Add a delivery address here, or save one during checkout." action={{ label: "Add an address", onClick: startNew }} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {!showForm && (
            <button
              type="button"
              onClick={startNew}
              className={`flex min-h-[3.25rem] w-full items-center justify-center gap-2 rounded-[12px] border border-dashed border-line-strong bg-surface/60 px-4 py-2 text-center text-muted transition-colors hover:border-primary hover:text-brand md:order-last md:min-h-[8rem] md:flex-col md:p-6 ${FOCUS}`}
            >
              <span className="grid size-8 place-items-center rounded-full bg-primary-soft text-brand md:size-10">
                <Plus className="size-4 md:size-5" aria-hidden />
              </span>
              <span className="text-body-sm font-medium">Add new address</span>
            </button>
          )}

          {account.addresses.map((address) => {
            const isDefault = address.isDefaultShipping || address.isDefaultBilling;
            return (
              <div key={address.id} className={`${CARD} flex flex-col gap-3 p-4 sm:p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-body-sm font-semibold text-ink">{address.label || "Saved address"}</h3>
                      {isDefault && <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[0.6875rem] font-medium text-brand">Default</span>}
                    </div>
                    <p className="mt-2 text-body-sm font-medium text-ink">{address.recipientName}</p>
                    <p className="mt-0.5 text-caption leading-relaxed text-muted">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ""}
                      {address.landmark ? `, near ${address.landmark}` : ""}
                      <br />
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="mt-1 tabular text-caption text-muted">{address.phone}</p>
                  </div>
                  <div className="flex shrink-0 gap-3">
                    <button
                      type="button"
                      aria-label={`Edit ${address.label || "address"}`}
                      onClick={() => {
                        setDraft(draftFromEntry(address));
                        setEditingId(address.id);
                        setErrors({});
                        setShowForm(true);
                      }}
                      className={`grid size-11 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-primary hover:text-brand lg:size-10 ${FOCUS}`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${address.label || "address"}`}
                      onClick={() => setPendingDelete(address)}
                      className={`grid size-11 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-danger/30 hover:bg-danger-wash hover:text-danger lg:size-10 ${FOCUS}`}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
                {!isDefault && (
                  <button
                    type="button"
                    onClick={() => makeDefault(address)}
                    className={`inline-flex min-h-11 items-center self-start rounded text-caption font-medium text-brand underline decoration-brand/30 underline-offset-2 transition-colors hover:decoration-brand lg:min-h-0 ${FOCUS}`}
                  >
                    Set as default delivery
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showForm && (
        <form onSubmit={save} noValidate className={`${CARD} flex flex-col gap-lg p-4 sm:p-6`}>
          <h3 className="text-[1.25rem] font-semibold text-ink">{editingId ? "Edit address" : "New address"}</h3>
          <AddressFields
            idPrefix="account-address"
            value={draft}
            errors={errors}
            onChange={(patch) => {
              setDraft((current) => ({ ...current, ...patch }));
              setErrors({});
            }}
          />
          <CheckboxField
            id="account-address-default"
            label="Use this as my default delivery address"
            checked={draft.isDefault}
            onChange={(event) => setDraft((current) => ({ ...current, isDefault: event.target.checked }))}
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit" className="rounded-lg" disabled={busy}>
              {busy ? "Saving…" : editingId ? "Save changes" : "Save address"}
            </Button>
            <Button type="button" variant="secondary" className="rounded-lg" onClick={() => setShowForm(false)} disabled={busy}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        onConfirm={remove}
        title="Remove this address?"
        body={pendingDelete ? `${pendingDelete.label || "This address"} — ${pendingDelete.line1}, ${pendingDelete.city}. It is removed from your account only, not from past orders.` : ""}
        confirmLabel="Remove address"
        destructive
      />
    </div>
  );
}
