"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ExternalLink, Eye, EyeOff, MailCheck } from "lucide-react";
import { CaptchaField } from "@/components/account/CaptchaField";
import { Button, ButtonLink } from "@/components/ui/Button";
import { CheckboxField, TextField } from "@/components/ui/Field";
import { Breadcrumbs } from "@/components/ui/Nav";
import { Notice } from "@/components/ui/States";
import { B2B_SITE_URL } from "@/lib/config";
import { normaliseMobile, passwordStrength, safeNextPath, validateAccountPassword, validateEmail, validateName, validatePhone } from "@/lib/validation";
import { GOOGLE_AUTH_ENABLED } from "@/lib/supabase/config";
import { resendVerification, signInWithEmail, signInWithGoogle, signUpWithEmail } from "@/lib/supabase/auth";
import { useSession } from "@/state/session";
import { useToast } from "@/state/toast";

type Mode = "sign-in" | "register";

const RESEND_SECONDS = 45;

export function AuthPanel({ mode, next }: { mode: Mode; next: string }) {
  const session = useSession();
  const toast = useToast();
  const router = useRouter();
  const nextPath = safeNextPath(next);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [terms, setTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "submit" | "google" | "resend">(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const feedbackHandled = useRef(false);

  const strength = passwordStrength(password);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (feedbackHandled.current) return;
    feedbackHandled.current = true;
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error === "link") {
      setFormError("That link is invalid or has expired. Request a fresh one below.");
    } else if (error === "backend") {
      setFormError("Accounts are not connected in this build. Nothing was sent anywhere.");
    }
  }, []);

  const fieldErrors = (): Record<string, string | null> => {
    if (mode === "register") {
      return {
        fullName: validateName(fullName),
        email: validateEmail(email),
        phone: validatePhone(phone),
        password: validateAccountPassword(password),
        terms: terms ? null : "Confirm you agree to the account terms."
      };
    }
    return {
      email: validateEmail(email),
      password: password ? null : "Password is required"
    };
  };

  const validateField = (field: string, value: string) => {
    let error: string | null = null;
    if (field === "fullName") error = validateName(value);
    if (field === "email") error = validateEmail(value);
    if (field === "phone") error = validatePhone(value);
    if (field === "password") error = mode === "register" ? validateAccountPassword(value) : value ? null : "Password is required";
    if (field === "terms") error = value === "1" ? null : "Confirm you agree to the account terms.";
    setErrors((current) => ({ ...current, [field]: error }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setFormError(null);

    const nextErrors = fieldErrors();
    setErrors(nextErrors);
    setTouched((current) => ({ ...current, fullName: true, email: true, phone: true, password: true, terms: true }));
    if (Object.values(nextErrors).some(Boolean)) return;

    setBusy("submit");
    try {
      if (mode === "register") {
        const result = await signUpWithEmail({
          fullName,
          email,
          phone,
          password,
          marketingOptIn: marketing,
          captchaToken: captchaToken ?? undefined
        });
        if (!result.ok) {
          const field = result.field;
          setFormError(field === "form" || !field ? result.message : null);
          if (field && field !== "form") setErrors((current) => ({ ...current, [field]: result.message }));
          return;
        }
        setPendingEmail(email.trim().toLowerCase());
        setCooldown(RESEND_SECONDS);
        toast.push("Account created. Verify your email to finish.", "success");
        return;
      }

      const result = await signInWithEmail(email, password, captchaToken ?? undefined);
      if (!result.ok) {
        if (result.message.includes("not verified")) {
          setPendingEmail(email.trim().toLowerCase());
          setCooldown(0);
          return;
        }
        setFormError(result.field === "form" || !result.field ? result.message : null);
        if (result.field && result.field !== "form") {
          const field = result.field;
          setErrors((current) => ({ ...current, [field]: result.message }));
        }
        return;
      }
      toast.push("Signed in.", "success");
      router.replace(nextPath);
      router.refresh();
    } finally {
      setBusy(null);
    }
  };

  const resend = async () => {
    if (busy || cooldown > 0) return;
    setBusy("resend");
    try {
      const result = await resendVerification(pendingEmail ?? email);
      if (!result.ok) {
        setFormError(result.message);
        return;
      }
      setCooldown(RESEND_SECONDS);
      toast.push("Verification email sent. Check your inbox and spam folder.", "success");
    } finally {
      setBusy(null);
    }
  };

  const google = async () => {
    if (busy) return;
    setBusy("google");
    try {
      const result = await signInWithGoogle();
      if (!result.ok) setFormError(result.message);
    } finally {
      setBusy(null);
    }
  };

  if (pendingEmail) {
    return (
      <AuthShell mode={mode} nextPath={nextPath}>
        <div className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-lg">
          <span className="flex size-11 items-center justify-center rounded-full bg-primary-soft text-primary">
            <MailCheck className="size-5" aria-hidden />
          </span>
          <h2 className="font-display text-h2 font-extrabold text-ink">Check your email to verify</h2>
          <p className="text-body-sm leading-relaxed text-muted">
            We sent a confirmation link to <span className="font-medium text-ink">{pendingEmail}</span>. Open it on this
            device to finish setting up your account. The link expires after a short while.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={resend} disabled={busy === "resend" || cooldown > 0}>
              {busy === "resend" ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend email"}
            </Button>
            <ButtonLink href={`/login?next=${encodeURIComponent(nextPath)}`} variant="quiet">
              Back to sign in
            </ButtonLink>
          </div>
          {formError && <p className="text-caption font-medium text-danger" role="alert">{formError}</p>}
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell mode={mode} nextPath={nextPath}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-md rounded-xl border border-line bg-surface p-lg">
        {session.user && mode === "sign-in" && (
          <Notice tone="info" title="You are already signed in">
            <Link href="/account" className="underline decoration-line-strong underline-offset-4">
              Open your account
            </Link>{" "}
            or sign in with a different email below.
          </Notice>
        )}

        {formError && (
          <Notice tone="danger" title="Could not continue">
            {formError}
          </Notice>
        )}

        {mode === "register" && (
          <TextField
            id="auth-name"
            label="Full name"
            required
            autoComplete="name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            onBlur={() => {
              setTouched((current) => ({ ...current, fullName: true }));
              validateField("fullName", fullName);
            }}
            error={touched.fullName ? errors.fullName : null}
          />
        )}

        <TextField
          id="auth-email"
          label="Email"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          onBlur={() => {
            setTouched((current) => ({ ...current, email: true }));
            validateField("email", email);
          }}
          error={touched.email ? errors.email : null}
        />

        {mode === "register" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="auth-phone" className="text-caption font-medium text-ink">
              Mobile number <span className="text-danger">*</span>
            </label>
            <div className="flex">
              <span className="flex h-11 items-center rounded-l-lg border border-r-0 border-line-strong bg-subtle/60 px-3 text-body-sm text-muted">
                +91
              </span>
              <input
                id="auth-phone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="9876543210"
                maxLength={10}
                value={phone}
                onChange={(event) => setPhone(normaliseMobile(event.target.value))}
                onBlur={() => {
                  setTouched((current) => ({ ...current, phone: true }));
                  validateField("phone", phone);
                }}
                aria-invalid={touched.phone && errors.phone ? true : undefined}
                className="h-11 w-full rounded-r-lg border border-line-strong bg-surface px-3.5 text-body-sm text-ink placeholder:text-muted focus-visible:border-primary"
              />
            </div>
            {touched.phone && errors.phone ? (
              <p className="text-caption font-medium text-danger" role="alert">
                {errors.phone}
              </p>
            ) : (
              <p className="text-caption text-muted">Dispatch partners use this on the delivery day. It is never shown publicly.</p>
            )}
          </div>
        )}

        <div className="relative">
          <TextField
            id="auth-password"
            label="Password"
            required
            type={showPassword ? "text" : "password"}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={() => {
              setTouched((current) => ({ ...current, password: true }));
              validateField("password", password);
            }}
            error={touched.password ? errors.password : null}
            className="[&_input]:pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-1.5 bottom-1.5 flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>

        {mode === "register" && password.length > 0 && (
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-1.5" aria-hidden>
              {[1, 2, 3].map((step) => (
                <span
                  key={step}
                  className={
                    "h-1 flex-1 rounded-full " +
                    (strength.score >= step ? (strength.score === 1 ? "bg-danger" : strength.score === 2 ? "bg-warning" : "bg-success") : "bg-hair")
                  }
                />
              ))}
            </div>
            <p className="text-caption text-muted">
              <span className="font-medium text-ink">{strength.label}</span> — {strength.hint}
            </p>
          </div>
        )}

        {mode === "sign-in" && (
          <div className="flex justify-end">
            <Link
              href={`/forgot-password?next=${encodeURIComponent(nextPath)}`}
              className="text-caption font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-navy"
            >
              Forgot password?
            </Link>
          </div>
        )}

        {mode === "register" && (
          <div className="flex flex-col gap-3 border-t border-line pt-md">
            <CheckboxField
              id="auth-terms"
              label="I agree to the account and store terms."
              checked={terms}
              onChange={(event) => setTerms(event.target.checked)}
              error={touched.terms ? errors.terms : null}
            />
            <CheckboxField
              id="auth-marketing"
              label="Email me occasional product news and offers."
              hint="Optional. You can opt out at any time."
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
            />
          </div>
        )}

        <CaptchaField onToken={setCaptchaToken} />

        <Button type="submit" fullWidth disabled={busy !== null}>
          {busy === "submit" ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
          {busy !== "submit" && <ArrowRight className="size-4" aria-hidden />}
        </Button>

        {mode === "sign-in" && (
          <>
            {GOOGLE_AUTH_ENABLED && (
              <Button type="button" variant="secondary" fullWidth onClick={google} disabled={busy !== null}>
                {busy === "google" ? "Opening Google…" : "Continue with Google"}
              </Button>
            )}
            <p className="text-center text-caption text-muted">
              New to Plusmark?{" "}
              <ButtonLink href={`/register?next=${encodeURIComponent(nextPath)}`} variant="quiet" size="sm">
                Create an account
              </ButtonLink>
            </p>
          </>
        )}

        {mode === "register" && (
          <p className="text-center text-caption text-muted">
            Already have an account?{" "}
            <ButtonLink href={`/login?next=${encodeURIComponent(nextPath)}`} variant="quiet" size="sm">
              Sign in
            </ButtonLink>
          </p>
        )}
      </form>
    </AuthShell>
  );
}

function AuthShell({ mode, nextPath, children }: { mode: Mode; nextPath: string; children: React.ReactNode }) {
  return (
    <div className="pm-shell py-16 lg:py-20">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: mode === "register" ? "Create account" : "Sign in" }]} />
      <div className="mx-auto mt-12 grid max-w-5xl items-start gap-12 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <h1 className="font-display text-h1 font-extrabold text-ink">
            {mode === "register" ? "Create your Plusmark account" : "Welcome back"}
          </h1>
          <p className="max-w-reading text-body leading-relaxed text-muted">
            {mode === "register"
              ? "One account keeps your delivery addresses, saved boards and order history in one place. Checkout still works as a guest."
              : "Sign in to see your saved addresses, saved boards and order history. Guest checkout stays available without an account."}
          </p>
          {mode === "sign-in" && nextPath !== "/account" && (
            <p className="text-caption text-muted">You will continue to {nextPath} after signing in.</p>
          )}
          <div className="mt-1">
            <a
              href={B2B_SITE_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 text-caption font-medium text-muted underline decoration-line-strong underline-offset-4 hover:text-ink"
            >
              Buying for a school, office or dealer? Visit Plusmark Business
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
