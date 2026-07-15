"use client";

import { useState } from "react";
import { Card, CardHeading } from "./parts";

/* ----------------------------- model ----------------------------- */

const TOTAL = 20806;

// split = [Returned All, Kept Some, Kept All]
const BRACK = [
  { id: "Size", color: "#4169e1", value: 5200, split: [0.18, 0.42, 0.4] },
  { id: "Color", color: "#27cba7", value: 4800, split: [0.1, 0.3, 0.6] },
  { id: "Both", color: "#1d97ff", value: 2100, split: [0.22, 0.45, 0.33] },
  { id: "No Bracketing", color: "#ababab", value: 8706, split: [0.2, 0.38, 0.42] },
];
// back = [came back, did not]
const OUTCOMES = [
  { id: "Returned All", color: "#dc2828", idx: 0, back: [0.35, 0.65] },
  { id: "Kept Some", color: "#f59f0a", idx: 1, back: [0.7, 0.3] },
  { id: "Kept All", color: "#059467", idx: 2, back: [0.82, 0.18] },
];
const DEPTS = [
  { id: "W Denim", frac: 0.3, color: "#4169e1" },
  { id: "W Tops", frac: 0.24, color: "#1d97ff" },
  { id: "Accessories", frac: 0.18, color: "#27cba7" },
  { id: "Mens", frac: 0.16, color: "#85a1ff" },
  { id: "Other", frac: 0.12, color: "#ababab" },
];

type Seg = { id: string; color: string; count: number };

function outcomeSegs(brackId?: string): Seg[] {
  return OUTCOMES.map((o) => {
    const count = brackId
      ? (BRACK.find((b) => b.id === brackId)?.value ?? 0) *
        (BRACK.find((b) => b.id === brackId)?.split[o.idx] ?? 0)
      : BRACK.reduce((s, b) => s + b.value * b.split[o.idx], 0);
    return { id: o.id, color: o.color, count: Math.round(count) };
  });
}

function backSegs(brackId?: string, outcomeId?: string): Seg[] {
  const outs = outcomeSegs(brackId).filter((o) => !outcomeId || o.id === outcomeId);
  let back = 0;
  let none = 0;
  outs.forEach((o) => {
    const def = OUTCOMES.find((x) => x.id === o.id);
    if (!def) return;
    back += o.count * def.back[0];
    none += o.count * def.back[1];
  });
  return [
    { id: "Came back", color: "#059467", count: Math.round(back) },
    { id: "No repeat purchase", color: "#ababab", count: Math.round(none) },
  ];
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n));

/* --------------------------- stage bar --------------------------- */

function StageBar({
  title,
  note,
  segments,
  selected,
  onSelect,
}: {
  title: string;
  note?: string;
  segments: Seg[];
  selected?: string;
  onSelect?: (id: string | undefined) => void;
}) {
  const total = segments.reduce((s, x) => s + x.count, 0) || 1;
  const interactive = Boolean(onSelect);
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-800">
          {title}
          {note ? <span className="ml-1.5 text-xs font-normal text-neutral-400">{note}</span> : null}
        </span>
        {selected && onSelect ? (
          <button
            type="button"
            onClick={() => onSelect(undefined)}
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            Clear
          </button>
        ) : null}
      </div>
      <div className="flex h-11 w-full gap-1">
        {segments.map((s) => {
          const dim = selected != null && selected !== s.id;
          const width = `${Math.max((s.count / total) * 100, 3)}%`;
          const inner = (
            <>
              <span className="truncate text-[11px] font-semibold leading-tight">{s.id}</span>
              <span className="truncate text-[10px] leading-tight opacity-90">
                {fmt(s.count)} · {Math.round((s.count / total) * 100)}%
              </span>
            </>
          );
          const base =
            "flex flex-col items-start justify-center overflow-hidden rounded-md px-2 text-left text-white transition-opacity";
          return interactive ? (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect?.(selected === s.id ? undefined : s.id)}
              style={{ width, backgroundColor: s.color }}
              className={`${base} ${dim ? "opacity-30 hover:opacity-60" : "opacity-100"}`}
            >
              {inner}
            </button>
          ) : (
            <div key={s.id} style={{ width, backgroundColor: s.color }} className={base}>
              {inner}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------- journey explorer ------------------------ */

function JourneyExplorer() {
  const [sel, setSel] = useState<{ bracketing?: string; outcome?: string; cameBack?: string }>({});

  const stage1: Seg[] = BRACK.map((b) => ({ id: b.id, color: b.color, count: b.value }));
  const stage2 = outcomeSegs(sel.bracketing);
  const stage3 = backSegs(sel.bracketing, sel.outcome);
  const cameBackPop =
    sel.cameBack === "No repeat purchase"
      ? 0
      : (stage3.find((s) => s.id === "Came back")?.count ?? 0);
  const stage4: Seg[] = DEPTS.map((d) => ({
    id: d.id,
    color: d.color,
    count: Math.round(cameBackPop * d.frac),
  }));

  const pathCount = sel.cameBack
    ? (stage3.find((s) => s.id === sel.cameBack)?.count ?? 0)
    : sel.outcome
      ? (stage2.find((s) => s.id === sel.outcome)?.count ?? 0)
      : sel.bracketing
        ? (BRACK.find((b) => b.id === sel.bracketing)?.value ?? 0)
        : TOTAL;

  const crumbs = [sel.bracketing, sel.outcome, sel.cameBack].filter(Boolean) as string[];

  return (
    <Card>
      <CardHeading
        title="Customer journey explorer"
        subtitle="Click any segment to trace that group forward — each stage below re-splits for your selection."
      />

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary-50 px-3 py-2">
        <p className="text-sm text-neutral-700">
          <span className="font-bold text-neutral-800">{fmt(pathCount)}</span> customers
          <span className="text-neutral-500">
            {" "}
            ({Math.round((pathCount / TOTAL) * 100)}% of {fmt(TOTAL)})
          </span>
          {crumbs.length ? (
            <span className="text-neutral-500"> · {crumbs.join(" → ")}</span>
          ) : (
            <span className="text-neutral-500"> · all customers</span>
          )}
        </p>
        {crumbs.length ? (
          <button
            type="button"
            onClick={() => setSel({})}
            className="text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            Reset
          </button>
        ) : null}
      </div>

      <div data-anim-fade className="mt-4 flex flex-col gap-4">
        <StageBar
          title="1 · Bracketing type"
          segments={stage1}
          selected={sel.bracketing}
          onSelect={(v) => setSel({ bracketing: v })}
        />
        <StageBar
          title="2 · First-order outcome"
          segments={stage2}
          selected={sel.outcome}
          onSelect={(v) => setSel((p) => ({ bracketing: p.bracketing, outcome: v }))}
        />
        <StageBar
          title="3 · Did they come back?"
          segments={stage3}
          selected={sel.cameBack}
          onSelect={(v) => setSel((p) => ({ bracketing: p.bracketing, outcome: p.outcome, cameBack: v }))}
        />
        <StageBar title="4 · Next department" note="of those who came back" segments={stage4} />
      </div>
    </Card>
  );
}

/* -------------------------- all paths ---------------------------- */

type PathRow = {
  bracketing: string;
  firstOrder: string;
  nextPurchase: string;
  nextDept: string;
  customers: number;
  netValue: string;
  perCust: string;
  positive: boolean;
};

const PATHS: PathRow[] = [
  { bracketing: "Size", firstOrder: "Returned All", nextPurchase: "Next Purchase", nextDept: "W Denim", customers: 118, netValue: "$16.2K", perCust: "$137", positive: true },
  { bracketing: "Size", firstOrder: "Returned All", nextPurchase: "Next Purchase", nextDept: "W Tops", customers: 96, netValue: "$8.6K", perCust: "$90", positive: true },
  { bracketing: "Size", firstOrder: "Returned All", nextPurchase: "Next Purchase", nextDept: "Accessories", customers: 88, netValue: "$3.7K", perCust: "$42", positive: true },
  { bracketing: "Size", firstOrder: "Returned All", nextPurchase: "Next Purchase", nextDept: "Mens", customers: 74, netValue: "$8.4K", perCust: "$114", positive: true },
  { bracketing: "Size", firstOrder: "Returned All", nextPurchase: "No Next Purchase", nextDept: "—", customers: 833, netValue: "−$11.7K", perCust: "−$14", positive: false },
  { bracketing: "Size", firstOrder: "Kept Some", nextPurchase: "Next Purchase", nextDept: "W Denim", customers: 336, netValue: "$56.2K", perCust: "$167", positive: true },
  { bracketing: "Size", firstOrder: "Kept Some", nextPurchase: "Next Purchase", nextDept: "W Tops", customers: 189, netValue: "$37.7K", perCust: "$200", positive: true },
  { bracketing: "Size", firstOrder: "Kept Some", nextPurchase: "Next Purchase", nextDept: "Accessories", customers: 128, netValue: "$28.2K", perCust: "$126", positive: true },
  { bracketing: "Size", firstOrder: "Kept Some", nextPurchase: "No Next Purchase", nextDept: "—", customers: 608, netValue: "$37.5K", perCust: "$84", positive: true },
  { bracketing: "Size", firstOrder: "Kept All", nextPurchase: "Next Purchase", nextDept: "W Denim", customers: 468, netValue: "$139.1K", perCust: "$418", positive: true },
  { bracketing: "Size", firstOrder: "Kept All", nextPurchase: "Next Purchase", nextDept: "W Tops", customers: 380, netValue: "$109.4K", perCust: "$396", positive: true },
  { bracketing: "Size", firstOrder: "Kept All", nextPurchase: "Next Purchase", nextDept: "Accessories", customers: 301, netValue: "$47.6K", perCust: "$185", positive: true },
  { bracketing: "Color", firstOrder: "Kept All", nextPurchase: "Next Purchase", nextDept: "W Denim", customers: 512, netValue: "$168.3K", perCust: "$462", positive: true },
  { bracketing: "Color", firstOrder: "Returned All", nextPurchase: "No Next Purchase", nextDept: "—", customers: 402, netValue: "−$6.1K", perCust: "−$15", positive: false },
];

function ValuePill({ text, positive }: { text: string; positive: boolean }) {
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-xs font-semibold ${
        positive ? "bg-success-50 text-success-600" : "bg-danger-50 text-danger-600"
      }`}
    >
      {text}
    </span>
  );
}

function AllPaths() {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-neutral-800">All paths</h2>
        <span className="text-xs text-neutral-500">Sort value: Net</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Bracketing</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">First Order</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">Next Purchase?</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">Next Dept</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Customers</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Net Value</th>
              <th className="whitespace-nowrap py-2 pl-3 text-right font-normal">Per Cust.</th>
            </tr>
          </thead>
          <tbody>
            {PATHS.map((p, i) => (
              <tr key={i} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-2.5 pr-3 font-medium text-neutral-800">{p.bracketing}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-neutral-700">{p.firstOrder}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-neutral-700">{p.nextPurchase}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-neutral-700">{p.nextDept}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right text-neutral-700">{p.customers}</td>
                <td className="whitespace-nowrap px-3 py-2.5 text-right">
                  <ValuePill text={p.netValue} positive={p.positive} />
                </td>
                <td className="whitespace-nowrap py-2.5 pl-3 text-right">
                  <ValuePill text={p.perCust} positive={p.positive} />
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

export default function BehavioralFlowTab() {
  return (
    <>
      <JourneyExplorer />
      <AllPaths />
    </>
  );
}
