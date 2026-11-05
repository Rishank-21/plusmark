"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { classNames } from "@/lib/format";

type Variant = "primary" | "navy" | "secondary" | "ghost" | "danger" | "quiet";
type Size = "sm" | "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-md font-sans font-medium tracking-[0.01em] transition-[background-color,color,border-color,opacity,transform] duration-200 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-offset-2";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-deep focus-visible:bg-brand-deep",
  navy: "bg-brand text-white hover:bg-brand-deep focus-visible:bg-brand-deep",
  secondary: "border border-brand/25 bg-white text-brand hover:border-brand hover:bg-brand-wash",
  ghost: "text-brand hover:bg-brand-wash",
  danger: "bg-danger text-white hover:bg-danger/90",
  quiet: "text-graphite underline decoration-hair-strong underline-offset-4 hover:text-ink hover:decoration-ink"
};

const SIZES: Record<Size, string> = {
  sm: "h-10 px-3.5 text-caption min-w-10 lg:h-9 lg:px-3 lg:min-w-9",
  md: "h-11 px-5 text-body-sm min-w-11",
  lg: "h-12 px-7 text-body min-w-12"
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
