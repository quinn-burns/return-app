"use client";

import { Card, InfoBanner } from "./parts";

/* ----------------------------- model ----------------------------- */

const COLORS = {
  size: "#4169e1",
  color: "#7c3aed",
  sizeColor: "#0ea5e9",
  noBracket: "#94a3b8",
  returnedAll: "#d13636",
  keptSome: "#f5a623",
  keptAll: "#22a06b",
  nextPurchase: "#0d9488",
  nextDept: "#64748b",
};

type NodeDef = { id: string; label: string; value: number; color: string };

// Column 0 — bracketing type, with split fractions into [returnedAll, keptSome, keptAll]
const BRACKETING: (NodeDef & { split: [number, number, number] })[] = [
  { id: "size", label: "Size", value: 5200, color: COLORS.size, split: [0.18, 0.42, 0.4] },
  { id: "color", label: "Color", value: 4800, color: COLORS.color, split: [0.1, 0.3, 0.6] },
  { id: "sizeColor", label: "Size + Color", value: 2100, color: COLORS.sizeColor, split: [0.22, 0.45, 0.33] },
  { id: "noBracket", label: "No Bracketing", value: 8706, color: COLORS.noBracket, split: [0.2, 0.38, 0.42] },
];

// Column 1 — first-order outcome, split into [nextPurchase, noNextPurchase]
const OUTCOMES: (NodeDef & { split: [number, number] })[] = [
  { id: "returnedAll", label: "Returned All", value: 0, color: COLORS.returnedAll, split: [0.35, 0.65] },
  { id: "keptSome", label: "Kept Some", value: 0, color: COLORS.keptSome, split: [0.7, 0.3] },
  { id: "keptAll", label: "Kept All", value: 0, color: COLORS.keptAll, split: [0.82, 0.18] },
];

// Column 3 — next department, fractions of the "Next Purchase" node
const DEPTS: { id: string; label: string; frac: number }[] = [
  { id: "wDenim", label: "W Denim", frac: 0.3 },
  { id: "wTops", label: "W Tops", frac: 0.24 },
  { id: "accessories", label: "Accessories", frac: 0.18 },
  { id: "mens", label: "Mens", frac: 0.16 },
  { id: "other", label: "Other", frac: 0.12 },
];

const LEGEND = [
  { label: "Size", color: COLORS.size },
  { label: "Color", color: COLORS.color },
  { label: "Size + Color", color: COLORS.sizeColor },
  { label: "No Bracketing", color: COLORS.noBracket },
  { label: "Returned All", color: COLORS.returnedAll },
  { label: "Kept Some", color: COLORS.keptSome },
  { label: "Kept All", color: COLORS.keptAll },
  { label: "Next Purchase", color: COLORS.nextPurchase },
];

/* ------------------------- sankey layout ------------------------- */

type LaidNode = NodeDef & { x: number; y: number; h: number };
type Link = { source: string; target: string; value: number; color: string };

function buildFlow() {
  const H = 300;
  const NODE_W = 14;
  const GAP = 8;
  const X = [16, 250, 470, 660];

  // Derive outcome + downstream values from the split model.
  const outcomeVals: Record<string, number> = { returnedAll: 0, keptSome: 0, keptAll: 0 };
  const links: Link[] = [];
  BRACKETING.forEach((b) => {
    (["returnedAll", "keptSome", "keptAll"] as const).forEach((o, i) => {
      const v = Math.round(b.value * b.split[i]);
      outcomeVals[o] += v;
      links.push({ source: b.id, target: o, value: v, color: b.color });
    });
  });

  let nextPurchaseTotal = 0;
  let noNextTotal = 0;
  OUTCOMES.forEach((o) => {
    const total = outcomeVals[o.id];
    const np = Math.round(total * o.split[0]);
    const nn = total - np;
    nextPurchaseTotal += np;
    noNextTotal += nn;
    links.push({ source: o.id, target: "nextPurchase", value: np, color: o.color });
    links.push({ source: o.id, target: "noNext", value: nn, color: o.color });
  });

  DEPTS.forEach((d) => {
    links.push({
      source: "nextPurchase",
      target: d.id,
      value: Math.round(nextPurchaseTotal * d.frac),
      color: COLORS.nextPurchase,
    });
  });

  // Global value → pixel scale (tallest column is col0/col1 = 20806).
  const colTotals = [20806, 20806, nextPurchaseTotal + noNextTotal];
  const maxTotal = Math.max(...colTotals);
  const S = (H - GAP * 3) / maxTotal;

  const columns: NodeDef[][] = [
    BRACKETING.map(({ id, label, value, color }) => ({ id, label, value, color })),
    OUTCOMES.map((o) => ({ id: o.id, label: o.label, value: outcomeVals[o.id], color: o.color })),
    [
      { id: "nextPurchase", label: "Next Purchase", value: nextPurchaseTotal, color: COLORS.nextPurchase },
      { id: "noNext", label: "No Next Purchase", value: noNextTotal, color: COLORS.noBracket },
    ],
    DEPTS.map((d) => ({
      id: d.id,
      label: d.label,
      value: Math.round(nextPurchaseTotal * d.frac),
      color: COLORS.nextDept,
    })),
  ];

  const nodes: Record<string, LaidNode> = {};
  columns.forEach((col, ci) => {
    let y = 10;
    col.forEach((n) => {
      const h = Math.max(2, n.value * S);
      nodes[n.id] = { ...n, x: X[ci], y, h };
      y += h + GAP;
    });
  });

  // Stack ribbon slots on both ends.
  const sUsed: Record<string, number> = {};
  const tUsed: Record<string, number> = {};
  const ribbons = links.map((l) => {
    const s = nodes[l.source];
    const t = nodes[l.target];
    const h = l.value * S;
    const sy = s.y + (sUsed[l.source] ?? 0);
    const ty = t.y + (tUsed[l.target] ?? 0);
    sUsed[l.source] = (sUsed[l.source] ?? 0) + h;
    tUsed[l.target] = (tUsed[l.target] ?? 0) + h;
    const x1 = s.x + NODE_W;
    const x2 = t.x;
    const mx = (x1 + x2) / 2;
    return {
      key: `${l.source}-${l.target}`,
      color: l.color,
      d: `M${x1},${sy} C${mx},${sy} ${mx},${ty} ${x2},${ty} L${x2},${ty + h} C${mx},${ty + h} ${mx},${sy + h} ${x1},${sy + h} Z`,
    };
  });

  return { nodes: Object.values(nodes), ribbons, NODE_W, H, width: X[3] + NODE_W + 90 };
}

function Sankey() {
  const { nodes, ribbons, NODE_W, H, width } = buildFlow();
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${H + 20}`} className="w-full min-w-[720px]" role="img" aria-label="Customer journey flow">
        {ribbons.map((r) => (
          <path key={r.key} d={r.d} fill={r.color} fillOpacity={0.22} />
        ))}
        {nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={NODE_W} height={n.h} rx={2} fill={n.color} />
            <text
              x={n.x + NODE_W + 4}
              y={n.y + n.h / 2}
              dominantBaseline="middle"
              fontSize="9"
              fill="#454545"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
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
            <tr className="text-neutral-500">
              <th className="py-2 pr-3 font-normal">Bracketing</th>
              <th className="px-3 py-2 font-normal">First Order</th>
              <th className="px-3 py-2 font-normal">Next Purchase?</th>
              <th className="px-3 py-2 font-normal">Next Dept</th>
              <th className="px-3 py-2 text-right font-normal">Customers</th>
              <th className="px-3 py-2 text-right font-normal">Net Value</th>
              <th className="py-2 pl-3 text-right font-normal">Per Cust.</th>
            </tr>
          </thead>
          <tbody>
            {PATHS.map((p, i) => (
              <tr key={i} className="border-t border-primary-50">
                <td className="py-2.5 pr-3 font-medium text-neutral-800">{p.bracketing}</td>
                <td className="px-3 py-2.5 text-neutral-700">{p.firstOrder}</td>
                <td className="px-3 py-2.5 text-neutral-700">{p.nextPurchase}</td>
                <td className="px-3 py-2.5 text-neutral-700">{p.nextDept}</td>
                <td className="px-3 py-2.5 text-right text-neutral-700">{p.customers}</td>
                <td className="px-3 py-2.5 text-right">
                  <ValuePill text={p.netValue} positive={p.positive} />
                </td>
                <td className="py-2.5 pl-3 text-right">
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
      <InfoBanner
        title="Track the full customer journey."
        body="Follow customers from how they bracket, through what they keep, to whether they come back and what they buy next. Hover any flow or node for customers, total value, and average value."
      />
      <Card>
        <div className="flex flex-col gap-1">
          <h2 className="text-base font-semibold text-neutral-800">Behavioral flow</h2>
          <p className="text-xs text-neutral-500">20,806 customers · rolling 12 months</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {["Bracketing Type", "First Order", "Next Purchase?", "Next Dept"].map((s) => (
            <span key={s} className="text-[11px] font-medium text-neutral-500">
              {s}
            </span>
          ))}
        </div>
        <div className="mt-2">
          <Sankey />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
          {LEGEND.map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-neutral-600">
              <span className="size-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-500">
          Hover a flow or node to see customers, total value, and average value.
        </p>
      </Card>
      <AllPaths />
    </>
  );
}
