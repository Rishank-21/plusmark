"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { CaptchaField } from "@/components/account/CaptchaField";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { Breadcrumbs } from "@/components/ui/Nav";
import { Notice, Skeleton } from "@/components/ui/States";
import { passwordStrength, safeNextPath, validateAccountPassword, validateEmail } from "@/lib/validation";
import { resendVerification, sendPasswordReset, updatePassword } from "@/lib/supabase/auth";
import { useSession } from "@/state/session";
import { useToast } from "@/state/toast";

const RESEND_SECONDS = 45;

function Shell({ title, lede, children }: { title: string; lede: string; children: React.ReactNode }) {
  return (
    <div className="pm-shell py-16 lg:py-20">
      <Breadcrumbs trail={[{ label: "Home", href: "/" }, { label: "Sign in", href: "/login" }, { label: title }]} />
      <div className="mx-auto mt-2xl grid max-w-5xl items-start gap-2xl md:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-h1 font-extrabold text-ink">{title}</h1>
          <p className="max-w-reading text-body leading-relaxed text-muted">{lede}</p>
        </div>
        <div className="rounded-xl border border-line bg-surface p-lg">{children}</div>
      </div>
    </div>
  );
}

function useCooldown(): [number, () => void] {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (seconds <= 0) return;
    const timer = window.setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [seconds]);
  return [seconds, () => setSeconds(RESEND_SECONDS)];
}

export function ForgotPasswordPanel({ next }: { next: string }) {
  const nextPath = safeNextPath(next, "/account");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;

    setBusy(true);
    try {
      const result = await sendPasswordReset(email, captchaToken ?? undefined);
      /* The same confirmation either way, so this cannot probe for accounts. */
      if (!result.ok && result.field === "email") {
        setError(result.message);
        return;
      }
      setSent(true);
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Shell title="Check your inbox" lede="Password reset links are single-use and expire quickly.">
        <div className="flex flex-col gap-3">
          <p className="text-body-sm leading-relaxed text-muted">
            If an account exists for <span className="font-medium text-ink">{email.trim().toLowerCase()}</span>, we have sent
            a link to reset the password. Open it on this device, then choose a new password.
          </p>
          <p className="text-caption text-muted">Nothing arrived? Check spam, or wait a minute and try again.</p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setSent(false);
                setEmail("");
              }}
            >
              Try another email
            </Button>
            <ButtonLink href={`/login?next=${encodeURIComponent(nextPath)}`} variant="quiet">
              Back to sign in
            </ButtonLink>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title="Reset your password"
      lede="Enter the email on your Plusmark account. We will send a link that lets you choose a new password."
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-md">
        <TextField
          id="forgot-email"
          label="Email"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
        />
        <CaptchaField onToken={setCaptchaToken} />
        <Button type="submit" fullWidth disabled={busy}>
          {busy ? "Sending…" : "Send reset link"}
          {!busy && <ArrowRight className="size-4" aria-hidden />}
        </Button>
        <p className="text-center text-caption text-muted">
          Remembered it?{" "}
          <ButtonLink href={`/login?next=${encodeURIComponent(nextPath)}`} variant="quiet" size="sm">
            Sign in
          </ButtonLink>
        </p>
      </form>
    </Shell>
  );
}

export function ResetPasswordPanel() {
  const session = useSession();
  const toast = useToast();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const strength = passwordStrength(password);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    const validation = validateAccountPassword(password);
    setError(validation);
    if (validation) return;

    setBusy(true);
    try {
      const result = await updatePassword(password);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setDone(true);
      toast.push("Password updated.", "success");
    } finally {
      setBusy(false);
    }
  };

  if (!session.hydrated) {
    return (
      <Shell title="Choose a new password" lede="Checking your reset link…">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-40" />
        </div>
      </Shell>
    );
  }

  if (!session.user) {
    return (
      <Shell title="Choose a new password" lede="A reset link is needed before a password can be changed.">
        <div className="flex flex-col gap-3">
          <Notice tone="warning" title="This link is invalid or has expired">
            Request a fresh reset email and open the newest link on this device.
          </Notice>
          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/forgot-password">Request a new link</ButtonLink>
            <ButtonLink href="/login" variant="quiet">
              Back to sign in
            </ButtonLink>
          </div>
        </div>
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell title="Password updated" lede="Your new password is active on this account.">
        <div className="flex flex-col gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-success-wash text-success">
            <CheckCircle2 className="size-5" aria-hidden />
          </span>
          <p className="text-body-sm text-muted">Use the new password the next time you sign in on another device.</p>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => router.replace("/account")}>Go to your account</Button>
            <ButtonLink href="/login" variant="quiet">
              Sign in screen
            </ButtonLink>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Choose a new password" lede={`Updating the password for ${session.user.email ?? "your account"}.`}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-md">
        <div className="relative">
          <TextField
            id="reset-password"
            label="New password"
            required
            type={show ? "text" : "password"}
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            error={error}
            className="[&_input]:pr-11"
          />
          <button
            type="button"
            onClick={() => setShow((value) => !value)}
            aria-label={show ? "Hide password" : "Show password"}
            className="absolute right-1.5 bottom-1.5 flex size-8 items-center justify-center rounded-md text-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue"
          >
            {show ? <EyeOff className="size-4" aria-hidden /> : <Eye className="size-4" aria-hidden />}
          </button>
        </div>
        {password.length > 0 && (
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
        <Button type="submit" fullWidth disabled={busy}>
          {busy ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Shell>
  );
}

export function VerifyEmailPanel({ email: initialEmail, verified }: { email: string; verified: boolean }) {
  const [email, setEmail] = useState(initialEmail);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, startCooldown] = useCooldown();
  const toast = useToast();

  const resend = async () => {
    if (busy || cooldown > 0) return;
    const emailError = validateEmail(email);
    setError(emailError);
    if (emailError) return;
    setBusy(true);
    try {
      const result = await resendVerification(email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      startCooldown();
      toast.push("Verification email sent.", "success");
    } finally {
      setBusy(false);
    }
  };

  if (verified) {
    return (
      <Shell title="Email verified" lede="Your account is ready. Sign in to see your orders and saved boards.">
        <div className="flex flex-col gap-3">
          <span className="flex size-11 items-center justify-center rounded-full bg-success-wash text-success">
            <CheckCircle2 className="size-5" aria-hidden />
          </span>
          <ButtonLink href="/login">Go to sign in</ButtonLink>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Verify your email" lede="Confirming your address protects your order history and keeps reset emails working.">
      <div className="flex flex-col gap-md">
        <p className="text-body-sm leading-relaxed text-muted">
          Open the confirmation link we emailed you. It can take a minute to arrive — check spam as well. If you signed up
          with a different address, enter it below to resend.
        </p>
        <TextField
          id="verify-email"
          label="Email"
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          error={error}
        />
        <Button onClick={resend} disabled={busy || cooldown > 0} fullWidth>
          {busy ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend verification email"}
        </Button>
        <p className="text-center text-caption text-muted">
          Already verified?{" "}
          <Link href="/login" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
            Sign in
          </Link>
        </p>
      </div>
    </Shell>
  );
}
