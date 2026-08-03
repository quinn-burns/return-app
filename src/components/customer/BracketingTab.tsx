"use client";

import type { ReactNode } from "react";
import { AiInsight, Donut, Pagination, RecommendedActions, TakeAction, usePaged, useReveal, type RecItem } from "./parts";
import { FILLER_DEPTS, countStr, money, pctStr, seeded } from "./filler";

type Trend = "down" | "up" | "flat";
const KPIS: { label: string; value: string; change: string; trend: Trend }[] = [
  { label: "Return Rate (V)", value: "14.76%", change: "↓ 2.0 pts vs LY", trend: "down" },
  { label: "% of Returns Due to Bracketing", value: "30.84%", change: "↓ 0.9 pts vs LY", trend: "down" },
  { label: "% Orders Bracketed", value: "8.46%", change: "↓ 0.0 pts vs LY", trend: "flat" },
  { label: "% Orders Bracketed on Size", value: "5.52%", change: "↓ 0.0 pts vs LY", trend: "flat" },
  { label: "% Orders Bracketed on Color", value: "4.33%", change: "↓ 0.2 pts vs LY", trend: "down" },
];

// Share of bracketed orders that involve each dimension. Orders can bracket on
// both size and color, so these shares overlap and add to more than 100%.
const BRACKETED_TOTAL = "171K";
const TYPE_BREAKDOWN = [
  // Nominal categories: primary blue + warning-600 orange (a deeper orange than
  // the amber used for "Kept some", so the two stay distinguishable).
  // The Exchange "what kind?" chart uses these same three colors.
  { label: "Size", pct: 65, orders: "111K", color: "#4169e1" },
  { label: "Color", pct: 51, orders: "87K", color: "#27cba7" },
  { label: "Other", pct: 2, orders: "3K", color: "#ababab" },
];

// Profit and outcome per bracketing type, ordered best → worst profit per order.
// keep = [kept all, kept some, returned all] as percentages.
const BRACKETING_TYPES = [
  { label: "Color", orders: "87K", profit: 44, keep: [90, 8, 2] },
  { label: "Both", orders: "20K", profit: 21, keep: [78, 15, 7] },
  { label: "Size", orders: "111K", profit: -7, keep: [10, 50, 40] },
];
const PROFIT_MAX = 50; // scale for the diverging profit bars

const OUTCOME_LEGEND = [
  { label: "Kept all", color: "#059467" },
  { label: "Kept some", color: "#f59f0a" },
  { label: "Returned all", color: "#dc2828" },
];

type Rec = "allowSize" | "discSize" | "sizeGuide" | "promoteColor" | "imgColor";
const REC_META: Record<Rec, { label: string; tone: "good" | "warn" | "bad" }> = {
  allowSize: { label: "Allow size bracketing", tone: "good" },
  discSize: { label: "Discourage size bracketing", tone: "bad" },
  sizeGuide: { label: "Improve size guidance", tone: "warn" },
  promoteColor: { label: "Promote color bracketing", tone: "good" },
  imgColor: { label: "Improve image color", tone: "warn" },
};

// One row per department, tagged with the recommendation its economics imply, so
// a single Size table and a single Color table carry allow / discourage /
// guidance together — the client's split — instead of four separate tables.
type BrkRow = {
  dept: string;
  revenue: string;
  pct: string;
  returned: string;
  delta: string;
  positive: boolean;
  rec: Rec;
  opportunity: string;
};

const SIZE_BASE: BrkRow[] = [
  { dept: "Steel Toe", revenue: "$8.0M", pct: "4.05%", returned: "9%", delta: "+$95", positive: true, rec: "allowSize", opportunity: "$18K" },
  { dept: "Soft Toe", revenue: "$13.8M", pct: "6.47%", returned: "11%", delta: "+$54", positive: true, rec: "allowSize", opportunity: "$17K" },
  { dept: "Composite Toe", revenue: "$12.1M", pct: "4.27%", returned: "8%", delta: "+$73", positive: true, rec: "allowSize", opportunity: "$15K" },
  { dept: "Originals", revenue: "$3.3M", pct: "3.99%", returned: "31%", delta: "−$14", positive: false, rec: "sizeGuide", opportunity: "$692" },
  { dept: "Light Hike", revenue: "$6.1M", pct: "4.87%", returned: "24%", delta: "−$22", positive: false, rec: "discSize", opportunity: "$2K" },
  { dept: "Trail Running", revenue: "$1.3M", pct: "4.13%", returned: "27%", delta: "−$28", positive: false, rec: "discSize", opportunity: "$587" },
];
const COLOR_BASE: BrkRow[] = [
  { dept: "Running", revenue: "$46.4M", pct: "3.63%", returned: "2%", delta: "+$88", positive: true, rec: "promoteColor", opportunity: "$48K" },
  { dept: "Casual", revenue: "$28.0M", pct: "5.53%", returned: "3%", delta: "+$49", positive: true, rec: "promoteColor", opportunity: "$39K" },
  { dept: "Light Hike", revenue: "$46.1M", pct: "3.38%", returned: "2%", delta: "+$40", positive: true, rec: "promoteColor", opportunity: "$24K" },
  { dept: "Lowdown", revenue: "$182K", pct: "2.6%", returned: "14%", delta: "+$8", positive: true, rec: "imgColor", opportunity: "$5K" },
  { dept: "Performance Tops", revenue: "$11K", pct: "1.9%", returned: "12%", delta: "+$12", positive: true, rec: "imgColor", opportunity: "$733" },
];

/** Pads a dimension's table with deterministic rows so pagination has real pages. */
function padBrk(base: BrkRow[], count: number, dimension: "size" | "color"): BrkRow[] {
  const out = [...base];
  for (const dept of FILLER_DEPTS) {
    if (out.length >= count) break;
    if (out.some((r) => r.dept === dept)) continue;
    const d = Math.round(seeded(dept, 3, 8, 95));
    const positive = seeded(dept, 6, 0, 1) > (dimension === "color" ? 0.2 : 0.45);
    const rec: Rec = positive
      ? dimension === "color" ? "promoteColor" : "allowSize"
      : dimension === "color" ? "imgColor" : "discSize";
    out.push({
      dept,
      revenue: money(seeded(dept, 1, 3e5, 4e7)),
      pct: pctStr(seeded(dept, 2, 1.2, 8.4)),
      returned: pctStr(seeded(dept, 7, 2, 34)),
      delta: `${positive ? "+" : "−"}$${d}`,
      positive,
      rec,
      opportunity: money(seeded(dept, 5, 200, 42000)),
    });
  }
  return out;
}
const SIZE_ROWS = padBrk(SIZE_BASE, 22, "size");
const COLOR_ROWS = padBrk(COLOR_BASE, 22, "color");

/* --------------------------- primitives -------------------------- */

function Pill({ change, trend }: { change: string; trend: Trend }) {
  const styles: Record<Trend, string> = {
    up: "bg-success-50 text-success-600",
    down: "bg-success-50 text-success-600",
    flat: "bg-neutral-100 text-neutral-600",
  };
  return (
    <span
      className={`flex w-fit items-center rounded-full px-2 py-[3px] text-[11px] font-medium ${styles[trend]}`}
    >
      {change}
    </span>
  );
}

/* Local twin of the Card in ./parts — kept in step with it, including the `id`
   that lets the Overview tab link straight to a card. */
function Card({
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

function CardHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-base font-semibold text-neutral-800">{title}</h2>
      <p className="text-xs text-neutral-600">{subtitle}</p>
    </div>
  );
}


function KpiRow() {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-0 sm:grid-cols-3 lg:grid-cols-5">
      {KPIS.map((kpi) => (
        <div key={kpi.label} className="flex flex-col gap-1.5 p-4">
          <p className="text-xs text-neutral-600">{kpi.label}</p>
          <p className="text-[28px] font-bold leading-[34px] text-neutral-800">{kpi.value}</p>
          <Pill change={kpi.change} trend={kpi.trend} />
        </div>
      ))}
    </div>
  );
}

function TypeBreakdown() {
  // Shares overlap (an order can bracket on both), so normalize for the ring
  // while the legend keeps the true per-dimension percentages.
  const total = TYPE_BREAKDOWN.reduce((s, t) => s + t.pct, 0);
  const arcs = TYPE_BREAKDOWN.map((t) => ({
    label: t.label,
    pct: (t.pct / total) * 100,
    color: t.color,
  }));
  return (
    <Card>
      <div className="flex h-full flex-col">
        <CardHeading
          title="What kind of bracketing?"
          subtitle="Size = same style, different sizes. Color = same style, different colors."
        />
        <div className="flex flex-1 flex-col items-center justify-center gap-5 py-4 sm:flex-row">
          <Donut segments={arcs} centerTop={BRACKETED_TOTAL} centerBottom="orders" />
          <ul className="flex min-w-0 flex-1 flex-col gap-2">
            {TYPE_BREAKDOWN.map((t) => (
              <li key={t.label} className="flex items-center gap-2 text-sm">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                <span className="font-medium text-neutral-800">{t.label}</span>
                <span className="text-neutral-600">
                  — {t.pct}% · {t.orders} orders
                </span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-[11px] leading-4 text-neutral-600">
          Orders can be bracketed on both size and color, so shares add to more than 100%.
        </p>
      </div>
    </Card>
  );
}

function DivergingProfitBar({ value }: { value: number }) {
  const pct = Math.min(Math.abs(value) / PROFIT_MAX, 1) * 100;
  const positive = value >= 0;
  return (
    <div className="flex h-6 items-center" aria-hidden="true">
      <div className="flex flex-1 justify-end">
        {positive ? null : (
          <div data-anim-bar="right" className="h-5 rounded-l-[4px] bg-danger-600" style={{ width: `${pct}%` }} />
        )}
      </div>
      <div className="h-6 w-px bg-neutral-300" />
      <div className="flex flex-1 justify-start">
        {positive ? (
          <div data-anim-bar className="h-5 rounded-r-[4px] bg-success-600" style={{ width: `${pct}%` }} />
        ) : null}
      </div>
    </div>
  );
}

function BracketingProfit() {
  return (
    <Card id="bracketing-profit">
      <div className="flex h-full flex-col">
        <CardHeading
          title="Where bracketing helps or hurts profit"
          subtitle="Average profit per order by bracketing type — green adds margin, red loses it."
        />
        <div className="flex flex-1 flex-col justify-center gap-4 py-4">
          {BRACKETING_TYPES.map((t) => (
            <div key={t.label} className="flex items-center gap-3">
              <div className="w-16 shrink-0">
                <p className="text-sm font-medium text-neutral-800">{t.label}</p>
                <p className="text-[11px] text-neutral-600">{t.orders} orders</p>
              </div>
              <div className="min-w-0 flex-1">
                <DivergingProfitBar value={t.profit} />
              </div>
              <span
                className={`w-14 shrink-0 text-right text-sm font-semibold ${
                  t.profit >= 0 ? "text-success-600" : "text-danger-600"
                }`}
              >
                {t.profit >= 0 ? "+" : "−"}${Math.abs(t.profit)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-[10px] text-neutral-600">
          Profit per order relative to a $0 break-even line
        </p>
      </div>
    </Card>
  );
}

function BracketingOutcomes() {
  return (
    <Card>
      <div className="flex h-full flex-col">
        <CardHeading
          title="Do bracketed orders come back?"
          subtitle="Share of each bracketing type kept versus returned."
        />
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {OUTCOME_LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-neutral-600">
              <span className="size-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
        <div className="flex flex-1 flex-col justify-center gap-4 py-4">
          {BRACKETING_TYPES.map((t) => {
            const kept = t.keep[0] + t.keep[1];
            return (
              <div key={t.label} className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-neutral-800">{t.label}</span>
                  <span className="text-[11px] text-neutral-600">
                    <span className="font-semibold text-neutral-700">{kept}% kept</span> ·{" "}
                    {t.keep[2]}% returned
                  </span>
                </div>
                <div data-anim-bar className="flex h-3 w-full overflow-hidden rounded-[4px]">
                  {t.keep.map((p, i) => (
                    <span key={i} style={{ width: `${p}%`, backgroundColor: OUTCOME_LEGEND[i].color }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

function RecBadge({ rec }: { rec: Rec }) {
  const m = REC_META[rec];
  const cls =
    m.tone === "good"
      ? "bg-success-50 text-success-600"
      : m.tone === "bad"
        ? "bg-danger-50 text-danger-600"
        : "bg-warning-50 text-warning-600";
  return (
    <span className={`inline-flex whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ${cls}`}>
      {m.label}
    </span>
  );
}

function BrkTable({
  id,
  title,
  subtitle,
  pctLabel,
  rows,
}: {
  id: string;
  title: string;
  subtitle: string;
  pctLabel: string;
  rows: BrkRow[];
}) {
  const { slice, page, setPage, total, pageSize } = usePaged(rows, 6);
  return (
    <Card id={id}>
      <CardHeading title={title} subtitle={subtitle} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] text-neutral-600 [text-wrap:balance]">
              <th className="py-2 pr-1.5 align-bottom font-normal leading-tight">Department</th>
              <th className="px-1.5 py-2 text-right align-bottom font-normal leading-tight">Revenue</th>
              <th className="px-1.5 py-2 text-right align-bottom font-normal leading-tight">{pctLabel}</th>
              <th className="px-1.5 py-2 text-right align-bottom font-normal leading-tight">% Returned in Full</th>
              <th className="px-1.5 py-2 text-right align-bottom font-normal leading-tight">Δ Profit / Order</th>
              <th className="px-1.5 py-2 align-bottom font-normal leading-tight">Recommendation</th>
              <th className="px-1.5 py-2 text-right align-bottom font-normal leading-tight">Rev. Opportunity</th>
              <th className="py-2 pl-1.5 font-normal" />
            </tr>
          </thead>
          <tbody>
            {slice.map((r) => (
              <tr key={r.dept} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-1.5 font-medium text-neutral-800">{r.dept}</td>
                <td className="whitespace-nowrap px-1.5 py-3 text-right text-neutral-700">{r.revenue}</td>
                <td className="whitespace-nowrap px-1.5 py-3 text-right text-neutral-700">{r.pct}</td>
                <td className="whitespace-nowrap px-1.5 py-3 text-right text-neutral-700">{r.returned}</td>
                <td className={`whitespace-nowrap px-1.5 py-3 text-right font-semibold ${r.positive ? "text-success-600" : "text-danger-600"}`}>
                  {r.delta}
                </td>
                <td className="px-1.5 py-3">
                  <RecBadge rec={r.rec} />
                </td>
                <td className="whitespace-nowrap px-1.5 py-3 text-right font-semibold text-neutral-800">
                  {r.opportunity}
                </td>
                <td className="py-3 pl-1.5 text-right">
                  <TakeAction context="Bracketing" department={r.dept} />
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

const BRK_RECS: RecItem[] = [
  { label: "Promote color bracketing", tone: "good", impact: "$111K", context: "Bracketing", department: "Running", why: "Color-bracketed orders keep 90% of the order and earn about +$44 each — expand where volume is high, starting with Running and Casual." },
  { label: "Allow size bracketing where it pays", tone: "good", impact: "$50K", context: "Bracketing", department: "Steel Toe", why: "Profitable in the footwear toe categories where fit is predictable (Steel and Soft Toe), so the usual size-bracketing downside does not apply." },
  { label: "Improve size guidance", tone: "warn", impact: "Retention", context: "Bracketing", department: "Size bracketing", why: "Two in five size-bracketed orders come back in full — clearer PDP fit guidance cuts the outcome most likely to end the relationship." },
  { label: "Discourage size bracketing", tone: "bad", impact: "$4.7K", context: "Bracketing", department: "Light Hike", why: "Nudge it down in the categories where it loses margin, without touching the categories where it pays." },
];

export default function BracketingTab({
  insight,
  description,
}: {
  insight: ReactNode;
  description: ReactNode;
}) {
  return (
    <>
      <AiInsight title="Bracketing Insights" subtitle={description}>
        {insight}
      </AiInsight>
      {/* KPIs are metrics, not AI output, so they sit in their own box below the
          insight rather than inside it. */}
      <KpiRow />
      {/* Three charts share one row on a wide screen and stack below it, the
          same layout as the Exchange tab. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <TypeBreakdown />
        <BracketingOutcomes />
        <BracketingProfit />
      </div>
      <RecommendedActions context="Bracketing" items={BRK_RECS} />
      {/* One table per dimension — each carries allow / discourage / guidance in a
          Recommendation column, so the two tables replace the old four. */}
      <BrkTable
        id="bracketing-promote-size"
        title="Size bracketing"
        subtitle="Every department's size bracketing, with the recommendation its economics imply · R12M"
        pctLabel="% Brkt. on Size"
        rows={SIZE_ROWS}
      />
      <BrkTable
        id="bracketing-promote-color"
        title="Color bracketing"
        subtitle="Every department's color bracketing, with the recommendation its economics imply · R12M"
        pctLabel="% Brkt. on Color"
        rows={COLOR_ROWS}
      />
    </>
  );
}
