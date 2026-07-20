"use client";

import * as Toast from "@radix-ui/react-toast";
import { createContext, useContext, useState, type ReactNode } from "react";

const ExportToastContext = createContext<(() => void) | null>(null);

/** Returns a function that pops the "export started" toast. No-op outside the provider. */
export function useExportToast() {
  return useContext(ExportToastContext) ?? (() => {});
}

/**
 * Wraps content in a Radix Toast provider and renders a top-right toast that
 * confirms an export was triggered. Nothing is actually exported.
 */
export function ExportToastProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  // Re-key the toast on each click so the enter animation replays.
  const [count, setCount] = useState(0);
  const show = () => {
    setCount((c) => c + 1);
    setOpen(true);
  };

  return (
    <Toast.Provider swipeDirection="right" duration={3500}>
      <ExportToastContext.Provider value={show}>{children}</ExportToastContext.Provider>

      <Toast.Root
        key={count}
        open={open}
        onOpenChange={setOpen}
        className="toast-root flex items-start gap-3 rounded-lg border border-neutral-200 bg-neutral-0 p-4 shadow-[0px_8px_40px_rgba(0,0,51,0.12)]"
      >
        <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-600">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path
              d="M2.5 6.2l2.3 2.3L9.5 3.5"
              stroke="#fff"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <Toast.Title className="text-sm font-semibold text-neutral-800">
            Export started
          </Toast.Title>
          <Toast.Description className="text-xs leading-4 text-neutral-600">
            Your segment list is being prepared and will download shortly.
          </Toast.Description>
        </div>
        <Toast.Close
          aria-label="Close"
          className="shrink-0 text-neutral-400 transition-colors hover:text-neutral-600"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </Toast.Close>
      </Toast.Root>

      <Toast.Viewport className="fixed right-4 top-4 z-[100] m-0 flex w-[360px] max-w-[calc(100vw-2rem)] list-none flex-col gap-2 p-0 outline-none" />
    </Toast.Provider>
  );
}
