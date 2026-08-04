"use client";

import { Card, CardHeading, Donut, MetricsCard } from "./parts";

/* ----------------------------- data ----------------------------- */

/* Money to gain: a total that exists only by summing opportunity across
   Bracketing and Exchange — a cross-tab figure. */
const RECOVERABLE = [
  { area: "Bracketing", value: 166, display: "$166K", color: "#4169e1" },
  { area: "Exchange", value: 66, display: "$66K", color: "#27cba7" },
];
const RECOVERABLE_TOTAL = "$232K";

const BRACKETING_DEF =
  "Bracketing: ordering several sizes or colors of the same style to compare at home, then returning the ones that don't fit — so one order becomes several returns.";

/* Headline KPIs — the one number each area leads with, pulled together so the
   whole customer picture reads in one row. */
type Kpi = { label: string; value: string; sub: string; info?: string; risk?: boolean };
const KPIS: Kpi[] = [
  { label: "Return Rate", value: "14.76%", sub: "of items returned", info: "Share of shipped items returned, rolling 12 months." },
  { label: "% Orders Bracketed", value: "8.46%", sub: "of all orders", info: "Orders with multiple sizes or colors of one style." },
  { label: "Same-Style Exchange Rate", value: "4.4%", sub: "of returns recovered", info: "Returns saved as a same-style swap rather than a refund." },
  { label: "Repurchase (Kept All)", value: "74%", sub: "buy again", info: "Customers who kept a full order and came back." },
  { label: "Revenue at Risk", value: "$4.3M", sub: "1,574 fragile customers", risk: true },
];

/* Segments summary — the at-risk groups, listed (they overlap, so not summed). */
const SEGMENTS = [
  { name: "New, no repurchase", count: "1,574", revenue: "$4.3M", rate: "34.5% return" },
  { name: "High return-rate", count: "2,503", revenue: "$4.1M", rate: "33.4% return" },
  { name: "Unprofitable", count: "836", revenue: "$1.5M", rate: "48.0% return" },
  { name: "Likely resellers", count: "1,947", revenue: "$743K", rate: "59.7% return" },
];

/* Bracketing summary. Shares overlap (an order can bracket on both), so the ring
   is normalized while the legend keeps the true per-dimension percentages. */
const BRK_TYPES = [
  { label: "Size", pct: 65, color: "#4169e1" },
  { label: "Color", pct: 51, color: "#27cba7" },
  { label: "Other", pct: 2, color: "#ababab" },
];

/* Exchange summary. */
const EXCH_OUTCOME = [
  { label: "Kept", pct: 67, color: "#059467" },
  { label: "Returned", pct: 33, color: "#dc2828" },
];

/* Customer Value summary — how much customers come back and spend. */
const VALUE = [
  { label: "Repurchase Rate", value: "28.4%", sub: "1.7M customers", info: "Share of customers who place a second order." },
  { label: "Net Rev / Customer", value: "$440", sub: "lifetime", info: "Lifetime net revenue per customer, after returns." },
  { label: "New Cust. Repurchase", value: "28.4%", sub: "2nd order ≤ 12 mo", info: "New customers who buy again within a year." },
  { label: "New Cust. Net Rev", value: "$403", sub: "first 12 months", info: "Net revenue from a new customer in their first year." },
];

/* Customer Journey summary — the biggest sequences across the whole journey. */
const JOURNEY = [
  { tone: "bad" as const, title: "Bracketers who return everything rarely come back", detail: "Size bracketers who send the whole order back repurchase at just 41% — the clearest early churn signal." },
  { tone: "warn" as const, title: "A return with no exchange is the biggest leak", detail: "Only 4.4% of returns convert to a same-style exchange; the rest walk away with the refund." },
  { tone: "good" as const, title: "The best journey is a bracket that works", detail: "Keep-all bracketed orders repurchase at 74% and drive the most downstream value into W Denim and W Tops." },
];
const JOURNEY_TONE: Record<"bad" | "warn" | "good", string> = {
  bad: "border-danger-100 bg-danger-50",
  warn: "border-warning-100 bg-warning-50",
  good: "border-success-100 bg-success-50",
};
const JOURNEY_DOT: Record<"bad" | "warn" | "good", string> = {
  bad: "#dc2828",
  warn: "#f59f0a",
  good: "#059467",
};

/* --------------------------- primitives -------------------------- */

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The section link into the detail tab that owns these numbers. */
function DetailsLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
    >
      Details
      <ArrowRight />
    </button>
  );
}

/** Hover-revealed definition, for terms obvious to merchandising but not to the
    CX and marketing people pulled into these conversations. */
function InfoTip({ label, text }: { label: string; text: string }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className="flex size-[15px] items-center justify-center rounded-full border border-neutral-300 text-[10px] font-bold text-neutral-500"
      >
        i
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-60 -translate-x-1/2 rounded-lg bg-neutral-800 px-3 py-2 text-left text-[11px] font-normal leading-snug text-neutral-0 shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}

/** Heading with a Details link on the right — the frame for each area summary. */
function AreaCard({
  title,
  subtitle,
  onDetails,
  children,
}: {
  title: string;
  subtitle: string;
  onDetails?: () => void;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <CardHeading title={title} subtitle={subtitle} />
        {onDetails ? <DetailsLink onClick={onDetails} /> : null}
      </div>
      <div className="mt-4">{children}</div>
    </Card>
  );
}

/* --------------------------- sections ---------------------------- */

/** Money to gain / money to protect — top of the page, on a lighter panel. */
function MoneyBar({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  const total = RECOVERABLE.reduce((s, r) => s + r.value, 0);
  return (
    <section className="overflow-hidden rounded-lg border border-primary-100 bg-primary-50">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="flex-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-700">
            <span className="size-2 rounded-full bg-brand-teal" />
            Money to gain
          </p>
          <p className="mt-1.5 text-[44px] font-bold leading-none text-neutral-800">{RECOVERABLE_TOTAL}</p>
          <p className="mt-2 text-xs text-neutral-600">
            Recoverable across bracketing and exchange — a total that exists only by summing both.
          </p>
          <div className="mt-3.5 flex h-2 max-w-[420px] overflow-hidden rounded-full">
            {RECOVERABLE.map((r) => (
              <span key={r.area} style={{ width: `${(r.value / total) * 100}%`, backgroundColor: r.color }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {RECOVERABLE.map((r) => (
              <span key={r.area} className="flex items-center gap-1.5 text-xs text-neutral-600">
                <span className="size-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.area} <span className="font-semibold text-neutral-800">{r.display}</span>
              </span>
            ))}
          </div>
          <details className="mt-2.5 text-[11px] text-neutral-500">
            <summary className="cursor-pointer select-none">How this is calculated</summary>
            <p className="mt-1 max-w-[440px] leading-snug">
              Rolling 12 months. Sum of the revenue-opportunity column across each action table, top
              departments only, at a 1.05× adoption assumption. Levers are independent, so they add.
            </p>
          </details>
        </div>

        <div className="hidden w-px shrink-0 bg-primary-100 lg:block" />

        <div className="flex flex-col justify-center rounded-lg border border-primary-100 bg-neutral-0 p-4 lg:w-[320px]">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-700">
            <span className="size-2 rounded-full bg-warning-400" />
            Money to protect
          </p>
          <p className="mt-1.5 text-[28px] font-bold leading-none text-neutral-800">$4.3M</p>
          <p className="mt-2 text-xs leading-relaxed text-neutral-600">
            Revenue you already hold, sitting in your most fragile group — 1,574 new customers who
            returned once and never came back.
          </p>
          <button
            type="button"
            onClick={() => onGo("Segments", "segments-impact")}
            className="mt-2.5 inline-flex items-center gap-1 self-start text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            See all at-risk segments
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

/** The AI read: one line that names the conflict, not a recap of the numbers. */
function BriefingInsights() {
  return (
    <section className="rounded-lg border border-primary-100 bg-primary-50 p-4">
      <div className="flex items-center gap-1.5">
        <span className="flex items-center justify-center rounded-full bg-gradient-to-b from-[#27cba7] to-[#0b61dd] p-[3.5px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overview/ai-logo.svg" alt="" className="size-[17px]" />
        </span>
        <h2 className="text-xl font-semibold text-primary-700">Briefing Insights</h2>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
        Color bracketing{" "}
        <InfoTip label="What is bracketing?" text={BRACKETING_DEF} /> recovers the most and retains
        best; size bracketing, its mirror, leaks the most — so treat them as one decision, and scope
        any size-guidance rollout to size only.
      </p>
    </section>
  );
}

/** Headline KPI row, styled like the KPI strips on the detail tabs. */
function KpiRow() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {KPIS.map((k) => (
        <div key={k.label} className="flex flex-col gap-1.5 rounded-lg border border-neutral-200 bg-neutral-0 p-4">
          <p className="flex items-center gap-1 text-xs text-neutral-600">
            {k.label}
            {k.info ? <InfoTip label={k.label} text={k.info} /> : null}
          </p>
          <p className={`text-[28px] font-bold leading-[34px] ${k.risk ? "text-danger-600" : "text-neutral-800"}`}>
            {k.value}
          </p>
          <p className="text-[11px] text-neutral-600">{k.sub}</p>
        </div>
      ))}
    </div>
  );
}

/** Customer Value summary — no dedicated tab, so no Details link. */
function CustomerValueSummary() {
  return (
    <AreaCard
      title="Customer Value"
      subtitle="How much customers come back and spend after they buy · all time"
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {VALUE.map((v) => (
          <div key={v.label}>
            <p className="flex items-center gap-1 text-xs text-neutral-600">
              {v.label}
              <InfoTip label={v.label} text={v.info} />
            </p>
            <p className="mt-0.5 text-2xl font-bold text-neutral-800">{v.value}</p>
            <p className="text-[11px] text-neutral-600">{v.sub}</p>
          </div>
        ))}
      </div>
    </AreaCard>
  );
}

/** Customer Journey summary — the biggest sequences, as tone-coded callouts. */
function CustomerJourneySummary({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  return (
    <AreaCard
      title="Customer Journey"
      subtitle="The biggest sequences across bracketing, returns and repurchase · rolling 12 months"
      onDetails={() => onGo("Customer Journey", "flow-journeys")}
    >
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {JOURNEY.map((c) => (
          <div key={c.title} className={`rounded-lg border p-3 ${JOURNEY_TONE[c.tone]}`}>
            <div className="flex items-start gap-2">
              <span
                className="mt-1 size-2 shrink-0 rounded-full"
                style={{ backgroundColor: JOURNEY_DOT[c.tone] }}
              />
              <p className="text-sm font-semibold leading-snug text-neutral-800">{c.title}</p>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">{c.detail}</p>
          </div>
        ))}
      </div>
    </AreaCard>
  );
}

/** Segments summary. */
function SegmentsSummary({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  return (
    <AreaCard
      title="Segments"
      subtitle="Exportable groups of customers to act on · rolling 12 months"
      onDetails={() => onGo("Segments", "segments-impact")}
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {SEGMENTS.map((s) => (
          <div key={s.name}>
            <p className="text-xs text-neutral-600">{s.name}</p>
            <p className="mt-0.5 text-2xl font-bold leading-tight text-danger-600">{s.count}</p>
            <p className="text-[11px] text-neutral-600">
              {s.revenue} · {s.rate}
            </p>
          </div>
        ))}
      </div>
    </AreaCard>
  );
}

/** Bracketing summary. */
function BracketingSummary({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  const totalPct = BRK_TYPES.reduce((s, t) => s + t.pct, 0);
  const arcs = BRK_TYPES.map((t) => ({ label: t.label, pct: (t.pct / totalPct) * 100, color: t.color }));
  return (
    <AreaCard
      title="Bracketing"
      subtitle="How much of the business is bracketed, and what happens when it is · rolling 12 months"
      onDetails={() => onGo("Bracketing", "bracketing-profit")}
    >
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-neutral-600">% Orders Bracketed</p>
            <p className="mt-0.5 text-2xl font-bold text-neutral-800">8.46%</p>
            <p className="text-[11px] text-neutral-600">143K of 847K orders</p>
          </div>
          <div>
            <p className="flex items-center gap-1 text-xs text-neutral-600">
              Size brackets returned in full
              <InfoTip label="Size brackets returned" text="Share of size-bracketed orders where every item came back." />
            </p>
            <p className="mt-0.5 text-2xl font-bold text-danger-600">40%</p>
            <p className="text-[11px] text-neutral-600">vs 2% for color</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Donut segments={arcs} centerTop="171K" centerBottom="orders" size={104} />
          <div className="flex flex-col gap-1.5">
            {BRK_TYPES.map((t) => (
              <span key={t.label} className="flex items-center gap-2 text-xs text-neutral-700">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label} <span className="font-semibold text-neutral-800">{t.pct}%</span>
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm">
          <p className="text-xs text-neutral-600">Profit per bracketed order</p>
          <p className="mt-1 text-neutral-800">
            Best · Color <span className="font-semibold text-success-600">+$44</span>
          </p>
          <p className="text-neutral-800">
            Worst · Size <span className="font-semibold text-danger-600">−$7</span>
          </p>
        </div>
      </div>
    </AreaCard>
  );
}

/** Exchange summary. */
function ExchangeSummary({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  return (
    <AreaCard
      title="Exchange"
      subtitle="How much return revenue is recovered by a same-style swap · rolling 12 months"
      onDetails={() => onGo("Exchange", "exchange-promote")}
    >
      <div className="flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
        <div className="flex gap-8">
          <div>
            <p className="text-xs text-neutral-600">Same-Style Exchange Rate</p>
            <p className="mt-0.5 text-2xl font-bold text-neutral-800">4.4%</p>
            <p className="text-[11px] text-neutral-600">5K of 154K returned items</p>
          </div>
          <div>
            <p className="text-xs text-neutral-600">Exchanges that stick</p>
            <p className="mt-0.5 text-2xl font-bold text-success-600">67%</p>
            <p className="text-[11px] text-neutral-600">33% come back again</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Donut segments={EXCH_OUTCOME} centerTop="4.4%" centerBottom="recovered" size={104} />
          <div className="flex flex-col gap-1.5">
            {EXCH_OUTCOME.map((t) => (
              <span key={t.label} className="flex items-center gap-2 text-xs text-neutral-700">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label} <span className="font-semibold text-neutral-800">{t.pct}%</span>
              </span>
            ))}
          </div>
        </div>
        <div className="text-sm">
          <p className="text-xs text-neutral-600">Exchange program opportunity</p>
          <p className="mt-1 text-2xl font-bold text-success-600">$66K</p>
          <p className="text-[11px] text-neutral-600">modeled: lifting capture to 5.0% of returns</p>
        </div>
      </div>
    </AreaCard>
  );
}

/* ------------------------------ tab ------------------------------ */

export default function BriefingTab({ onGo }: { onGo: (tab: string, anchor?: string) => void }) {
  return (
    <>
      <MoneyBar onGo={onGo} />
      <BriefingInsights />
      <MetricsCard>
        <KpiRow />
      </MetricsCard>
      <CustomerValueSummary />
      <SegmentsSummary onGo={onGo} />
      <BracketingSummary onGo={onGo} />
      <ExchangeSummary onGo={onGo} />
      <CustomerJourneySummary onGo={onGo} />
    </>
  );
}
