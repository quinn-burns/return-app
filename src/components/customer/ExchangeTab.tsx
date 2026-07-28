"use client";

import type { ReactNode } from "react";
import {
  AiInsight,
  Card,
  CardHeading,
  Donut,
  InsightLink,
  KpiStrip,
  Pagination,
  TakeAction,
  usePaged,
} from "./parts";
import { FILLER_DEPTS, money, pctStr, seeded } from "./filler";

/* ----------------------------- data ----------------------------- */

const KPIS = [
  { label: "Return Rate", sub: "Items returned", value: "14.76%" },
  { label: "Same-Style Exchange Rate", sub: "Of returns", value: "4.4%" },
  { label: "% Returns Exchanged on Size", sub: "Of returns", value: "2.55%" },
  { label: "% Returns Exchanged on Color", sub: "Of returns", value: "0.93%" },
];

const KIND = [
  // Matches the "What kind of bracketing?" donut on the Bracketing tab.
  // Primary blue + brand teal, matching the Bracketing donut.
  { label: "Size", pct: 58, color: "#4169e1" },
  { label: "Color", pct: 21, color: "#27cba7" },
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

/** Pad the demo tables so pagination has real pages to move through. */
function padPromo(base: PromoRow[], count: number): PromoRow[] {
  const out = [...base];
  for (const dept of FILLER_DEPTS) {
    if (out.length >= count) break;
    if (out.some((r) => r.dept === dept)) continue;
    out.push({
      dept,
      revenue: money(seeded(dept, 11, 4e5, 9e6)),
      pct: pctStr(seeded(dept, 12, 0.6, 3.8)),
      opportunity: money(seeded(dept, 13, 400, 16000)),
    });
  }
  return out;
}

function padGuide(base: GuideRow[], count: number): GuideRow[] {
  const out = [...base];
  for (const dept of FILLER_DEPTS) {
    if (out.length >= count) break;
    if (out.some((r) => r.dept === dept)) continue;
    out.push({
      dept,
      revenue: money(seeded(dept, 21, 5e3, 2e5)),
      exchPct: pctStr(seeded(dept, 22, 0.2, 1.9)),
      returnedPct: pctStr(seeded(dept, 23, 25, 100)),
      opportunity: money(seeded(dept, 24, 120, 5200)),
    });
  }
  return out;
}

const PROMOTE_SIZE_ALL = padPromo(PROMOTE_SIZE, 24);
const PROMOTE_COLOR_ALL = padPromo(PROMOTE_COLOR, 24);
const IMPROVE_SIZE_ALL = padGuide(IMPROVE_SIZE, 24);
const IMPROVE_COLOR_ALL = padGuide(IMPROVE_COLOR, 24);

/* --------------------------- charts ------------------------------ */

function ExchangeKind() {
  // Size and Color are independent rates (they do not sum to 100), so two pie
  // slices would misread. Independent bars — each the share of that return type
  // saved as a same-style exchange — are the honest, legible choice.
  return (
    <Card>
      <div className="flex h-full flex-col">
        <CardHeading
          title="Of exchanges, what kind?"
          subtitle="Size = swap to a different size. Color = swap to a different color."
        />
        <div className="flex flex-1 flex-col justify-center gap-3 py-4">
          {KIND.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <span className="w-14 shrink-0 text-sm font-medium text-neutral-800">{t.label}</span>
              <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
                <div
                  data-anim-bar
                  className="h-5 rounded-[4px]"
                  style={{ width: `${t.pct}%`, backgroundColor: t.color }}
                />
              </div>
              <span className="w-12 shrink-0 text-right text-sm font-semibold text-neutral-800">
                {t.pct}%
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] leading-4 text-neutral-600">
          Share of returns saved as a same-style exchange rather than a refund.
        </p>
      </div>
    </Card>
  );
}

function ExchangeOutcome() {
  // Kept vs Returned are two parts of one whole, so a donut fits and fills the card.
  return (
    <Card>
      <div className="flex h-full flex-col">
        <CardHeading
          title="When they exchange, what happens?"
          subtitle="Did the exchanged item stick, or come back?"
        />
        <div className="flex flex-1 flex-wrap items-center justify-center gap-6 py-4">
          <Donut
            segments={[
              { label: "Kept", pct: 67, color: "#059467" },
              { label: "Returned", pct: 33, color: "#dc2828" },
            ]}
            centerTop="67%"
            centerBottom="kept"
            size={150}
          />
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-sm text-neutral-700">
              <span className="size-3 rounded-full" style={{ backgroundColor: "#059467" }} />
              <span className="font-semibold text-neutral-800">Kept</span> — 67%
            </span>
            <span className="flex items-center gap-2 text-sm text-neutral-700">
              <span className="size-3 rounded-full" style={{ backgroundColor: "#dc2828" }} />
              <span className="font-semibold text-neutral-800">Returned</span> — 33%
            </span>
          </div>
        </div>
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
        <p className="flex flex-wrap items-center gap-1.5 text-xs text-neutral-600">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "#4169e1" }} />
          Breaking down the <span className="font-semibold text-neutral-700">Returned — 33%</span> ·
          top styles, by re-return rate × volume
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-2">
        {COME_BACK.map((s) => (
          <div key={s.style} className="flex items-center gap-3">
            {/* Style name over its exchange count, so the row stays narrow enough
                to sit in the three-across layout without crushing the bar. */}
            <div className="w-28 shrink-0 leading-tight">
              <div className="truncate text-[13px] font-medium text-neutral-800">{s.style}</div>
              <div className="truncate text-[10px] text-neutral-500">{s.detail}</div>
            </div>
            <div className="h-3.5 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
              <div
                data-anim-bar
                className="h-3.5 rounded-[4px] bg-primary-600"
                style={{ width: `${(s.pct / max) * 100}%` }}
              />
            </div>
            <span className="w-12 shrink-0 text-right text-xs font-semibold text-neutral-800">
              {s.pct}%
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
  id,
}: {
  title: string;
  subtitle: string;
  pctLabel: string;
  rows: PromoRow[];
  id?: string;
}) {
  const { slice, page, setPage, total, pageSize } = usePaged(rows, 5);
  return (
    <Card id={id}>
      <CardHeading title={title} subtitle={subtitle} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="py-2 pr-2 align-bottom font-normal leading-tight">Department</th>
              <th className="px-2 py-2 text-right align-bottom font-normal leading-tight">Return Revenue</th>
              <th className="px-2 py-2 text-right align-bottom font-normal leading-tight">{pctLabel}</th>
              <th className="px-2 py-2 text-right align-bottom font-normal leading-tight">Rev. Opportunity</th>
              <th className="py-2 pl-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.dept} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-2 font-medium text-neutral-800">{r.dept}</td>
                <td className="whitespace-nowrap px-2 py-3 text-right text-neutral-700">{r.revenue}</td>
                <td className="whitespace-nowrap px-2 py-3 text-right text-neutral-700">{r.pct}</td>
                <td className="whitespace-nowrap px-2 py-3 text-right font-semibold text-neutral-800">
                  {r.opportunity}
                </td>
                <td className="py-3 pl-2 text-right">
                  <TakeAction context="Exchange" department={r.dept} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
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
  const { slice, page, setPage, total, pageSize } = usePaged(rows, 5);
  return (
    <Card>
      <CardHeading title={title} subtitle={subtitle} action={<InsightLink label={insight} />} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="py-2 pr-2 align-bottom font-normal leading-tight">Department</th>
              <th className="px-2 py-2 text-right align-bottom font-normal leading-tight">Return Revenue</th>
              <th className="px-2 py-2 text-right align-bottom font-normal leading-tight">{pctLabel}</th>
              <th className="px-2 py-2 text-right align-bottom font-normal leading-tight">{returnedLabel}</th>
              <th className="px-2 py-2 text-right align-bottom font-normal leading-tight">Rev. Opportunity</th>
              <th className="py-2 pl-2 font-normal" />
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.dept} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-2 font-medium text-neutral-800">{r.dept}</td>
                <td className="whitespace-nowrap px-2 py-3 text-right text-neutral-700">{r.revenue}</td>
                <td className="whitespace-nowrap px-2 py-3 text-right text-neutral-700">{r.exchPct}</td>
                <td className="whitespace-nowrap px-2 py-3 text-right font-semibold text-danger-600">
                  {r.returnedPct}
                </td>
                <td className="whitespace-nowrap px-2 py-3 text-right font-semibold text-neutral-800">
                  {r.opportunity}
                </td>
                <td className="py-3 pl-2 text-right">
                  <TakeAction context="Exchange" department={r.dept} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
    </Card>
  );
}

/* ----------------------------- tab ------------------------------- */

export default function ExchangeTab({
  insight,
  description,
}: {
  insight: ReactNode;
  description: ReactNode;
}) {
  return (
    <>
      <AiInsight title="Exchange Insights" subtitle={description}>
        {insight}
      </AiInsight>
      {/* KPIs are metrics, not AI output, so they sit in their own box below. */}
      <KpiStrip items={KPIS} cols={4} />
      {/* The three exchange charts share one row on a wide screen and stack below it. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ExchangeKind />
        <ExchangeOutcome />
        <ComeBack />
      </div>
      {/* Action tables pair up two-across on a wide screen, one-per-row when narrow. */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <PromoteTable
          id="exchange-promote"
          title="Promote size exchanges"
          subtitle="Low size-exchange rate — opportunity from increasing (→1.05×)"
          pctLabel="% Ret. Exch. Size"
          rows={PROMOTE_SIZE_ALL}
        />
        <PromoteTable
          id="exchange-promote-color"
          title="Promote color exchanges"
          subtitle="Low color-exchange rate — opportunity from increasing (→1.05×)"
          pctLabel="% Ret. Exch. Color"
          rows={PROMOTE_COLOR_ALL}
        />
        <GuidanceTable
          title="Improve size guidance"
          subtitle="High share of size exchanges returned again — opportunity from reducing (→0.95×)"
          insight="Size fit insights by style"
          pctLabel="% Ret. Exch. Size"
          returnedLabel="% Size Exch. Returned"
          rows={IMPROVE_SIZE_ALL}
        />
        <GuidanceTable
          title="Improve color guidance"
          subtitle="High share of color exchanges returned again — opportunity from reducing (→0.95×)"
          insight="Color insights by style"
          pctLabel="% Ret. Exch. Color"
          returnedLabel="% Color Exch. Returned"
          rows={IMPROVE_COLOR_ALL}
        />
      </div>
    </>
  );
}
