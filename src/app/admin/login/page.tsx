"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Notice } from "@/components/ui/States";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { validateEmail } from "@/lib/validation";
import { useSession } from "@/state/session";

type Step = "password" | "enroll" | "code";

function AdminLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const session = useSession();
  const next = params.get("next")?.startsWith("/admin") ? (params.get("next") as string) : "/admin";
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [factorId, setFactorId] = useState("");
  const [enroll, setEnroll] = useState<{ secret: string; qr: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const supabase = getSupabaseBrowserClient();

  // Already signed in with a password (for example redirected here for the code): go straight to the code step.
  useEffect(() => {
    if (!supabase || step !== "password") return;
    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      const level = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (level.data?.currentLevel === "aal2") {
        router.replace(next);
        return;
      }
      await proceedAfterPassword();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase]);

  async function proceedAfterPassword() {
    if (!supabase) return;
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.user.id).maybeSingle();
    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("This account is not an administrator.");
      setStep("password");
      return;
    }
    const factors = await supabase.auth.mfa.listFactors();
    const verified = factors.data?.totp?.find((f) => f.status === "verified");
    if (verified) {
      setFactorId(verified.id);
      setStep("code");
      return;
    }
    // first sign-in for this admin: set up the authenticator app
    for (const stale of factors.data?.all ?? []) {
      if (stale.status === "unverified") await supabase.auth.mfa.unenroll({ factorId: stale.id });
    }
    const created = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Plusmark admin" });
    if (created.error || !created.data) {
      setError(created.error?.message ?? "Could not start authenticator setup.");
      return;
    }
    setFactorId(created.data.id);
    setEnroll({ secret: created.data.totp.secret, qr: created.data.totp.qr_code });
    setStep("enroll");
  }

  async function signIn(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const emailError = validateEmail(email);
    if (emailError || !password) {
      setError(emailError ?? "Enter your password.");
      return;
    }
    if (!supabase) {
      setError("The backend is not configured.");
      return;
    }
    setBusy(true);
    try {
      const { error: signError } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      if (signError) {
        setError("Those details did not match an account.");
        return;
      }
      await proceedAfterPassword();
    } finally {
      setBusy(false);
    }
  }

  async function verify(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!supabase) return;
    if (!/^\d{6}$/.test(code.trim())) {
      setError("Enter the 6 digit code from your authenticator app.");
      return;
    }
    setBusy(true);
    try {
      const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.trim() });
      if (verifyError) {
        setError("That code was not accepted. Wait for a new code and try again.");
        setCode("");
        return;
      }
      // Make sure the new (aal2) tokens are in the cookies before the server checks them on the next page.
      await supabase.auth.refreshSession();
      await session.refreshAccount();
      await supabase.auth.getSession();
      // Give the browser a moment to write the new cookies, otherwise the server still sees the old level and bounces back here.
      await new Promise((resolve) => setTimeout(resolve, 800));
      window.location.assign(next);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-6 shadow-card">
        <div className="flex items-center gap-3">
          {step === "password" ? <KeyRound className="size-6 text-primary" aria-hidden /> : <ShieldCheck className="size-6 text-primary" aria-hidden />}
          <h1 className="font-display text-h2 font-extrabold text-ink">Admin sign in</h1>
        </div>

        {params.get("denied") && (
          <Notice tone="danger" title="Not an administrator">
            That account does not have admin access.
          </Notice>
        )}

        {step === "password" && (
          <form onSubmit={signIn} noValidate className="flex flex-col gap-3">
            <TextField label="Email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <TextField label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            {error && <p role="alert" className="text-body-sm font-medium text-danger">{error}</p>}
            <Button type="submit" loading={busy} disabled={busy}>Continue</Button>
            <p className="text-caption text-muted">Next you will be asked for the 6 digit code from your authenticator app.</p>
          </form>
        )}

        {step === "enroll" && enroll && (
          <form onSubmit={verify} noValidate className="flex flex-col gap-3">
            <p className="text-body-sm text-ink">
              Set up your authenticator app once. Scan this code with Google Authenticator, Authy or 1Password, or type the key in.
            </p>
            {/* The QR image comes from Supabase as an SVG data URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enroll.qr} alt="Authenticator QR code" className="mx-auto size-44 rounded-sm border border-line bg-white p-2" />
            <p className="break-all rounded-sm bg-subtle p-2 text-center font-mono text-caption text-ink">{enroll.secret}</p>
            <TextField label="6 digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            {error && <p role="alert" className="text-body-sm font-medium text-danger">{error}</p>}
            <Button type="submit" loading={busy} disabled={busy}>Finish setup</Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={verify} noValidate className="flex flex-col gap-3">
            <p className="text-body-sm text-ink">Enter the 6 digit code from your authenticator app.</p>
            <TextField label="6 digit code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
            {error && <p role="alert" className="text-body-sm font-medium text-danger">{error}</p>}
            <Button type="submit" loading={busy} disabled={busy}>Verify and open admin</Button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLogin />
    </Suspense>
  );
}
