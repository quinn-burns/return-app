"use client";

import { useState } from "react";
import { ActionModalProvider } from "./ActionSubmit";
import { AiInsight, Donut, TakeAction, useReveal } from "./parts";
import {
  BRAND_OPTS,
  COUNTRY_OPTS,
  CATEGORY_OPTS,
  CUSTOMER_TYPE_OPTS,
  DEPARTMENT_OPTS,
  PERIOD_OPTS,
  FilterSelect,
  FilterBarProvider,
  ApplyFiltersButton,
  ResetFiltersButton,
} from "./filters";
import ExchangeTab from "./ExchangeTab";
import SegmentsTab from "./SegmentsTab";
import BehavioralFlowTab from "./BehavioralFlowTab";

/* ----------------------------- data ----------------------------- */

const TABS = ["Bracketing", "Exchange", "Segments", "Behavioral Flow"] as const;
type Tab = (typeof TABS)[number];

const TAB_META: Record<Tab, { description: string; insight: React.ReactNode }> = {
  Bracketing: {
    description:
      "How customers order multiple sizes or colors of the same style to compare at home — and where that bracketing adds or erodes margin.",
    insight: (
      <>
        Color bracketing is almost always profitable — color-bracketed orders generate{" "}
        <span className="font-semibold text-neutral-800">$20–50 more revenue per order</span>{" "}
        than non-bracketed. Size bracketing, by contrast, breaks even or loses money across your top
        categories, so it&rsquo;s the lever with the most downside to manage.
      </>
    ),
  },
  Exchange: {
    description:
      "How often returns are recovered as same-style exchanges instead of lost sales, broken down by department.",
    insight: (
      <>
        Exchanges recover revenue that returns otherwise lose. A true same-style exchange keeps the
        sale, and departments with{" "}
        <span className="font-semibold text-neutral-800">
          low exchange rates or high re-return rates
        </span>{" "}
        are your biggest untapped opportunities — Light Hike and Running lead on size-exchange
        upside.
      </>
    ),
  },
  Segments: {
    description:
      "Actionable customer groups surfaced from return behavior — ready to filter by loyalty tier and export.",
    insight: (
      <>
        Your <span className="font-semibold text-neutral-800">836 unprofitable customers</span>{" "}alone
        account for $1.5M in return revenue at a 48% return rate. Overlaying them with the high
        return-rate and likely-reseller segments gives you a targeted list to act on before the cost
        compounds.
      </>
    ),
  },
  "Behavioral Flow": {
    description:
      "The full journey from how customers bracket, through what they keep, to whether they come back and what they buy next.",
    insight: (
      <>
        Customers who <span className="font-semibold text-neutral-800">keep all</span>{" "}of a bracketed
        order are far more valuable downstream — they repurchase at high rates and drive most net
        value into W Denim and W Tops. Those who return everything and don&rsquo;t come back are the
        clearest early churn signal to intervene on.
      </>
    ),
  },
};

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
  { label: "Size", pct: 65, orders: "111K", color: "#4169e1" },
  { label: "Color", pct: 51, orders: "87K", color: "#85a1ff" },
  { label: "Other", pct: 2, orders: "3K", color: "#c7d4ff" },
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

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
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

function CardHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-base font-semibold text-neutral-800">{title}</h2>
      <p className="text-xs text-neutral-600">{subtitle}</p>
    </div>
  );
}

/* ---------------------------- sections --------------------------- */

function Header() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 bg-neutral-0 px-4 py-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-[36px] font-bold leading-tight text-neutral-800">Customers</h1>
        <p className="text-sm text-neutral-600">
          Understand customer behavior including bracketing, exchanges, and returns by department
        </p>
      </div>
    </header>
  );
}

function FilterBar({ tab }: { tab: Tab }) {
  return (
    <FilterBarProvider>
      <div className="flex flex-wrap items-center gap-4">
        <FilterSelect label="Brand" options={BRAND_OPTS} />
        <FilterSelect label="Country" options={COUNTRY_OPTS} />
        <FilterSelect label="Product Category" options={CATEGORY_OPTS} />
        {tab === "Behavioral Flow" ? (
          <>
            <FilterSelect label="Customer Type" options={CUSTOMER_TYPE_OPTS} />
            <FilterSelect label="1st Purchase Department" options={DEPARTMENT_OPTS} />
          </>
        ) : null}
        <FilterSelect label="Period" options={PERIOD_OPTS} />
        <div className="ml-auto flex items-center gap-4">
          <ApplyFiltersButton />
          <ResetFiltersButton />
        </div>
      </div>
    </FilterBarProvider>
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
                      : "whitespace-nowrap text-[13px] font-medium text-neutral-600"
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
      <CardHeading
        title="What kind of bracketing?"
        subtitle="Size = same style, different sizes. Color = same style, different colors."
      />
      <div className="mt-4 flex flex-col items-center gap-5 sm:flex-row">
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
      <p className="mt-3 text-[11px] leading-4 text-neutral-600">
        Orders can be bracketed on both size and color, so shares add to more than 100%.
      </p>
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
    <Card>
      <CardHeading
        title="Where bracketing helps or hurts profit"
        subtitle="Average profit per order by bracketing type — green adds margin, red loses it."
      />
      <div className="mt-4 flex flex-col gap-3">
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
      <p className="mt-3 text-center text-[10px] text-neutral-600">
        Profit per order relative to a $0 break-even line
      </p>
    </Card>
  );
}

function BracketingOutcomes() {
  return (
    <Card>
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
      <div className="mt-4 flex flex-col gap-4">
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
    <Card>
      <CardHeading title={title} subtitle={subtitle} />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Department</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Revenue</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">{pctLabel}</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Orders</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Δ Profit / Order</th>
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
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.orders}</td>
                <td
                  className={`whitespace-nowrap px-3 py-3 text-right font-semibold ${negative ? "text-danger-600" : "text-success-600"}`}
                >
                  {r.delta}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-neutral-800">
                  {r.opportunity}
                </td>
                <td className="py-3 pl-3 text-right">
                  <TakeAction context="Bracketing" department={r.dept} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function BracketingTab() {
  return (
    <>
      <KpiRow />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TypeBreakdown />
        <BracketingProfit />
      </div>
      <BracketingOutcomes />
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
    <ActionModalProvider>
      <div className="min-h-screen bg-neutral-0">
        <Header />
        <div className="flex flex-col gap-5 px-4 pb-10 pt-3.5">
          <FilterBar tab={tab} />
          <TabBar tab={tab} onChange={setTab} />
          <p className="-mt-1 text-sm text-neutral-600">{TAB_META[tab].description}</p>
          <AiInsight>{TAB_META[tab].insight}</AiInsight>
          {tab === "Bracketing" ? (
            <BracketingTab />
          ) : tab === "Exchange" ? (
            <ExchangeTab />
          ) : tab === "Segments" ? (
            <SegmentsTab />
          ) : (
            <BehavioralFlowTab />
          )}
        </div>
      </div>
    </ActionModalProvider>
  );
}
