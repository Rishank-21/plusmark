"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, ShieldX, UserRoundX } from "lucide-react";
import { useSession } from "@/state/session";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validation";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/States";
import { TextField } from "@/components/ui/Field";

type Result = { tone: "none" } | { tone: "error"; message: string } | { tone: "success" };

export default function AdminLoginPage() {
  const { adminSignedIn, account, accountLoading, refreshAccount } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [result, setResult] = useState<Result>({ tone: "none" });
  const [submitting, setSubmitting] = useState(false);
  const [denied, setDenied] = useState(false);
  const [nextPath, setNextPath] = useState("/admin");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDenied(params.get("denied") === "1");
    const next = params.get("next");
    if (next && next.startsWith("/admin")) setNextPath(next);
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    setResult({ tone: "none" });
    setDenied(false);

    const cleanEmail = email.trim().toLowerCase();
    const nextEmailError = cleanEmail ? validateEmail(cleanEmail) : "Enter the email of the person operating this desk.";
    const nextPasswordError = password ? null : "Enter your account password.";
    setEmailError(nextEmailError);
    setPasswordError(nextPasswordError);
    if (nextEmailError || nextPasswordError) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setResult({ tone: "error", message: "Accounts are not connected in this build. Add the Supabase keys to .env.local." });
      return;
    }

    setSubmitting(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (error || !data.user) {
      setSubmitting(false);
      setPasswordError(
        error?.message?.toLowerCase().includes("invalid login")
          ? "That email and password do not match an account."
          : error?.message || "Sign in failed. Try again."
      );
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      await supabase.auth.signOut();
      setSubmitting(false);
      setResult({
        tone: "error",
        message: "This account exists but does not have administrator rights. Sign in with an administrator account."
      });
      return;
    }

    await refreshAccount();
    setResult({ tone: "success" });
    router.replace(nextPath);
    router.refresh();
  };

  if (accountLoading) {
    return (
      <div className="mx-auto max-w-page px-4 py-12 sm:px-6" role="status" aria-live="polite">
        <span className="sr-only">Checking your session</span>
        <div className="h-8 w-48 animate-pulse rounded-xs bg-sand" />
      </div>
    );
  }

  if (adminSignedIn) {
    return (
      <div className="mx-auto flex max-w-page flex-col gap-4 px-4 py-12 sm:px-6">
        <h1 className="font-display text-h2 leading-tight">Already signed in</h1>
        <p className="max-w-reading text-body-sm text-graphite">
          This browser holds an administrator session{account ? ` for ${account.email}` : ""}. Open the dashboard, or sign
          out first to switch accounts.
        </p>
        <div>
          <Link href="/admin" className="pm-link text-body-sm font-medium">
            Open the admin dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-page gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
      <div className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-col gap-2">
          <p className="pm-eyebrow">Plusmark · internal</p>
          <h1 className="font-display text-h1 leading-tight">Admin sign in</h1>
          <p className="max-w-reading text-body-sm text-graphite">
            The administration desk for catalogue, orders and site settings. Sign in with an account that holds the
            administrator role.
          </p>
        </div>

        {denied && (
          <Notice tone="warning" title="Administrator rights required" icon={<ShieldX className="size-4" aria-hidden />}>
            That account is signed in as a customer. Use an administrator account, or ask an existing administrator to
            grant the role.
          </Notice>
        )}

        {account && (
          <Notice tone="warning" title="A customer account is signed in" icon={<UserRoundX className="size-4" aria-hidden />}>
            This browser is signed in as <span className="font-medium text-ink">{account.email}</span>, which is not an
            administrator. Signing in below replaces that session.
          </Notice>
        )}

        {result.tone === "error" && (
          <Notice tone="danger" title="Sign in failed">
            {result.message}
          </Notice>
        )}

        {result.tone === "success" && (
          <Notice tone="success" title="Administrator session opened" icon={<ShieldCheck className="size-4" aria-hidden />}>
            Opening the dashboard.
          </Notice>
        )}

        <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-sm border border-hair bg-surface p-5">
          <TextField
            label="Admin email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            error={emailError}
            onChange={(event) => {
              setEmail(event.target.value);
              if (emailError) setEmailError(null);
            }}
            placeholder="you@plusmark.in"
            required
          />
          <TextField
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            value={password}
            error={passwordError}
            onChange={(event) => {
              setPassword(event.target.value);
              if (passwordError) setPasswordError(null);
            }}
            required
          />
          <Button type="submit" fullWidth disabled={submitting}>
            <KeyRound className="size-4" aria-hidden />
            {submitting ? "Signing in…" : "Sign in to admin"}
          </Button>
          <p className="text-[0.6875rem] leading-relaxed text-graphite-light">
            Access is decided by the <span className="font-medium">profiles.role</span> column in Postgres and enforced
            by row-level security. The browser cannot grant itself administrator rights.
          </p>
        </form>

        <div className="flex items-center gap-3 text-caption text-graphite">
          <Link href="/" className="pm-link">
            Back to storefront
          </Link>
        </div>
      </div>

      <aside className="flex min-w-0 flex-col gap-4 rounded-sm border border-hair bg-sand/35 p-5">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-h3 leading-tight">What this desk contains</h2>
        </div>
        <p className="text-body-sm text-graphite">
          Catalogue, stock, customer orders and storefront settings for the Plusmark retail store.
        </p>
        <dl className="flex flex-col divide-y divide-hair border-t border-hair">
          {[
            ["Catalogue", "Products, series, categories, sizes and SKUs saved in Supabase."],
            ["Orders", "Customer orders with status transitions and payment state."],
            ["Customers", "Registered accounts, their saved addresses and order history."],
            ["Site", "Announcement, shipping methods, coupons and review moderation."]
          ].map(([term, definition]) => (
            <div key={term} className="flex flex-col gap-0.5 py-2.5">
              <dt className="text-caption font-medium uppercase tracking-[0.1em] text-ink">{term}</dt>
              <dd className="text-caption text-graphite">{definition}</dd>
            </div>
          ))}
        </dl>
        <p className="border-t border-hair pt-3 text-[0.6875rem] leading-relaxed text-graphite">
          Orders placed in this browser are stored locally until checkout is connected to the server; they appear in the
          Orders screen alongside server orders.
        </p>
      </aside>
    </div>
  );
}
