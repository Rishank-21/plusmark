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
  defaultOpenId,
  normalQuestions = false
}: {
  items: AccordionEntry[];
  defaultOpenId?: string;
  normalQuestions?: boolean;
}) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);
  const baseId = useId();

  return (
    <div className="border-t border-hair">
      {items.map((item) => {
        const open = openId === item.id;
        const panelId = `${baseId}-${item.id}-panel`;
        const buttonId = `${baseId}-${item.id}-button`;
        return (
          <div key={item.id} className="border-b border-hair">
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenId(open ? null : item.id)}
                className="group flex w-full items-center justify-between gap-6 py-5 text-left"
              >
                <span
                  className={classNames(
                    normalQuestions ? "font-sans font-normal text-h4 leading-snug transition-colors sm:text-h3" : "font-display text-h4 leading-snug transition-colors sm:text-h3",
                    open ? "text-blue-deep" : "text-ink group-hover:text-navy-deep"
                  )}
                >
                  {item.question}
                </span>
                <span className="flex shrink-0 items-center gap-4">
                  {item.meta && <span className="pm-eyebrow hidden md:inline">{item.meta}</span>}
                  <span
                    className={classNames(
                      "flex size-8 items-center justify-center rounded-full border transition-colors",
                      open
                        ? "border-brand bg-brand text-white"
                        : "border-hair bg-surface text-navy group-hover:border-brand"
                    )}
                  >
                    {open ? <Minus className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
                  </span>
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!open}
              className="max-w-reading pb-6 pr-0 text-body-sm leading-relaxed text-graphite sm:pr-14"
            >
              {item.answer}
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
    <div className="border-b border-hair">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 py-3 text-left text-body-sm font-medium text-ink"
      >
        {title}
        <ChevronDown className={classNames("size-4 text-graphite transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      <div id={id} hidden={!open} className="pb-4">
        {children}
      </div>
    </div>
  );
}
