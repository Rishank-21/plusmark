"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { classNames } from "@/lib/format";

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  hideScrollbars = false
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  hideScrollbars?: boolean;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab" && panel.current) {
        const focusables = panel.current.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const target = panel.current?.querySelector<HTMLElement>("button, input, select, textarea, a[href]");
    target?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const width = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-3xl" : "max-w-lg";

  return createPortal(
    <div className="fixed inset-0 z-[900] flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-navy-deep/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pm-modal-title"
        className={classNames(
          "relative flex w-full flex-col gap-4 rounded-t-md bg-canvas p-5 shadow-lift animate-slide-up sm:rounded-md sm:animate-fade-up sm:p-6",
          width
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="pm-modal-title" className="font-display text-h3 leading-tight">
              {title}
            </h2>
            {description && <p className="text-body-sm text-graphite">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="-m-1 rounded-xs p-1 text-graphite transition-colors hover:bg-sand hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div
          className={classNames(
            "max-h-[60vh] min-w-0 overflow-x-hidden overflow-y-auto pr-0.5",
            hideScrollbars && "modal-scrollbar-hidden"
          )}
        >
          {children}
        </div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-hair pt-4">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Confirm",
  destructive = false
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  destructive?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xs border border-hair-strong px-4 text-body-sm font-medium text-ink transition-colors hover:bg-sand"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={classNames(
              "h-10 rounded-xs px-4 text-body-sm font-medium transition-colors",
              destructive ? "bg-danger text-white hover:bg-danger/90" : "bg-blue text-white hover:bg-blue-deep"
            )}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-body-sm leading-relaxed text-graphite">{body}</p>
    </Modal>
  );
}
