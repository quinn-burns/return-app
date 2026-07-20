"use client";

import { useState } from "react";
import { Card, CardHeading } from "./parts";

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

/* ----------------------------- sankey ---------------------------- */

const SANKEY_TOTAL = 24318;
const S_BRACKETS: { id: string; label: string; share: number; color: string; out: Record<string, number> }[] = [
  { id: "size", label: "Size", share: 0.22, color: "#4169e1", out: { retall: 0.22, keptsome: 0.3, keptall: 0.48 } },
  { id: "color", label: "Color", share: 0.11, color: "#85a1ff", out: { retall: 0.18, keptsome: 0.27, keptall: 0.55 } },
  { id: "both", label: "Size + Color", share: 0.08, color: "#26398c", out: { retall: 0.25, keptsome: 0.45, keptall: 0.3 } },
  { id: "single", label: "No Bracketing", share: 0.59, color: "#c7d4ff", out: { retall: 0.22, keptsome: 0, keptall: 0.78 } },
];
const S_OUTCOMES = [
  { id: "retall", label: "Returned All", color: "#dc2828", repeat: 0.41, val: -14 },
  { id: "keptsome", label: "Kept Some", color: "#f59f0a", repeat: 0.58, val: 104 },
  { id: "keptall", label: "Kept All", color: "#059467", repeat: 0.74, val: 188 },
];
const S_DEPTS = [
  { id: "denim", label: "W Denim", share: 0.34, color: "#d97706", val: 150 },
  { id: "tops", label: "W Tops", share: 0.28, color: "#f59f0a", val: 96 },
  { id: "acc", label: "Accessories", share: 0.19, color: "#fbbf24", val: 54 },
  { id: "mens", label: "Mens", share: 0.11, color: "#fcd34d", val: 128 },
  { id: "other", label: "Other", share: 0.08, color: "#fde68a", val: 72 },
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

const S_LEGEND = [
  { label: "Size", color: "#4169e1" },
  { label: "Color", color: "#85a1ff" },
  { label: "Size + Color", color: "#26398c" },
  { label: "No Bracketing", color: "#c7d4ff" },
  { label: "Returned All", color: "#dc2828", divider: true },
  { label: "Kept Some", color: "#f59f0a" },
  { label: "Kept All", color: "#059467" },
  { label: "Next Purchase", color: "#4169e1", divider: true },
  { label: "Next Dept", color: "#f59f0a" },
];

function Sankey() {
  const [hover, setHover] = useState<{ kind: "rib"; i: number } | { kind: "node"; id: string } | null>(
    null,
  );
  const [tip, setTip] = useState<Tip | null>(null);

  const W = 1240;
  const H = 470;
  const colW = 16;
  const cols = [60, 430, 800, 1160];
  const top = 50;
  const scale = (H - top - 14 - 5 * 6) / SANKEY_TOTAL;

  const bracketN = S_BRACKETS.map((b) => b.share * SANKEY_TOTAL);
  const outTot = S_OUTCOMES.map((o) =>
    S_BRACKETS.reduce((s, b, bi) => s + bracketN[bi] * b.out[o.id], 0),
  );
  const repeatN = S_OUTCOMES.reduce((s, o, oi) => s + outTot[oi] * o.repeat, 0);
  const norepN = SANKEY_TOTAL - repeatN;
  const avgFirst = S_OUTCOMES.reduce((s, o, oi) => s + outTot[oi] * o.val, 0) / SANKEY_TOTAL;
  const avgDept = S_DEPTS.reduce((s, d) => s + d.share * d.val, 0);

  const stack = (items: { id: string; label: string; c: string; v: number }[], x: number): SN[] => {
    let y = top;
    return items.map((it) => {
      const node = { ...it, x, y0: y, y1: y + it.v * scale };
      y += it.v * scale + 6;
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
      { id: "next", label: "Next Purchase", c: "#4169e1", v: repeatN },
      { id: "norep", label: "No Next Purchase", c: "#c7d4ff", v: norepN },
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

  type L = { src: string; dst: string; v: number; color: string; avgVal: number };
  const links: L[] = [];
  S_BRACKETS.forEach((b, bi) =>
    S_OUTCOMES.forEach((o) => {
      const v = bracketN[bi] * b.out[o.id];
      if (v >= 1) links.push({ src: b.id, dst: o.id, v, color: o.color, avgVal: o.val + o.repeat * avgDept });
    }),
  );
  S_OUTCOMES.forEach((o, oi) => {
    const tt = outTot[oi];
    links.push({ src: o.id, dst: "next", v: tt * o.repeat, color: "#4169e1", avgVal: o.val + avgDept });
    links.push({ src: o.id, dst: "norep", v: tt * (1 - o.repeat), color: "#c7d4ff", avgVal: o.val });
  });
  S_DEPTS.forEach((d) =>
    links.push({ src: "next", dst: d.id, v: repeatN * d.share, color: d.color, avgVal: avgFirst + d.val }),
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
    return {
      path: `M${x1},${sy0} C${mx},${sy0} ${mx},${dy0} ${x2},${dy0} L${x2},${dy1} C${mx},${dy1} ${mx},${sy1} ${x1},${sy1} Z`,
      l,
    };
  });

  const headers = [
    { x: cols[0], label: "Bracketing Type" },
    { x: cols[1], label: "First Order" },
    { x: cols[2], label: "Next Purchase?" },
    { x: cols[3], label: "Next Dept", right: true },
  ];

  return (
    <div>
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
          const op = hover?.kind === "rib" ? (hover.i === i ? 0.6 : 0.1) : 0.32;
          return (
            <path
              key={i}
              d={r.path}
              fill={r.l.color}
              fillOpacity={op}
              style={{ cursor: "pointer", transition: "fill-opacity 120ms" }}
              onMouseEnter={() => {
                setHover({ kind: "rib", i });
                setTip({
                  title: `${nodeMap[r.l.src].label} → ${nodeMap[r.l.dst].label}`,
                  cust: r.l.v,
                  avg: r.l.avgVal,
                });
              }}
            />
          );
        })}
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
                style={{ cursor: "pointer" }}
                onMouseEnter={() => {
                  setHover({ kind: "node", id: n.id });
                  setTip({ title: n.label, cust: n.v, avg: perNodeVal[n.id] });
                }}
              />
              {h > 22 ? (
                <>
                  <text x={tx} y={mid - 2} textAnchor={anchor} fontSize="11" fontWeight="600" fill="#212121" pointerEvents="none">
                    {n.label}
                  </text>
                  <text x={tx} y={mid + 11} textAnchor={anchor} fontSize="10.5" fill="#676767" pointerEvents="none">
                    {sFmt(n.v)}
                  </text>
                </>
              ) : (
                <text x={tx} y={mid + 3.5} textAnchor={anchor} fontSize="10.5" fontWeight="600" fill="#212121" pointerEvents="none">
                  {n.label} · {sFmt(n.v)}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {S_LEGEND.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-neutral-600">
            {l.divider && <span className="mr-1 text-neutral-300">|</span>}
            <span className="size-2.5 rounded-[3px]" style={{ backgroundColor: l.color }} />
            {l.label}
          </span>
        ))}
      </div>

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
        ) : (
          "Hover a flow or node to see customers, total value, and average value."
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
