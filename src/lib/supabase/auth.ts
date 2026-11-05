import type { AuthError } from "@supabase/supabase-js";
import { requireSupabaseBrowserClient, BackendNotConfiguredError } from "./client";
import { GOOGLE_AUTH_ENABLED } from "./config";
import { normaliseMobile, validateAccountPassword, validateEmail, validateName, validatePhone } from "@/lib/validation";

export type AuthField = "email" | "phone" | "password" | "form";

export type AuthResult<T = undefined> = { ok: true; data: T } | { ok: false; message: string; field?: AuthField };

function fail(message: string, field?: AuthField): { ok: false; message: string; field?: AuthField } {
  return { ok: false, message, field };
}

/** Same-origin landing page for every Supabase email link. */
export function authCallbackUrl(next?: string): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  const query = params.toString();
  return `${origin}/auth/callback${query ? `?${query}` : ""}`;
}

/**
 * Turns Supabase auth errors into copy that names the fix. Unknown errors fall
 * back to a neutral line rather than leaking internals.
 */
export function authErrorMessage(error: AuthError | null | undefined): string {
  if (!error) return "Something went wrong. Try again.";
  switch (error.code) {
    case "invalid_credentials":
      return "Email or password is incorrect. Check them and try again.";
    case "email_not_confirmed":
      return "This email is not verified yet. Open the link we sent, or resend it below.";
    case "user_already_exists":
    case "email_exists":
      return "This email already has an account. Sign in instead, or reset your password.";
    case "phone_exists":
      return "That mobile number is already linked to an account.";
    case "weak_password":
      return "Choose a stronger password: at least 8 characters with a number or symbol.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Too many attempts in a short window. Wait a minute and try again.";
    case "over_sms_send_rate_limit":
      return "Too many codes requested. Wait a minute and try again.";
    case "signup_disabled":
      return "New accounts are paused right now. Contact Plusmark if this is unexpected.";
    case "captcha_failed":
      return "The security check did not pass. Reload the page and try again.";
    case "otp_expired":
      return "That link has expired. Request a fresh one.";
    case "same_password":
      return "The new password must be different from the current one.";
    case "session_not_found":
    case "refresh_token_not_found":
      return "That session has expired. Sign in again.";
    default:
      return error.message || "Something went wrong. Try again.";
  }
}

export function isBackendConfigured(): boolean {
  try {
    requireSupabaseBrowserClient();
    return true;
  } catch (error) {
    return !(error instanceof BackendNotConfiguredError);
  }
}

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  marketingOptIn: boolean;
  captchaToken?: string;
}

export async function signUpWithEmail(input: SignUpInput): Promise<AuthResult<{ needsVerification: boolean }>> {
  const nameError = validateName(input.fullName);
  if (nameError) return fail(nameError, "form");
  const emailError = validateEmail(input.email);
  if (emailError) return fail(emailError, "email");
  const phoneError = validatePhone(input.phone);
  if (phoneError) return fail(phoneError, "phone");
  const passwordError = validateAccountPassword(input.password);
  if (passwordError) return fail(passwordError, "password");

  const phone = normaliseMobile(input.phone);

  let supabase;
  try {
    supabase = requireSupabaseBrowserClient();
  } catch (error) {
    return fail(
      error instanceof BackendNotConfiguredError
        ? "Accounts are not connected yet: this build has no Supabase project. Nothing was created."
        : "The account service is unavailable. Try again."
    );
  }

  /* The profiles table owns phone uniqueness, but the row appears only after the
     auth user exists — so check ahead of sign-up for a clear error. */
  const { data: phoneTaken, error: phoneCheckError } = await supabase.rpc("phone_in_use", { p_phone: phone });
  if (!phoneCheckError && phoneTaken) {
    return fail("That mobile number is already linked to an account. Sign in instead.", "phone");
  }

  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      emailRedirectTo: authCallbackUrl("/account"),
      captchaToken: input.captchaToken,
      data: {
        full_name: input.fullName.trim(),
        phone,
        marketing_opt_in: input.marketingOptIn
      }
    }
  });

  if (error) return fail(authErrorMessage(error), "form");

  /* With confirmations on, Supabase returns a user with no identities for an
     address that already exists, precisely so the screen cannot be farmed. */
  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return fail("This email already has an account. Sign in instead, or reset your password.", "email");
  }

  return { ok: true, data: { needsVerification: !data.session } };
}

export async function resendVerification(email: string): Promise<AuthResult> {
  try {
    const supabase = requireSupabaseBrowserClient();
    const { error } = await supabase.auth.resend({
      type: "signup",
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo: authCallbackUrl("/account") }
    });
    if (error) return fail(authErrorMessage(error));
    return { ok: true, data: undefined };
  } catch (error) {
    return fail(
      error instanceof BackendNotConfiguredError
        ? "Email verification is not connected in this build."
        : "The account service is unavailable. Try again."
    );
  }
}

export interface SignInResult {
  unverified: boolean;
}

export async function signInWithEmail(email: string, password: string, captchaToken?: string): Promise<AuthResult<SignInResult>> {
  const emailError = validateEmail(email);
  if (emailError) return fail(emailError, "email");
  if (!password) return fail("Password is required", "password");

  try {
    const supabase = requireSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
      options: { captchaToken }
    });
    if (error) {
      return fail(authErrorMessage(error), error.code === "email_not_confirmed" ? "email" : "form");
    }
    return { ok: true, data: { unverified: false } };
  } catch (error) {
    return fail(
      error instanceof BackendNotConfiguredError
        ? "Sign-in is not connected in this build: no Supabase project is configured."
        : "The account service is unavailable. Try again."
    );
  }
}

export async function signOut(): Promise<void> {
  const supabase = (() => {
    try {
      return requireSupabaseBrowserClient();
    } catch {
      return null;
    }
  })();
  if (!supabase) return;
  await supabase.auth.signOut();
}

/**
 * Always resolves the same way, whether or not the address exists, so the screen
 * cannot be used to probe for registered emails.
 */
export async function sendPasswordReset(email: string, captchaToken?: string): Promise<AuthResult> {
  const emailError = validateEmail(email);
  if (emailError) return fail(emailError, "email");

  try {
    const supabase = requireSupabaseBrowserClient();
    await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: authCallbackUrl("/reset-password"),
      captchaToken
    });
    return { ok: true, data: undefined };
  } catch {
    return fail("The reset email could not be sent right now. Try again in a minute.");
  }
}

export async function updatePassword(password: string): Promise<AuthResult> {
  const passwordError = validateAccountPassword(password);
  if (passwordError) return fail(passwordError, "password");

  try {
    const supabase = requireSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return fail(authErrorMessage(error), "password");
    return { ok: true, data: undefined };
  } catch {
    return fail("The password could not be updated right now. Try again.");
  }
}

export async function signInWithGoogle(): Promise<AuthResult> {
  if (!GOOGLE_AUTH_ENABLED) return fail("Google sign-in is not enabled.");
  try {
    const supabase = requireSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: authCallbackUrl("/account") }
    });
    if (error) return fail(authErrorMessage(error));
    return { ok: true, data: undefined };
  } catch {
    return fail("The account service is unavailable. Try again.");
  }
}

export async function getCurrentUser() {
  try {
    const supabase = requireSupabaseBrowserClient();
    const {
      data: { user }
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}
