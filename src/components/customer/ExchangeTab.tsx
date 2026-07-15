"use client";

import { Card, CardHeading, InsightLink, KpiStrip, TakeAction } from "./parts";

/* ----------------------------- data ----------------------------- */

const KPIS = [
  { label: "Return Rate", sub: "Items returned", value: "14.76%" },
  { label: "Same-Style Exchange Rate", sub: "Of returns", value: "4.4%" },
  { label: "% Returns Exchanged on Size", sub: "Of returns", value: "2.55%" },
  { label: "% Returns Exchanged on Color", sub: "Of returns", value: "0.93%" },
];

const KIND = [
  { label: "Size", pct: 58, color: "#dc2828" },
  { label: "Color", pct: 21, color: "#4169e1" },
];

const COME_BACK = [
  { style: "Triumph 23", pct: 81.82, detail: "180 of 220 exch." },
  { style: "Endorphin Speed 5", pct: 76.68, detail: "342 of 446 exch." },
  { style: "Endorphin Azura", pct: 62.32, detail: "43 of 69 exch." },
  { style: "Progrid Omni 9", pct: 50.94, detail: "81 of 159 exch." },
  { style: "Endorphin Elite 2", pct: 42.04, detail: "132 of 314 exch." },
];

type PromoRow = { dept: string; revenue: string; pct: string; opportunity: string };
const PROMOTE_SIZE: PromoRow[] = [
  { dept: "Light Hike", revenue: "$8.8M", pct: "3.31%", opportunity: "$15K" },
  { dept: "Running", revenue: "$7.4M", pct: "3.1%", opportunity: "$11K" },
  { dept: "Casual", revenue: "$5.9M", pct: "2.12%", opportunity: "$6K" },
  { dept: "Originals", revenue: "$3.2M", pct: "3.56%", opportunity: "$6K" },
  { dept: "Trail Running", revenue: "$2.5M", pct: "2.63%", opportunity: "$3K" },
];
const PROMOTE_COLOR: PromoRow[] = [
  { dept: "Running", revenue: "$7.4M", pct: "1.52%", opportunity: "$6K" },
  { dept: "Light Hike", revenue: "$8.8M", pct: "1.13%", opportunity: "$5K" },
  { dept: "Casual", revenue: "$5.9M", pct: "0.79%", opportunity: "$2K" },
  { dept: "Originals", revenue: "$3.2M", pct: "1%", opportunity: "$2K" },
  { dept: "Trail Running", revenue: "$2.5M", pct: "1.03%", opportunity: "$1K" },
];

type GuideRow = {
  dept: string;
  revenue: string;
  exchPct: string;
  returnedPct: string;
  opportunity: string;
};
const IMPROVE_SIZE: GuideRow[] = [
  { dept: "Sandals", revenue: "$7K", exchPct: "0.66%", returnedPct: "100%", opportunity: "$343" },
  { dept: "Flame Resistant", revenue: "$6K", exchPct: "1.2%", returnedPct: "100%", opportunity: "$310" },
  { dept: "Mid Layers", revenue: "$5K", exchPct: "1.32%", returnedPct: "50%", opportunity: "$133" },
  { dept: "Apparel", revenue: "$88K", exchPct: "1.21%", returnedPct: "33.33%", opportunity: "$1K" },
  { dept: "Outerwear", revenue: "$38K", exchPct: "1.8%", returnedPct: "30.77%", opportunity: "$582" },
];
const IMPROVE_COLOR: GuideRow[] = [
  { dept: "Flame Resistant", revenue: "$6K", exchPct: "1.2%", returnedPct: "100%", opportunity: "$310" },
  { dept: "Lowdown", revenue: "$182K", exchPct: "0.26%", returnedPct: "57.14%", opportunity: "$5K" },
  { dept: "Bottoms", revenue: "$29K", exchPct: "0.25%", returnedPct: "50%", opportunity: "$733" },
  { dept: "Performance Tops", revenue: "$11K", exchPct: "0.69%", returnedPct: "50%", opportunity: "$269" },
  { dept: "Sandals", revenue: "$7K", exchPct: "1.32%", returnedPct: "50%", opportunity: "$172" },
];

/* --------------------------- charts ------------------------------ */

function ExchangeKind() {
  return (
    <Card>
      <CardHeading
        title="Of exchanges, what kind?"
        subtitle="Size = swap to a different size. Color = swap to a different color."
      />
      <div className="mt-4 flex flex-col gap-3">
        {KIND.map((t) => (
          <div key={t.label} className="flex items-center gap-3">
            <span className="w-12 shrink-0 text-sm font-medium text-neutral-800">{t.label}</span>
            <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
              <div
                data-anim-bar
                className="h-5 rounded-[4px]"
                style={{ width: `${t.pct}%`, backgroundColor: t.color }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold text-neutral-800">
              {t.pct}%
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-4 text-neutral-400">
        Share of returns saved as a same-style exchange rather than a refund.
      </p>
    </Card>
  );
}

function ExchangeOutcome() {
  return (
    <Card>
      <CardHeading
        title="When they exchange, what happens?"
        subtitle="Did the exchanged item stick, or come back?"
      />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 text-[11px] text-neutral-600">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "#059467" }} /> Kept — 67%
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-neutral-600">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "#dc2828" }} /> Returned — 33%
        </span>
      </div>
      <div data-anim-bar className="mt-4 flex h-6 w-full overflow-hidden rounded-[4px]">
        <span style={{ width: "67%", backgroundColor: "#059467" }} />
        <span style={{ width: "33%", backgroundColor: "#dc2828" }} />
      </div>
    </Card>
  );
}

function ComeBack() {
  const max = Math.max(...COME_BACK.map((s) => s.pct));
  return (
    <Card>
      <div className="flex flex-col gap-1">
        <h2 className="text-base font-semibold text-neutral-800">Where do they come back?</h2>
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "#dc2828" }} />
          Breaking down the <span className="font-semibold text-neutral-700">Returned — 33%</span> ·
          top styles, by re-return rate × volume
        </p>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        {COME_BACK.map((s) => (
          <div key={s.style} className="flex items-center gap-3">
            <span className="w-40 shrink-0 truncate text-sm font-medium text-neutral-800">
              {s.style}
            </span>
            <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
              <div
                data-anim-bar
                className="h-4 rounded-[4px] bg-danger-600"
                style={{ width: `${(s.pct / max) * 100}%` }}
              />
            </div>
            <span className="w-44 shrink-0 text-right text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">{s.pct}%</span> · {s.detail}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* --------------------------- tables ------------------------------ */

function PromoteTable({
  title,
  subtitle,
  pctLabel,
  rows,
}: {
  title: string;
  subtitle: string;
  pctLabel: string;
  rows: PromoRow[];
}) {
  return (
    <Card>
      <CardHeading title={title} subtitle={subtitle} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Department</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Return Revenue</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">{pctLabel}</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Rev. Opportunity</th>
              <th className="py-2 pl-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.dept} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-3 font-medium text-neutral-800">{r.dept}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.revenue}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.pct}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-neutral-800">
                  {r.opportunity}
                </td>
                <td className="py-3 pl-3 text-right">
                  <TakeAction context="Exchange" department={r.dept} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function GuidanceTable({
  title,
  subtitle,
  insight,
  pctLabel,
  returnedLabel,
  rows,
}: {
  title: string;
  subtitle: string;
  insight: string;
  pctLabel: string;
  returnedLabel: string;
  rows: GuideRow[];
}) {
  return (
    <Card>
      <CardHeading title={title} subtitle={subtitle} action={<InsightLink label={insight} />} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Department</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Return Revenue</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">{pctLabel}</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">{returnedLabel}</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Rev. Opportunity</th>
              <th className="py-2 pl-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.dept} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-3 font-medium text-neutral-800">{r.dept}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.revenue}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.exchPct}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-danger-600">
                  {r.returnedPct}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-neutral-800">
                  {r.opportunity}
                </td>
                <td className="py-3 pl-3 text-right">
                  <TakeAction context="Exchange" department={r.dept} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ----------------------------- tab ------------------------------- */

export default function ExchangeTab() {
  return (
    <>
      <KpiStrip items={KPIS} cols={4} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ExchangeKind />
        <ExchangeOutcome />
      </div>
      <ComeBack />
      <PromoteTable
        title="Promote size exchanges"
        subtitle="Low size-exchange rate — opportunity from increasing (→1.05×)"
        pctLabel="% Ret. Exch. Size"
        rows={PROMOTE_SIZE}
      />
      <PromoteTable
        title="Promote color exchanges"
        subtitle="Low color-exchange rate — opportunity from increasing (→1.05×)"
        pctLabel="% Ret. Exch. Color"
        rows={PROMOTE_COLOR}
      />
      <GuidanceTable
        title="Improve size guidance"
        subtitle="High share of size exchanges returned again — opportunity from reducing (→0.95×)"
        insight="Size fit insights by style"
        pctLabel="% Ret. Exch. Size"
        returnedLabel="% Size Exch. Returned"
        rows={IMPROVE_SIZE}
      />
      <GuidanceTable
        title="Improve color guidance"
        subtitle="High share of color exchanges returned again — opportunity from reducing (→0.95×)"
        insight="Color insights by style"
        pctLabel="% Ret. Exch. Color"
        returnedLabel="% Color Exch. Returned"
        rows={IMPROVE_COLOR}
      />
    </>
  );
}
