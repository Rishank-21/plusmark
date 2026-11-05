/**
 * Client-safe Cloudinary settings. Nothing here is secret: the cloud name is
 * public, and the API key/secret stay on the server in /api/media/*.
 */
export const CLOUDINARY_CLOUD_NAME =
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() || "drt0rpkn2";

export const MEDIA_FOLDERS = ["products", "categories", "banners", "videos", "reviews"] as const;
export type MediaFolder = (typeof MEDIA_FOLDERS)[number];

export type MediaKind = "image" | "video";

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const VIDEO_MIME_TYPES = ["video/mp4", "video/webm", "video/quicktime"] as const;

export const IMAGE_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;
export const VIDEO_FORMATS = ["mp4", "webm", "mov"] as const;

export const MEDIA_LIMITS = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024
} as const;

export const MEDIA_LIMIT_LABEL = {
  image: "10 MB",
  video: "100 MB"
} as const;

/** Folders that may hold each resource type. Videos stay in their own folder. */
export const FOLDER_KIND: Record<MediaFolder, MediaKind> = {
  products: "image",
  categories: "image",
  banners: "image",
  reviews: "image",
  videos: "video"
};

export function isMediaFolder(value: string): value is MediaFolder {
  return (MEDIA_FOLDERS as readonly string[]).includes(value);
}

export function mediaLimitLabel(kind: MediaKind): string {
  return MEDIA_LIMIT_LABEL[kind];
}

/**
 * Validates a picked file before any network call. Mirrors the rules the sign
 * route enforces, so the user gets the message without a round trip.
 */
export function validateMediaFile(file: File, kind: MediaKind): string | null {
  const extension = (file.name.split(".").pop() ?? "").toLowerCase();
  const allowedMime: readonly string[] = kind === "image" ? IMAGE_MIME_TYPES : VIDEO_MIME_TYPES;
  const allowedExt: readonly string[] = kind === "image" ? IMAGE_FORMATS : VIDEO_FORMATS;

  if (!allowedMime.includes(file.type)) {
    return kind === "image"
      ? "Use a JPEG, PNG, WebP or AVIF image."
      : "Use an MP4, WebM or MOV video.";
  }
  if (!allowedExt.includes(extension)) {
    return kind === "image"
      ? "That file extension is not an image. Use JPG, PNG, WebP or AVIF."
      : "That file extension is not a video. Use MP4, WebM or MOV.";
  }
  if (file.size > MEDIA_LIMITS[kind]) {
    return `${kind === "image" ? "Images" : "Videos"} must be ${MEDIA_LIMIT_LABEL[kind]} or smaller.`;
  }
  if (file.size === 0) {
    return "That file is empty.";
  }
  return null;
}
