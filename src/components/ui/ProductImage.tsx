"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { blurDataUrl, cloudinaryLoader, imageUrl, isCloudinaryPublicId } from "@/lib/media";
import type { MediaAsset } from "@/types";

/**
 * Cloudinary already negotiates AVIF/WebP through f_auto, so these images are
 * rendered without a second transform by the Next optimizer.
 *
 * When a product has no photograph on the CDN yet, a labelled schematic
 * placeholder is drawn instead — never a stock photo pretending to be Plusmark.
 */
export function ProductImage({
  asset,
  sizes,
  priority = false,
  className,
  name,
  categoryId
}: {
  asset: MediaAsset | null;
  sizes: string;
  priority?: boolean;
  className?: string;
  name: string;
  categoryId?: string;
}) {
  if (!asset) {
    return (
      <PhotoPending className={className} name={name} categoryId={categoryId} />
    );
  }

  return (
    <Image
      src={imageUrl(asset.publicId, { fit: "scale", width: asset.width })}
      alt={asset.alt}
      sizes={sizes}
      width={asset.width}
      height={asset.height}
      priority={priority}
      {...deliveryProps(asset.publicId)}
      {...blurProps(asset.publicId)}
      className={className}
    />
  );
}

/**
 * A missing CDN asset is a real state of this catalogue, not a design decision,
 * so it degrades to the same honest "photograph pending" panel. Kept as state
 * rather than an onError handler because event handlers cannot cross the
 * server/client component boundary.
 */
export function PlainImage({
  publicId,
  alt,
  sizes,
  className,
  priority = false,
  fit = "fill",
  width,
  height,
  pendingLabel
}: {
  publicId: string;
  alt: string;
  sizes: string;
  className?: string;
  priority?: boolean;
  fit?: "fill" | "scale";
  width?: number;
  height?: number;
  /** When set, a failed load swaps to the pending panel instead of a broken image. */
  pendingLabel?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed && pendingLabel) {
    return <PhotoPending className={className} name={pendingLabel} />;
  }
  if (failed) {
    return (
      <div className={className}>
        <BrokenImageFallback label={alt} />
      </div>
    );
  }

  return (
    <Image
      src={imageUrl(publicId, { fit, width, height })}
      alt={alt}
      width={width ?? 1200}
      height={height ?? 900}
      sizes={sizes}
      priority={priority}
      {...deliveryProps(publicId)}
      {...blurProps(publicId)}
      className={className}
      onError={() => {
        setFailed(true);
      }}
    />
  );
}

/** Local /public files have one size, so they stay untouched; CDN ids get the width ladder. */
function deliveryProps(publicId: string) {
  return isCloudinaryPublicId(publicId) ? { loader: cloudinaryLoader } : { unoptimized: true as const };
}

/** A 24px blurred Cloudinary preview keeps the frame from flashing empty. */
function blurProps(publicId: string) {
  const data = blurDataUrl(publicId);
  return data ? { placeholder: "blur" as const, blurDataURL: data } : {};
}

function PhotoPending({
  className,
  name,
  categoryId
}: {
  className?: string;
  name: string;
  categoryId?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center gap-2 bg-sand/70 text-center ${className ?? ""}`}>
      <BoardGlyph categoryId={categoryId} />
      <p className="max-w-[16rem] px-3 text-caption leading-snug text-graphite">Photograph pending</p>
      <p className="px-3 pb-1 text-[0.625rem] uppercase tracking-[0.12em] text-graphite-light">
        Replace in admin · {name}
      </p>
    </div>
  );
}

function BoardGlyph({ categoryId }: { categoryId?: string }) {
  const landscape = categoryId === "school-benches" || categoryId === "board-stands";
  return (
    <svg
      viewBox="0 0 64 64"
      className={landscape ? "h-10 w-14" : "h-12 w-12"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden
    >
      <rect x="8" y="12" width="48" height="34" rx="1.5" className="text-hair-strong" />
      <rect x="12.5" y="16.5" width="39" height="25" className="text-hair" />
      <path d="M22 50v6M42 50v6" className="text-hair-strong" />
    </svg>
  );
}

export function BrokenImageFallback({ label }: { label: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-sand/60 text-graphite">
      <ImageOff className="size-5" aria-hidden />
      <p className="text-caption">{label}</p>
    </div>
  );
}
