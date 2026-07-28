"use client";

import { Fragment, useState } from "react";
import { Card, CardHeading, TakeAction } from "./parts";

/* ----------------------------- data ----------------------------- */

const RECOVERABLE = [
  { area: "Bracketing", value: 166, display: "$166K", color: "#4169e1" },
  { area: "Exchange", value: 66, display: "$66K", color: "#27cba7" },
];
const RECOVERABLE_TOTAL = "$232K";

const TRENDS = [
  { label: "Return rate", value: "14.76%", note: "↓ 2.0 pts", good: true },
  { label: "Returns from bracketing", value: "30.84%", note: "↓ 0.9 pts", good: true },
  { label: "Returns recovered as exchanges", value: "4.4%", note: "no movement", good: false },
];

/* --- Conclusions that need two tabs to see. --- */
type Link = {
  title: string;
  body: string;
  proof: { label: string; value: string }[];
  from: string[];
  tab: string;
  anchor: string;
  tone: "bad" | "good";
};
const CONNECTIONS: Link[] = [
  {
    title: "Size bracketing costs you the customer, not just the margin",
    body: "Two in five size-bracketed orders come back in full, against one in fifty for color. And customers who return everything are the least likely to ever buy again — so the damage outlives the order.",
    proof: [
      { label: "Size orders returned in full", value: "40%" },
      { label: "Color orders returned in full", value: "2%" },
      { label: "Repurchase after returning all", value: "41%" },
      { label: "Repurchase after keeping all", value: "74%" },
    ],
    from: ["Bracketing", "Behavioral Flow"],
    tab: "Behavioral Flow",
    anchor: "flow-journeys",
    tone: "bad",
  },
  {
    title: "Color bracketing is a retention engine you are under-using",
    body: "Nine in ten color-bracketed orders are kept in full, and those customers come back at the highest rate you record. It earns margin on the order and buys the next one — and it is your single largest untapped lever.",
    proof: [
      { label: "Color orders kept in full", value: "90%" },
      { label: "Profit per color-bracketed order", value: "+$44" },
      { label: "Repurchase after keeping all", value: "74%" },
      { label: "Identified opportunity", value: "$111K" },
    ],
    from: ["Bracketing", "Behavioral Flow"],
    tab: "Bracketing",
    anchor: "bracketing-promote-color",
    tone: "good",
  },
  {
    title: "Every exchange you win is a 17-point retention swing",
    body: "An exchange turns a customer who returned everything into one who kept something. That is not just the sale recovered — it moves them onto a materially better repeat curve. You are currently converting fewer than one return in twenty.",
    proof: [
      { label: "Returns recovered as exchanges", value: "4.4%" },
      { label: "Repurchase after returning all", value: "41%" },
      { label: "Repurchase after keeping some", value: "58%" },
      { label: "Identified opportunity", value: "$57K" },
    ],
    from: ["Exchange", "Behavioral Flow"],
    tab: "Exchange",
    anchor: "exchange-promote",
    tone: "good",
  },
];

/* Segments overlap — listed rather than totalled. */
const AT_RISK = [
  { segment: "New customers: returns, no repurchase", customers: "1,574", revenue: "$4.3M", rate: "34.5%" },
  { segment: "High return rate customers", customers: "2,503", revenue: "$4.1M", rate: "33.4%" },
  { segment: "Unprofitable customers", customers: "836", revenue: "$1.5M", rate: "48.0%" },
  { segment: "Likely resellers", customers: "1,947", revenue: "$743K", rate: "59.7%" },
];

/* The one decision table. Merges the old ranked list and the suggested-action
   list into a single tracked object per lever: opportunity is the only dollar
   column, retention impact and status are their own columns, and the reasoning
   plus method note live in the row's expansion. `major` splits the headline
   levers from the low-confidence long tail. */
type Effort = "Low" | "Medium";
type Grade = "High" | "Medium" | "Low" | "—";
type Confidence = "High" | "Medium" | "Low";
type Status = "Not started" | "In progress" | "Live" | "Measured";
type Decision = {
  id: string;
  lever: string;
  area: "Bracketing" | "Exchange";
  opportunity: number; // $K, canonical for ranking
  opportunityLabel: string;
  effort: Effort;
  retention: Grade;
  confidence: Confidence;
  status: Status;
  major: boolean;
  why: string;
  method: string;
  tab: string;
  anchor: string;
  department: string;
};
const DECISIONS: Decision[] = [
  { id: "color-brkt", lever: "Allow color bracketing", area: "Bracketing", opportunity: 111, opportunityLabel: "$111K", effort: "Low", retention: "High", confidence: "High", status: "In progress", major: true, tab: "Bracketing", anchor: "bracketing-promote-color", department: "Running", why: "Your largest single opportunity, and the outcome it produces — keeping the whole order — is also the one that predicts a repeat purchase. Holds across Running, Casual and Light Hike, which is why confidence is high.", method: "Rolling 12 months · sum of per-department revenue opportunity on color-bracketed orders · assumes a 1.05× adoption uplift." },
  { id: "size-brkt", lever: "Allow size bracketing where it pays", area: "Bracketing", opportunity: 50, opportunityLabel: "$50K", effort: "Low", retention: "Medium", confidence: "High", status: "Not started", major: true, tab: "Bracketing", anchor: "bracketing-promote-size", department: "Steel Toe", why: "Profitable in the footwear toe categories where fit is predictable (Steel and Soft Toe), so the downside that makes size bracketing risky elsewhere does not apply here.", method: "Rolling 12 months · Steel/Soft/Composite Toe only · revenue opportunity where profit-per-order is positive." },
  { id: "size-exch", lever: "Promote size exchanges", area: "Exchange", opportunity: 41, opportunityLabel: "$41K", effort: "Medium", retention: "High", confidence: "Medium", status: "Not started", major: true, tab: "Exchange", anchor: "exchange-promote", department: "Light Hike", why: "Only 4.4% of returns convert to an exchange today; each conversion moves that customer from a 41% repeat rate to 58%, so the retention gain outweighs the modest dollar figure.", method: "Rolling 12 months · returns not yet recovered as same-style exchanges × recovered margin · assumes exchange rate to 1.05×." },
  { id: "color-exch", lever: "Promote color exchanges", area: "Exchange", opportunity: 16, opportunityLabel: "$16K", effort: "Medium", retention: "Medium", confidence: "Medium", status: "Not started", major: true, tab: "Exchange", anchor: "exchange-promote-color", department: "Running", why: "Same mechanism as size exchanges at lower volume — a straightforward extension once the size-exchange prompt is live.", method: "Rolling 12 months · color returns not recovered as exchanges × recovered margin." },
  { id: "color-guide", lever: "Improve color guidance", area: "Exchange", opportunity: 6.5, opportunityLabel: "$6.5K", effort: "Medium", retention: "Low", confidence: "Medium", status: "Not started", major: false, tab: "Exchange", anchor: "exchange-promote-color", department: "Lowdown", why: "Tightening PDP color accuracy reduces the share of color exchanges that come back a second time. Small dollar impact, low retention leverage.", method: "Rolling 12 months · re-returned color exchanges × margin · assumes a 0.95× re-return rate." },
  { id: "discourage-size", lever: "Discourage size bracketing where it loses", area: "Bracketing", opportunity: 4.7, opportunityLabel: "$4.7K", effort: "Low", retention: "—", confidence: "High", status: "Not started", major: false, tab: "Bracketing", anchor: "bracketing-profit", department: "Light Hike", why: "Size bracketing breaks even or loses across your top categories; nudging it down where it loses protects margin. No retention upside — purely a leak to close.", method: "Rolling 12 months · loss-making size-bracketed orders × loss per order · assumes a 0.95× reduction." },
  { id: "size-guide", lever: "Improve size guidance", area: "Bracketing", opportunity: 2.4, opportunityLabel: "$2.4K", effort: "Medium", retention: "High", confidence: "Low", status: "Not started", major: false, tab: "Bracketing", anchor: "bracketing-profit", department: "Size bracketing", why: "111K orders bracket on size and 40% come back in full. The dollar figure is small and inside the noise band, but the retention upside is real — treat this as a retention play, not a revenue one.", method: "Rolling 12 months · small sample · wide confidence interval — figure is directional, not a forecast." },
];

const CONFIDENCE_DOT: Record<Confidence, string> = {
  High: "#059467",
  Medium: "#f59f0a",
  Low: "#ababab",
};

const BRACKETING_DEF =
  "Bracketing: ordering several sizes or colors of the same style to compare at home, then returning the ones that don't fit — so one order becomes several returns.";

/* --------------------------- primitives -------------------------- */

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The one navigation verb: it names its destination. The only other verb is Take action. */
function ViewIn({ tab, onClick }: { tab: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
    >
      View in {tab}
      <ArrowRight />
    </button>
  );
}

/** Hover-revealed definition, for terms obvious to merchandising but not to the
    CX and marketing people pulled into these conversations. */
function InfoTip({ label, text, dark = false }: { label: string; text: string; dark?: boolean }) {
  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        className={`flex size-[15px] items-center justify-center rounded-full border text-[10px] font-bold ${
          dark ? "border-primary-200 text-primary-100" : "border-neutral-300 text-neutral-500"
        }`}
      >
        i
      </button>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-1.5 hidden w-60 -translate-x-1/2 rounded-lg bg-neutral-800 px-3 py-2 text-left text-[11px] font-normal leading-snug text-neutral-0 shadow-lg group-hover:block">
        {text}
      </span>
    </span>
  );
}

function GradePill({ grade }: { grade: Grade }) {
  if (grade === "—") return <span className="text-neutral-400">—</span>;
  const cls =
    grade === "High"
      ? "bg-success-50 text-success-600"
      : grade === "Medium"
        ? "bg-warning-50 text-warning-600"
        : "bg-neutral-100 text-neutral-600";
  return <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${cls}`}>{grade}</span>;
}

function StatusPill({ status }: { status: Status }) {
  const cls: Record<Status, string> = {
    "Not started": "border-neutral-200 text-neutral-500",
    "In progress": "border-warning-400 text-warning-600",
    Live: "border-primary-400 text-primary-600",
    Measured: "border-success-500 text-success-600",
  };
  return (
    <span className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls[status]}`}>
      {status}
    </span>
  );
}

/* --------------------------- sections ---------------------------- */

/** The AI read: one line that names the conflict, not a recap of the numbers
    below it. Then the money it points to. */
function OpportunityBar({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  const total = RECOVERABLE.reduce((s, r) => s + r.value, 0);
  return (
    <section className="rounded-lg border border-primary-100 bg-primary-50 p-4">
      <div className="flex items-center gap-1.5">
        <span className="flex items-center justify-center rounded-full bg-gradient-to-b from-[#27cba7] to-[#0b61dd] p-[3.5px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overview/ai-logo.svg" alt="" className="size-[17px]" />
        </span>
        <h2 className="text-xl font-semibold text-primary-700">Briefing</h2>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-neutral-700">
        Color bracketing recovers the most and retains best; size{" "}
        <InfoTip label="What is bracketing?" text={BRACKETING_DEF} /> bracketing, its mirror, leaks
        the most — so treat them as one decision, and scope any size-guidance rollout to size only.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        <section className="overflow-hidden rounded-lg bg-primary-800 text-neutral-0">
          <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-stretch lg:gap-8">
            <div className="flex-1">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
                <span className="size-2 rounded-full bg-brand-teal" />
                Money to gain
              </p>
              <p className="mt-1.5 text-[44px] font-bold leading-none">{RECOVERABLE_TOTAL}</p>
              <p className="mt-2 text-xs text-primary-200">
                Recoverable across bracketing and exchange — a total that exists only by summing both.
              </p>
              <div className="mt-3.5 flex h-2 max-w-[420px] overflow-hidden rounded-full">
                {RECOVERABLE.map((r) => (
                  <span key={r.area} style={{ width: `${(r.value / total) * 100}%`, backgroundColor: r.color }} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                {RECOVERABLE.map((r) => (
                  <span key={r.area} className="flex items-center gap-1.5 text-xs text-primary-100">
                    <span className="size-2 rounded-full" style={{ backgroundColor: r.color }} />
                    {r.area} <span className="font-semibold text-neutral-0">{r.display}</span>
                  </span>
                ))}
              </div>
              <details className="mt-2.5 text-[11px] text-primary-200">
                <summary className="cursor-pointer select-none">How this is calculated</summary>
                <p className="mt-1 max-w-[440px] leading-snug">
                  Rolling 12 months. Sum of the revenue-opportunity column across each action table,
                  top departments only, at a 1.05× adoption assumption. Levers are independent, so
                  they add; overlap is not double-counted.
                </p>
              </details>
            </div>

            <div className="hidden w-px shrink-0 bg-primary-600 lg:block" />

            <div className="flex flex-col justify-center rounded-lg bg-primary-600/25 p-4 lg:w-[320px]">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
                <span className="size-2 rounded-full bg-warning-400" />
                Money to protect
              </p>
              <p className="mt-1.5 text-[28px] font-bold leading-none">$4.3M</p>
              <p className="mt-2 text-xs leading-relaxed text-primary-100">
                Revenue you already hold, sitting in your most fragile group — 1,574 new customers
                who returned once and never came back.
              </p>
              <button
                type="button"
                onClick={() => onGo("Segments", "segments-impact")}
                className="mt-2.5 inline-flex items-center gap-1 self-start text-xs font-medium text-neutral-0 underline underline-offset-2 transition-opacity hover:opacity-80"
              >
                See all at-risk segments
                <ArrowRight />
              </button>
            </div>
          </div>
        </section>

        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 rounded-lg border border-neutral-200 bg-neutral-0 px-4 py-2.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-600">
            How you are tracking
          </span>
          {TRENDS.map((t) => (
            <span key={t.label} className="flex items-baseline gap-2 text-xs">
              <span className="text-neutral-600">{t.label}</span>
              <span className="text-sm font-bold text-neutral-800">{t.value}</span>
              <span className={`font-medium ${t.good ? "text-success-600" : "text-warning-600"}`}>
                {t.note}
              </span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Connections({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-neutral-800">What the tabs cannot tell you alone</h2>
        <p className="text-sm text-neutral-600">
          Conclusions that only appear when two areas are read together.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {CONNECTIONS.map((c) => (
          <Card key={c.title} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {c.from.map((f, i) => (
                <span key={f} className="flex items-center gap-1.5">
                  {i > 0 ? <span className="text-neutral-400">+</span> : null}
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-700">
                    {f}
                  </span>
                </span>
              ))}
            </div>
            <h3
              className={`text-base font-semibold leading-snug ${
                c.tone === "bad" ? "text-danger-600" : "text-success-600"
              }`}
            >
              {c.title}
            </h3>
            <p className="text-xs leading-relaxed text-neutral-600">{c.body}</p>
            <dl className="mt-1 flex flex-col gap-1.5 rounded-lg bg-neutral-50 p-3">
              {c.proof.map((p) => (
                <div key={p.label} className="flex items-baseline justify-between gap-3">
                  <dt className="text-[11px] leading-tight text-neutral-600">{p.label}</dt>
                  <dd className="shrink-0 text-xs font-semibold text-neutral-800">{p.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-auto pt-1">
              <ViewIn tab={c.tab} onClick={() => onGo(c.tab, c.anchor)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** One decision table: ranked, expandable for the why + method, acted on in place.
    The low-confidence long tail is collapsed so $2.4K does not sit at the same
    weight as $111K. */
function DecisionTable({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showTail, setShowTail] = useState(false);

  const major = DECISIONS.filter((d) => d.major);
  const tail = DECISIONS.filter((d) => !d.major);
  const shown = showTail ? [...major, ...tail] : major;
  const maxOpp = Math.max(...DECISIONS.map((d) => d.opportunity));

  const Row = ({ d }: { d: Decision }) => {
    const open = expanded === d.id;
    return (
      <Fragment>
        <tr
          onClick={() => setExpanded(open ? null : d.id)}
          className="cursor-pointer border-b border-primary-50 transition-colors hover:bg-neutral-50"
        >
          <td className="py-2.5 pr-2 font-medium text-neutral-800">
            <span className="flex items-center gap-1.5">
              <span className={`text-[9px] text-neutral-400 transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
              {d.lever}
            </span>
          </td>
          <td className="whitespace-nowrap px-2 py-2.5 text-neutral-600">{d.area}</td>
          <td className="whitespace-nowrap px-2 py-2.5 text-right">
            <span className="flex items-center justify-end gap-2">
              <span className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-neutral-100 sm:block">
                <span data-anim-bar className="block h-full rounded-full bg-primary-600" style={{ width: `${(d.opportunity / maxOpp) * 100}%` }} />
              </span>
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: CONFIDENCE_DOT[d.confidence] }}
                title={`${d.confidence} confidence`}
              />
              <span className="font-semibold text-neutral-800">{d.opportunityLabel}</span>
            </span>
          </td>
          <td className="px-2 py-2.5 text-center">
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${d.effort === "Low" ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"}`}>
              {d.effort}
            </span>
          </td>
          <td className="px-2 py-2.5 text-center">
            <GradePill grade={d.retention} />
          </td>
          <td className="px-2 py-2.5 text-center">
            <StatusPill status={d.status} />
          </td>
          <td className="whitespace-nowrap py-2.5 pl-2 text-right" onClick={(e) => e.stopPropagation()}>
            <TakeAction context="Briefing" department={d.department} />
          </td>
        </tr>
        {open ? (
          <tr className="border-b border-primary-50 bg-neutral-50">
            <td colSpan={7} className="px-3 py-3">
              <p className="text-xs leading-relaxed text-neutral-700">{d.why}</p>
              <p className="mt-2 flex items-start gap-2 text-[11px] leading-snug text-neutral-500">
                <span className="mt-0.5 shrink-0 rounded bg-neutral-200 px-1 font-semibold text-neutral-600">
                  Method
                </span>
                <span>
                  {d.method} · Confidence: {d.confidence}
                </span>
              </p>
              <div className="mt-2">
                <ViewIn tab={d.tab} onClick={() => onGo(d.tab, d.anchor)} />
              </div>
            </td>
          </tr>
        ) : null}
      </Fragment>
    );
  };

  return (
    <Card id="briefing-decisions">
      <CardHeading
        title="Decisions"
        subtitle="Every lever as one tracked object — ranked by opportunity, expandable for the why and the method, acted on in place."
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] text-neutral-600">
              <th className="whitespace-nowrap py-2 pr-2 font-normal">Lever</th>
              <th className="whitespace-nowrap px-2 py-2 font-normal">Area</th>
              <th className="whitespace-nowrap px-2 py-2 text-right font-normal">Opportunity</th>
              <th className="whitespace-nowrap px-2 py-2 text-center font-normal">Effort</th>
              <th className="whitespace-nowrap px-2 py-2 text-center font-normal">Retention</th>
              <th className="whitespace-nowrap px-2 py-2 text-center font-normal">Status</th>
              <th className="whitespace-nowrap py-2 pl-2 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((d) => (
              <Row key={d.id} d={d} />
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        onClick={() => setShowTail((v) => !v)}
        className="mt-3 text-xs font-medium text-primary-600 hover:text-primary-700"
      >
        {showTail ? "Hide smaller opportunities" : `Show ${tail.length} smaller opportunities`}
      </button>
    </Card>
  );
}

function AtRisk({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  return (
    <Card id="overview-at-risk">
      <CardHeading
        title="Revenue to protect"
        subtitle="Segments carrying return revenue you already hold. Customers can appear in more than one, so these are listed rather than totalled."
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Segment</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Customers</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Return revenue</th>
              <th className="whitespace-nowrap py-2 pl-3 text-right font-normal">Return rate</th>
            </tr>
          </thead>
          <tbody>
            {AT_RISK.map((r) => (
              <tr key={r.segment} className="border-b border-primary-50 last:border-b-0">
                <td className="py-2.5 pr-3 font-medium text-neutral-800">{r.segment}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-neutral-700">{r.customers}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold text-neutral-800">{r.revenue}</td>
                <td className="whitespace-nowrap py-2.5 pl-3 text-right text-danger-600">{r.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3">
        <ViewIn tab="Segments" onClick={() => onGo("Segments", "segments-impact")} />
      </div>
    </Card>
  );
}

/* ------------------------------ tab ------------------------------ */

export default function BriefingTab({ onGo }: { onGo: (tab: string, anchor?: string) => void }) {
  return (
    <>
      <OpportunityBar onGo={onGo} />
      <Connections onGo={onGo} />
      <DecisionTable onGo={onGo} />
      <AtRisk onGo={onGo} />
    </>
  );
}
