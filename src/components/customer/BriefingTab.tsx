"use client";

/*
  CONTENT RULE FOR THIS TAB
  This tab may only display content that satisfies at least one of:
    (a) it requires reading two or more of Bracketing / Exchange / Segments /
        Behavioral Flow together to reach, or
    (b) it describes change over time — what moved, what's new, what's live.
  Anything a single tab's own table already shows does NOT belong here. This tab
  synthesizes; it does not recap. If a proposed element restates a figure that is
  already legible in one other tab, cut it or move it there.
*/

import { Fragment, useState } from "react";
import { Card, CardHeading, TakeAction } from "./parts";

/* ----------------------------- data ----------------------------- */

/* Data-quality coverage. Not shown on any other tab, and answers "can I trust
   these figures" before any figure is read. (Rule b / trust.) */
const COVERAGE = { skusCovered: 94, skusExcluded: 6 };

/* #1 — What changed since you last looked. Needs a per-user last-viewed marker
   and a prior snapshot, so there is nothing to show yet: render the empty state,
   not invented deltas. */
type ChangeEvent = {
  kind: "opportunity-up" | "opportunity-down" | "segment-grew" | "confidence-up";
  headline: string;
  detail: string;
};
const CHANGES: ChangeEvent[] = [];

/* #2 — Delta strip. The metric and its period-over-period delta are known, so a
   two-point trend (last year → now) is real data. A full sparkline series and
   the attribution line ("1.2 pts traces to the Running policy") need the history
   feed and the action ledger respectively, so both stay absent until they land. */
type Metric = {
  label: string;
  value: string;
  now: number;
  prev: number;
  deltaLabel: string;
  good: boolean;
  series?: number[]; // multi-period history — lights up the full sparkline
  attribution?: string; // ties the delta to a logged action — needs the ledger
};
const METRICS: Metric[] = [
  { label: "Return rate", value: "14.76%", now: 14.76, prev: 16.76, deltaLabel: "↓ 2.0 pts", good: true },
  { label: "Returns from bracketing", value: "30.84%", now: 30.84, prev: 31.74, deltaLabel: "↓ 0.9 pts", good: true },
  { label: "Recovered as exchanges", value: "4.4%", now: 4.4, prev: 4.4, deltaLabel: "no movement", good: false },
];

/* Money to gain: a total that only exists by summing opportunity across
   Bracketing and Exchange — a cross-tab figure, so it belongs here. (Rule a.) */
const GAIN = {
  total: "$232K",
  split: [
    { area: "Bracketing", value: 166, display: "$166K", color: "#4169e1" },
    { area: "Exchange", value: 66, display: "$66K", color: "#27cba7" },
  ],
};

/* #4 — Money to protect. The segments overlap, so the distinct count needs
   customer-level data (empty until then). Direction of travel per segment needs
   a prior snapshot (empty until then). The listed view is honest today. */
type AtRiskSegment = {
  segment: string;
  customers: string;
  revenue: string;
  rate: string;
  direction?: "up" | "down" | "flat"; // needs a prior snapshot
};
const AT_RISK: AtRiskSegment[] = [
  { segment: "New customers: returns, no repurchase", customers: "1,574", revenue: "$4.3M", rate: "34.5%" },
  { segment: "High return-rate customers", customers: "2,503", revenue: "$4.1M", rate: "33.4%" },
  { segment: "Unprofitable customers", customers: "836", revenue: "$1.5M", rate: "48.0%" },
  { segment: "Likely resellers", customers: "1,947", revenue: "$743K", rate: "59.7%" },
];
const DISTINCT_AT_RISK: string | null = null; // requires customer-level data

/* D — Cross-behavior findings. Each names two areas and states a conclusion that
   neither area's own table states alone. Capped at three. */
type Finding = {
  title: string;
  body: string;
  stat?: { label: string; value: string };
  from: [string, string];
  tab: string;
  anchor: string;
  tone: "conflict" | "sequence";
};
const FINDINGS: Finding[] = [
  {
    title: "Scope the size-guidance rollout to size only",
    body: "Rolling size guidance across Running would cut its bracketing, but Running's color bracketing is your strongest retention lever. A blanket policy would suppress both; a size-only policy keeps the retention play intact.",
    stat: { label: "Retention lever it would otherwise cut", value: "Color bracketing" },
    from: ["Bracketing", "Behavioral Flow"],
    tab: "Bracketing",
    anchor: "bracketing-profit",
    tone: "conflict",
  },
  {
    title: "Winning an exchange compounds — it shrinks the next order's bracketing",
    body: "Customers who exchange once bracket materially less on their following order, so exchange conversion is not just a one-time save: it lowers the return risk of the purchase after it.",
    stat: { label: "Next-order bracketing after an exchange", value: "−30%" },
    from: ["Exchange", "Bracketing"],
    tab: "Exchange",
    anchor: "exchange-promote",
    tone: "sequence",
  },
  {
    title: "Your churn and your margin leak are the same people",
    body: "The new customers who return once and never come back overlap heavily with size bracketers. The retention problem and the bracketing-margin problem are one cohort, so one intervention can move both.",
    stat: { label: "Fragile new-customer segment", value: "1,574" },
    from: ["Segments", "Bracketing"],
    tab: "Segments",
    anchor: "segments-impact",
    tone: "sequence",
  },
];

/* A/B — the one decision table. Merges the old ranked list and suggested-action
   list into a single tracked object per lever, so they can never disagree again.
   Opportunity is the only dollar column; retention impact is its own column
   (never mixed into a dollar figure). Status is stubbed for the action ledger. */
type Effort = "Low" | "Medium";
type Grade = "High" | "Medium" | "Low" | "—";
type Status = "Not started" | "In progress" | "Live" | "Measured";
type Lever = {
  id: string;
  lever: string;
  area: "Bracketing" | "Exchange";
  opportunity: number; // $K, canonical for sorting
  opportunityLabel: string;
  effort: Effort;
  retention: Grade;
  confidence: Exclude<Grade, "—">;
  status: Status;
  why: string;
  tab: string;
  anchor: string;
  department: string;
};
const LEVERS: Lever[] = [
  { id: "color-brkt", lever: "Allow color bracketing", area: "Bracketing", opportunity: 111, opportunityLabel: "$111K", effort: "Low", retention: "High", confidence: "High", status: "Not started", tab: "Bracketing", anchor: "bracketing-promote-color", department: "Running", why: "Your largest single opportunity, and the outcome it produces — keeping the whole order — is also the one that predicts a repeat purchase. Highest confidence because it holds across Running, Casual and Light Hike." },
  { id: "size-brkt", lever: "Allow size bracketing where it pays", area: "Bracketing", opportunity: 50, opportunityLabel: "$50K", effort: "Low", retention: "Medium", confidence: "High", status: "Not started", tab: "Bracketing", anchor: "bracketing-promote-size", department: "Steel Toe", why: "Profitable in the footwear toe categories where fit is predictable (Steel and Soft Toe), so the downside that makes size bracketing risky elsewhere does not apply here." },
  { id: "size-exch", lever: "Promote size exchanges", area: "Exchange", opportunity: 41, opportunityLabel: "$41K", effort: "Medium", retention: "High", confidence: "Medium", status: "Not started", tab: "Exchange", anchor: "exchange-promote", department: "Light Hike", why: "Only 4.4% of returns convert to an exchange today; each conversion moves that customer from a 41% repeat rate to 58%, so the retention gain outweighs the modest dollar figure." },
  { id: "color-exch", lever: "Promote color exchanges", area: "Exchange", opportunity: 16, opportunityLabel: "$16K", effort: "Medium", retention: "Medium", confidence: "Medium", status: "Not started", tab: "Exchange", anchor: "exchange-promote-color", department: "Running", why: "Same mechanism as size exchanges at lower volume — a straightforward extension once the size-exchange prompt is live." },
  { id: "color-guide", lever: "Improve color guidance", area: "Exchange", opportunity: 6.5, opportunityLabel: "$6.5K", effort: "Medium", retention: "Low", confidence: "Medium", status: "Not started", tab: "Exchange", anchor: "exchange-promote-color", department: "Lowdown", why: "Tightening PDP color accuracy reduces the share of color exchanges that come back a second time. Small dollar impact, low retention leverage." },
  { id: "discourage-size", lever: "Discourage size bracketing where it loses", area: "Bracketing", opportunity: 4.7, opportunityLabel: "$4.7K", effort: "Low", retention: "—", confidence: "High", status: "Not started", tab: "Bracketing", anchor: "bracketing-profit", department: "Light Hike", why: "Size bracketing breaks even or loses across your top categories; nudging it down where it loses protects margin. No retention upside — it is purely a leak to close." },
  { id: "size-guide", lever: "Improve size guidance", area: "Bracketing", opportunity: 2.4, opportunityLabel: "$2.4K", effort: "Medium", retention: "High", confidence: "Low", status: "Not started", tab: "Bracketing", anchor: "bracketing-profit", department: "Size bracketing", why: "111K orders bracket on size and 40% come back in full — the outcome most likely to end the relationship. The dollar figure is small today, but the retention upside is high and it is the lever the size-guidance conflict above is about." },
];

const GRADE_RANK: Record<Grade, number> = { High: 3, Medium: 2, Low: 1, "—": 0 };
const EFFORT_RANK: Record<Effort, number> = { Low: 0, Medium: 1 };
const STATUS_RANK: Record<Status, number> = { "Not started": 0, "In progress": 1, Live: 2, Measured: 3 };

/* --------------------------- primitives -------------------------- */

function ArrowRight() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** The one navigation verb: it always means "go to the supporting data," and it
    names its destination. The only other verb is Take action. */
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

/** E — coverage line. */
function CoverageLine() {
  return (
    <p className="text-xs text-neutral-600">
      Analysis covers{" "}
      <span className="font-semibold text-neutral-800">{COVERAGE.skusCovered}% of SKUs</span>;{" "}
      {COVERAGE.skusExcluded}% excluded for insufficient volume.
    </p>
  );
}

/** #1 — What changed since you last looked. Empty until two periods exist. */
function WhatChanged() {
  return (
    <Card>
      <CardHeading
        title="What changed since you last looked"
        subtitle="Opportunities that crossed a threshold, segments that grew, levers that became actionable."
      />
      {CHANGES.length === 0 ? (
        <div className="mt-3 flex items-center gap-3 rounded-lg border border-dashed border-neutral-200 bg-neutral-50 px-4 py-6 text-sm text-neutral-600">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
            ⏳
          </span>
          Change tracking begins once you have two periods of data.
        </div>
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {CHANGES.map((c) => (
            <li key={c.headline} className="text-sm text-neutral-700">
              <span className="font-medium text-neutral-800">{c.headline}</span> — {c.detail}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** #2 — Delta strip. Two-point trend (LY → now) is real; the full sparkline and
    attribution light up with the history feed and the action ledger. */
function DeltaStrip() {
  return (
    <div className="flex flex-wrap gap-3">
      {METRICS.map((m) => {
        const min = Math.min(m.now, m.prev);
        const max = Math.max(m.now, m.prev);
        const norm = (v: number) => (max === min ? 0.5 : (v - min) / (max - min));
        const y = (v: number) => 12 - norm(v) * 10;
        return (
          <div
            key={m.label}
            className="flex min-w-[190px] flex-1 flex-col gap-1 rounded-lg border border-neutral-200 bg-neutral-0 p-3"
          >
            <span className="text-xs text-neutral-600">{m.label}</span>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xl font-bold text-neutral-800">{m.value}</span>
              <svg width="40" height="14" viewBox="0 0 40 14" fill="none" aria-hidden="true">
                <polyline
                  points={`2,${y(m.prev)} 38,${y(m.now)}`}
                  stroke={m.good ? "#059467" : "#8a8a8a"}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle cx="38" cy={y(m.now)} r="1.8" fill={m.good ? "#059467" : "#8a8a8a"} />
              </svg>
            </div>
            <span className={`text-xs font-medium ${m.good ? "text-success-600" : "text-neutral-500"}`}>
              {m.deltaLabel}
            </span>
            {m.attribution ? (
              <span className="text-[11px] leading-tight text-neutral-600">{m.attribution}</span>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

/** Money to gain (cross-tab total) + money to protect (deduped/trended, with the
    parts that need customer-level or period data rendered as empty states). */
function MoneyBar({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  const total = GAIN.split.reduce((s, r) => s + r.value, 0);
  return (
    <section className="overflow-hidden rounded-lg bg-primary-800 text-neutral-0">
      <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-stretch lg:gap-8">
        <div className="flex-1">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
            <span className="size-2 rounded-full bg-brand-teal" />
            Money to gain
          </p>
          <p className="mt-1.5 text-[44px] font-bold leading-none">{GAIN.total}</p>
          <p className="mt-2 max-w-[420px] text-sm leading-relaxed text-primary-100">
            The recoverable total only exists by summing opportunity across bracketing and exchange —
            it is not on any single tab. The levers behind it are ranked in the decision table below.
          </p>
          <div className="mt-3.5 flex h-2 max-w-[420px] overflow-hidden rounded-full">
            {GAIN.split.map((r) => (
              <span key={r.area} style={{ width: `${(r.value / total) * 100}%`, backgroundColor: r.color }} />
            ))}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {GAIN.split.map((r) => (
              <span key={r.area} className="flex items-center gap-1.5 text-xs text-primary-100">
                <span className="size-2 rounded-full" style={{ backgroundColor: r.color }} />
                {r.area} <span className="font-semibold text-neutral-0">{r.display}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="hidden w-px shrink-0 bg-primary-600 lg:block" />

        <div className="flex flex-col rounded-lg bg-primary-600/25 p-4 lg:w-[340px]">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary-200">
            <span className="size-2 rounded-full bg-warning-400" />
            Money to protect
          </p>
          {/* Deduped distinct count needs customer-level data — empty state. */}
          <p className="mt-1.5 text-sm text-primary-100">
            Distinct at-risk customers:{" "}
            <span className="font-semibold text-neutral-0">
              {DISTINCT_AT_RISK ?? "Requires customer-level data"}
            </span>
          </p>
          <p className="mt-0.5 text-[11px] text-primary-300">
            The four segments below overlap, so they are listed, not summed.
          </p>
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {AT_RISK.map((s) => (
              <li key={s.segment} className="flex items-baseline justify-between gap-3 text-xs">
                <span className="min-w-0 flex-1 truncate text-primary-100">{s.segment}</span>
                <span className="shrink-0 font-semibold text-neutral-0">{s.revenue}</span>
                {/* Direction of travel needs a prior snapshot. */}
                <span className="w-3 shrink-0 text-center text-primary-300">
                  {s.direction === "up" ? "↑" : s.direction === "down" ? "↓" : "·"}
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onGo("Segments", "segments-impact")}
            className="mt-2.5 inline-flex items-center gap-1 self-start text-xs font-medium text-neutral-0 underline underline-offset-2 transition-opacity hover:opacity-80"
          >
            View in Segments
            <ArrowRight />
          </button>
        </div>
      </div>
    </section>
  );
}

/** D — cross-behavior findings. */
function CrossBehaviorFindings({ onGo }: { onGo: (tab: string, anchor: string) => void }) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-neutral-800">Cross-behavior findings</h2>
        <p className="text-sm text-neutral-600">
          Conclusions that need two areas read together — none is a single tab&rsquo;s own row.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {FINDINGS.map((f) => (
          <Card key={f.title} className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <span
                className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                  f.tone === "conflict" ? "bg-danger-50 text-danger-600" : "bg-primary-50 text-primary-600"
                }`}
              >
                {f.tone === "conflict" ? "Conflict" : "Sequence"}
              </span>
              {f.from.map((a, i) => (
                <span key={a} className="flex items-center gap-1.5">
                  {i > 0 ? <span className="text-neutral-400">+</span> : null}
                  <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-[11px] font-medium text-neutral-700">
                    {a}
                  </span>
                </span>
              ))}
            </div>
            <h3 className="text-base font-semibold leading-snug text-neutral-800">{f.title}</h3>
            <p className="text-xs leading-relaxed text-neutral-600">{f.body}</p>
            {f.stat ? (
              <div className="mt-auto flex items-baseline justify-between gap-3 rounded-lg bg-neutral-50 px-3 py-2">
                <span className="text-[11px] leading-tight text-neutral-600">{f.stat.label}</span>
                <span className="shrink-0 text-sm font-semibold text-neutral-800">{f.stat.value}</span>
              </div>
            ) : null}
            <div className={f.stat ? "" : "mt-auto"}>
              <ViewIn tab={f.tab} onClick={() => onGo(f.tab, f.anchor)} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/** #3 — opportunity × effort scatter. Reveals the low-effort / high-value cluster
    a one-column sort cannot. Clicking a dot highlights its table row. */
function OpportunityScatter({ onPick, active }: { onPick: (id: string) => void; active: string | null }) {
  const W = 640;
  const H = 240;
  const padL = 44;
  const padB = 34;
  const padT = 12;
  const maxOpp = 120;
  const bands: Effort[] = ["Low", "Medium"];
  const bandX = (e: Effort) => padL + ((bands.indexOf(e) + 0.5) / bands.length) * (W - padL - 12);
  const y = (opp: number) => padT + (1 - opp / maxOpp) * (H - padT - padB);
  const areaColor = (a: Lever["area"]) => (a === "Bracketing" ? "#4169e1" : "#27cba7");
  const dotR = (c: Lever["confidence"]) => (c === "High" ? 9 : c === "Medium" ? 6.5 : 4.5);

  return (
    <Card>
      <CardHeading
        title="Where to start: opportunity vs effort"
        subtitle="Higher and to the left is do-first. Dot size is confidence. Click a dot to jump to its row."
      />
      <div className="mt-3 overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 480, height: "auto" }} role="img" aria-label="Opportunity versus effort scatter">
          {[0, 40, 80, 120].map((g) => (
            <g key={g}>
              <line x1={padL} y1={y(g)} x2={W - 12} y2={y(g)} stroke="#f0f0f0" strokeWidth="1" />
              <text x={padL - 8} y={y(g) + 3} textAnchor="end" fontSize="10" fill="#8a8a8a">
                ${g}K
              </text>
            </g>
          ))}
          {bands.map((b) => (
            <text key={b} x={bandX(b)} y={H - 12} textAnchor="middle" fontSize="11" fontWeight="600" fill="#676767">
              {b} effort
            </text>
          ))}
          {LEVERS.map((l) => {
            const sameBand = LEVERS.filter((x) => x.effort === l.effort);
            const idx = sameBand.indexOf(l);
            const jitter = (idx - (sameBand.length - 1) / 2) * 20;
            const cx = bandX(l.effort) + jitter;
            const on = active === l.id;
            return (
              <circle
                key={l.id}
                cx={cx}
                cy={y(l.opportunity)}
                r={dotR(l.confidence)}
                fill={areaColor(l.area)}
                fillOpacity={on ? 1 : 0.65}
                stroke={on ? "#212121" : "#fff"}
                strokeWidth={on ? 2 : 1}
                style={{ cursor: "pointer", transition: "fill-opacity 120ms" }}
                onClick={() => onPick(l.id)}
              >
                <title>{`${l.lever} · ${l.opportunityLabel} · ${l.effort} effort · ${l.confidence} confidence`}</title>
              </circle>
            );
          })}
        </svg>
      </div>
      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-600">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "#4169e1" }} /> Bracketing
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full" style={{ backgroundColor: "#27cba7" }} /> Exchange
        </span>
        <span className="text-neutral-500">Bigger dot = higher confidence</span>
      </div>
    </Card>
  );
}

type SortKey = "lever" | "area" | "opportunity" | "effort" | "retention" | "confidence" | "status";

/** A/B — the single decision table. */
function DecisionTable({
  onGo,
  highlightId,
  sort,
  setSort,
}: {
  onGo: (tab: string, anchor: string) => void;
  highlightId: string | null;
  sort: { key: SortKey; dir: 1 | -1 };
  setSort: (s: { key: SortKey; dir: 1 | -1 }) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const rank = (l: Lever, k: SortKey): number | string => {
    switch (k) {
      case "opportunity":
        return l.opportunity;
      case "effort":
        return EFFORT_RANK[l.effort];
      case "retention":
        return GRADE_RANK[l.retention];
      case "confidence":
        return GRADE_RANK[l.confidence];
      case "status":
        return STATUS_RANK[l.status];
      default:
        return l[k];
    }
  };
  const rows = [...LEVERS].sort((a, b) => {
    const av = rank(a, sort.key);
    const bv = rank(b, sort.key);
    if (av < bv) return -sort.dir;
    if (av > bv) return sort.dir;
    return 0;
  });

  const clickHead = (k: SortKey) =>
    setSort(
      sort.key === k
        ? { key: k, dir: (sort.dir * -1) as 1 | -1 }
        : { key: k, dir: k === "lever" || k === "area" ? 1 : -1 },
    );

  const Th = ({ k, label, align = "left" }: { k: SortKey; label: string; align?: "left" | "right" | "center" }) => (
    <th className={`whitespace-nowrap px-2 py-2 font-normal ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""}`}>
      <button
        type="button"
        onClick={() => clickHead(k)}
        className={`inline-flex items-center gap-1 hover:text-neutral-800 ${sort.key === k ? "font-semibold text-neutral-800" : ""}`}
      >
        {label}
        <span className="text-[9px]">{sort.key === k ? (sort.dir === -1 ? "▼" : "▲") : "↕"}</span>
      </button>
    </th>
  );

  return (
    <Card id="briefing-decisions">
      <CardHeading
        title="Decisions"
        subtitle="Every gain lever as one tracked object — ranked, expandable for the why, and acted on in place. Default sort: opportunity."
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] text-neutral-600">
              <Th k="lever" label="Lever" />
              <Th k="area" label="Area" />
              <Th k="opportunity" label="Opportunity" align="right" />
              <Th k="effort" label="Effort" align="center" />
              <Th k="retention" label="Retention" align="center" />
              <Th k="confidence" label="Confidence" align="center" />
              <Th k="status" label="Status" align="center" />
              <th className="whitespace-nowrap py-2 pl-2 text-right font-normal">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const open = expanded === l.id;
              return (
                <Fragment key={l.id}>
                  <tr
                    id={`lever-${l.id}`}
                    onClick={() => setExpanded(open ? null : l.id)}
                    className={`scroll-mt-24 cursor-pointer border-b border-primary-50 transition-colors ${
                      highlightId === l.id ? "bg-primary-50 ring-1 ring-inset ring-primary-200" : "hover:bg-neutral-50"
                    }`}
                  >
                    <td className="py-2.5 pr-2 font-medium text-neutral-800">
                      <span className="flex items-center gap-1.5">
                        <span className={`text-[9px] text-neutral-400 transition-transform ${open ? "rotate-90" : ""}`}>▶</span>
                        {l.lever}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-neutral-600">{l.area}</td>
                    <td className="whitespace-nowrap px-2 py-2.5 text-right font-semibold text-neutral-800">{l.opportunityLabel}</td>
                    <td className="px-2 py-2.5 text-center">
                      <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${l.effort === "Low" ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"}`}>
                        {l.effort}
                      </span>
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <GradePill grade={l.retention} />
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <GradePill grade={l.confidence} />
                    </td>
                    <td className="px-2 py-2.5 text-center">
                      <StatusPill status={l.status} />
                    </td>
                    <td className="whitespace-nowrap py-2.5 pl-2 text-right" onClick={(e) => e.stopPropagation()}>
                      <TakeAction context="Briefing" department={l.department} />
                    </td>
                  </tr>
                  {open ? (
                    <tr className="border-b border-primary-50 bg-neutral-50">
                      <td colSpan={8} className="px-3 py-3">
                        <p className="text-xs leading-relaxed text-neutral-700">{l.why}</p>
                        <div className="mt-2">
                          <ViewIn tab={l.tab} onClick={() => onGo(l.tab, l.anchor)} />
                        </div>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ------------------------------ tab ------------------------------ */

export default function BriefingTab({ onGo }: { onGo: (tab: string, anchor?: string) => void }) {
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "opportunity", dir: -1 });

  const pickLever = (id: string) => {
    setHighlightId(id);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document.getElementById(`lever-${id}`)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    window.setTimeout(() => setHighlightId((cur) => (cur === id ? null : cur)), 3000);
  };

  return (
    <>
      <CoverageLine />
      <WhatChanged />
      <DeltaStrip />
      <MoneyBar onGo={onGo} />
      <CrossBehaviorFindings onGo={onGo} />
      <OpportunityScatter onPick={pickLever} active={highlightId} />
      <DecisionTable onGo={onGo} highlightId={highlightId} sort={sort} setSort={setSort} />
    </>
  );
}
