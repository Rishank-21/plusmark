"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play, Share2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { ProductImage } from "@/components/ui/ProductImage";
import { cloudinaryLoader, imageUrl, videoPoster, videoUrl, galleryLoader, zoomLoader, isCloudinaryPublicId } from "@/lib/media";
import { classNames } from "@/lib/format";
import type { Product } from "@/types";

/**
 * Amazon-style gallery: a vertical rail of thumbnails beside a large frame,
 * with a share action above it and a full-view lightbox below. Hovering a
 * thumbnail previews it; clicking or tapping pins it. The frame keeps the
 * existing cursor magnifier on wide screens.
 */
const ZOOM = 2.5;
const LENS = 240;
const LENS_RADIUS = LENS / 2;
const THUMB_LIMIT = 5;

function deliveryProps(publicId: string, loader = galleryLoader) {
  return isCloudinaryPublicId(publicId) ? { loader } : { unoptimized: true as const };
}

export function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number; fx: number; fy: number; w: number; h: number } | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [shareNote, setShareNote] = useState("");

  const media = product.media;
  const current = media[active] ?? media[0] ?? null;
  const visible = showAll ? media : media.slice(0, THUMB_LIMIT);
  const hiddenCount = media.length - visible.length;
  const lightboxAsset = lightboxIndex !== null ? media[lightboxIndex] ?? null : null;

  if (!current) {
    return (
      <ProductImage
        asset={null}
        sizes="100vw"
        name={product.name}
        categoryId={product.categoryId}
        className="aspect-square w-full"
        preset="gallery"
      />
    );
  }

  const trackPointer = (event: React.MouseEvent<HTMLImageElement>) => {
    const img = event.currentTarget;
    const rect = img.getBoundingClientRect();
    const naturalWidth = img.naturalWidth || rect.width;
    const naturalHeight = img.naturalHeight || rect.height;
    const scale = Math.min(rect.width / naturalWidth, rect.height / naturalHeight);
    const drawnWidth = naturalWidth * scale;
    const drawnHeight = naturalHeight * scale;
    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    // Position inside the drawn photo, ignoring the letterbox from object-contain.
    const x = clamp((event.clientX - rect.left - (rect.width - drawnWidth) / 2) / drawnWidth);
    const y = clamp((event.clientY - rect.top - (rect.height - drawnHeight) / 2) / drawnHeight);
    setPointer({
      x,
      y,
      fx: clamp((event.clientX - rect.left) / rect.width),
      fy: clamp((event.clientY - rect.top) / rect.height),
      w: rect.width,
      h: rect.height
    });
    setOrigin(`${x * 100}% ${y * 100}%`);
  };

  const clearPointer = () => {
    setZoomed(false);
    setPointer(null);
  };

  const preview = (index: number) => {
    setActive(index);
    setPlaying(false);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied");
      window.setTimeout(() => setShareNote(""), 2500);
    } catch {
      setShareNote("Copy the address bar to share this page");
    }
  };

  return (
    <div className="flex min-w-0 flex-col gap-3 lg:flex-row lg:items-start lg:gap-4">
      <div
        className={classNames(
          "order-2 flex gap-2 overflow-x-auto pb-1 no-scrollbar lg:order-1 lg:w-16 lg:flex-col lg:overflow-x-visible",
          showAll && "lg:max-h-[34rem] lg:overflow-y-auto"
        )}
        aria-label={`${product.name} media`}
      >
        {visible.map((asset, index) => (
          <button
            key={asset.publicId + index}
            type="button"
            onMouseEnter={() => preview(index)}
            onFocus={() => preview(index)}
            onClick={() => preview(index)}
            aria-current={!playing && index === active}
            aria-label={`Show image ${index + 1} of ${media.length} for ${product.name}`}
            className={classNames(
              "relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm border-2 bg-white transition-colors",
              !playing && index === active ? "border-blue" : "border-hair hover:border-graphite-light"
            )}
          >
            <Image
              src={imageUrl(asset.publicId, { fit: "scale", width: 160 })}
              alt=""
              width={160}
              height={160}
              {...deliveryProps(asset.publicId, cloudinaryLoader)}
              className="size-full object-contain"
            />
          </button>
        ))}

        {product.videoId && (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play the video for ${product.name}`}
            className={classNames(
              "relative aspect-square w-16 shrink-0 overflow-hidden rounded-sm border-2 bg-white transition-colors",
              playing ? "border-blue" : "border-hair hover:border-graphite-light"
            )}
          >
            <Image
              src={videoPoster(product.videoId)}
              alt=""
              width={160}
              height={160}
              {...deliveryProps(product.videoId, cloudinaryLoader)}
              className="absolute inset-0 size-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-navy-deep/20">
              <span className="flex size-6 items-center justify-center rounded-full bg-canvas/95 text-ink">
                <Play className="size-2.5 fill-current" aria-hidden />
              </span>
            </span>
            <span className="absolute inset-x-0 bottom-0 bg-navy-deep/85 py-0.5 text-center text-[0.5625rem] font-semibold uppercase tracking-[0.1em] text-white">
              Video
            </span>
          </button>
        )}

        {!showAll && hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            aria-label={`+${hiddenCount} more images — show all ${media.length} for ${product.name}`}
            className="flex aspect-square w-16 shrink-0 items-center justify-center rounded-sm border-2 border-hair bg-surface text-body-sm font-medium text-ink transition-colors hover:border-graphite-light"
          >
            +{hiddenCount}
          </button>
        )}
      </div>

      <div className="order-1 min-w-0 flex-1 lg:order-2">
        <div className="flex items-center justify-end pb-1.5">
          <span className="sr-only" role="status" aria-live="polite">
            {shareNote}
          </span>
          {shareNote && <span className="pr-2 text-caption text-graphite">{shareNote}</span>}
          <button
            type="button"
            onClick={share}
            aria-label={`Share ${product.name}`}
            className="flex size-11 items-center justify-center rounded-full text-graphite transition-colors hover:bg-sand hover:text-ink lg:size-9"
          >
            <Share2 className="size-4" aria-hidden />
          </button>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-white">
          {playing && product.videoId ? (
            <video
              src={videoUrl(product.videoId)}
              poster={videoPoster(product.videoId, { width: 1200 })}
              controls
              playsInline
              preload="metadata"
              className="aspect-[4/3] w-full bg-navy-deep object-contain"
              aria-label={`Plusmark product video for ${product.name}`}
            />
          ) : (
            <Image
              src={imageUrl(current.publicId, { fit: "limit", width: 1200 })}
              alt={current.alt}
              width={1200}
              height={900}
              priority
              {...deliveryProps(current.publicId)}
              sizes="(max-width: 767px) 100vw, (max-width: 1023px) 48vw, (max-width: 1279px) 52vw, 40vw"
              onMouseEnter={(event) => {
                setZoomed(true);
                trackPointer(event);
              }}
              onMouseLeave={clearPointer}
              onMouseMove={trackPointer}
              onClick={() => setLightboxIndex(active)}
              className={classNames(
                "aspect-[4/3] w-full cursor-zoom-in bg-white object-contain transition-transform duration-300",
                zoomed && "scale-[2] xl:scale-100"
              )}
              style={zoomed ? { transformOrigin: origin } : undefined}
            />
          )}

          {pointer && !playing && (
            <div
              aria-hidden
              className="pointer-events-none absolute z-20 hidden -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full bg-white shadow-[0_18px_45px_-18px_rgb(var(--c-shadow)/0.4)] ring-1 ring-navy/15 xl:block"
              style={{
                width: LENS,
                height: LENS,
                left: `clamp(${LENS_RADIUS}px, ${pointer.fx * 100}%, calc(100% - ${LENS_RADIUS}px))`,
                top: `clamp(${LENS_RADIUS}px, ${pointer.fy * 100}%, calc(100% - ${LENS_RADIUS}px))`
              }}
            >
              <Image
                src={imageUrl(current.publicId, { fit: "limit", width: 2000 })}
                alt=""
                width={2000}
                height={1500}
                {...deliveryProps(current.publicId, zoomLoader)}
                className="absolute max-w-none object-contain"
                style={{
                  // Lay the photo out at the frame's own size, then scale it about
                  // the cursor so the lens shows a true ZOOM× crop of the frame.
                  width: pointer.w,
                  height: pointer.h,
                  left: LENS_RADIUS - pointer.fx * pointer.w,
                  top: LENS_RADIUS - pointer.fy * pointer.h,
                  transform: `scale(${ZOOM})`,
                  transformOrigin: `${pointer.fx * 100}% ${pointer.fy * 100}%`
                }}
              />
            </div>
          )}
        </div>

        <div className="pt-3 text-center">
          <button
            type="button"
            onClick={() => setLightboxIndex(playing ? 0 : active)}
            className="-my-2 inline-flex min-h-11 items-center px-3 text-body-sm text-blue-deep underline-offset-4 hover:underline"
          >
            Click to see full view
          </button>
        </div>
      </div>

      <Modal
        open={lightboxAsset !== null}
        onClose={() => setLightboxIndex(null)}
        title={product.name}
        description={lightboxAsset?.alt}
        size="lg"
      >
        {lightboxAsset && lightboxIndex !== null && (
          <div className="flex flex-col gap-3">
            <div className="relative flex items-center justify-center rounded-md bg-white">
              <Image
                src={imageUrl(lightboxAsset.publicId, { fit: "limit", width: 2000 })}
                alt={lightboxAsset.alt}
                width={2000}
                height={1500}
                {...deliveryProps(lightboxAsset.publicId, zoomLoader)}
                sizes="100vw"
                className="max-h-[64vh] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex - 1 + media.length) % media.length)}
                aria-label="Previous image"
                className="absolute left-0 flex size-11 items-center justify-center rounded-full border border-hair bg-surface/95 text-ink shadow-card hover:bg-sand lg:size-9"
              >
                <ChevronLeft className="size-4" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => setLightboxIndex((lightboxIndex + 1) % media.length)}
                aria-label="Next image"
                className="absolute right-0 flex size-11 items-center justify-center rounded-full border border-hair bg-surface/95 text-ink shadow-card hover:bg-sand lg:size-9"
              >
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
            <div className="flex justify-center gap-2">
              {media.map((asset, index) => (
                <button
                  key={`lightbox-${asset.publicId}-${index}`}
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  aria-label={`Show image ${index + 1} of ${media.length}`}
                  aria-current={index === lightboxIndex}
                  className={classNames(
                    "size-12 overflow-hidden rounded-sm border-2 bg-white",
                    index === lightboxIndex ? "border-blue" : "border-hair hover:border-graphite-light"
                  )}
                >
                  <Image
                    src={imageUrl(asset.publicId, { fit: "scale", width: 96 })}
                    alt=""
                    width={96}
                    height={96}
                    {...deliveryProps(asset.publicId, cloudinaryLoader)}
                    className="size-full object-contain"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
