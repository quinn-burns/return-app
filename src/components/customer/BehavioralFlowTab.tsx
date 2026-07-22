"use client";

import { useState } from "react";
import { Card, CardHeading, Pagination, usePaged } from "./parts";
import { seeded } from "./filler";

/* ----------------------------- model ----------------------------- */

const TOTAL = 20806;

// split = [Returned All, Kept Some, Kept All]
const BRACK = [
  { id: "Size", color: "#4169e1", value: 5200, split: [0.18, 0.42, 0.4] },
  { id: "Color", color: "#85a1ff", value: 4800, split: [0.1, 0.3, 0.6] },
  { id: "Both", color: "#26398c", value: 2100, split: [0.22, 0.45, 0.33] },
  { id: "No Bracketing", color: "#c7d4ff", value: 8706, split: [0.2, 0.38, 0.42] },
];
// back = [came back, did not]
const OUTCOMES = [
  { id: "Returned All", color: "#dc2828", idx: 0, back: [0.35, 0.65] },
  { id: "Kept Some", color: "#f59f0a", idx: 1, back: [0.7, 0.3] },
  { id: "Kept All", color: "#059467", idx: 2, back: [0.82, 0.18] },
];
const DEPTS = [
  { id: "W Denim", frac: 0.3, color: "#d97706" },
  { id: "W Tops", frac: 0.24, color: "#f59f0a" },
  { id: "Accessories", frac: 0.18, color: "#fbbf24" },
  { id: "Mens", frac: 0.16, color: "#fcd34d" },
  { id: "Other", frac: 0.12, color: "#fde68a" },
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
          {note ? <span className="ml-1.5 text-xs font-normal text-neutral-600">{note}</span> : null}
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
          <span className="text-neutral-600">
            {" "}
            ({Math.round((pathCount / TOTAL) * 100)}% of {fmt(TOTAL)})
          </span>
          {crumbs.length ? (
            <span className="text-neutral-600"> · {crumbs.join(" → ")}</span>
          ) : (
            <span className="text-neutral-600"> · all customers</span>
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

/** Fill out the remaining bracket x outcome x dept combinations so the table pages. */
function padPaths(base: PathRow[], count: number): PathRow[] {
  const out = [...base];
  const brackets = ["Size", "Color", "Both", "No Bracketing"];
  const orders = ["Returned All", "Kept Some", "Kept All"];
  const dests = ["W Denim", "W Tops", "Accessories", "Mens", "Other", "\u2014"];
  for (const b of brackets) {
    for (const o of orders) {
      for (const d of dests) {
        if (out.length >= count) return out;
        if (out.some((p) => p.bracketing === b && p.firstOrder === o && p.nextDept === d)) continue;
        const key = `${b}|${o}|${d}`;
        const cust = Math.round(seeded(key, 61, 40, 900));
        const per = Math.round(seeded(key, 62, -30, 460));
        const net = (cust * per) / 1000;
        out.push({
          bracketing: b,
          firstOrder: o,
          nextPurchase: d === "\u2014" ? "No Next Purchase" : "Next Purchase",
          nextDept: d,
          customers: cust,
          netValue: `${net < 0 ? "\u2212" : ""}$${Math.abs(net).toFixed(1)}K`,
          perCust: `${per < 0 ? "\u2212" : ""}$${Math.abs(per)}`,
          positive: per >= 0,
        });
      }
    }
  }
  return out;
}
const PATHS_ALL = padPaths(PATHS, 48);

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
  const { slice, page, setPage, total, pageSize } = usePaged(PATHS_ALL, 12);
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-neutral-800">All paths</h2>
        <span className="text-xs text-neutral-600">Sort value: Net</span>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
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
            {slice.map((p, i) => (
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
      <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
    </Card>
  );
}

/* ----------------------------- tab ------------------------------- */

/* ----------------------------- sankey ---------------------------- */

const SANKEY_TOTAL = 24318;
const S_BRACKETS: { id: string; label: string; share: number; color: string; out: Record<string, number> }[] = [
  { id: "size", label: "Size", share: 0.22, color: "#454545", out: { retall: 0.22, keptsome: 0.3, keptall: 0.48 } },
  { id: "color", label: "Color", share: 0.11, color: "#8a8a8a", out: { retall: 0.18, keptsome: 0.27, keptall: 0.55 } },
  { id: "both", label: "Size + Color", share: 0.08, color: "#ababab", out: { retall: 0.25, keptsome: 0.45, keptall: 0.3 } },
  { id: "single", label: "No Bracketing", share: 0.59, color: "#dedede", out: { retall: 0.22, keptsome: 0, keptall: 0.78 } },
];
const S_OUTCOMES = [
  { id: "retall", label: "Returned All", color: "#0729a5", repeat: 0.41, val: -14 },
  { id: "keptsome", label: "Kept Some", color: "#4169e1", repeat: 0.58, val: 104 },
  { id: "keptall", label: "Kept All", color: "#85a1ff", repeat: 0.74, val: 188 },
];
const S_NEXT = { next: "#0f7a63", norep: "#9ce6d6" };
const S_DEPTS = [
  { id: "denim", label: "W Denim", share: 0.34, color: "#b45309", val: 150 },
  { id: "tops", label: "W Tops", share: 0.28, color: "#d97706", val: 96 },
  { id: "acc", label: "Accessories", share: 0.19, color: "#f59f0a", val: 54 },
  { id: "mens", label: "Mens", share: 0.11, color: "#fbbf24", val: 128 },
  { id: "other", label: "Other", share: 0.08, color: "#fcd34d", val: 72 },
];

const sFmt = (n: number) => Math.round(n).toLocaleString();
function sMoney(v: number) {
  const a = Math.abs(v);
  const s = v < 0 ? "-" : "";
  if (a >= 1e6) return `${s}$${(a / 1e6).toFixed(2)}M`;
  if (a >= 1e3) return `${s}$${(a / 1e3).toFixed(1)}K`;
  return `${s}$${Math.round(a)}`;
}

type SN = { id: string; label: string; c: string; v: number; x: number; y0: number; y1: number };
type Tip = { title: string; cust: number; avg: number };

const S_LEGEND_GROUPS = [
  {
    stage: "Bracketing Type",
    items: [
      { label: "Size", color: "#454545" },
      { label: "Color", color: "#8a8a8a" },
      { label: "Size + Color", color: "#ababab" },
      { label: "No Bracketing", color: "#dedede" },
    ],
  },
  {
    stage: "First Order",
    items: [
      { label: "Returned All", color: "#0729a5" },
      { label: "Kept Some", color: "#4169e1" },
      { label: "Kept All", color: "#85a1ff" },
    ],
  },
  {
    stage: "Next Purchase?",
    items: [
      { label: "Next Purchase", color: S_NEXT.next },
      { label: "No Next Purchase", color: S_NEXT.norep },
    ],
  },
  {
    stage: "Next Dept",
    items: [
      { label: "W Denim", color: "#b45309" },
      { label: "W Tops", color: "#d97706" },
      { label: "Accessories", color: "#f59f0a" },
      { label: "Mens", color: "#fbbf24" },
      { label: "Other", color: "#fcd34d" },
    ],
  },
];

function Sankey() {
  const [hover, setHover] = useState<{ kind: "rib"; i: number } | { kind: "node"; id: string } | null>(
    null,
  );
  const [tip, setTip] = useState<Tip | null>(null);
  // Drill-through selection, one entry per stage. Picking a node narrows the
  // population that flows onward, so every column to its right is recounted.
  const [sel, setSel] = useState<{ bracket?: string; outcome?: string; next?: string }>({});

  const W = 1240;
  const H = 470;
  const colW = 20;
  const cols = [60, 430, 800, 1160];
  const top = 50;
  const scale = (H - top - 14 - 5 * 6) / SANKEY_TOTAL;

  const bracketOn = (id: string) => !sel.bracket || sel.bracket === id;
  const outcomeOn = (id: string) => !sel.outcome || sel.outcome === id;
  const nextOn = (id: string) => !sel.next || sel.next === id;
  const active = Boolean(sel.bracket || sel.outcome || sel.next);

  // Geometry is always built from the full population, so drilling in never
  // resizes or reflows the diagram — the shape you learned stays put.
  const bracketN = S_BRACKETS.map((b) => b.share * SANKEY_TOTAL);
  const outTot = S_OUTCOMES.map((o) =>
    S_BRACKETS.reduce((s, b, bi) => s + bracketN[bi] * b.out[o.id], 0),
  );
  const repeatN = S_OUTCOMES.reduce((s, o, oi) => s + outTot[oi] * o.repeat, 0);
  const norepN = SANKEY_TOTAL - repeatN;
  const avgFirst = S_OUTCOMES.reduce((s, o, oi) => s + outTot[oi] * o.val, 0) / SANKEY_TOTAL;
  const avgDept = S_DEPTS.reduce((s, d) => s + d.share * d.val, 0);

  // The selected route, counted stage by stage. Drawn as a solid band inside
  // each full-size flow, so the part and the whole are visible together.
  const selBracket = S_BRACKETS.map((b, i) => (bracketOn(b.id) ? bracketN[i] : 0));
  const selOut = S_OUTCOMES.map((o) =>
    outcomeOn(o.id) ? S_BRACKETS.reduce((s, b, bi) => s + selBracket[bi] * b.out[o.id], 0) : 0,
  );
  const selNext = nextOn("next")
    ? S_OUTCOMES.reduce((s, o, oi) => s + selOut[oi] * o.repeat, 0)
    : 0;
  const selNorep = nextOn("norep")
    ? S_OUTCOMES.reduce((s, o, oi) => s + selOut[oi] * (1 - o.repeat), 0)
    : 0;

  const selVal: Record<string, number> = { next: selNext, norep: selNorep };
  S_BRACKETS.forEach((b, i) => {
    selVal[b.id] = selBracket[i];
  });
  S_OUTCOMES.forEach((o, i) => {
    selVal[o.id] = selOut[i];
  });
  S_DEPTS.forEach((d) => {
    selVal[d.id] = selNext * d.share;
  });

  const stack = (items: { id: string; label: string; c: string; v: number }[], x: number): SN[] => {
    let y = top;
    return items.map((it) => {
      const h = Math.max(it.v * scale, 3);
      const node = { ...it, x, y0: y, y1: y + h };
      y += h + 6;
      return node;
    });
  };
  const colA = stack(
    S_BRACKETS.map((b, i) => ({ id: b.id, label: b.label, c: b.color, v: bracketN[i] })),
    cols[0],
  );
  const colB = stack(
    S_OUTCOMES.map((o, i) => ({ id: o.id, label: o.label, c: o.color, v: outTot[i] })),
    cols[1],
  );
  const colC = stack(
    [
      { id: "next", label: "Next Purchase", c: S_NEXT.next, v: repeatN },
      { id: "norep", label: "No Next Purchase", c: S_NEXT.norep, v: norepN },
    ],
    cols[2],
  );
  const colD = stack(
    S_DEPTS.map((d) => ({ id: d.id, label: d.label, c: d.color, v: repeatN * d.share })),
    cols[3],
  );

  const nodeMap: Record<string, SN> = {};
  [...colA, ...colB, ...colC, ...colD].forEach((n) => {
    nodeMap[n.id] = n;
  });

  const perNodeVal: Record<string, number> = { next: avgFirst + avgDept, norep: avgFirst };
  S_OUTCOMES.forEach((o) => {
    perNodeVal[o.id] = o.val;
  });
  S_BRACKETS.forEach((b) => {
    perNodeVal[b.id] = Object.keys(b.out).reduce((s, k) => {
      const o = S_OUTCOMES.find((x) => x.id === k);
      return o ? s + b.out[k] * (o.val + o.repeat * avgDept) : s;
    }, 0);
  });
  S_DEPTS.forEach((d) => {
    perNodeVal[d.id] = avgFirst + d.val;
  });

  type L = { src: string; dst: string; v: number; sv: number; color: string; avgVal: number };
  const links: L[] = [];
  S_BRACKETS.forEach((b, bi) =>
    S_OUTCOMES.forEach((o) => {
      const v = bracketN[bi] * b.out[o.id];
      if (v < 1) return;
      const sv = bracketOn(b.id) && outcomeOn(o.id) ? v : 0;
      links.push({ src: b.id, dst: o.id, v, sv, color: o.color, avgVal: o.val + o.repeat * avgDept });
    }),
  );
  S_OUTCOMES.forEach((o, oi) => {
    const tt = outTot[oi];
    links.push({
      src: o.id,
      dst: "next",
      v: tt * o.repeat,
      sv: nextOn("next") ? selOut[oi] * o.repeat : 0,
      color: S_NEXT.next,
      avgVal: o.val + avgDept,
    });
    links.push({
      src: o.id,
      dst: "norep",
      v: tt * (1 - o.repeat),
      sv: nextOn("norep") ? selOut[oi] * (1 - o.repeat) : 0,
      color: S_NEXT.norep,
      avgVal: o.val,
    });
  });
  S_DEPTS.forEach((d) =>
    links.push({
      src: "next",
      dst: d.id,
      v: repeatN * d.share,
      sv: selNext * d.share,
      color: d.color,
      avgVal: avgFirst + d.val,
    }),
  );

  const outOff: Record<string, number> = {};
  const inOff: Record<string, number> = {};
  const ribbons = links.map((l) => {
    const s = nodeMap[l.src];
    const dn = nodeMap[l.dst];
    const so = outOff[l.src] || 0;
    const io = inOff[l.dst] || 0;
    const sy0 = s.y0 + so;
    const sy1 = sy0 + l.v * scale;
    const dy0 = dn.y0 + io;
    const dy1 = dy0 + l.v * scale;
    outOff[l.src] = so + l.v * scale;
    inOff[l.dst] = io + l.v * scale;
    const x1 = s.x + colW;
    const x2 = dn.x;
    const mx = (x1 + x2) / 2;
    const band = (a0: number, a1: number, b0: number, b1: number) =>
      `M${x1},${a0} C${mx},${a0} ${mx},${b0} ${x2},${b0} L${x2},${b1} C${mx},${b1} ${mx},${a1} ${x1},${a1} Z`;
    // The selected share of a flow, drawn along its top edge.
    const f = l.v > 0 ? l.sv / l.v : 0;
    return {
      path: band(sy0, sy1, dy0, dy1),
      hi: f > 0.001 ? band(sy0, sy0 + (sy1 - sy0) * f, dy0, dy0 + (dy1 - dy0) * f) : null,
      l,
    };
  });

  // Which stage a node belongs to, so one click handler can drive all four.
  const stageOf = (id: string): "bracket" | "outcome" | "next" | "dept" => {
    if (S_BRACKETS.some((b) => b.id === id)) return "bracket";
    if (S_OUTCOMES.some((o) => o.id === id)) return "outcome";
    if (id === "next" || id === "norep") return "next";
    return "dept";
  };
  const pick = (id: string) => {
    const st = stageOf(id);
    if (st === "dept") return;
    setSel((prev) => {
      // Re-picking the same node steps back out; picking a new one at a stage
      // invalidates the narrower stages downstream of it.
      if (st === "bracket") return prev.bracket === id ? {} : { bracket: id };
      if (st === "outcome")
        return prev.outcome === id
          ? { bracket: prev.bracket }
          : { bracket: prev.bracket, outcome: id };
      return prev.next === id
        ? { bracket: prev.bracket, outcome: prev.outcome }
        : { bracket: prev.bracket, outcome: prev.outcome, next: id };
    });
  };

  // Ribbons are click targets too: a flow names both ends of the step it
  // represents, so clicking one drills straight to that path.
  const pickPath = (src: string, dst: string) => {
    const st = stageOf(src);
    if (st === "bracket") setSel({ bracket: src, outcome: dst });
    else if (st === "outcome") setSel((p) => ({ bracket: p.bracket, outcome: src, next: dst }));
    else setSel((p) => ({ bracket: p.bracket, outcome: p.outcome, next: "next" }));
  };

  const nameOf = (id: string) =>
    [...S_BRACKETS, ...S_OUTCOMES, ...S_DEPTS].find((n) => n.id === id)?.label ??
    (id === "next" ? "Next Purchase" : "No Next Purchase");
  const crumbs = [sel.bracket, sel.outcome, sel.next].filter(Boolean) as string[];
  // How many customers survive the current path, measured at the last stage picked.
  const reachedNow = sel.next
    ? sel.next === "norep"
      ? selNorep
      : selNext
    : sel.outcome
      ? selOut.reduce((s, v) => s + v, 0)
      : sel.bracket
        ? selBracket.reduce((s, v) => s + v, 0)
        : SANKEY_TOTAL;

  const headers = [
    { x: cols[0], label: "Bracketing Type" },
    { x: cols[1], label: "First Order" },
    { x: cols[2], label: "Next Purchase?" },
    { x: cols[3], label: "Next Dept", right: true },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {S_LEGEND_GROUPS.map((g) => (
          <div key={g.stage} className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[11px] font-semibold text-neutral-700">{g.stage}</span>
            {g.items.map((it) => (
              <span key={it.label} className="flex items-center gap-1.5 text-[11px] text-neutral-600">
                <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: it.color }} />
                {it.label}
              </span>
            ))}
          </div>
        ))}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-150 bg-neutral-50 px-3 py-2 text-xs">
        <span className="font-semibold text-neutral-700">Path</span>
        <span className="text-neutral-600">All customers</span>
        {crumbs.map((id) => (
          <span key={id} className="flex items-center gap-2 text-neutral-600">
            <span className="text-neutral-400">›</span>
            <span className="rounded-full bg-neutral-0 px-2 py-0.5 font-medium text-neutral-800 ring-1 ring-neutral-150">
              {nameOf(id)}
            </span>
          </span>
        ))}
        <span className="ml-auto flex items-center gap-3">
          <span className="text-neutral-600">
            <span className="font-semibold text-neutral-800">{sFmt(reachedNow)}</span> customers ·{" "}
            <span className="font-semibold text-neutral-800">
              {((reachedNow / SANKEY_TOTAL) * 100).toFixed(1)}%
            </span>{" "}
            of total
          </span>
          {crumbs.length > 0 && (
            <button
              type="button"
              onClick={() => setSel({})}
              className="rounded-md border border-neutral-200 bg-neutral-0 px-2 py-1 font-medium text-neutral-700 hover:bg-neutral-100"
            >
              Reset
            </button>
          )}
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        style={{ display: "block", width: "100%", height: "auto" }}
        role="img"
        aria-label="Behavioral flow Sankey diagram"
        onMouseLeave={() => {
          setHover(null);
          setTip(null);
        }}
      >
        {headers.map((h, i) => (
          <text
            key={i}
            x={h.right ? h.x + colW : h.x}
            y={34}
            textAnchor={h.right ? "end" : "start"}
            fontSize="12"
            fontWeight="600"
            fill="#454545"
          >
            {h.label}
          </text>
        ))}
        {ribbons.map((r, i) => {
          // With a route picked the untouched flows stay drawn, just quiet, so
          // the diagram keeps its shape and the route reads on top of it.
          const op = active
            ? 0.12
            : hover?.kind === "rib"
              ? hover.i === i
                ? 0.65
                : 0.12
              : 0.32;
          return (
            <path
              key={i}
              d={r.path}
              fill={r.l.color}
              fillOpacity={op}
              style={{ cursor: "pointer", transition: "fill-opacity 120ms" }}
              onClick={() => pickPath(r.l.src, r.l.dst)}
              onMouseEnter={() => {
                setHover({ kind: "rib", i });
                setTip({
                  title: `${nodeMap[r.l.src].label} → ${nodeMap[r.l.dst].label}`,
                  cust: active ? r.l.sv : r.l.v,
                  avg: r.l.avgVal,
                });
              }}
            />
          );
        })}
        {active &&
          ribbons.map((r, i) =>
            r.hi ? (
              <path key={`hi${i}`} d={r.hi} fill={r.l.color} fillOpacity={0.85} pointerEvents="none" />
            ) : null,
          )}
        {Object.values(nodeMap).map((n) => {
          const h = Math.max(2, n.y1 - n.y0);
          const left = n.x > W / 2;
          const tx = left ? n.x - 6 : n.x + colW + 6;
          const anchor = left ? "end" : "start";
          const mid = (n.y0 + n.y1) / 2;
          return (
            <g key={n.id}>
              <rect
                x={n.x}
                y={n.y0}
                width={colW}
                height={h}
                rx={3}
                fill={n.c}
                fillOpacity={active ? 0.2 : 1}
                stroke={crumbs.includes(n.id) ? "#212121" : "none"}
                strokeWidth={crumbs.includes(n.id) ? 1.5 : 0}
                pointerEvents="none"
                style={{ transition: "fill-opacity 160ms" }}
              />
              {active && selVal[n.id] > 0 ? (
                <rect
                  x={n.x}
                  y={n.y0}
                  width={colW}
                  height={Math.max(h * (selVal[n.id] / n.v), 2)}
                  rx={3}
                  fill={n.c}
                  pointerEvents="none"
                  style={{ transition: "height 220ms" }}
                />
              ) : null}
              {h > 22 ? (
                <>
                  <text x={tx} y={mid - 2} textAnchor={anchor} fontSize="11" fontWeight="600" fill="#212121" pointerEvents="none">
                    {n.label}
                  </text>
                  <text x={tx} y={mid + 11} textAnchor={anchor} fontSize="10.5" fill="#676767" pointerEvents="none">
                    {active ? `${sFmt(selVal[n.id])} of ${sFmt(n.v)}` : sFmt(n.v)}
                  </text>
                </>
              ) : (
                <text x={tx} y={mid + 3.5} textAnchor={anchor} fontSize="10.5" fontWeight="600" fill="#212121" pointerEvents="none">
                  {n.label} · {active ? `${sFmt(selVal[n.id])} of ${sFmt(n.v)}` : sFmt(n.v)}
                </text>
              )}
              {/* Transparent target covering the bar and its label. The bar alone
                  is ~11 real pixels wide, far too thin to aim at. */}
              <rect
                x={left ? n.x - 150 : n.x - 8}
                y={Math.min(n.y0, mid - 11)}
                width={150 + colW + 8}
                height={Math.max(h, 22)}
                fill="transparent"
                style={{ cursor: stageOf(n.id) === "dept" ? "default" : "pointer" }}
                onClick={() => pick(n.id)}
                onMouseEnter={() => {
                  setHover({ kind: "node", id: n.id });
                  setTip({ title: n.label, cust: active ? selVal[n.id] : n.v, avg: perNodeVal[n.id] });
                }}
              />
            </g>
          );
        })}
      </svg>

      <div className="mt-2 min-h-[42px] text-xs text-neutral-600">
        {tip ? (
          <>
            <span className="font-semibold text-neutral-800">{tip.title}</span>
            <div className="mt-0.5 flex flex-wrap gap-4">
              <span>
                Customers: <span className="text-neutral-800">{sFmt(tip.cust)}</span>
              </span>
              <span>
                Total value: <span className="text-neutral-800">{sMoney(tip.cust * tip.avg)}</span>
              </span>
              <span>
                Avg / customer: <span className="text-neutral-800">{sMoney(tip.avg)}</span>
              </span>
            </div>
          </>
        ) : crumbs.length ? (
          "Every column to the right has been recounted for this path — click a node again to step back out."
        ) : (
          "Hover for customers and value; click any bar, label or flow to drill into that journey."
        )}
      </div>
    </div>
  );
}

function SankeyFlow() {
  return (
    <Card>
      <CardHeading
        title="Behavioral flow"
        subtitle="24,318 customers · rolling 12 months · Sankey view"
      />
      <div className="mt-4">
        <Sankey />
      </div>
    </Card>
  );
}

export default function BehavioralFlowTab() {
  return (
    <>
      <SankeyFlow />
      <JourneyExplorer />
      <AllPaths />
    </>
  );
}
