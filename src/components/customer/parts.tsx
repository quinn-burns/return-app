"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useActionModal } from "./ActionSubmit";

/** Reveal once when scrolled into view; resets on unmount (leave + return). */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;
    if (typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [shown]);
  return { ref, shown };
}

// Chart fill colors — official Fuego Returnalyze palette (Figma node 1415:45).
export const CHART = {
  blue: "#4169e1", // primary-600
  green: "#059467", // success-600
  amber: "#f59f0a", // warning-500
  red: "#dc2828", // error-600
  sky: "#1d97ff", // brand
  teal: "#27cba7", // brand
  grey: "#ababab", // neutral-400
  track: "#dedede", // neutral-200 (bar/donut track)
} as const;

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      data-reveal={shown ? "in" : "out"}
      className={`rounded-lg border border-neutral-200 bg-neutral-0 p-4 ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-neutral-800">{title}</h2>
        {subtitle ? <p className="text-xs text-neutral-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** AI-generated insight callout, matching the Overview "AI Returns Summary" card. */
export function AiInsight({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
      <div className="flex items-center gap-1.5">
        <span className="flex items-center justify-center rounded-full bg-gradient-to-b from-[#27cba7] to-[#0b61dd] p-[3.5px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overview/ai-logo.svg" alt="" className="size-[17px]" />
        </span>
        <h2 className="text-xl font-semibold text-primary-700">AI Insight</h2>
      </div>
      <p className="mt-1.5 w-full text-sm leading-5 text-neutral-700">{children}</p>
    </div>
  );
}

export function TakeAction({ context, department }: { context: string; department: string }) {
  const { open } = useActionModal();
  return (
    <button
      type="button"
      onClick={() => open({ context, department })}
      className="inline-flex items-center gap-1 whitespace-nowrap rounded-lg border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:border-primary-400 hover:bg-primary-100"
    >
      Take action
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M5 12h14M13 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function InsightLink({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-medium text-primary-600 hover:text-primary-700"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 18h6M10 21h4M12 3a6 6 0 00-3.5 10.9c.5.4.8.9.9 1.6h5.2c.1-.7.4-1.2.9-1.6A6 6 0 0012 3z"
          stroke="#4169e1"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label} →
    </button>
  );
}

export function ExportButton() {
  return (
    <button
      type="button"
      className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M12 15V4m0 0L8 8m4-4l4 4M5 20h14"
          stroke="#4169e1"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      Export
    </button>
  );
}

/** Donut over a grey track. Segment `pct` values are percentages of 100. */
export function Donut({
  segments,
  centerTop,
  centerBottom,
  size = 130,
}: {
  segments: { label: string; pct: number; color: string }[];
  centerTop: string;
  centerBottom: string;
  size?: number;
}) {
  const c = 2 * Math.PI * 40;
  const arcs = segments.map((seg, i) => ({
    ...seg,
    dash: (seg.pct / 100) * c,
    offset: segments.slice(0, i).reduce((s, x) => s + (x.pct / 100) * c, 0),
  }));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="size-full -rotate-90">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#dedede" strokeWidth="12" />
        {arcs.map((seg) => (
          <circle
            key={seg.label}
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={seg.color}
            strokeWidth="12"
            strokeDasharray={`${seg.dash} ${c - seg.dash}`}
            strokeDashoffset={-seg.offset}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold text-neutral-800">{centerTop}</span>
        <span className="text-[10px] text-neutral-500">{centerBottom}</span>
      </div>
    </div>
  );
}

const COLS: Record<number, string> = {
  4: "sm:grid-cols-2 lg:grid-cols-4",
  5: "sm:grid-cols-3 lg:grid-cols-5",
  6: "sm:grid-cols-3 lg:grid-cols-6",
};

/** Bordered KPI strip: label + value (+ optional sub-label). */
export function KpiStrip({
  items,
  cols = 5,
}: {
  items: { label: string; sub?: string; value: string }[];
  cols?: 4 | 5 | 6;
}) {
  return (
    <div className={`grid grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-0 ${COLS[cols]}`}>
      {items.map((kpi) => (
        <div key={kpi.label} className="flex flex-col gap-1 p-4">
          <p className="text-xs text-neutral-500">
            {kpi.label}
            {kpi.sub ? <span className="block text-[10px] text-neutral-400">{kpi.sub}</span> : null}
          </p>
          <p className="text-[26px] font-bold leading-[32px] text-neutral-800">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}
