"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardHeading, ExportButton, KpiStrip } from "./parts";
import { ExportToastProvider, useExportToast } from "./ExportToast";

/* ----------------------------- data ----------------------------- */

type Customer = {
  id: string;
  revenue: string;
  returnRevenue: string;
  depts: string;
  items: string;
};

type Segment = {
  name: string;
  thresholds: string;
  summary: { label: string; value: string }[];
  customers: Customer[];
};

const SEGMENTS: Segment[] = [
  {
    name: "Unprofitable Customers",
    thresholds: "Lifetime return rate > 60% and ≥ 5 returns",
    summary: [
      { label: "Revenue", value: "$5.6M" },
      { label: "Return Revenue", value: "$1.5M" },
      { label: "Net Revenue", value: "$4.1M" },
      { label: "Items Returned", value: "17.9K" },
      { label: "Return Rate ($)", value: "48.0%" },
      { label: "Customer Count", value: "836" },
    ],
    customers: [
      { id: "C-658582", revenue: "$5,043", returnRevenue: "$2,866", depts: "F Outerwear (9) · M Knits (7) · F Knits (4)", items: "Chino Pant (6) · Wide-Leg Trouser (8) · Cable Knit Sweater (9)" },
      { id: "C-377746", revenue: "$5,556", returnRevenue: "$2,416", depts: "M Knits (7) · F Sweaters (7) · M Wovens (6)", items: "Henley Tee (2) · Puffer Jacket (1)" },
      { id: "C-407757", revenue: "$4,797", returnRevenue: "$2,314", depts: "M Wovens (5) · F Swim (9)", items: "Henley Tee (5) · Slim Crop Jean (9)" },
      { id: "C-267753", revenue: "$5,278", returnRevenue: "$2,152", depts: "F Jeans (8) · F Shorts (9) · M Pants (5)", items: "Poplin Shirt (6) · Slim Crop Jean (4)" },
    ],
  },
  {
    name: "High Return Rate Customers",
    thresholds: "Return rate > 45% and ≥ 3 returns (thresholds configurable on the backend)",
    summary: [
      { label: "Revenue", value: "$10.0M" },
      { label: "Return Revenue", value: "$4.1M" },
      { label: "Net Revenue", value: "$5.9M" },
      { label: "Items Returned", value: "48.5K" },
      { label: "Return Rate ($)", value: "33.4%" },
      { label: "Customer Count", value: "2,503" },
    ],
    customers: [
      { id: "C-274389", revenue: "$5,617", returnRevenue: "$2,201", depts: "M Pants (1) · F Shorts (3)", items: "Tiered Midi Dress (8) · Linen Short (5) · Cable Knit Sweater (7)" },
      { id: "C-921414", revenue: "$4,422", returnRevenue: "$2,119", depts: "F Knits (4) · F Pants (1) · F Sweaters (9)", items: "Chino Pant (1) · Quarter-Zip Fleece (1)" },
      { id: "C-698782", revenue: "$3,604", returnRevenue: "$2,114", depts: "M Jeans (2) · F Shorts (2) · F Pants (7)", items: "Linen Short (1) · Chino Pant (2) · Puffer Jacket (1)" },
    ],
  },
  {
    name: "Likely Resellers",
    thresholds: "≥ 4 styles purchased with > 3 units each of the same style ID",
    summary: [
      { label: "Revenue", value: "$2.7M" },
      { label: "Return Revenue", value: "$743K" },
      { label: "Net Revenue", value: "$1.9M" },
      { label: "Items Returned", value: "8.7K" },
      { label: "Return Rate ($)", value: "59.7%" },
      { label: "Customer Count", value: "1,947" },
    ],
    customers: [
      { id: "C-548462", revenue: "$4,654", returnRevenue: "$4,209", depts: "F Swim (3) · M Wovens (9)", items: "Quarter-Zip Fleece (9) · Pleated Skirt (3)" },
      { id: "C-804318", revenue: "$2,041", returnRevenue: "$2,041", depts: "F Swim (1) · M Jeans (8) · F Jeans (2)", items: "Henley Tee (9) · Wide-Leg Trouser (5)" },
      { id: "C-320861", revenue: "$1,608", returnRevenue: "$1,608", depts: "F Wovens (8) · M Pants (5) · F Sweaters (1)", items: "Linen Short (6) · Cable Knit Sweater (3) · Tiered Midi Dress (5)" },
    ],
  },
  {
    name: "New customers: returns with no repurchase",
    thresholds: "Returned all/part of first order, no additional order after 90 days",
    summary: [
      { label: "Revenue", value: "$13.2M" },
      { label: "Return Revenue", value: "$4.3M" },
      { label: "Net Revenue", value: "$8.8M" },
      { label: "Items Returned", value: "51.0K" },
      { label: "Return Rate ($)", value: "34.5%" },
      { label: "Customer Count", value: "1,574" },
    ],
    customers: [
      { id: "C-802448", revenue: "$4,868", returnRevenue: "$4,037", depts: "F Sweaters (2) · F Knits (7)", items: "Puffer Jacket (4) · Wide-Leg Trouser (8)" },
      { id: "C-373903", revenue: "$5,684", returnRevenue: "$3,602", depts: "F Jeans (7) · F Skirts (6)", items: "Quarter-Zip Fleece (2) · Linen Short (7) · Pleated Skirt (4)" },
      { id: "C-338651", revenue: "$2,618", returnRevenue: "$2,618", depts: "F Shorts (5) · M Fleece (2)", items: "Quarter-Zip Fleece (7) · Poplin Shirt (9) · Henley Tee (6)" },
    ],
  },
  {
    name: "Existing customers: returns with no repurchase",
    thresholds: "Returned all/part of most recent order, no additional order after 90 days",
    summary: [
      { label: "Revenue", value: "$4.4M" },
      { label: "Return Revenue", value: "$1.3M" },
      { label: "Net Revenue", value: "$3.2M" },
      { label: "Items Returned", value: "14.7K" },
      { label: "Return Rate ($)", value: "33.2%" },
      { label: "Customer Count", value: "690" },
    ],
    customers: [
      { id: "C-390782", revenue: "$4,709", returnRevenue: "$3,643", depts: "F Wovens (8) · F Pants (2) · F Sweaters (5)", items: "Cable Knit Sweater (6) · Quarter-Zip Fleece (9)" },
      { id: "C-577538", revenue: "$3,979", returnRevenue: "$3,561", depts: "F Pants (8) · M Wovens (7) · M Pants (4)", items: "Chino Pant (4) · Tiered Midi Dress (3) · Slim Crop Jean (9)" },
      { id: "C-932291", revenue: "$4,313", returnRevenue: "$3,266", depts: "F Knits (9) · F Wovens (6) · F Jeans (2)", items: "Cable Knit Sweater (1) · Wide-Leg Trouser (1) · Poplin Shirt (4)" },
    ],
  },
  {
    name: "Same SKU Repurchase",
    thresholds: "Returned and then repurchased the same SKU",
    summary: [
      { label: "Revenue", value: "$2.4M" },
      { label: "Return Revenue", value: "$637K" },
      { label: "Net Revenue", value: "$1.8M" },
      { label: "Items Returned", value: "7.5K" },
      { label: "Return Rate ($)", value: "51.0%" },
      { label: "Customer Count", value: "789" },
    ],
    customers: [
      { id: "C-309044", revenue: "$4,722", returnRevenue: "$2,215", depts: "F Pants (8) · F Knits (2)", items: "Wide-Leg Trouser (3) · Puffer Jacket (2) · Cable Knit Sweater (3)" },
      { id: "C-938722", revenue: "$3,599", returnRevenue: "$2,070", depts: "F Pants (8) · F Sweaters (1) · F Shorts (7)", items: "Poplin Shirt (3) · Chino Pant (8) · Linen Short (3)" },
      { id: "C-513160", revenue: "$5,900", returnRevenue: "$1,935", depts: "F Jeans (7) · F Wovens (3)", items: "Ribbed Tank (7) · Tiered Midi Dress (6) · Cable Knit Sweater (4)" },
    ],
  },
  {
    name: "Returns Due to Quality Issue",
    thresholds: "≥ 2 returns flagged with reason: damaged / defective / quality (reason codes configurable on the backend)",
    summary: [
      { label: "Revenue", value: "$3.2M" },
      { label: "Return Revenue", value: "$890K" },
      { label: "Net Revenue", value: "$2.3M" },
      { label: "Items Returned", value: "10.5K" },
      { label: "Return Rate ($)", value: "29.5%" },
      { label: "Customer Count", value: "512" },
    ],
    customers: [
      { id: "C-771204", revenue: "$4,200", returnRevenue: "$1,650", depts: "F Dresses (3) · F Knits (2)", items: "Tiered Midi Dress (3) · Poplin Shirt (2)" },
      { id: "C-660238", revenue: "$3,850", returnRevenue: "$1,420", depts: "M Wovens (4) · F Swim (2)", items: "Poplin Shirt (4) · Linen Short (2)" },
      { id: "C-559871", revenue: "$2,980", returnRevenue: "$1,180", depts: "F Outerwear (2) · F Sweaters (3)", items: "Puffer Jacket (2) · Cable Knit Sweater (3)" },
    ],
  },
];

const TIERS = ["All Tiers", "Platinum", "Gold", "Silver", "Member", "Non-member"];
const DEFAULT_SELECTED = ["Unprofitable Customers", "High Return Rate Customers", "Likely Resellers"];

/* --------------------------- primitives -------------------------- */

function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="#8a8a8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SegmentSelect({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (name: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 min-w-[190px] items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-0 px-3 text-sm text-neutral-800 hover:bg-neutral-50"
      >
        {selected.length} of {SEGMENTS.length} segments shown
        <Chevron />
      </button>
      {open ? (
        <div className="absolute left-0 top-11 z-20 w-[320px] rounded-lg border border-neutral-200 bg-white p-1 shadow-lg">
          {SEGMENTS.map((s) => {
            const on = selected.includes(s.name);
            return (
              <button
                key={s.name}
                type="button"
                onClick={() => onToggle(s.name)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50"
              >
                <span
                  className={`flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border ${
                    on ? "border-primary-600 bg-primary-600" : "border-neutral-400 bg-white"
                  }`}
                >
                  {on ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                      <path d="M2.5 6.2l2.3 2.3L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : null}
                </span>
                {s.name}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function TierSelect() {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState(TIERS[0]);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 min-w-[150px] items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-0 px-3 text-sm text-neutral-800 hover:bg-neutral-50"
      >
        {tier}
        <Chevron />
      </button>
      {open ? (
        <div className="absolute left-0 top-11 z-20 w-[180px] rounded-lg border border-neutral-200 bg-white p-1 shadow-lg">
          {TIERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTier(t);
                setOpen(false);
              }}
              className={`flex w-full rounded-md px-2 py-2 text-left text-sm hover:bg-neutral-50 ${
                t === tier ? "font-medium text-primary-600" : "text-neutral-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function parseMoney(v: string): number {
  const s = v.replace(/[$,]/g, "");
  const n = parseFloat(s) || 0;
  if (s.includes("M")) return n * 1e6;
  if (s.includes("K")) return n * 1e3;
  return n;
}

function summaryVal(seg: Segment, label: string): string {
  return seg.summary.find((x) => x.label === label)?.value ?? "";
}

function SegmentImpact({ segments }: { segments: Segment[] }) {
  const rows = segments
    .map((s) => ({
      name: s.name,
      revenue: summaryVal(s, "Return Revenue"),
      value: parseMoney(summaryVal(s, "Return Revenue")),
      customers: summaryVal(s, "Customer Count"),
      rate: summaryVal(s, "Return Rate ($)"),
    }))
    .sort((a, b) => b.value - a.value);
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <Card>
      <CardHeading
        title="Return revenue at risk by segment"
        subtitle="Selected segments ranked by the return revenue they represent."
      />
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className="w-52 shrink-0 truncate text-sm font-medium text-neutral-800">
              {r.name}
            </span>
            <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
              <div
                data-anim-bar
                className="h-5 rounded-[4px] bg-warning-500"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
            <span className="w-52 shrink-0 text-right text-xs text-neutral-600">
              <span className="font-semibold text-neutral-800">{r.revenue}</span> · {r.customers}{" "}
              cust · {r.rate} rate
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SegmentSection({ segment }: { segment: Segment }) {
  const showToast = useExportToast();
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-bold text-neutral-800">{segment.name}</h2>
          <p className="text-xs text-neutral-600">{segment.thresholds}</p>
        </div>
        <ExportButton onClick={showToast} />
      </div>
      <div className="mt-3">
        <KpiStrip items={segment.summary} cols={6} />
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Customer ID</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Revenue</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Return Revenue</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">Units Returned by Department</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">Units Returned by Item</th>
            </tr>
          </thead>
          <tbody>
            {segment.customers.map((c) => (
              <tr key={c.id} className="border-b border-primary-50 align-top last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-3 font-medium text-neutral-800">{c.id}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{c.revenue}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-warning-600">
                  {c.returnRevenue}
                </td>
                <td className="px-3 py-3 text-neutral-600">{c.depts}</td>
                <td className="px-3 py-3 text-neutral-600">{c.items}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ----------------------------- tab ------------------------------- */

export default function SegmentsTab() {
  const [selected, setSelected] = useState<string[]>(DEFAULT_SELECTED);
  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  const shown = SEGMENTS.filter((s) => selected.includes(s.name));
  return (
    <ExportToastProvider>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Segments
          <SegmentSelect selected={selected} onToggle={toggle} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-600">
          Loyalty Tier
          <TierSelect />
        </label>
      </div>
      {shown.length === 0 ? (
        <Card className="flex min-h-[160px] items-center justify-center text-sm text-neutral-600">
          Select at least one segment to display.
        </Card>
      ) : (
        <>
          {shown.length > 1 ? <SegmentImpact segments={shown} /> : null}
          {shown.map((s) => (
            <SegmentSection key={s.name} segment={s} />
          ))}
        </>
      )}
    </ExportToastProvider>
  );
}
