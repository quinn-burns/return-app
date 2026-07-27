"use client";

import { useMemo, useState } from "react";
import { Card, CardHeading, Pagination, TakeAction, usePaged } from "./parts";
import { seeded } from "./filler";

/* ----------------------------- model ----------------------------- */

/* Journeys are derived from the same constants that draw the Sankey, so a row
   here and a ribbon there can never disagree. Shapes are passed in rather than
   re-declared for the same reason. */

export type Stage = { id: string; label: string; color: string };
export type JourneyInput = {
  total: number;
  brackets: { id: string; label: string; share: number; color: string; out: Record<string, number> }[];
  outcomes: { id: string; label: string; color: string; repeat: number; val: number }[];
  next: { next: string; norep: string };
  depts: { id: string; label: string; share: number; color: string; val: number }[];
};

export type Journey = {
  key: string;
  steps: Stage[];
  customers: number;
  perCust: number;
  net: number;
  /** Change in customers against the prior period. Demo figure — see note in UI. */
  delta: number;
  cameBack: boolean;
};

/* Movement is demo data, but it has to behave like real movement: most journeys
   sit roughly flat and a handful genuinely move. A flat spread made half the
   page "material", which makes the alert worth nothing. */
function movement(key: string) {
  const spike = seeded(key, 137, 0, 1);
  if (spike <= 0.88) return seeded(key, 91, -9, 9);
  const dir = seeded(key, 307, 0, 1) > 0.5 ? 1 : -1;
  return dir * seeded(key, 211, 21, 41);
}

export function buildJourneys(m: JourneyInput): Journey[] {
  const out: Journey[] = [];
  m.brackets.forEach((b) => {
    const bn = m.total * b.share;
    m.outcomes.forEach((o) => {
      const rn = bn * b.out[o.id];
      if (rn < 1) return;
      const back = rn * o.repeat;
      const gone = rn * (1 - o.repeat);
      const bStage = { id: b.id, label: b.label, color: b.color };
      const oStage = { id: o.id, label: o.label, color: o.color };
      if (back >= 1) {
        m.depts.forEach((d) => {
          const key = `${b.id}|${o.id}|next|${d.id}`;
          const customers = back * d.share;
          const perCust = o.val + d.val;
          out.push({
            key,
            steps: [
              bStage,
              oStage,
              { id: "next", label: "Came back", color: m.next.next },
              { id: d.id, label: d.label, color: d.color },
            ],
            customers,
            perCust,
            net: customers * perCust,
            delta: movement(key),
            cameBack: true,
          });
        });
      }
      if (gone >= 1) {
        const key = `${b.id}|${o.id}|norep`;
        out.push({
          key,
          steps: [
            bStage,
            oStage,
            { id: "norep", label: "Never came back", color: m.next.norep },
          ],
          customers: gone,
          perCust: o.val,
          net: gone * o.val,
          delta: movement(key),
          cameBack: false,
        });
      }
    });
  });
  return out;
}

/* --------------------------- the read ---------------------------- */

/* A path plus two numbers is not an insight — someone still has to work out
   what it means and what to do. Derive both from the shape of the journey so
   every row says it outright. */
export type Read = { verdict: string; tone: "bad" | "warn" | "good"; meaning: string; action: string };

export function readJourney(j: Journey): Read {
  const bracket = j.steps[0].id;
  const outcome = j.steps[1].id;
  const dept = j.cameBack ? j.steps[3].label : null;
  const growing = j.delta >= 5;
  const shrinking = j.delta <= -5;
  const grew = (bad: boolean) =>
    bad && growing
      ? " And it is growing."
      : !bad && shrinking
        ? " And it is shrinking."
        : "";

  if (outcome === "retall" && !j.cameBack) {
    return {
      verdict: "Costing you",
      tone: "bad",
      meaning: "You paid to acquire them, they sent the whole order back, and never returned." + grew(true),
      action:
        bracket === "single"
          ? "Fix the product detail that oversold it"
          : "Add size guidance before checkout",
    };
  }
  if (outcome === "retall" && j.cameBack) {
    return {
      verdict: "Recovered",
      tone: "warn",
      meaning: "Returned everything first time but came back anyway — something won them back." + grew(false),
      action: "Find what recovered them and repeat it",
    };
  }
  if (!j.cameBack) {
    return {
      verdict: "One and done",
      tone: "warn",
      meaning: "They kept what they bought and then never came back — revenue now, nothing after." + grew(true),
      action: "Trigger a win-back at 30 days",
    };
  }
  if (outcome === "keptall") {
    return {
      verdict: "Winning",
      tone: "good",
      meaning: `Kept the whole order and came back${dept ? ` into ${dept}` : ""} — the pattern worth protecting.` + grew(false),
      action:
        bracket === "color"
          ? "Allow colour bracketing to more of these customers"
          : "Build a look-alike audience from this group",
    };
  }
  return {
    verdict: "Solid",
    tone: "good",
    meaning: `Kept part of the order and came back${dept ? ` into ${dept}` : ""}.` + grew(false),
    action: "Move the partial return into an exchange",
  };
}

const fmtN = (n: number) => Math.round(n).toLocaleString();
function fmtMoney(v: number) {
  const a = Math.abs(v);
  const s = v < 0 ? "−" : "";
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(1)}K`;
  return `${s}$${Math.round(a)}`;
}

/* --------------------------- treemap ----------------------------- */

type TRect = { x: number; y: number; w: number; h: number };

/* A binary-split treemap: recursively cut the rectangle into two groups of
   roughly equal value, alternating direction. Simple and always valid, which is
   what we want here over a fancier squarified layout. */
function binaryTreemap<T extends { value: number }>(
  items: T[],
  rect: TRect,
  horizontal: boolean,
): (T & TRect)[] {
  if (items.length === 0) return [];
  if (items.length === 1) return [{ ...items[0], ...rect }];
  const total = items.reduce((s, i) => s + i.value, 0);
  let acc = 0;
  let idx = 0;
  for (; idx < items.length - 1; idx++) {
    if (idx > 0 && acc + items[idx].value > total / 2) break;
    acc += items[idx].value;
  }
  const a = items.slice(0, idx);
  const b = items.slice(idx);
  const frac = total > 0 ? a.reduce((s, i) => s + i.value, 0) / total : 0.5;
  if (horizontal) {
    const w1 = rect.w * frac;
    return [
      ...binaryTreemap(a, { ...rect, w: w1 }, !horizontal),
      ...binaryTreemap(b, { x: rect.x + w1, y: rect.y, w: rect.w - w1, h: rect.h }, !horizontal),
    ];
  }
  const h1 = rect.h * frac;
  return [
    ...binaryTreemap(a, { ...rect, h: h1 }, !horizontal),
    ...binaryTreemap(b, { x: rect.x, y: rect.y + h1, w: rect.w, h: rect.h - h1 }, !horizontal),
  ];
}

const TONE_BG: Record<Read["tone"], string> = {
  good: "#0f7a63",
  warn: "#d97706",
  bad: "#dc2828",
};

/** Journeys as a treemap: block size is customers, colour is whether the
    outcome is good, worth watching, or costing you. Reads at a glance —
    biggest blocks are where your customers are, red is where they leak. */
export function JourneyTreemap({ journeys }: { journeys: Journey[] }) {
  const top = [...journeys].sort((a, b) => b.customers - a.customers).slice(0, 14);
  const laid = binaryTreemap(
    top.map((j) => ({ value: j.customers, j })),
    { x: 0, y: 0, w: 100, h: 100 },
    true,
  );
  return (
    <Card>
      <CardHeading
        title="Where your customers are"
        subtitle="Each block is one complete journey. Its size is how many customers took it; its colour is whether that ending is good, worth watching, or costing you."
      />
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-600">
        {(
          [
            ["good", "Winning"],
            ["warn", "Watch"],
            ["bad", "Costing you"],
          ] as [Read["tone"], string][]
        ).map(([tone, label]) => (
          <span key={tone} className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: TONE_BG[tone] }} />
            {label}
          </span>
        ))}
      </div>
      <div className="relative mt-3 h-[360px] w-full">
        {laid.map(({ j, x, y, w, h }) => {
          const read = readJourney(j);
          const short = j.cameBack
            ? `${j.steps[1].label} → ${j.steps[3].label}`
            : `${j.steps[1].label}, gone`;
          const showLabel = w > 15 && h > 15;
          const showCount = w > 9 && h > 9;
          return (
            <div
              key={j.key}
              className="absolute overflow-hidden rounded-[3px] p-1.5 text-neutral-0"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `calc(${w}% - 3px)`,
                height: `calc(${h}% - 3px)`,
                backgroundColor: TONE_BG[read.tone],
              }}
              title={`${j.steps.map((s) => s.label).join(" → ")} · ${fmtN(j.customers)} customers · ${fmtMoney(j.net)}`}
            >
              <div className="flex h-full flex-col justify-between gap-1">
                {showLabel ? (
                  <span className="truncate text-[10px] font-medium leading-tight opacity-90">
                    {short}
                  </span>
                ) : (
                  <span />
                )}
                {showCount ? <span className="text-sm font-bold leading-none">{fmtN(j.customers)}</span> : null}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-2.5 text-[11px] leading-4 text-neutral-600">
        The biggest blocks are where most of your customers are; the red ones are the journeys
        leaking value. Hover any block for its full path and net value.
      </p>
    </Card>
  );
}

/** Anything past this much movement is worth being told about unprompted. */
const ALERT_AT = 20;

type Preset = "all" | "losing" | "best" | "dropoff" | "movers";
const PRESETS: { id: Preset; label: string; hint: string }[] = [
  { id: "all", label: "All journeys", hint: "Every complete path, biggest first" },
  { id: "losing", label: "Losing money", hint: "Journeys with negative net value" },
  { id: "best", label: "Best repeat", hint: "Journeys that end in another purchase" },
  { id: "dropoff", label: "Biggest drop-off", hint: "Journeys that end without a repeat" },
  { id: "movers", label: "Biggest movers", hint: "Largest change against last period" },
];

type Metric = "customers" | "net";
type SortBy = "biggest" | "improved" | "declined";

/* ---------------------------- pieces ----------------------------- */

function PathChips({ steps }: { steps: Stage[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
      {steps.map((s, i) => (
        <span key={s.id} className="flex items-center gap-1.5">
          {i > 0 ? (
            <span aria-hidden="true" className="text-neutral-300">
              ›
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 py-0.5 pl-1.5 pr-2 text-[11px] font-medium text-neutral-800">
            <span
              className="size-2 shrink-0 rounded-full ring-1 ring-inset ring-black/10"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </span>
        </span>
      ))}
    </div>
  );
}

function Delta({ value }: { value: number }) {
  const up = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 whitespace-nowrap text-xs font-medium ${
        up ? "text-success-600" : "text-danger-600"
      }`}
    >
      {up ? "↑" : "↓"}
      {Math.abs(value).toFixed(0)}%
    </span>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-neutral-600">
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 rounded-lg border border-neutral-200 bg-neutral-0 px-2 text-xs font-medium text-neutral-800"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* ---------------------------- module ----------------------------- */

export default function JourneysModule({ journeys }: { journeys: Journey[] }) {
  const [preset, setPreset] = useState<Preset>("all");
  const [metric, setMetric] = useState<Metric>("customers");
  const [sort, setSort] = useState<SortBy>("biggest");

  const rows = useMemo(() => {
    let list = journeys;
    if (preset === "losing") list = list.filter((j) => j.net < 0);
    if (preset === "best") list = list.filter((j) => j.cameBack);
    if (preset === "dropoff") list = list.filter((j) => !j.cameBack);
    if (preset === "movers") list = list.filter((j) => Math.abs(j.delta) >= ALERT_AT);

    const size = (j: Journey) => (metric === "net" ? j.net : j.customers);
    const sorted = [...list];
    if (sort === "improved") sorted.sort((a, b) => b.delta - a.delta);
    else if (sort === "declined") sorted.sort((a, b) => a.delta - b.delta);
    else if (preset === "movers") sorted.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    else if (preset === "losing") sorted.sort((a, b) => a.net - b.net);
    else sorted.sort((a, b) => size(b) - size(a));
    return sorted;
  }, [journeys, preset, metric, sort]);

  const { slice, page, setPage, total, pageSize } = usePaged(rows, 6);
  const activeHint = PRESETS.find((p) => p.id === preset)?.hint ?? "";

  return (
    <Card id="flow-journeys">
      <CardHeading
        title="Customer journeys"
        subtitle="Every complete path from how they bracket to what they buy next, ranked."
      />

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setPreset(p.id);
                setPage(0);
              }}
              className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                preset === p.id
                  ? "bg-primary-600 text-neutral-0"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-150"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <Select
            label="Size by"
            value={metric}
            onChange={(v) => setMetric(v as Metric)}
            options={[
              { value: "customers", label: "Customers" },
              { value: "net", label: "Net value" },
            ]}
          />
          <Select
            label="Sort"
            value={sort}
            onChange={(v) => setSort(v as SortBy)}
            options={[
              { value: "biggest", label: "Biggest" },
              { value: "improved", label: "Most improved" },
              { value: "declined", label: "Most declined" },
            ]}
          />
        </div>
      </div>

      <p className="mt-2 text-xs text-neutral-600">{activeHint}</p>

      {/* Column labels, so the two numbers on each row are unambiguous. */}
      <div className="mt-3 hidden items-center gap-x-4 border-b border-neutral-200 pb-1.5 text-[11px] font-medium text-neutral-500 sm:flex">
        <span className="w-5 shrink-0" />
        <span className="min-w-[240px] flex-1">Journey</span>
        <span className="w-16 shrink-0 text-right">Customers</span>
        <span className="w-20 shrink-0 text-right">Net value</span>
        <span className="w-16 shrink-0 text-right">Change</span>
      </div>

      <ol className="flex flex-col">
        {slice.map((j, i) => {
          const read = readJourney(j);
          const material = Math.abs(j.delta) >= ALERT_AT;
          return (
            <li key={j.key} className="border-b border-primary-50 py-3 last:border-b-0">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <span className="w-5 shrink-0 text-xs font-semibold text-neutral-400">
                  {page * pageSize + i + 1}
                </span>
                <div className="min-w-[240px] flex-1">
                  <PathChips steps={j.steps} />
                </div>
                <span className="w-16 shrink-0 text-right text-xs text-neutral-600">
                  {fmtN(j.customers)}
                </span>
                <span
                  className={`w-20 shrink-0 text-right text-sm font-semibold ${
                    j.net < 0 ? "text-danger-600" : "text-neutral-800"
                  }`}
                >
                  {fmtMoney(j.net)}
                </span>
                <span className="flex w-16 shrink-0 items-center justify-end gap-1">
                  {material ? (
                    <span className="size-1.5 rounded-full bg-warning-500" title="Moved materially" />
                  ) : null}
                  <Delta value={j.delta} />
                </span>
              </div>
              {/* The one-line read: what it is, and what to do. */}
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 sm:pl-9">
                <span
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                    read.tone === "bad"
                      ? "bg-danger-50 text-danger-600"
                      : read.tone === "warn"
                        ? "bg-warning-50 text-warning-600"
                        : "bg-success-50 text-success-600"
                  }`}
                >
                  {read.verdict}
                </span>
                <span className="text-xs font-medium text-neutral-700">→ {read.action}</span>
                <span className="ml-auto">
                  <TakeAction context="Behavioral Flow" department={j.steps[0].label} />
                </span>
              </div>
            </li>
          );
        })}
        {slice.length === 0 ? (
          <li className="py-6 text-center text-sm text-neutral-600">
            No journeys match this view.
          </li>
        ) : null}
      </ol>

      <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />

      <p className="mt-3 text-[11px] text-neutral-600">
        Period-on-period movement is illustrative in this prototype.
      </p>
    </Card>
  );
}
