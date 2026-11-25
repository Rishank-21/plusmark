"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useSession } from "@/state/session";
import { classNames } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/States";
import { ADMIN_AREA_LABELS, ADMIN_NAV, isAdminArea } from "@/components/admin/adminNav";

const HEAD_VAR = "--pm-admin-head";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { adminSignedIn, adminLoading, adminSignOut, account, hydrated } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const drawerPanel = useRef<HTMLDivElement>(null);

  const onLoginPage = pathname === "/admin/login";

  /* Middleware already blocks the route server-side; this keeps the UI consistent
     while the client session hydrates and after a sign-out. */
  useEffect(() => {
    if (!hydrated || adminLoading) return;
    if (adminSignedIn && onLoginPage) router.replace("/admin");
    else if (!adminSignedIn && !onLoginPage) router.replace("/admin/login");
  }, [adminSignedIn, adminLoading, hydrated, onLoginPage, router]);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    drawerPanel.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen, closeDrawer]);

  const shellStyle = { [HEAD_VAR]: "5.75rem" } as React.CSSProperties;

  if (!hydrated || adminLoading) {
    return (
      <div style={shellStyle} className="min-h-dvh bg-canvas">
        <AdminBand />
        <div className="border-b border-hair bg-surface px-4 py-4">
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-8 sm:px-6" role="status" aria-live="polite">
          <span className="sr-only">Checking the administrator session</span>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!adminSignedIn && !onLoginPage) {
    return (
      <div style={shellStyle} className="min-h-dvh bg-canvas">
        <AdminBand />
        <div className="px-4 py-16 text-center text-body-sm text-graphite">
          <ShieldAlert className="mx-auto mb-3 size-6 text-graphite" aria-hidden />
          Administrative access is required for this screen.
          <div className="mt-4">
            <Link href="/admin/login" className="pm-link text-body-sm">
              Go to admin sign-in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (onLoginPage && !adminSignedIn) {
    return (
      <div style={shellStyle} className="flex min-h-dvh flex-col bg-canvas">
        <AdminBand />
        <div className="flex h-14 items-center gap-3 border-b border-hair bg-surface px-4">
          <Link href="/admin" className="flex items-baseline gap-2.5">
            <span className="font-display text-h4 leading-none">Plusmark</span>
            <span className="pm-eyebrow">Admin</span>
          </Link>
          <Link href="/" className="ml-auto text-caption font-medium text-graphite underline decoration-hair-strong underline-offset-4 transition-colors hover:text-ink">
            Storefront
          </Link>
        </div>
        <main id="main" className="flex-1">
          {children}
        </main>
      </div>
    );
  }

  const area = pathname.split("/")[2] ?? "";
  const areaLabel = isAdminArea(area) ? ADMIN_AREA_LABELS[area] : ADMIN_AREA_LABELS[""];

  return (
    <div style={shellStyle} className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-50">
        <AdminBand />
        <div className="flex h-14 items-center gap-3 border-b border-hair bg-surface px-3 sm:px-4">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open admin navigation"
            aria-expanded={drawerOpen}
            aria-controls="pm-admin-drawer"
            className="flex size-11 shrink-0 items-center justify-center rounded-xs border border-hair-strong text-ink transition-colors hover:bg-sand/60 lg:hidden"
          >
            <Menu className="size-5" aria-hidden />
          </button>

          <Link href="/admin" className="flex min-w-0 items-baseline gap-2.5">
            <span className="font-display text-h4 leading-none">Plusmark</span>
            <span className="pm-eyebrow hidden sm:inline">Admin</span>
          </Link>

          <span className="hidden shrink-0 text-caption text-graphite-light md:inline">/</span>
          <span className="hidden shrink-0 text-caption font-medium text-graphite md:inline">{areaLabel}</span>

          <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden flex-col items-end leading-tight sm:flex">
              <span className="text-caption font-medium text-ink">{account?.fullName || "Administrator"}</span>
              <span className="text-[0.6875rem] text-graphite">{account?.email}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                void adminSignOut();
                router.replace("/admin/login");
              }}
            >
              <LogOut className="size-4" aria-hidden />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <aside
        className="fixed bottom-0 left-0 top-0 hidden w-[16rem] border-r border-hair bg-surface pt-[var(--pm-admin-head)] lg:block"
        aria-label="Admin sections"
      >
        <div className="h-full overflow-y-auto pb-10">
          <SidebarNav />
        </div>
      </aside>

      <div className="lg:pl-[16rem]">
        <main id="main" className="mx-auto w-full max-w-[88rem] px-3 py-5 sm:px-5 sm:py-7">
          {children}
        </main>
      </div>

      {drawerOpen && (
        <div id="pm-admin-drawer" className="fixed inset-0 z-[70] lg:hidden">
          <div className="absolute inset-0 bg-scrim/50" onClick={closeDrawer} aria-hidden />
          <div
            ref={drawerPanel}
            role="dialog"
            aria-modal="true"
            aria-label="Admin navigation"
            tabIndex={-1}
            className="absolute inset-y-0 left-0 flex w-[17rem] max-w-[85vw] flex-col overflow-y-auto bg-surface shadow-drawer animate-slide-in-right"
          >
            <div className="flex items-center justify-between gap-3 border-b border-hair px-4 py-3">
              <span className="font-display text-h4">Admin sections</span>
              <button
                type="button"
                onClick={closeDrawer}
                aria-label="Close admin navigation"
                className="flex size-11 items-center justify-center rounded-xs text-graphite transition-colors hover:bg-sand hover:text-ink"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>
            <SidebarNav />
          </div>
        </div>
      )}
    </div>
  );
}

function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="flex flex-col gap-6 px-3 py-4">
      {ADMIN_NAV.map((section) => (
        <div key={section.title} className="flex flex-col gap-1">
          <p className="pm-eyebrow px-2 pb-1">{section.title}</p>
          <ul className="flex flex-col">
            {section.items.map((item) => {
              const active =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={classNames(
                      "flex h-11 items-center gap-2.5 rounded-xs px-2 text-body-sm transition-colors",
                      active ? "bg-navy-wash font-medium text-navy-deep" : "text-graphite hover:bg-sand/60 hover:text-ink"
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p className="flex items-start gap-2 border-t border-hair px-2 pt-3 text-[0.6875rem] leading-relaxed text-graphite">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        Every change here is saved to Supabase and checked against your administrator role.
      </p>
    </nav>
  );
}

/** Thin band above every admin screen. */
export function AdminBand() {
  return (
    <div className="flex h-[1.75rem] items-center gap-2 bg-shell px-3 text-shell-on sm:h-9 sm:px-4">
      <ShieldCheck className="size-3.5 shrink-0" aria-hidden />
      <p className="truncate text-[0.625rem] font-medium uppercase tracking-[0.12em] sm:text-[0.6875rem]">
        Plusmark operations desk
      </p>
      <span className="ml-auto hidden shrink-0 text-[0.625rem] uppercase tracking-[0.1em] text-sand sm:inline">
        Live catalogue · live orders
      </span>
    </div>
  );
}
