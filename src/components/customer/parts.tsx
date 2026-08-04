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

/** `id` makes a card a deep-link target for the Overview tab's "See the data". */
export function Card({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const { ref, shown } = useReveal<HTMLElement>();
  return (
    <section
      ref={ref}
      id={id}
      data-reveal={shown ? "in" : "out"}
      className={`scroll-mt-6 rounded-lg border border-neutral-200 bg-neutral-0 p-4 ${className}`}
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
        <h2 className="text-balance text-base font-semibold leading-snug text-neutral-800">{title}</h2>
        {subtitle ? <p className="text-xs leading-snug text-neutral-600">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

/** Thumb icon for the "Was this helpful?" affordance (down = rotated). */
function Thumb({ down = false }: { down?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={down ? { transform: "rotate(180deg)" } : undefined}
    >
      <path
        d="M7 10v12M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** AI insight card: white card, blue-titled header, the read in a left-accent
    tinted row, and a "Was this helpful?" footer. */
export function AiInsight({
  title = "AI Insight",
  subtitle,
  footer,
  items,
  children,
}: {
  title?: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  /** Multiple insight rows, each a bold lead + an explaining line. */
  items?: { lead: ReactNode; text: ReactNode }[];
  children?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
      <div className="flex items-center gap-1.5">
        <span className="flex items-center justify-center rounded-full bg-gradient-to-b from-[#27cba7] to-[#0b61dd] p-[3.5px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overview/ai-logo.svg" alt="" className="size-[17px]" />
        </span>
        <h2 className="text-xl font-semibold text-primary-700">{title}</h2>
      </div>
      {subtitle ? <p className="mt-1 text-xs text-neutral-600">{subtitle}</p> : null}
      {items ? (
        <div className="mt-3 flex flex-col gap-1.5">
          {items.map((it, i) => (
            <div
              key={i}
              className="rounded-r-md border-l-[3px] border-primary-600 bg-primary-50 px-3 py-2"
            >
              <p className="text-[13px] font-semibold leading-snug text-neutral-800">{it.lead}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-neutral-600">{it.text}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-3 rounded-r-md border-l-[3px] border-primary-600 bg-primary-50 px-3 py-2.5">
          <p className="w-full text-sm leading-relaxed text-neutral-700">{children}</p>
        </div>
      )}
      {footer ? <div className="mt-3">{footer}</div> : null}
      <div className="mt-3 flex items-center justify-center gap-2.5 text-xs text-neutral-600">
        Was this helpful?
        <button type="button" aria-label="Not helpful" className="text-danger-600 transition-colors hover:text-danger-700">
          <Thumb down />
        </button>
        <button type="button" aria-label="Helpful" className="text-success-600 transition-colors hover:text-success-700">
          <Thumb />
        </button>
      </div>
    </div>
  );
}

/** Titled wrapper for a page's headline metrics — "Key Performance Metrics"
    over the metric-card grid, matching the design. */
export function MetricsCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
      <div className="flex items-center gap-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M3 3v18h18M8 17V9m5 8V5m5 12v-6"
            stroke="#4169e1"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h2 className="text-base font-semibold text-neutral-800">Key Performance Metrics</h2>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

/* --------------------------- pagination -------------------------- */

/** Slices rows for the current page and keeps the page in range. */
export function usePaged<T>(rows: T[], pageSize: number) {
  const [page, setPage] = useState(0);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const current = Math.min(page, pageCount - 1);
  return {
    slice: rows.slice(current * pageSize, current * pageSize + pageSize),
    page: current,
    setPage,
    total: rows.length,
    pageSize,
  };
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const last = Math.max(0, Math.ceil(total / pageSize) - 1);
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min((page + 1) * pageSize, total);
  const arrow =
    "flex size-7 items-center justify-center rounded text-neutral-600 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-300 disabled:hover:bg-transparent";
  return (
    <div className="mt-3 flex items-center justify-end gap-3 text-xs text-neutral-600">
      <span>
        {start}-{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Previous page"
          disabled={page <= 0}
          onClick={() => onChange(page - 1)}
          className={arrow}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Next page"
          disabled={page >= last}
          onClick={() => onChange(page + 1)}
          className={arrow}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function TakeAction({ context, department }: { context: string; department: string }) {
  const { open } = useActionModal();
  return (
    <button
      type="button"
      onClick={() => open({ context, department })}
      className="inline-flex items-center whitespace-nowrap rounded-lg bg-primary-600 px-3.5 py-1.5 text-xs font-medium text-neutral-0 transition-colors hover:bg-primary-700"
    >
      Create Action
    </button>
  );
}

/** A curated "Recommended actions" block, shared by the detail tabs. Each item
    is a plain-language recommendation with a tone, a why, its modeled impact,
    and a Take action CTA that opens the same action flow the tables use. */
export type RecTone = "good" | "warn" | "bad";
export type RecItem = {
  label: string;
  tone: RecTone;
  why: string;
  impact: string;
  context: string;
  department: string;
};
export function RecommendedActions({
  context,
  items,
}: {
  context: string;
  items: RecItem[];
}) {
  const toneCls: Record<RecTone, string> = {
    good: "bg-success-50 text-success-600 ring-success-100",
    warn: "bg-warning-50 text-warning-600 ring-warning-100",
    bad: "bg-danger-50 text-danger-600 ring-danger-100",
  };
  return (
    <Card>
      <CardHeading
        title="Recommended actions"
        subtitle={`What the ${context.toLowerCase()} data says to do, ranked by what it's worth.`}
      />
      <ol className="mt-3 flex flex-col">
        {items.map((a, i) => (
          <li
            key={a.label}
            className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b border-primary-50 py-3 last:border-b-0"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">
              {i + 1}
            </span>
            <div className="min-w-[240px] flex-1">
              <span
                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${toneCls[a.tone]}`}
              >
                {a.label}
              </span>
              <p className="mt-1 text-xs leading-relaxed text-neutral-600">{a.why}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="whitespace-nowrap text-xs font-semibold text-neutral-800">{a.impact}</span>
              <TakeAction context={context} department={a.department} />
            </div>
          </li>
        ))}
      </ol>
    </Card>
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

export function ExportButton({ onClick, icon = false }: { onClick?: () => void; icon?: boolean }) {
  // Icon-only download button (bordered square). The text variant stays the
  // default so other pages using ExportButton are unchanged.
  if (icon) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label="Export"
        title="Export"
        className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-0 text-neutral-600 transition-colors hover:bg-neutral-100"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
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
        <span className="text-[10px] text-neutral-600">{centerBottom}</span>
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
    <div className={`grid grid-cols-2 gap-3 ${COLS[cols]}`}>
      {items.map((kpi) => (
        <div
          key={kpi.label}
          className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-0 p-4"
        >
          <p className="text-xs text-neutral-600">
            {kpi.label}
            {kpi.sub ? <span className="block text-[10px] text-neutral-500">{kpi.sub}</span> : null}
          </p>
          <p className="text-[26px] font-bold leading-[32px] text-neutral-800">{kpi.value}</p>
        </div>
      ))}
    </div>
  );
}

