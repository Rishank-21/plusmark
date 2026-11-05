"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Film, ImagePlus, Loader2, RotateCcw, Star, Trash2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/Modal";
import { adminMediaSrc } from "@/components/admin/adminMedia";
import { videoPoster } from "@/lib/media";
import { MEDIA_LIMIT_LABEL, validateMediaFile, type MediaFolder, type MediaKind } from "@/lib/media-config";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export interface MediaItem {
  key: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  source: "product" | "video-poster" | "industry";
}

interface UploadJob {
  key: string;
  file: File | null;
  kind: MediaKind;
  name: string;
  progress: number;
  status: "uploading" | "error";
  error: string | null;
}

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  resource_type: "image" | "video";
  format: string;
  width?: number;
  height?: number;
  bytes: number;
  duration?: number;
}

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 6)}`;
}

async function adminToken(): Promise<string> {
  const client = getSupabaseBrowserClient();
  if (!client) throw new Error("Supabase is not configured.");
  const { data } = await client.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sign in as an administrator to upload media.");
  return token;
}

interface SignedUpload {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  signature: string;
  folder: string;
  allowedFormats: string;
  maxFileSize: number;
  uploadPreset?: string;
  error?: string;
}

async function signUpload(folder: MediaFolder, resourceType: MediaKind): Promise<SignedUpload> {
  const token = await adminToken();
  const response = await fetch("/api/media/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ folder, resourceType })
  });
  const payload = (await response.json().catch(() => null)) as SignedUpload | null;
  if (!response.ok || !payload?.uploadUrl || !payload.signature) {
    throw new Error(payload?.error || "The upload could not be authorised.");
  }
  return payload;
}

/** Uploads one file straight to Cloudinary with XHR so progress and cancel work. */
function uploadToCloudinary(
  file: File,
  folder: MediaFolder,
  kind: MediaKind,
  onProgress: (percent: number) => void,
  signal: AbortSignal
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    void (async () => {
      try {
        const signed = await signUpload(folder, kind);
        if (signal.aborted) {
          reject(new DOMException("Upload cancelled", "AbortError"));
          return;
        }

        const form = new FormData();
        form.append("file", file);
        form.append("api_key", signed.apiKey);
        form.append("timestamp", String(signed.timestamp));
        form.append("signature", signed.signature);
        form.append("folder", signed.folder);
        form.append("allowed_formats", signed.allowedFormats);
        form.append("max_file_size", String(signed.maxFileSize));
        if (signed.uploadPreset) form.append("upload_preset", signed.uploadPreset);

        const xhr = new XMLHttpRequest();
        const cancel = () => xhr.abort();
        signal.addEventListener("abort", cancel, { once: true });

        xhr.open("POST", signed.uploadUrl);
        xhr.upload.addEventListener("progress", (event) => {
          if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
        });
        xhr.addEventListener("load", () => {
          signal.removeEventListener("abort", cancel);
          const payload = (() => {
            try {
              return JSON.parse(xhr.responseText) as CloudinaryUploadResult & { error?: { message?: string } };
            } catch {
              return null;
            }
          })();
          if (xhr.status >= 200 && xhr.status < 300 && payload && "public_id" in payload) {
            onProgress(100);
            resolve(payload);
            return;
          }
          reject(new Error(payload?.error?.message || "Cloudinary rejected the upload."));
        });
        xhr.addEventListener("error", () => reject(new Error("The upload could not reach Cloudinary.")));
        xhr.addEventListener("abort", () => reject(new DOMException("Upload cancelled", "AbortError")));
        xhr.send(form);
      } catch (error) {
        reject(error);
      }
    })();
  });
}

async function recordMedia(result: CloudinaryUploadResult, alt: string): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (!client) return;
  const { data } = await client.auth.getUser();
  const { error } = await client.from("media").insert({
    public_id: result.public_id,
    url: result.secure_url,
    resource_type: result.resource_type,
    format: result.format ?? null,
    width: result.width ?? null,
    height: result.height ?? null,
    bytes: typeof result.bytes === "number" ? result.bytes : null,
    duration: typeof result.duration === "number" ? result.duration : null,
    alt_text: alt,
    created_by: data.user?.id ?? null
  });
  /* PGRST205/42P01 = the media table has not been migrated yet. The product row
     still stores the public id, so the file is not orphaned; surface it later. */
  if (error && !["42P01", "PGRST205"].includes(error.code ?? "")) {
    throw new Error(error.message);
  }
}

async function deleteRemote(publicId: string, resourceType: MediaKind): Promise<string[]> {
  const token = await adminToken();
  const response = await fetch("/api/media/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ publicId, resourceType })
  });
  const payload = (await response.json().catch(() => null)) as { error?: string; warnings?: string[] } | null;
  if (!response.ok) throw new Error(payload?.error || "The file could not be deleted.");
  return payload?.warnings ?? [];
}

export function MediaUploader({
  items,
  onChange,
  folder = "products",
  disabled = false,
  onError,
  maxItems = Infinity,
  noun = "product",
  showAlt = true
}: {
  items: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  folder?: MediaFolder;
  disabled?: boolean;
  onError?: (message: string | null) => void;
  /** 1 = a single replaceable image (category tile, hero); unlimited for products. */
  maxItems?: number;
  noun?: string;
  /** Off when the record keeps its alt text in a separate field. */
  showAlt?: boolean;
}) {
  const [jobs, setJobs] = useState<UploadJob[]>([]);
  const [dragging, setDragging] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MediaItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const controllers = useRef(new Map<string, AbortController>());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const updateJob = (key: string, patch: Partial<UploadJob>) => {
    setJobs((current) => current.map((job) => (job.key === key ? { ...job, ...patch } : job)));
  };

  const runJob = async (job: UploadJob) => {
    if (!job.file) return;
    const controller = new AbortController();
    controllers.current.set(job.key, controller);
    updateJob(job.key, { status: "uploading", progress: 0, error: null });
    onError?.(null);
    try {
      const result = await uploadToCloudinary(
        job.file,
        folder,
        job.kind,
        (progress) => updateJob(job.key, { progress }),
        controller.signal
      );
      await recordMedia(result, "");
      const next = [
        ...itemsRef.current,
        {
          key: `m_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          publicId: result.public_id,
          alt: "",
          width: result.width ?? 1200,
          height: result.height ?? 900,
          source: "product" as const
        }
      ];
      itemsRef.current = next;
      onChange(next);
      setJobs((current) => current.filter((entry) => entry.key !== job.key));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      const message = error instanceof Error ? error.message : "The upload failed.";
      updateJob(job.key, { status: "error", error: message });
      onError?.(message);
    } finally {
      controllers.current.delete(job.key);
    }
  };

  const acceptFiles = (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files).slice(0, Math.max(0, maxItems - itemsRef.current.length));
    for (const file of list) {
      const message = validateMediaFile(file, "image");
      if (message) {
        onError?.(message);
        continue;
      }
      const job: UploadJob = {
        key: fileKey(file),
        file,
        kind: "image",
        name: file.name,
        progress: 0,
        status: "uploading",
        error: null
      };
      setJobs((current) => [...current, job]);
      void runJob(job);
    }
  };

  const cancel = (key: string) => {
    controllers.current.get(key)?.abort();
    controllers.current.delete(key);
    setJobs((current) => current.filter((job) => job.key !== key));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const setPrimary = (index: number) => {
    if (index === 0) return;
    const next = [...items];
    const [chosen] = next.splice(index, 1);
    onChange([chosen, ...next]);
  };

  const remove = async (item: MediaItem) => {
    setDeleting(true);
    onError?.(null);
    try {
      if (!item.publicId.startsWith("/")) {
        const warnings = await deleteRemote(item.publicId, "image");
        if (warnings.length) onError?.(warnings[0]);
      }
      onChange(items.filter((entry) => entry.key !== item.key));
      setPendingDelete(null);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "The image could not be deleted.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {items.length < maxItems && (
      <div
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          if (!disabled) acceptFiles(event.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center gap-2 rounded-sm border border-dashed px-4 py-6 text-center transition-colors ${
          dragging ? "border-blue bg-blue/5" : "border-hair-strong bg-sand/20"
        }`}
      >
        <UploadCloud className="size-5 text-graphite" aria-hidden />
        <p className="text-body-sm text-ink">Drag photos here, or</p>
        <label
          className={`inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-xs border border-hair-strong px-3 text-caption font-medium text-ink transition-colors hover:border-ink hover:bg-sand/60 ${
            disabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <ImagePlus className="size-4" aria-hidden />
          Choose images
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              acceptFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        <p className="text-caption text-graphite">JPEG, PNG, WebP or AVIF · up to {MEDIA_LIMIT_LABEL.image} each</p>
      </div>
      )}

      {jobs.length > 0 && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {jobs.map((job) => (
            <li key={job.key} className="rounded-xs border border-hair bg-surface p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="min-w-0 truncate text-caption text-ink">{job.name}</p>
                <div className="flex items-center gap-1">
                  {job.status === "error" ? (
                    <button
                      type="button"
                      onClick={() => void runJob(job)}
                      className="flex h-8 items-center gap-1 rounded-xs px-2 text-caption text-ink hover:bg-sand"
                      aria-label={`Retry ${job.name}`}
                    >
                      <RotateCcw className="size-3.5" aria-hidden /> Retry
                    </button>
                  ) : (
                    <Loader2 className="size-4 animate-spin text-graphite" aria-hidden />
                  )}
                  <button
                    type="button"
                    onClick={() => cancel(job.key)}
                    className="flex size-8 items-center justify-center rounded-xs text-graphite hover:bg-sand hover:text-ink"
                    aria-label={`Cancel ${job.name}`}
                  >
                    <X className="size-4" aria-hidden />
                  </button>
                </div>
              </div>
              {job.status === "error" ? (
                <p className="mt-1 text-caption text-danger">{job.error}</p>
              ) : (
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-hair"
                  role="progressbar"
                  aria-valuenow={job.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Uploading ${job.name}`}
                >
                  <div className="h-full bg-blue transition-[width]" style={{ width: `${job.progress}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {items.length === 0 ? (
        <p className="rounded-xs border border-dashed border-hair-strong px-4 py-8 text-center text-body-sm text-graphite">
          {maxItems === 1
            ? `No image yet. Upload a real Plusmark photograph for this ${noun}.`
            : "No photographs yet. A draft can be saved without one; publishing needs at least one described image."}
        </p>
      ) : (
        <ol className="flex flex-col gap-3">
          {items.map((item, index) => (
            <li key={item.key} className="flex flex-col gap-3 rounded-sm border border-hair bg-sand/25 p-3 sm:flex-row sm:items-start">
              <div className="relative size-20 shrink-0 overflow-hidden rounded-xs border border-hair bg-surface">
                <Image
                  src={adminMediaSrc(item.publicId, 160)}
                  alt={item.alt || `Product image ${index + 1} preview`}
                  width={80}
                  height={80}
                  unoptimized
                  className="size-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-0 top-0 inline-flex items-center gap-0.5 bg-blue px-1 py-0.5 text-[0.5625rem] font-semibold uppercase tracking-wide text-white">
                    <Star className="size-2.5 fill-current" aria-hidden /> Primary
                  </span>
                )}
              </div>
              <div className="flex min-w-0 grow flex-col gap-2">
                <p className="break-all text-caption text-graphite">{item.publicId}</p>
                {showAlt && (
                <TextField
                  label={`Image description ${index + 1}`}
                  value={item.alt}
                  onChange={(event) => {
                    const next = [...items];
                    next[index] = { ...item, alt: event.target.value };
                    onChange(next);
                  }}
                  placeholder="Metallic Premium white board, 4 x 3 ft, with aluminium frame"
                />
                )}
              </div>
              <div className="flex shrink-0 flex-wrap gap-1">
                {maxItems > 1 && (
                  <>
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0}
                  className="flex size-11 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
                  aria-label={`Move image ${index + 1} earlier`}
                >
                  <ArrowUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === items.length - 1}
                  className="flex size-11 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
                  aria-label={`Move image ${index + 1} later`}
                >
                  <ArrowDown className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setPrimary(index)}
                  disabled={index === 0}
                  className="flex size-11 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-ink hover:text-ink disabled:opacity-30"
                  aria-label={`Set image ${index + 1} as primary`}
                >
                  <Star className="size-4" aria-hidden />
                </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={() => setPendingDelete(item)}
                  className="flex size-11 items-center justify-center rounded-xs border border-hair-strong text-graphite transition-colors hover:border-danger hover:text-danger"
                  aria-label={`Delete image ${index + 1}`}
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) void remove(pendingDelete);
        }}
        title="Delete this image?"
        body={`The file is removed from Cloudinary and from this ${noun}. This cannot be undone.`}
        confirmLabel={deleting ? "Deleting…" : "Delete image"}
        destructive
      />
    </div>
  );
}

export function VideoUploader({
  videoId,
  onChange,
  onError,
  disabled = false
}: {
  videoId: string;
  onChange: (publicId: string) => void;
  onError?: (message: string | null) => void;
  disabled?: boolean;
}) {
  const [job, setJob] = useState<UploadJob | null>(null);
  const [pendingDelete, setPendingDelete] = useState(false);
  const controller = useRef<AbortController | null>(null);

  const accept = async (file: File | null) => {
    if (!file) return;
    const message = validateMediaFile(file, "video");
    if (message) {
      onError?.(message);
      return;
    }
    const next: UploadJob = {
      key: fileKey(file),
      file,
      kind: "video",
      name: file.name,
      progress: 0,
      status: "uploading",
      error: null
    };
    setJob(next);
    onError?.(null);
    const abort = new AbortController();
    controller.current = abort;
    try {
      const result = await uploadToCloudinary(file, "videos", "video", (progress) => setJob((current) => (current ? { ...current, progress } : current)), abort.signal);
      await recordMedia(result, "");
      onChange(result.public_id);
      setJob(null);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setJob(null);
        return;
      }
      const text = error instanceof Error ? error.message : "The video upload failed.";
      setJob((current) => (current ? { ...current, status: "error", error: text } : current));
      onError?.(text);
    } finally {
      controller.current = null;
    }
  };

  const remove = async () => {
    if (!videoId) return;
    try {
      await deleteRemote(videoId, "video");
      onChange("");
      setPendingDelete(false);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "The video could not be deleted.");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {videoId ? (
        <div className="flex flex-col gap-3 rounded-sm border border-hair bg-sand/25 p-3 sm:flex-row sm:items-center">
          <Image
            src={videoPoster(videoId, { width: 240 })}
            alt="Video preview"
            width={96}
            height={72}
            unoptimized
            className="h-[72px] w-24 rounded-xs border border-hair bg-surface object-cover"
          />
          <div className="min-w-0 grow">
            <p className="flex items-center gap-1.5 text-caption font-medium text-ink">
              <Film className="size-3.5" aria-hidden /> Product video
            </p>
            <p className="break-all text-caption text-graphite">{videoId}</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => setPendingDelete(true)}>
            Remove
          </Button>
        </div>
      ) : null}

      {job ? (
        <div className="rounded-xs border border-hair bg-surface p-3">
          <div className="flex items-center justify-between gap-3">
            <p className="min-w-0 truncate text-caption text-ink">{job.name}</p>
            <div className="flex items-center gap-1">
              {job.status === "error" ? (
                <button
                  type="button"
                  onClick={() => void accept(job.file)}
                  className="flex h-8 items-center gap-1 rounded-xs px-2 text-caption text-ink hover:bg-sand"
                >
                  <RotateCcw className="size-3.5" aria-hidden /> Retry
                </button>
              ) : (
                <Loader2 className="size-4 animate-spin text-graphite" aria-hidden />
              )}
              <button
                type="button"
                onClick={() => {
                  controller.current?.abort();
                  setJob(null);
                }}
                className="flex size-8 items-center justify-center rounded-xs text-graphite hover:bg-sand hover:text-ink"
                aria-label={`Cancel ${job.name}`}
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          </div>
          {job.status === "error" ? (
            <p className="mt-1 text-caption text-danger">{job.error}</p>
          ) : (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-hair" role="progressbar" aria-valuenow={job.progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full bg-blue transition-[width]" style={{ width: `${job.progress}%` }} />
            </div>
          )}
        </div>
      ) : (
        <label
          className={`inline-flex h-11 w-fit cursor-pointer items-center gap-1.5 rounded-xs border border-hair-strong px-3 text-caption font-medium text-ink transition-colors hover:border-ink hover:bg-sand/60 ${
            disabled ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <Film className="size-4" aria-hidden />
          {videoId ? "Replace video" : "Upload video"}
          <input
            type="file"
            accept="video/mp4,video/webm,video/quicktime"
            className="sr-only"
            disabled={disabled}
            onChange={(event) => {
              void accept(event.target.files?.[0] ?? null);
              event.target.value = "";
            }}
          />
        </label>
      )}
      <p className="text-caption text-graphite">MP4, WebM or MOV · up to {MEDIA_LIMIT_LABEL.video}</p>

      <ConfirmDialog
        open={pendingDelete}
        onClose={() => setPendingDelete(false)}
        onConfirm={() => void remove()}
        title="Delete this video?"
        body="The file is removed from Cloudinary and from this product. This cannot be undone."
        confirmLabel="Delete video"
        destructive
      />
    </div>
  );
}
