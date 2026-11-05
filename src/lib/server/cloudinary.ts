import { createHash } from "node:crypto";
import {
  CLOUDINARY_CLOUD_NAME,
  FOLDER_KIND,
  MEDIA_LIMITS,
  type MediaFolder,
  type MediaKind
} from "@/lib/media-config";

interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  baseFolder: string;
  enabled: boolean;
}

export function cloudinaryConfig(): CloudinaryConfig {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME || CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
  const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";
  const baseFolder = (process.env.CLOUDINARY_BASE_FOLDER || "plusmark").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  return {
    cloudName,
    apiKey,
    apiSecret,
    baseFolder,
    enabled: Boolean(cloudName && apiKey && apiSecret)
  };
}

export function cloudinaryFolder(folder: MediaFolder): string {
  return `${cloudinaryConfig().baseFolder}/${folder}`;
}

/** Cloudinary signs the alphabetically sorted parameter string with SHA-1. */
export function cloudinarySignature(params: Record<string, string | number>, secret: string): string {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(`${payload}${secret}`).digest("hex");
}

export interface SignRequest {
  folder: MediaFolder;
  resourceType: MediaKind;
  timestamp: number;
}

export interface SignResult {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
  allowedFormats: string;
  maxFileSize: number;
  resourceType: MediaKind;
  uploadUrl: string;
  uploadPreset?: string;
}

export function signUpload({ folder, resourceType, timestamp }: SignRequest): SignResult {
  const config = cloudinaryConfig();
  if (!config.enabled) throw new Error("Cloudinary is not configured on this deployment.");

  const targetFolder = `${config.baseFolder}/${folder}`;
  const allowedFormats = resourceType === "image" ? "jpg,jpeg,png,webp,avif" : "mp4,webm,mov";
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();
  /* Cloudinary validates max_file_size itself and drops it from the signed
     string, so signing it here would make every signature invalid. */
  const params: Record<string, string | number> = {
    allowed_formats: allowedFormats,
    folder: targetFolder,
    timestamp
  };
  if (uploadPreset) params.upload_preset = uploadPreset;

  return {
    cloudName: config.cloudName,
    apiKey: config.apiKey,
    timestamp,
    folder: targetFolder,
    signature: cloudinarySignature(params, config.apiSecret),
    allowedFormats,
    maxFileSize: MEDIA_LIMITS[resourceType],
    resourceType,
    uploadUrl: `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`,
    ...(uploadPreset ? { uploadPreset } : {})
  };
}

export interface DestroyResult {
  result: string;
}

/** Deletes one asset. `invalidate` clears the CDN copy too. */
export async function destroyAsset(publicId: string, resourceType: MediaKind): Promise<DestroyResult> {
  const config = cloudinaryConfig();
  if (!config.enabled) throw new Error("Cloudinary is not configured on this deployment.");

  const timestamp = Math.floor(Date.now() / 1000);
  const params = { invalidate: "true", public_id: publicId, timestamp };
  const body = new URLSearchParams({
    public_id: publicId,
    invalidate: "true",
    timestamp: String(timestamp),
    api_key: config.apiKey,
    signature: cloudinarySignature(params, config.apiSecret)
  });

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/destroy`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store"
    }
  );

  const payload = (await response.json().catch(() => null)) as { result?: string; error?: { message?: string } } | null;
  if (!response.ok) {
    throw new Error(payload?.error?.message || "Cloudinary rejected the delete request.");
  }
  return { result: payload?.result ?? "unknown" };
}

export function expectedKind(folder: MediaFolder): MediaKind {
  return FOLDER_KIND[folder];
}
