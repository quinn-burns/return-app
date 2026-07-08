"use client";

import { useEffect } from "react";

function useOverlay(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
}

/** Right-aligned slide-over panel on a dimmed backdrop. */
export function Sheet({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative m-2 w-full max-w-[1000px] overflow-y-auto overscroll-contain rounded-2xl bg-neutral-50 shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}

/** Centered modal dialog on a dimmed backdrop. */
export function Modal({
  open,
  onClose,
  label,
  children,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
}) {
  useOverlay(open, onClose);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="relative max-h-[92vh] w-full max-w-[649px] overflow-y-auto overscroll-contain rounded-2xl bg-white shadow-2xl"
      >
        {children}
      </div>
    </div>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label="Back"
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white transition-colors hover:bg-neutral-100"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M19 12H5m0 0l6-6m-6 6l6 6"
          stroke="#212121"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function SheetHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Share"
        className="flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white transition-colors hover:bg-neutral-100"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/overview/ios-share.svg" alt="" className="size-5" />
      </button>
      <button
        type="button"
        aria-label="More options"
        className="flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white transition-colors hover:bg-neutral-100"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="5" r="1.6" fill="#212121" />
          <circle cx="12" cy="12" r="1.6" fill="#212121" />
          <circle cx="12" cy="19" r="1.6" fill="#212121" />
        </svg>
      </button>
    </div>
  );
}
