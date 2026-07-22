"use client";

import { Card, CardHeading, TakeAction } from "./parts";

/* ----------------------------- data ----------------------------- */

/* Every figure here is taken from the tab it links to, so nothing on this page
   can drift out of step with the table underneath it. Where a number is derived,
   the arithmetic is noted beside it. */

/* Recoverable = the opportunity columns of the four action tables, top
   departments only. Bracketing: promote colour 48+39+24, promote size 18+17+15,
   discourage size ~4.7. Exchange: promote size 15+11+6+6+3, promote colour
   6+5+2+2+1, guidance ~8.9. These are separate levers, so they add up. */
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

/* --- Conclusions that need two tabs to see. This is the part of the page that
   no single tab can produce, and the reason it earns its place. --- */
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
    body: "Two in five size-bracketed orders come back in full, against one in fifty for colour. And customers who return everything are the least likely to ever buy again — so the damage outlives the order.",
    proof: [
      { label: "Size orders returned in full", value: "40%" },
      { label: "Colour orders returned in full", value: "2%" },
      { label: "Repurchase after returning all", value: "41%" },
      { label: "Repurchase after keeping all", value: "74%" },
    ],
    from: ["Bracketing", "Behavioral Flow"],
    tab: "Behavioral Flow",
    anchor: "flow-sankey",
    tone: "bad",
  },
  {
    title: "Colour bracketing is a retention engine you are under-using",
    body: "Nine in ten colour-bracketed orders are kept in full, and those customers come back at the highest rate you record. It earns margin on the order and buys the next one — and it is your single largest untapped lever.",
    proof: [
      { label: "Colour orders kept in full", value: "90%" },
      { label: "Profit per colour-bracketed order", value: "+$44" },
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

/* Ranked by the opportunity column of each source table. */
type Lever = {
  lever: string;
  area: string;
  value: string;
  amount: number;
  effort: "Low" | "Medium";
  tab: string;
  anchor: string;
};
const LEVERS: Lever[] = [
  { lever: "Promote colour bracketing", area: "Bracketing", value: "$111K", amount: 111, effort: "Low", tab: "Bracketing", anchor: "bracketing-promote-color" },
  { lever: "Promote size bracketing where it pays", area: "Bracketing", value: "$50K", amount: 50, effort: "Low", tab: "Bracketing", anchor: "bracketing-promote-size" },
  { lever: "Promote size exchanges", area: "Exchange", value: "$41K", amount: 41, effort: "Medium", tab: "Exchange", anchor: "exchange-promote" },
  { lever: "Promote colour exchanges", area: "Exchange", value: "$16K", amount: 16, effort: "Medium", tab: "Exchange", anchor: "exchange-promote-color" },
  { lever: "Improve colour guidance", area: "Exchange", value: "$6.5K", amount: 6.5, effort: "Medium", tab: "Exchange", anchor: "exchange-promote-color" },
  { lever: "Discourage size bracketing where it loses", area: "Bracketing", value: "$4.7K", amount: 4.7, effort: "Low", tab: "Bracketing", anchor: "bracketing-profit" },
  { lever: "Improve size guidance", area: "Exchange", value: "$2.4K", amount: 2.4, effort: "Medium", tab: "Exchange", anchor: "exchange-promote" },
];

/* Segments overlap — one customer can sit in several — so these are listed
   rather than totalled. Summing them would double-count and overstate. */
const AT_RISK = [
  { segment: "New customers: returns, no repurchase", customers: "1,574", revenue: "$4.3M", rate: "34.5%" },
  { segment: "High return rate customers", customers: "2,503", revenue: "$4.1M", rate: "33.4%" },
  { segment: "Unprofitable customers", customers: "836", revenue: "$1.5M", rate: "48.0%" },
  { segment: "Likely resellers", customers: "1,947", revenue: "$743K", rate: "59.7%" },
];

type Action = {
  title: string;
  why: string;
  impact: string;
  weight: "High" | "Medium";
  tab: string;
  anchor: string;
  context: string;
  department: string;
};
const ACTIONS: Action[] = [
  {
    title: "Push colour bracketing in Running, Casual and Light Hike",
    why: "Your biggest single opportunity, and the outcome it produces — keeping the whole order — is also the one that predicts a repeat purchase.",
    impact: "$111K",
    weight: "High",
    tab: "Bracketing",
    anchor: "bracketing-promote-color",
    context: "Bracketing",
    department: "Running",
  },
  {
    title: "Put size guidance on the styles customers bracket most",
    why: "111K orders bracket on size, each loses $7, and 40% come back in full — the outcome most likely to end the relationship.",
    impact: "Retention",
    weight: "High",
    tab: "Bracketing",
    anchor: "bracketing-profit",
    context: "Bracketing",
    department: "Size bracketing",
  },
  {
    title: "Offer an exchange before accepting a return in Light Hike and Running",
    why: "Only 4.4% of returns convert today, and each conversion moves that customer from a 41% repeat rate to 58%.",
    impact: "$41K",
    weight: "High",
    tab: "Exchange",
    anchor: "exchange-promote",
    context: "Exchange",
    department: "Light Hike",
  },
  {
    title: "Stop promoting to the 836 unprofitable customers",
    why: "They return 48% of what they buy, so acquisition spend here funds its own returns.",
    impact: "$1.5M at risk",
    weight: "High",
    tab: "Segments",
    anchor: "segments-impact",
    context: "Segments",
    department: "Unprofitable Customers",
  },
  {
    title: "Review the 1,947 accounts flagged as likely resellers",
    why: "A 59.7% return rate, the highest of any segment you track.",
    impact: "$743K at risk",
    weight: "Medium",
    tab: "Segments",
    anchor: "segments-impact",
    context: "Segments",
    department: "Likely Resellers",
  },
];

/* --------------------------- primitives -------------------------- */

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SeeData({ label = "See the data", onClick }: { label?: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 whitespace-nowrap text-xs font-medium text-primary-600 transition-colors hover:text-primary-700"
    >
      {label}
      <ArrowRight />
    </button>
  );
}

/* --------------------------- sections ---------------------------- */

/** Deliberately unlike the flat white KPI grid the other tabs use: this is the
    one place that totals across areas, so it should not look like a tab. */
function OpportunityBar() {
  const total = RECOVERABLE.reduce((s, r) => s + r.value, 0);
  return (
    <section className="overflow-hidden rounded-lg bg-primary-800 text-neutral-0">
      <div className="flex flex-wrap gap-x-10 gap-y-6 p-5">
        <div className="min-w-[240px] flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-300">
            Recoverable this period
          </p>
          <p className="mt-1 text-[40px] font-bold leading-none">{RECOVERABLE_TOTAL}</p>
          <p className="mt-1.5 text-xs text-primary-200">
            Identified across bracketing and exchange levers, top departments only
          </p>
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-primary-600/40">
            {RECOVERABLE.map((r) => (
              <span
                key={r.area}
                style={{ width: `${(r.value / total) * 100}%`, backgroundColor: r.color }}
              />
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
        </div>

        <div className="flex min-w-[300px] flex-1 flex-col justify-center gap-3">
          {TRENDS.map((t) => (
            <div key={t.label} className="flex items-baseline justify-between gap-3">
              <span className="text-xs text-primary-200">{t.label}</span>
              <span className="flex items-baseline gap-2">
                <span className="text-lg font-bold">{t.value}</span>
                <span
                  className={`text-xs font-medium ${t.good ? "text-success-100" : "text-warning-100"}`}
                >
                  {t.note}
                </span>
              </span>
            </div>
          ))}
        </div>

        <div className="flex min-w-[190px] flex-col justify-center rounded-lg bg-primary-600/30 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-primary-200">
            Largest group at risk
          </p>
          <p className="mt-1 text-2xl font-bold leading-tight">$4.3M</p>
          <p className="text-xs text-primary-100">
            1,574 new customers who returned and never came back
          </p>
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
              <SeeData label="See the evidence" onClick={() => onGo(c.tab, c.anchor)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LeverTable({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  const max = Math.max(...LEVERS.map((l) => l.amount));
  return (
    <Card>
      <CardHeading
        title="Where the money is, ranked"
        subtitle="Every identified lever across bracketing and exchange, largest first. Figures come from the opportunity column of each source table."
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Lever</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">Area</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">Effort</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Opportunity</th>
              <th className="whitespace-nowrap py-2 pl-3 text-right font-normal">Go</th>
            </tr>
          </thead>
          <tbody>
            {LEVERS.map((l) => (
              <tr key={l.lever} className="border-b border-primary-50 last:border-b-0">
                <td className="py-2.5 pr-3 font-medium text-neutral-800">{l.lever}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-neutral-600">{l.area}</td>
                <td className="whitespace-nowrap px-3 py-2.5">
                  <span
                    className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                      l.effort === "Low"
                        ? "bg-success-50 text-success-600"
                        : "bg-warning-50 text-warning-600"
                    }`}
                  >
                    {l.effort}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  <span className="flex items-center justify-end gap-2">
                    <span className="hidden h-2 w-24 overflow-hidden rounded-full bg-neutral-100 sm:block">
                      <span
                        data-anim-bar
                        className="block h-full rounded-full bg-primary-600"
                        style={{ width: `${(l.amount / max) * 100}%` }}
                      />
                    </span>
                    <span className="font-semibold text-neutral-800">{l.value}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap py-2.5 pl-3 text-right">
                  <SeeData label="Open" onClick={() => onGo(l.tab, l.anchor)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
        <SeeData label="Open segments" onClick={() => onGo("Segments", "segments-impact")} />
      </div>
    </Card>
  );
}

function SuggestedActions({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  return (
    <Card>
      <CardHeading
        title="Suggested actions"
        subtitle="Ranked by what the data says is costing the most right now. Each one links back to the evidence behind it."
      />
      <ol className="mt-3 flex flex-col">
        {ACTIONS.map((a, i) => (
          <li
            key={a.title}
            className="flex flex-wrap items-start gap-x-4 gap-y-2 border-b border-primary-50 py-3 last:border-b-0"
          >
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-xs font-semibold text-primary-600">
              {i + 1}
            </span>
            <div className="min-w-[240px] flex-1">
              <p className="text-sm font-medium text-neutral-800">{a.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-neutral-600">{a.why}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`whitespace-nowrap rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                  a.weight === "High"
                    ? "bg-danger-50 text-danger-600"
                    : "bg-warning-50 text-warning-600"
                }`}
              >
                {a.impact}
              </span>
              <SeeData label="Why this?" onClick={() => onGo(a.tab, a.anchor)} />
              <TakeAction context={a.context} department={a.department} />
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

/* ------------------------------ tab ------------------------------ */

export default function OverviewTab({ onGo }: { onGo: (tab: string, anchor?: string) => void }) {
  return (
    <>
      <OpportunityBar />
      <Connections onGo={onGo} />
      <LeverTable onGo={onGo} />
      <div className="grid grid-cols-1 gap-5">
        <SuggestedActions onGo={onGo} />
        <AtRisk onGo={onGo} />
      </div>
    </>
  );
}
