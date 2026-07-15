"use client";

import {
  Card,
  CardHeading,
  Donut,
  InfoBanner,
  InsightLink,
  KpiStrip,
  TakeAction,
} from "./parts";

/* ----------------------------- data ----------------------------- */

const KPIS = [
  { label: "Return Rate", sub: "Items returned", value: "25.23%" },
  { label: "Same-Style Exchange Rate", value: "8.95%" },
  { label: "% Returns Exchanged on Size", value: "6.62%" },
  { label: "% Returns Exchanged on Color", value: "1.44%" },
];

const KIND = [
  { label: "Size", pct: 74, color: "#d13636", detail: "74%" },
  { label: "Color", pct: 16, color: "#4169e1", detail: "16%" },
];

type PromoRow = { dept: string; revenue: string; pct: string; opportunity: string };
const PROMOTE_SIZE: PromoRow[] = [
  { dept: "Light Hike", revenue: "$1.8M", pct: "7.69%", opportunity: "$7K" },
  { dept: "Running", revenue: "$1.6M", pct: "6.38%", opportunity: "$5K" },
  { dept: "Originals", revenue: "$884K", pct: "6.42%", opportunity: "$3K" },
  { dept: "Trail Running", revenue: "$2.5M", pct: "2.63%", opportunity: "$3K" },
];
const PROMOTE_COLOR: PromoRow[] = [
  { dept: "Light Hike", revenue: "$1.8M", pct: "1.67%", opportunity: "$2K" },
  { dept: "Running", revenue: "$1.6M", pct: "1.7%", opportunity: "$1K" },
  { dept: "Originals", revenue: "$884K", pct: "1.06%", opportunity: "$476" },
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

/* --------------------------- sections ---------------------------- */

function KindDonut() {
  return (
    <Card>
      <CardHeading
        title="Of exchanges, what kind?"
        subtitle="Size = swap to a different size. Color = swap to a different color."
      />
      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row">
        <Donut segments={KIND} centerTop="8.95%" centerBottom="exch. rate" />
        <ul className="flex min-w-0 flex-1 flex-col gap-2">
          {KIND.map((seg) => (
            <li key={seg.label} className="flex items-center gap-2 text-xs">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="font-medium text-neutral-800">{seg.label}</span>
              <span className="text-neutral-500">= {seg.detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

function OutcomeBar() {
  return (
    <Card>
      <CardHeading
        title="When they exchange, what happens?"
        subtitle="Did the exchanged item stick, or come back?"
      />
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5 text-[11px] text-neutral-600">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "#22a06b" }} /> Kept — 69%
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-neutral-600">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "#d13636" }} /> Returned — 31%
        </span>
      </div>
      <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full">
        <span style={{ width: "69%", backgroundColor: "#22a06b" }} />
        <span style={{ width: "31%", backgroundColor: "#d13636" }} />
      </div>
    </Card>
  );
}

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
    <Card className="min-w-0 flex-1">
      <CardHeading title={title} subtitle={subtitle} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[420px] text-left text-sm">
          <thead>
            <tr className="text-neutral-500">
              <th className="py-2 pr-3 font-normal">Department</th>
              <th className="px-3 py-2 font-normal">Return Revenue</th>
              <th className="px-3 py-2 font-normal">{pctLabel}</th>
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
                <td className="px-3 py-2.5 font-semibold text-neutral-800">{r.opportunity}</td>
                <td className="py-2.5 pl-3">
                  <TakeAction />
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
    <Card className="min-w-0 flex-1">
      <CardHeading title={title} subtitle={subtitle} action={<InsightLink label={insight} />} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead>
            <tr className="text-neutral-500">
              <th className="py-2 pr-3 font-normal">Department</th>
              <th className="px-3 py-2 font-normal">Return Revenue</th>
              <th className="px-3 py-2 font-normal">{pctLabel}</th>
              <th className="px-3 py-2 font-normal">{returnedLabel}</th>
              <th className="px-3 py-2 font-normal">Rev. Opportunity</th>
              <th className="py-2 pl-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.dept} className="border-t border-primary-50">
                <td className="py-2.5 pr-3 font-medium text-neutral-800">{r.dept}</td>
                <td className="px-3 py-2.5 text-neutral-700">{r.revenue}</td>
                <td className="px-3 py-2.5 text-neutral-700">{r.exchPct}</td>
                <td className="px-3 py-2.5 font-semibold text-danger-600">{r.returnedPct}</td>
                <td className="px-3 py-2.5 font-semibold text-neutral-800">{r.opportunity}</td>
                <td className="py-2.5 pl-3">
                  <TakeAction />
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
      <InfoBanner
        title="Exchanges recover revenue that returns lose."
        body="A true same-style exchange keeps the sale. Departments with low exchange rates or high re-return rates are the biggest opportunities."
      />
      <KpiStrip items={KPIS} cols={4} />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <KindDonut />
        <OutcomeBar />
      </div>
      <div className="flex flex-col gap-5 lg:flex-row">
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
      </div>
      <div className="flex flex-col gap-5 lg:flex-row">
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
      </div>
    </>
  );
}
