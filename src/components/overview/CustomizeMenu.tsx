"use client";

import { useEffect, useRef, useState } from "react";

/* Segmented A/B toggle from the design system (Buttons-Toggle-AB). */
function ToggleAB({
  options,
  value,
  onChange,
}: {
  options: [string, string];
  value: number;
  onChange: (i: number) => void;
}) {
  return (
    <div className="flex items-center">
      {options.map((label, i) => {
        const active = i === value;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(i)}
            className={[
              "border px-4 py-2 text-xs font-medium transition-colors",
              i === 0 ? "rounded-l" : "-ml-px rounded-r",
              active
                ? "z-10 border-primary-600 bg-primary-500 text-white"
                : "border-primary-500 bg-white text-primary-500 hover:bg-primary-50",
            ].join(" ")}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function InfoDot() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src="/overview/info.svg" alt="" className="size-4" />
  );
}

const ROWS: { label: string; options: [string, string]; initial: number }[] = [
  { label: "Order Selection", options: ["Order Date", "Ship Date"], initial: 0 },
  { label: "Returns Selection", options: ["Return Date", "Orders"], initial: 1 },
  { label: "Display Units", options: ["By volume (v)", "By currency ($)"], initial: 0 },
];

export default function CustomizeMenu() {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(ROWS.map((r) => r.initial));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Customize dashboard"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={[
          "flex size-10 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 transition-colors",
          open ? "bg-neutral-50" : "bg-neutral-0 hover:bg-neutral-50",
        ].join(" ")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/overview/dashboard-customize.svg" alt="" className="size-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-50 mt-2 flex w-[267px] max-w-[calc(100vw-2rem)] flex-col gap-4 rounded-lg border border-neutral-150 bg-neutral-0 p-4 shadow-[0px_4px_20px_7px_rgba(0,0,0,0.07)]"
        >
          {ROWS.map((row, i) => (
            <div key={row.label} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-neutral-600">{row.label}</span>
                <InfoDot />
              </div>
              <ToggleAB
                options={row.options}
                value={values[i]}
                onChange={(v) =>
                  setValues((prev) => prev.map((p, idx) => (idx === i ? v : p)))
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
