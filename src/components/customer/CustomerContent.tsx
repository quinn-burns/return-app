"use client";

import { useState } from "react";
import { FilterDropdown } from "../overview/Buttons";

/* ----------------------------- data ----------------------------- */

const FILTERS = ["All Brands", "All Countries", "All Product Categories"];

const TABS = ["Bracketing", "Exchange", "Segments", "Behavioral Flow"] as const;
type Tab = (typeof TABS)[number];

type Trend = "down" | "up" | "flat";
const KPIS: { label: string; value: string; change: string; trend: Trend }[] = [
  { label: "Return Rate (V)", value: "14.76%", change: "↓ 2.0 pts vs LY", trend: "down" },
  { label: "% of Returns Due to Bracketing", value: "30.84%", change: "↓ 0.9 pts vs LY", trend: "down" },
  { label: "% Orders Bracketed", value: "8.46%", change: "↓ 0.0 pts vs LY", trend: "flat" },
  { label: "% Orders Bracketed on Size", value: "5.52%", change: "↓ 0.0 pts vs LY", trend: "flat" },
  { label: "% Orders Bracketed on Color", value: "4.33%", change: "↓ 0.2 pts vs LY", trend: "down" },
];

const KIND_SEGMENTS = [
  { label: "Size", detail: "65% · 19K orders", pct: 65, color: "#4169e1" },
  { label: "Color", detail: "28% · 8K orders", pct: 28, color: "#22a06b" },
  { label: "Both", detail: "2% · 3K orders", pct: 7, color: "#f5a623" },
];

const OUTCOME_BARS = [
  {
    label: "Size-bracketed",
    annotation: "10% kept all · 50% kept some · 40% returned all",
    parts: [10, 50, 40],
  },
  {
    label: "Color-bracketed",
    annotation: "90% kept all · 0% kept some · 10% returned all",
    parts: [90, 0, 10],
  },
];
const OUTCOME_LEGEND = [
  { label: "Kept all", color: "#22a06b" },
  { label: "kept some", color: "#f5a623" },
  { label: "Returned all", color: "#d13636" },
];

type Row = {
  dept: string;
  revenue: string;
  pct: string;
  orders: string;
  delta: string;
  opportunity: string;
};

const PROMOTE_SIZE: Row[] = [
  { dept: "Steel Toe", revenue: "$8.0M", pct: "4.05%", orders: "4K", delta: "+$95", opportunity: "$18K" },
  { dept: "Soft Toe", revenue: "$13.8M", pct: "6.47%", orders: "8K", delta: "+$54", opportunity: "$17K" },
  { dept: "Composite Toe", revenue: "$12.1M", pct: "4.27%", orders: "4K", delta: "+$73", opportunity: "$15K" },
];

const PROMOTE_COLOR: Row[] = [
  { dept: "Running", revenue: "$46.4M", pct: "3.63%", orders: "11K", delta: "+$88", opportunity: "$48K" },
  { dept: "Casual", revenue: "$28.0M", pct: "5.53%", orders: "17K", delta: "+$49", opportunity: "$39K" },
  { dept: "Light Hike", revenue: "$46.1M", pct: "3.38%", orders: "12K", delta: "+$40", opportunity: "$24K" },
];

const DISCOURAGE_SIZE: Row[] = [
  { dept: "Light Hike", revenue: "$6.1M", pct: "4.87%", orders: "2K", delta: "−$22", opportunity: "$2K" },
  { dept: "Running", revenue: "$7.0M", pct: "3.18%", orders: "2K", delta: "−$18", opportunity: "$1K" },
  { dept: "Originals", revenue: "$3.3M", pct: "3.99%", orders: "1K", delta: "−$14", opportunity: "$692" },
  { dept: "Trail Running", revenue: "$1.3M", pct: "4.13%", orders: "582", delta: "−$28", opportunity: "$587" },
  { dept: "Casual", revenue: "$1.5M", pct: "5.93%", orders: "564", delta: "−$13", opportunity: "$382" },
];

/* --------------------------- primitives -------------------------- */

function Pill({ change, trend }: { change: string; trend: Trend }) {
  const styles: Record<Trend, string> = {
    up: "bg-success-50 text-success-600",
    down: "bg-success-50 text-success-600",
    flat: "bg-neutral-100 text-neutral-500",
  };
  return (
    <span
      className={`flex w-fit items-center rounded-full px-2 py-[3px] text-[11px] font-medium ${styles[trend]}`}
    >
      {change}
    </span>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-lg border border-neutral-200 bg-neutral-0 p-4 ${className}`}>
      {children}
    </section>
  );
}

function CardHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-base font-semibold text-neutral-800">{title}</h2>
      <p className="text-xs text-neutral-500">{subtitle}</p>
    </div>
  );
}

/* ---------------------------- sections --------------------------- */

function Header() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 bg-neutral-0 px-4 py-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-[36px] font-bold leading-tight text-neutral-800">
          Customer Behavior
        </h1>
        <p className="text-sm text-neutral-500">
          Understand customer behavior including bracketing, exchanges, and returns by department
        </p>
      </div>
    </header>
  );
}

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {FILTERS.map((f) => (
        <FilterDropdown key={f} label={f} />
      ))}
      <div className="ml-auto">
        <FilterDropdown label="Rolling 12 Months" />
      </div>
    </div>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="w-full overflow-x-auto border-b border-neutral-200">
      <div className="flex min-w-max" role="tablist">
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t)}
              className="flex h-10 flex-col items-center"
            >
              <span className="flex flex-1 items-center px-3.5">
                <span
                  className={
                    active
                      ? "whitespace-nowrap text-[13px] font-semibold text-primary-600"
                      : "whitespace-nowrap text-[13px] font-medium text-neutral-500"
                  }
                >
                  {t}
                </span>
              </span>
              <span className={`h-0.5 w-full ${active ? "bg-primary-600" : ""}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InfoBanner() {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-primary-100 bg-primary-50 p-4">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
        <circle cx="12" cy="12" r="9" stroke="#4169e1" strokeWidth="1.6" />
        <path d="M12 11v5" stroke="#4169e1" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="8" r="1.1" fill="#4169e1" />
      </svg>
      <p className="text-sm text-neutral-700">
        <span className="font-semibold text-neutral-800">
          Color bracketing is almost always profitable.
        </span>{" "}
        Color-bracketed orders generate +$20–50 more revenue per order than non-bracketed. Size
        bracketing breaks even or loses money in top categories.
      </p>
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-0 sm:grid-cols-3 lg:grid-cols-5">
      {KPIS.map((kpi) => (
        <div key={kpi.label} className="flex flex-col gap-1.5 p-4">
          <p className="text-xs text-neutral-500">{kpi.label}</p>
          <p className="text-[28px] font-bold leading-[34px] text-neutral-800">{kpi.value}</p>
          <Pill change={kpi.change} trend={kpi.trend} />
        </div>
      ))}
    </div>
  );
}

function KindDonut() {
  const total = KIND_SEGMENTS.reduce((s, seg) => s + seg.pct, 0);
  const c = 2 * Math.PI * 40;
  const arcs = KIND_SEGMENTS.map((seg, i) => ({
    ...seg,
    dash: (seg.pct / total) * c,
    offset: KIND_SEGMENTS.slice(0, i).reduce((s, x) => s + (x.pct / total) * c, 0),
  }));
  return (
    <Card>
      <CardHeading
        title="Of bracketed orders, what kind?"
        subtitle="Size = same style, different sizes. Color = same style, different colors."
      />
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
        <div className="relative size-[130px] shrink-0">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
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
            <span className="text-xl font-bold text-neutral-800">17K</span>
            <span className="text-[10px] text-neutral-500">orders</span>
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <ul className="flex flex-col gap-1.5">
            {KIND_SEGMENTS.map((seg) => (
              <li key={seg.label} className="flex items-center gap-2 text-xs">
                <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="font-medium text-neutral-800">{seg.label}</span>
                <span className="text-neutral-500">{seg.detail}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs leading-4 text-neutral-500">
            Color bracketing is <span className="font-semibold text-neutral-700">more common</span>{" "}
            and almost always profitable. Size bracketing often breaks even or loses money.
          </p>
        </div>
      </div>
    </Card>
  );
}

function OutcomeBars() {
  return (
    <Card>
      <CardHeading
        title="When they bracket, what happens?"
        subtitle="Weighted across all style orders. One row per bracketing type."
      />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        {OUTCOME_LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-neutral-600">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-col gap-4">
        {OUTCOME_BARS.map((bar) => (
          <div key={bar.label} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-neutral-800">{bar.label}</span>
              <span className="text-[11px] text-neutral-500">{bar.annotation}</span>
            </div>
            <div className="flex h-3 w-full overflow-hidden rounded-full">
              {bar.parts.map((p, i) => (
                <span
                  key={i}
                  style={{ width: `${p}%`, backgroundColor: OUTCOME_LEGEND[i].color }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ActionTable({
  title,
  subtitle,
  pctLabel,
  rows,
  negative = false,
}: {
  title: string;
  subtitle: string;
  pctLabel: string;
  rows: Row[];
  negative?: boolean;
}) {
  return (
    <Card className="min-w-0 flex-1">
      <CardHeading title={title} subtitle={subtitle} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="text-neutral-500">
              <th className="py-2 pr-3 font-normal">Department</th>
              <th className="px-3 py-2 font-normal">Revenue</th>
              <th className="px-3 py-2 font-normal">{pctLabel}</th>
              <th className="px-3 py-2 font-normal">Orders</th>
              <th className="px-3 py-2 font-normal">Δ Profit / Order</th>
              <th className="px-3 py-2 font-normal">Rev. Opportunity</th>
              <th className="py-2 pl-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.dept} className="border-t border-primary-50">
                <td className="py-2.5 pr-3 font-medium text-neutral-800">{r.dept}</td>
                <td className="px-3 py-2.5 text-neutral-700">{r.revenue}</td>
                <td className="px-3 py-2.5 text-neutral-700">{r.pct}</td>
                <td className="px-3 py-2.5 text-neutral-700">{r.orders}</td>
                <td
                  className={`px-3 py-2.5 font-semibold ${negative ? "text-danger-600" : "text-success-600"}`}
                >
                  {r.delta}
                </td>
                <td className="px-3 py-2.5 font-semibold text-neutral-800">{r.opportunity}</td>
                <td className="py-2.5 pl-3">
                  <button
                    type="button"
                    className="whitespace-nowrap text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    Take action →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <Card className="flex min-h-[280px] flex-col items-center justify-center gap-1 text-center">
      <p className="text-base font-semibold text-neutral-800">{label}</p>
      <p className="text-sm text-neutral-500">This section is coming soon.</p>
    </Card>
  );
}

function BracketingTab() {
  return (
    <>
      <InfoBanner />
      <KpiRow />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <KindDonut />
        <OutcomeBars />
      </div>
      <div className="flex flex-col gap-5 lg:flex-row">
        <ActionTable
          title="Promote size bracketing"
          subtitle="Profitable size bracketing — prioritized by revenue opportunity (→1.05×)"
          pctLabel="% Orders Brkt. Size"
          rows={PROMOTE_SIZE}
        />
        <ActionTable
          title="Promote color bracketing"
          subtitle="Profitable color bracketing — prioritized by revenue opportunity (→1.05×)"
          pctLabel="% Orders Brkt. Color"
          rows={PROMOTE_COLOR}
        />
      </div>
      <ActionTable
        title="Discourage size bracketing"
        subtitle="Unprofitable size bracketing — opportunity from reducing (→0.95×)"
        pctLabel="% Orders Brkt. Size"
        rows={DISCOURAGE_SIZE}
        negative
      />
    </>
  );
}

/* ----------------------------- page ------------------------------ */

export default function CustomerContent() {
  const [tab, setTab] = useState<Tab>("Bracketing");
  return (
    <div className="min-h-screen bg-neutral-0">
      <Header />
      <div className="flex flex-col gap-5 px-4 pb-10 pt-3.5">
        <FilterBar />
        <TabBar tab={tab} onChange={setTab} />
        {tab === "Bracketing" ? <BracketingTab /> : <PlaceholderTab label={tab} />}
      </div>
    </div>
  );
}
