"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { classNames } from "@/lib/format";

type Variant = "primary" | "navy" | "secondary" | "ghost" | "danger" | "quiet";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-sans font-semibold tracking-[0.01em] transition-[background-color,color,border-color,opacity,transform] duration-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-page";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-onprimary shadow-[0_1px_2px_rgb(var(--c-shadow)/0.12)] hover:bg-primary-strong focus-visible:bg-primary-strong",
  navy: "bg-shell text-shell-on hover:bg-shell/90 focus-visible:bg-shell/90",
  secondary: "border border-line-strong bg-surface text-ink hover:border-primary/50 hover:bg-subtle",
  ghost: "text-ink hover:bg-subtle",
  danger: "bg-danger text-onprimary hover:bg-danger/90",
  quiet: "text-muted underline decoration-line-strong underline-offset-4 hover:text-ink hover:decoration-ink"
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-caption min-w-9",
  md: "h-11 px-5 text-body-sm min-w-11",
  lg: "h-[3.25rem] px-7 text-body min-w-12"
};

interface Common {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  ...rest
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      aria-busy={loading || undefined}
      className={classNames(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
    >
      {loading && <Loader2 className="size-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  href,
  disabled,
  ...rest
}: Common & { disabled?: boolean } & React.ComponentPropsWithoutRef<typeof Link>) {
  const styles = classNames(BASE, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className);
  if (disabled) {
    return (
      <span role="link" aria-disabled="true" className={classNames(styles, "pointer-events-none opacity-45")}>
        {children}
      </span>
    );
  }
  return (
    <Link {...rest} href={href} className={styles}>
      {children}
    </Link>
  );
}
