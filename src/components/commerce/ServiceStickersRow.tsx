"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Headset, MapPin, Package, ReceiptText, Tags, Truck, type LucideIcon } from "lucide-react";

export const SERVICE_STICKERS: { id: string; label: string; icon: LucideIcon }[] = [
  { id: "dispatch", label: "Pan-India dispatch", icon: Truck },
  { id: "pickup", label: "Free Ahmedabad pickup", icon: MapPin },
  { id: "gst", label: "GST invoice with HSN", icon: ReceiptText },
  { id: "single", label: "Order a single board", icon: Package },
  { id: "bulk", label: "Bulk pricing on request", icon: Tags },
  { id: "support", label: "Order desk support", icon: Headset }
];

export function ServiceStickersRow({ variant = "pdp" }: { variant?: "pdp" | "hero-strip" }) {
  const track = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const element = track.current;
    if (!element) return;
    setCanLeft(element.scrollLeft > 4);
    setCanRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 4);
  };

  useEffect(() => {
    if (variant !== "pdp") return;
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [variant]);

  if (variant === "hero-strip") {
    return (
      <section className="border-b border-line bg-surface py-5 sm:py-6" aria-label="Plusmark service guarantees">
        <div className="pm-shell">
          <ul className="grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-6 sm:gap-4">
            {SERVICE_STICKERS.map((service) => {
              const Icon = service.icon;
              return (
                <li key={service.id} className="flex min-w-0 flex-col items-center gap-2 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-ink sm:size-11">
                    <Icon className="size-4 sm:size-[18px]" aria-hidden />
                  </span>
                  <span className="text-[0.75rem] font-medium leading-snug text-ink sm:text-caption">
                    {service.label}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="relative border-t border-line pt-4" aria-label="Plusmark service information">
      <h2 className="pb-3 text-body font-semibold text-ink">Service information</h2>
      <div
        ref={track}
        onScroll={update}
        tabIndex={0}
        role="group"
        aria-label="Service highlights"
        className="grid grid-cols-3 gap-x-2 gap-y-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary lg:flex lg:gap-5 lg:overflow-x-auto lg:pb-1 lg:no-scrollbar"
      >
        {SERVICE_STICKERS.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.id} className="flex min-w-0 flex-col items-center gap-1.5 text-center lg:w-[4.75rem] lg:shrink-0">
              <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-ink">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="text-[0.75rem] leading-snug text-ink">{service.label}</span>
            </div>
          );
        })}
      </div>
      {canLeft && (
        <button
          type="button"
          onClick={() => track.current?.scrollBy({ left: -200, behavior: "smooth" })}
          aria-label="Scroll services left"
          className="absolute -left-2 top-[62%] hidden size-8 -translate-y-1/2 items-center justify-center rounded-md border border-line-strong bg-surface text-ink hover:bg-subtle lg:flex"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
      )}
      {canRight && (
        <button
          type="button"
          onClick={() => track.current?.scrollBy({ left: 200, behavior: "smooth" })}
          aria-label="Scroll services right"
          className="absolute -right-2 top-[62%] hidden size-8 -translate-y-1/2 items-center justify-center rounded-md border border-line-strong bg-surface text-ink hover:bg-subtle lg:flex"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      )}
    </section>
  );
}
