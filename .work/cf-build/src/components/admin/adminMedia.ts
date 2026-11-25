import { imageUrl } from "@/lib/media";

/** Media ids in the catalogue are Cloudinary ids or local paths; uploads are absolute Storage URLs. */
export function adminMediaSrc(publicId: string, width = 320): string {
  if (publicId.startsWith("http://") || publicId.startsWith("https://") || publicId.startsWith("/")) return publicId;
  return imageUrl(publicId, { fit: "fill", width, height: width });
}
