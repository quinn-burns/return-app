"use client";

import { useEffect, useMemo, useState } from "react";
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

const fmtN = (n: number) => Math.round(n).toLocaleString();
function fmtMoney(v: number) {
  const a = Math.abs(v);
  const s = v < 0 ? "−" : "";
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(1)}K`;
  return `${s}$${Math.round(a)}`;
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

type View = { name: string; preset: Preset; metric: Metric; sort: SortBy };
const STORAGE_KEY = "returns-journey-views";

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

export default function JourneysModule({
  journeys,
  sankey,
}: {
  journeys: Journey[];
  sankey: React.ReactNode;
}) {
  const [preset, setPreset] = useState<Preset>("all");
  const [metric, setMetric] = useState<Metric>("customers");
  const [sort, setSort] = useState<SortBy>("biggest");
  const [showFlow, setShowFlow] = useState(false);
  const [views, setViews] = useState<View[]>([]);
  const [naming, setNaming] = useState(false);
  const [draftName, setDraftName] = useState("");

  // Saved views live in the browser, so they are read after mount rather than
  // during render — reading storage while rendering breaks hydration.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setViews(JSON.parse(raw) as View[]);
    } catch {
      /* storage unavailable — saved views just stay empty */
    }
  }, []);
  const persist = (next: View[]) => {
    setViews(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const moved = useMemo(
    () => journeys.filter((j) => Math.abs(j.delta) >= ALERT_AT).length,
    [journeys],
  );

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

  const { slice, page, setPage, total, pageSize } = usePaged(rows, 8);
  const max = Math.max(...rows.map((j) => Math.abs(metric === "net" ? j.net : j.customers)), 1);
  const activeHint = PRESETS.find((p) => p.id === preset)?.hint ?? "";

  const applyView = (v: View) => {
    setPreset(v.preset);
    setMetric(v.metric);
    setSort(v.sort);
    setPage(0);
  };

  return (
    <Card id="flow-journeys">
      <CardHeading
        title="Customer journeys"
        subtitle="Every complete path from how they bracket to what they buy next, ranked. Built from the same numbers as the flow diagram."
      />

      {/* Tell them what moved rather than waiting to be asked. */}
      {moved > 0 ? (
        <button
          type="button"
          onClick={() => {
            setPreset("movers");
            setPage(0);
          }}
          className="mt-3 flex w-full items-center gap-2 rounded-lg border border-warning-100 bg-warning-50 px-3 py-2 text-left text-xs text-neutral-700 transition-colors hover:border-warning-400"
        >
          <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-warning-500 text-[10px] font-bold text-neutral-0">
            !
          </span>
          <span>
            <span className="font-semibold text-neutral-800">{moved} journeys</span> moved more than{" "}
            {ALERT_AT}% since last period.
          </span>
          <span className="ml-auto whitespace-nowrap font-medium text-primary-600">Show me →</span>
        </button>
      ) : null}

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

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="text-xs text-neutral-600">{activeHint}</p>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {views.map((v) => (
            <span
              key={v.name}
              className="flex items-center gap-1 rounded-full border border-primary-100 bg-primary-50 py-0.5 pl-2.5 pr-1 text-xs text-primary-600"
            >
              <button type="button" onClick={() => applyView(v)} className="font-medium">
                {v.name}
              </button>
              <button
                type="button"
                aria-label={`Delete saved view ${v.name}`}
                onClick={() => persist(views.filter((x) => x.name !== v.name))}
                className="px-1 text-neutral-400 hover:text-danger-600"
              >
                ×
              </button>
            </span>
          ))}
          {naming ? (
            <span className="flex items-center gap-1">
              <input
                autoFocus
                value={draftName}
                onChange={(e) => setDraftName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setNaming(false);
                  if (e.key === "Enter" && draftName.trim()) {
                    persist([
                      ...views.filter((v) => v.name !== draftName.trim()),
                      { name: draftName.trim(), preset, metric, sort },
                    ]);
                    setDraftName("");
                    setNaming(false);
                  }
                }}
                placeholder="Name this view"
                className="h-7 w-36 rounded-lg border border-neutral-200 px-2 text-xs text-neutral-800"
              />
              <button
                type="button"
                onClick={() => setNaming(false)}
                className="text-xs text-neutral-600 hover:text-neutral-800"
              >
                Cancel
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setNaming(true)}
              className="rounded-lg border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
            >
              Save this view
            </button>
          )}
        </div>
      </div>

      <ol className="mt-3 flex flex-col">
        {slice.map((j, i) => {
          const size = metric === "net" ? j.net : j.customers;
          const pct = (Math.abs(size) / max) * 100;
          const negative = metric === "net" && j.net < 0;
          return (
            <li
              key={j.key}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-primary-50 py-3 last:border-b-0"
            >
              <span className="w-5 shrink-0 text-xs font-semibold text-neutral-400">
                {page * pageSize + i + 1}
              </span>
              <div className="min-w-[280px] flex-1">
                <PathChips steps={j.steps} />
              </div>
              <span className="flex w-32 shrink-0 items-center gap-2">
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <span
                    data-anim-bar
                    className={`block h-full rounded-full ${negative ? "bg-danger-600" : "bg-primary-600"}`}
                    style={{ width: `${pct}%` }}
                  />
                </span>
              </span>
              <span className="w-20 shrink-0 text-right text-xs text-neutral-700">
                {fmtN(j.customers)}
              </span>
              <span
                className={`w-20 shrink-0 text-right text-xs font-semibold ${
                  j.net < 0 ? "text-danger-600" : "text-neutral-800"
                }`}
              >
                {fmtMoney(j.net)}
              </span>
              <span className="flex w-24 shrink-0 items-center justify-end gap-1.5">
                {Math.abs(j.delta) >= ALERT_AT ? (
                  <span className="size-1.5 rounded-full bg-warning-500" title="Moved materially" />
                ) : null}
                <Delta value={j.delta} />
              </span>
              <TakeAction context="Behavioral Flow" department={j.steps[0].label} />
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

      <div className="mt-4 border-t border-neutral-150 pt-3">
        <button
          type="button"
          onClick={() => setShowFlow((s) => !s)}
          className="flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700"
        >
          <span
            aria-hidden="true"
            className={`transition-transform ${showFlow ? "rotate-90" : ""}`}
          >
            ›
          </span>
          {showFlow ? "Hide the whole flow" : "See the whole flow"}
        </button>
        {showFlow ? <div className="mt-4">{sankey}</div> : null}
      </div>

      <p className="mt-3 text-[11px] text-neutral-600">
        Period-on-period movement is illustrative in this prototype.
      </p>
    </Card>
  );
}
