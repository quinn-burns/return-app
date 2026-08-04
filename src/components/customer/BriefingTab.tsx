"use client";

import { AiInsight, Card, CardHeading, Donut, MetricsCard } from "./parts";

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
/* The number stays black; the period-on-period change carries the good/bad read
   as a small pill — `dir` colors the pill (good = green, bad = red, flat = gray),
   the arrow lives in the `change` string. */
type Dir = "good" | "bad" | "flat";
type Kpi = { label: string; value: string; sub: string; info?: string; change: string; dir: Dir };
const KPIS: Kpi[] = [
  { label: "Return Rate", value: "14.76%", sub: "of items returned", info: "Share of shipped items returned, rolling 12 months.", change: "↓ 2.0 pts vs LY", dir: "good" },
  { label: "Repurchase Rate", value: "28.4%", sub: "buy a second time", info: "Share of customers who place a second order.", change: "↑ 1.4 pts vs LY", dir: "good" },
  { label: "Net Rev / Customer", value: "$440", sub: "lifetime, after returns", info: "Lifetime net revenue per customer, after returns.", change: "↑ $12 vs LY", dir: "good" },
  { label: "% Orders Bracketed", value: "8.46%", sub: "of all orders", info: "Orders with multiple sizes or colors of one style.", change: "↓ 0.0 pts vs LY", dir: "flat" },
  { label: "Same-Style Exchange Rate", value: "4.4%", sub: "of returns recovered", info: "Returns saved as a same-style swap rather than a refund.", change: "↑ 0.5 pts vs LY", dir: "good" },
];

/* Segments summary — the at-risk groups, listed (they overlap, so not summed).
   For an at-risk group, a growing count is bad (red) and a shrinking one good. */
const SEGMENTS: { name: string; count: string; revenue: string; rate: string; change: string; dir: Dir }[] = [
  { name: "New, no repurchase", count: "1,574", revenue: "$4.3M", rate: "34.5% return", change: "↑ 210 vs LY", dir: "bad" },
  { name: "High return-rate", count: "2,503", revenue: "$4.1M", rate: "33.4% return", change: "↓ 140 vs LY", dir: "good" },
  { name: "Unprofitable", count: "836", revenue: "$1.5M", rate: "48.0% return", change: "↑ 62 vs LY", dir: "bad" },
  { name: "Likely resellers", count: "1,947", revenue: "$743K", rate: "59.7% return", change: "↑ 88 vs LY", dir: "bad" },
];

/* Bracketing summary. A mutually-exclusive split of bracketed orders — size
   only, color only, or both — so the ring reads honestly and sums to 100%. */
const BRK_TYPES = [
  { label: "Size only", pct: 55, color: "#4169e1" },
  { label: "Color only", pct: 33, color: "#27cba7" },
  { label: "Both", pct: 12, color: "#ababab" },
];

/* Exchange summary. */
const EXCH_OUTCOME = [
  { label: "Kept", pct: 67, color: "#059467" },
  { label: "Returned", pct: 33, color: "#dc2828" },
];

/* Customer Value summary — the new-customer lens, so it doesn't repeat the
   overall repurchase/net-rev headlines already in the KPI row. */
const VALUE: { label: string; value: string; sub: string; info: string; change: string; dir: Dir }[] = [
  { label: "New-Cust. Repurchase", value: "22%", sub: "2nd order ≤ 12 mo", info: "New customers who buy again within a year.", change: "↑ 1.1 pts vs LY", dir: "good" },
  { label: "New-Cust. Net Rev", value: "$403", sub: "first 12 months", info: "Net revenue from a new customer in their first year.", change: "↑ $9 vs LY", dir: "good" },
  { label: "Repeat within 90 days", value: "12.1%", sub: "of first-time buyers", info: "First-time buyers who return for a second order within 90 days.", change: "↑ 0.6 pts vs LY", dir: "good" },
  { label: "Avg Orders / Customer", value: "2.4", sub: "lifetime", info: "Average lifetime orders per customer.", change: "↑ 0.1 vs LY", dir: "good" },
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

/** Period-on-period change pill — green for a good move, red for bad, gray for
    flat. Matches the KPI pills on the detail tabs. */
function ChangePill({ change, dir }: { change: string; dir: Dir }) {
  const cls =
    dir === "good"
      ? "bg-success-50 text-success-600"
      : dir === "bad"
        ? "bg-danger-50 text-danger-600"
        : "bg-neutral-100 text-neutral-600";
  return (
    <span className={`flex w-fit items-center rounded-full px-2 py-[3px] text-[11px] font-medium ${cls}`}>
      {change}
    </span>
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
    <AiInsight
      title="Briefing Insights"
      items={[
        {
          lead: (
            <>
              Color bracketing <InfoTip label="What is bracketing?" text={BRACKETING_DEF} /> pays;
              size bracketing leaks.
            </>
          ),
          text: "Color-bracketed orders are kept and repeat; size-bracketed ones come back and churn — so scope any size-guidance rollout to size only, or you suppress your best lever.",
        },
        {
          lead: "Your churn and your margin leak are the same customers.",
          text: "New customers who return once and never come back overlap heavily with size bracketers, so one intervention can move both problems.",
        },
        {
          lead: "Fewer than one return in twenty is recovered as an exchange.",
          text: "Each conversion moves that customer from a 41% repeat rate to 58% — a large retention gain for a small operational change.",
        },
        {
          lead: "Keeping the whole first order predicts a second purchase.",
          text: "Keep-all customers come back at 74% while full returners sit at 41% — the clearest early churn signal to act on.",
        },
        {
          lead: "The first order is where retention is won or lost.",
          text: "Customers who return everything on their first order almost never come back, so intervening at that first return matters more than any later touch.",
        },
        {
          lead: "The department they return into predicts what they buy next.",
          text: "Kept-all customers concentrate their next purchase in W Denim and W Tops — the clearest place to aim a follow-up offer.",
        },
      ]}
    />
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
          <p className="text-[28px] font-bold leading-[34px] text-neutral-800">{k.value}</p>
          <p className="text-[11px] text-neutral-600">{k.sub}</p>
          <ChangePill change={k.change} dir={k.dir} />
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {VALUE.map((v) => (
          <div
            key={v.label}
            className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-0 p-4"
          >
            <p className="flex items-center gap-1 text-xs text-neutral-600">
              {v.label}
              <InfoTip label={v.label} text={v.info} />
            </p>
            <p className="text-2xl font-bold text-neutral-800">{v.value}</p>
            <p className="text-[11px] text-neutral-600">{v.sub}</p>
            <ChangePill change={v.change} dir={v.dir} />
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
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {SEGMENTS.map((s) => (
          <div
            key={s.name}
            className="flex flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-0 p-4"
          >
            <p className="text-xs text-neutral-600">{s.name}</p>
            <p className="text-2xl font-bold leading-tight text-neutral-800">{s.count}</p>
            <p className="text-[11px] text-neutral-600">
              {s.revenue} · {s.rate}
            </p>
            <ChangePill change={s.change} dir={s.dir} />
          </div>
        ))}
      </div>
    </AreaCard>
  );
}

/** Bracketing summary. */
function BracketingSummary({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  return (
    <AreaCard
      title="Bracketing"
      subtitle="How much of the business is bracketed, and what happens when it is · rolling 12 months"
      onDetails={() => onGo("Bracketing", "bracketing-profit")}
    >
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
        <div>
          <p className="flex items-center gap-1 text-xs text-neutral-600">
            Size brackets returned in full
            <InfoTip label="Size brackets returned" text="Share of size-bracketed orders where every item came back." />
          </p>
          <p className="mt-0.5 text-2xl font-bold text-neutral-800">40%</p>
          <p className="text-[11px] text-neutral-600">vs 2% for color</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Donut segments={BRK_TYPES} centerTop="171K" centerBottom="bracketed" size={104} />
          <div className="flex flex-col gap-1.5">
            {BRK_TYPES.map((t) => (
              <span key={t.label} className="flex items-center gap-2 text-xs text-neutral-700">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label} <span className="font-semibold text-neutral-800">{t.pct}%</span>
              </span>
            ))}
          </div>
        </div>
        <div className="lg:text-right">
          <p className="text-xs text-neutral-600">Profit per bracketed order</p>
          <p className="mt-1 text-sm text-neutral-800">
            Best · Color <span className="font-semibold text-success-600">+$44</span>
          </p>
          <p className="text-sm text-neutral-800">
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
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-center">
        <div>
          <p className="text-xs text-neutral-600">Exchanges that stick</p>
          <p className="mt-0.5 text-2xl font-bold text-neutral-800">67%</p>
          <p className="text-[11px] text-neutral-600">33% come back again</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Donut segments={EXCH_OUTCOME} centerTop="5K" centerBottom="exchanges" size={104} />
          <div className="flex flex-col gap-1.5">
            {EXCH_OUTCOME.map((t) => (
              <span key={t.label} className="flex items-center gap-2 text-xs text-neutral-700">
                <span className="size-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                {t.label} <span className="font-semibold text-neutral-800">{t.pct}%</span>
              </span>
            ))}
          </div>
        </div>
        <div className="lg:text-right">
          <p className="text-xs text-neutral-600">Program opportunity</p>
          <p className="mt-1 text-2xl font-bold text-neutral-800">$66K</p>
          <p className="text-[11px] text-neutral-600">lifting capture to 5.0% of returns</p>
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
