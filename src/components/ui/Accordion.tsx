"use client";

import { useId, useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { classNames } from "@/lib/format";

export interface AccordionEntry {
  id: string;
  question: string;
  answer: React.ReactNode;
  meta?: string;
}

export function Accordion({
  items,
  defaultOpenId
}: {
  items: AccordionEntry[];
  defaultOpenId?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;
        return (
          <div key={item.id}>
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex w-full items-center justify-between gap-6 py-4 text-left sm:py-5"
              >
                <span className="font-display text-[0.9375rem] font-semibold leading-snug text-ink sm:text-[1.0625rem]">
                  {item.question}
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  {item.meta && (
                    <span className="hidden text-caption text-muted sm:inline">{item.meta}</span>
                  )}
                  <span className="text-muted transition-colors group-hover:text-ink" aria-hidden>
                    {open ? <Minus className="size-4" /> : <Plus className="size-4" />}
                  </span>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="pb-5 text-body-sm leading-relaxed text-muted sm:pr-12"
            >
              <div className="max-w-reading">{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function Collapsible({
  title,
  defaultOpen = false,
  children
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <div className="border-b border-line">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-3 text-left text-body-sm font-medium text-ink"
      >
        {title}
        <ChevronDown className={classNames("size-4 text-muted transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <div id={id} hidden={!open} className="pb-4">
        {children}
      </div>
    </div>
  );
}
