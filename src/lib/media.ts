import { CLOUDINARY_CLOUD_NAME } from "@/lib/media-config";
import { SITE_URL } from "@/lib/config";

const BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload`;
const VIDEO_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;

export const IMAGE_WIDTHS = [320, 480, 640, 768, 960, 1200, 1600, 2000] as const;

/** Named widths used by the storefront so every surface stays consistent. */
export const IMAGE_PRESETS = {
  thumbnail: 200,
  card: 800,
  gallery: 1200,
  hero: 1600,
  zoom: 2000
} as const;

/** Delivery ladders per surface. Cards never request above 800 px. */
export const CARD_WIDTHS = [320, 480, 640, 800] as const;
export const GALLERY_WIDTHS = [640, 960, 1200] as const;
export const HERO_WIDTHS = [640, 960, 1280, 1600] as const;
export const ZOOM_WIDTHS = [800, 1200, 1600, 2000] as const;

interface TransformOptions {
  /** Crop to fill (tiles, cards), scale, or limit so the image is never upscaled. */
  fit?: "fill" | "scale" | "pad" | "limit";
  gravity?: string;
  width?: number;
  height?: number;
  format?: "auto" | "jpg" | "png";
  /** Tighter quality for dense grids; defaults to q_auto. */
  quality?: "auto" | "auto:low";
  /** Small blurred preview for CLS-safe placeholders. */
  blur?: number;
  dpr?: "auto";
}

function segments({ fit = "fill", gravity = "auto", width, height, format = "auto", quality = "auto", blur, dpr }: TransformOptions) {
  const parts = [`f_${format}`, `q_${quality}`];
  if (dpr) parts.push(`dpr_${dpr}`);
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  parts.push(`c_${fit}`);
  if (fit === "fill") parts.push(`g_${gravity}`);
  if (fit === "pad") parts.push("b_white");
  if (blur) parts.push(`e_blur:${blur}`);
  return parts.join(",");
}

function snapWidth(width: number, ladder: readonly number[]): number {
  let chosen = ladder[0];
  for (const step of ladder) {
    if (step <= width) chosen = step;
  }
  return chosen;
}

function ladderLoader(ladder: readonly number[]) {
  return ({ src, width }: { src: string; width: number; quality?: number }) =>
    cloudinaryResize(src, snapWidth(width, ladder));
}

export const cardLoader = ladderLoader(CARD_WIDTHS);
export const galleryLoader = ladderLoader(GALLERY_WIDTHS);
export const heroLoader = ladderLoader(HERO_WIDTHS);
export const zoomLoader = ladderLoader(ZOOM_WIDTHS);

/** Absolute Cloudinary URL — or a local `/public` path, served untouched. */
export function imageUrl(publicId: string, options: TransformOptions = {}): string {
  if (publicId.startsWith("/") || publicId.startsWith("http://") || publicId.startsWith("https://")) {
    return publicId;
  }
  return `${BASE}/${segments(options)}/${publicId}`;
}

/** srcSet across the breakpoint ladder for a given rendering width. */
export function imageSrcSet(publicId: string, options: TransformOptions = {}): string {
  if (publicId.startsWith("/") || publicId.startsWith("http")) return "";
  return IMAGE_WIDTHS.filter((w) => w >= 320)
    .map((w) => `${imageUrl(publicId, { ...options, width: w })} ${w}w`)
    .join(", ");
}

/** Tiny blurred preview (≈24px) used as a placeholder while the photo loads. */
export function blurDataUrl(publicId: string): string | undefined {
  if (publicId.startsWith("/") || publicId.startsWith("http")) return undefined;
  return imageUrl(publicId, { width: 24, format: "auto", quality: "auto:low", blur: 400, fit: "scale" });
}

/** 1200 × 630 crop for Open Graph and social previews; always absolute. */
export function ogImageUrl(publicId: string): string {
  if (publicId.startsWith("http://") || publicId.startsWith("https://")) return publicId;
  if (publicId.startsWith("/")) return `${SITE_URL.replace(/\/$/, "")}${publicId}`;
  return imageUrl(publicId, { width: 1200, height: 630, fit: "fill", gravity: "auto", format: "jpg" });
}

export function videoPoster(publicId: string, options: TransformOptions = {}): string {
  const segs = ["f_jpg", "q_auto", "so_1"];
  if (options.width) segs.push(`w_${options.width}`);
  segs.push("c_scale");
  return `${VIDEO_BASE}/${segs.join(",")}/${publicId}`;
}

export function videoUrl(publicId: string, options: { width?: number } = {}): string {
  const segs = ["f_auto", "q_auto"];
  if (options.width) segs.push(`w_${options.width}`);
  return `${VIDEO_BASE}/${segs.join(",")}/${publicId}`;
}

export function isCloudinaryPublicId(value: string): boolean {
  return Boolean(value) && !value.startsWith("/") && !value.startsWith("http://") && !value.startsWith("https://");
}

const UPLOAD_URL = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/(?:image|video)\/upload\/)([^/]+)\/(.+)$/;

/**
 * Rewrites an existing delivery URL to another width, keeping every other
 * transform (crop, gravity, format). Heights scale with the width so the
 * rendered crop never changes shape between breakpoints.
 */
export function cloudinaryResize(src: string, width: number): string {
  const match = UPLOAD_URL.exec(src);
  if (!match) return src;
  const [, base, transform, rest] = match;
  const kept: string[] = [];
  let sourceWidth: number | null = null;
  let sourceHeight: number | null = null;
  for (const part of transform.split(",")) {
    if (/^w_\d+$/.test(part)) sourceWidth = Number(part.slice(2));
    else if (/^h_\d+$/.test(part)) sourceHeight = Number(part.slice(2));
    else kept.push(part);
  }
  const target = sourceWidth ? Math.min(width, sourceWidth) : width;
  kept.push(`w_${target}`);
  if (sourceWidth && sourceHeight) kept.push(`h_${Math.max(1, Math.round((sourceHeight * target) / sourceWidth))}`);
  return `${base}${kept.join(",")}/${rest}`;
}

/** next/image loader: Cloudinary serves the width ladder itself, with f_auto/q_auto. */
export function cloudinaryLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  return cloudinaryResize(src, width);
}

export const LOGO_PUBLIC_ID = "plusmark/plusmark-logo";
export const LOGO_URL = imageUrl(LOGO_PUBLIC_ID, { fit: "scale", width: 320 });
