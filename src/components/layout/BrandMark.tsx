"use client";

import Image from "next/image";
import { useStorefrontTheme } from "@/components/layout/StorefrontThemeProvider";

export function BrandMark({
  surface,
  sizes,
  className,
  priority = false
}: {
  surface: "surface" | "shell";
  sizes: string;
  className: string;
  priority?: boolean;
}) {
  const { surfaceIsDark, shellIsDark } = useStorefrontTheme();
  const useLightLogo = surface === "shell" ? shellIsDark : surfaceIsDark;

  return (
    <Image
      src={useLightLogo ? "/images/plusmark/brand/plusmark-white.png" : "/images/plusmark/brand/plusmark.png"}
      alt="Plusmark"
      width={useLightLogo ? 1304 : 1304}
      height={useLightLogo ? 261 : 262}
      sizes={sizes}
      className={className}
      priority={priority}
    />
  );
}
