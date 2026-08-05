"use client";

import { useState } from "react";
import { Card, CardHeading, ExportButton, KpiStrip, Pagination, RecommendedActions, usePaged, type RecItem } from "./parts";
import { seeded } from "./filler";
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
    name: "At-Risk",
    thresholds: "Latest order shows a churn marker — a return with no exchange, a bracket returned in full, or a 50%+ lifetime return rate on 4+ items",
    summary: [
      { label: "Revenue", value: "$8.9M" },
      { label: "Return Revenue", value: "$2.4M" },
      { label: "Net Revenue", value: "$6.5M" },
      { label: "Items Returned", value: "22.4K" },
      { label: "Return Rate ($)", value: "27.0%" },
      { label: "Customer Count", value: "3,120" },
    ],
    customers: [
      { id: "C-611904", revenue: "$4,930", returnRevenue: "$1,780", depts: "F Knits (5) · M Wovens (3)", items: "Chino Pant (4) · Puffer Jacket (2)" },
      { id: "C-448120", revenue: "$3,712", returnRevenue: "$1,402", depts: "F Jeans (6) · F Shorts (2)", items: "Slim Crop Jean (5) · Linen Short (3)" },
      { id: "C-729335", revenue: "$5,104", returnRevenue: "$1,905", depts: "M Pants (4) · F Sweaters (6)", items: "Cable Knit Sweater (4) · Henley Tee (2)" },
    ],
  },
  {
    name: "High-Returning",
    thresholds: "Over 45% of units returned in the window, with 3+ units returned (thresholds configurable on the backend)",
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
    name: "High-Potential",
    thresholds: "New customer who kept their whole first order, with 2+ items, 2+ categories, or a $500+ order",
    summary: [
      { label: "Revenue", value: "$12.5M" },
      { label: "Return Revenue", value: "$410K" },
      { label: "Net Revenue", value: "$12.1M" },
      { label: "Items Returned", value: "3.2K" },
      { label: "Return Rate ($)", value: "3.3%" },
      { label: "Customer Count", value: "4,180" },
    ],
    customers: [
      { id: "C-118273", revenue: "$6,140", returnRevenue: "$190", depts: "M Wovens (1) · F Jeans (1)", items: "Poplin Shirt (1) · Slim Crop Jean (1)" },
      { id: "C-905612", revenue: "$5,880", returnRevenue: "$120", depts: "F Sweaters (1)", items: "Cable Knit Sweater (1)" },
      { id: "C-334907", revenue: "$7,260", returnRevenue: "$240", depts: "F Outerwear (1) · F Knits (1)", items: "Puffer Jacket (1) · Henley Tee (1)" },
    ],
  },
  {
    name: "Unprofitable",
    thresholds: "Lifetime return rate over 60% with 5+ returns",
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
    name: "Likely Resellers",
    thresholds: "4+ styles bought with more than 3 units each of the same style (lifetime)",
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
    name: "New · return, no repurchase",
    thresholds: "First order returned in whole or part, with no order since",
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
    name: "Existing · return, no repurchase",
    thresholds: "Most recent order returned in whole or part, with no order since",
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
    thresholds: "Returned an item, then re-bought the exact same SKU",
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
  // Full segment list from the wireframe: a quality cohort plus one cohort per
  // return reason. Numbers preserve the wireframe's rank order, scaled to this
  // demo. Customer rows are generated (see padCustomers).
  {
    name: "Quality Issue",
    thresholds: "Two or more units returned as damaged or defective",
    summary: [
      { label: "Revenue", value: "$1.4M" },
      { label: "Return Revenue", value: "$360K" },
      { label: "Net Revenue", value: "$1.0M" },
      { label: "Items Returned", value: "2.0K" },
      { label: "Return Rate ($)", value: "25.7%" },
      { label: "Customer Count", value: "470" },
    ],
    customers: [],
  },
  {
    name: "Reason · Too Large",
    thresholds: "At least one return with the reason “too large”",
    summary: [
      { label: "Revenue", value: "$6.2M" },
      { label: "Return Revenue", value: "$2.9M" },
      { label: "Net Revenue", value: "$3.3M" },
      { label: "Items Returned", value: "18.5K" },
      { label: "Return Rate ($)", value: "46.8%" },
      { label: "Customer Count", value: "2,840" },
    ],
    customers: [],
  },
  {
    name: "Reason · Too Small",
    thresholds: "At least one return with the reason “too small”",
    summary: [
      { label: "Revenue", value: "$5.4M" },
      { label: "Return Revenue", value: "$2.6M" },
      { label: "Net Revenue", value: "$2.8M" },
      { label: "Items Returned", value: "16.2K" },
      { label: "Return Rate ($)", value: "48.1%" },
      { label: "Customer Count", value: "2,510" },
    ],
    customers: [],
  },
  {
    name: "Reason · Multi-Size, Kept One",
    thresholds: "At least one return with a bracketing reason (bought several sizes, kept one)",
    summary: [
      { label: "Revenue", value: "$3.1M" },
      { label: "Return Revenue", value: "$1.5M" },
      { label: "Net Revenue", value: "$1.6M" },
      { label: "Items Returned", value: "12.1K" },
      { label: "Return Rate ($)", value: "48.4%" },
      { label: "Customer Count", value: "1,930" },
    ],
    customers: [],
  },
  {
    name: "Reason · Wrong Item Ordered",
    thresholds: "At least one return for ordering the wrong item",
    summary: [
      { label: "Revenue", value: "$1.9M" },
      { label: "Return Revenue", value: "$980K" },
      { label: "Net Revenue", value: "$920K" },
      { label: "Items Returned", value: "6.4K" },
      { label: "Return Rate ($)", value: "51.6%" },
      { label: "Customer Count", value: "1,140" },
    ],
    customers: [],
  },
  {
    name: "Reason · Not As Described",
    thresholds: "At least one return for not matching the description",
    summary: [
      { label: "Revenue", value: "$1.4M" },
      { label: "Return Revenue", value: "$760K" },
      { label: "Net Revenue", value: "$640K" },
      { label: "Items Returned", value: "4.9K" },
      { label: "Return Rate ($)", value: "54.3%" },
      { label: "Customer Count", value: "920" },
    ],
    customers: [],
  },
  {
    name: "Reason · Bought Elsewhere",
    thresholds: "At least one return because the item was bought elsewhere",
    summary: [
      { label: "Revenue", value: "$1.5M" },
      { label: "Return Revenue", value: "$690K" },
      { label: "Net Revenue", value: "$810K" },
      { label: "Items Returned", value: "5.1K" },
      { label: "Return Rate ($)", value: "46.0%" },
      { label: "Customer Count", value: "810" },
    ],
    customers: [],
  },
  {
    name: "Reason · Damaged",
    thresholds: "At least one return for a damaged or defective item",
    summary: [
      { label: "Revenue", value: "$520K" },
      { label: "Return Revenue", value: "$290K" },
      { label: "Net Revenue", value: "$230K" },
      { label: "Items Returned", value: "2.4K" },
      { label: "Return Rate ($)", value: "55.8%" },
      { label: "Customer Count", value: "640" },
    ],
    customers: [],
  },
  {
    name: "Reason · Lost Parcel",
    thresholds: "At least one return for a lost parcel",
    summary: [
      { label: "Revenue", value: "$640K" },
      { label: "Return Revenue", value: "$320K" },
      { label: "Net Revenue", value: "$320K" },
      { label: "Items Returned", value: "2.1K" },
      { label: "Return Rate ($)", value: "50.0%" },
      { label: "Customer Count", value: "470" },
    ],
    customers: [],
  },
  {
    name: "Reason · Wrong Item Shipped",
    thresholds: "At least one return for the wrong item being shipped",
    summary: [
      { label: "Revenue", value: "$460K" },
      { label: "Return Revenue", value: "$210K" },
      { label: "Net Revenue", value: "$250K" },
      { label: "Items Returned", value: "1.6K" },
      { label: "Return Rate ($)", value: "45.7%" },
      { label: "Customer Count", value: "380" },
    ],
    customers: [],
  },
  {
    name: "Reason · Arrived Too Late",
    thresholds: "At least one return for arriving too late",
    summary: [
      { label: "Revenue", value: "$410K" },
      { label: "Return Revenue", value: "$180K" },
      { label: "Net Revenue", value: "$230K" },
      { label: "Items Returned", value: "1.3K" },
      { label: "Return Rate ($)", value: "43.9%" },
      { label: "Customer Count", value: "330" },
    ],
    customers: [],
  },
];

/* --------------------------- primitives -------------------------- */

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

/** Stable id fragment for a segment, so the chart can scroll to its row. */
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function SegmentImpact({ segments, onSelect }: { segments: Segment[]; onSelect: (name: string) => void }) {
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
    <Card id="segments-impact">
      <CardHeading
        title="Return revenue at risk by segment"
        subtitle="Every segment ranked by the return revenue it represents — click one to open its customers below."
      />
      <p className="mt-2 flex items-center gap-1.5 text-xs text-neutral-500">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
          <circle cx="12" cy="12" r="9" stroke="#8a8a8a" strokeWidth="1.6" />
          <path d="M12 11v5M12 8h.01" stroke="#8a8a8a" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        Segments overlap — a customer can appear in more than one.
      </p>
      <div className="mt-4 flex flex-col gap-1">
        {rows.map((r) => (
          <button
            key={r.name}
            type="button"
            onClick={() => onSelect(r.name)}
            className="group flex items-center gap-3 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-neutral-50"
          >
            <span className="flex w-52 shrink-0 items-center gap-1 truncate text-sm font-medium text-neutral-800 group-hover:text-primary-700">
              {r.name}
            </span>
            <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
              <div
                data-anim-bar
                className="h-5 rounded-[4px] bg-primary-600 transition-colors group-hover:bg-primary-700"
                style={{ width: `${(r.value / max) * 100}%` }}
              />
            </div>
            <span className="w-52 shrink-0 text-right text-xs text-neutral-600">
              <span className="font-semibold text-neutral-800">{r.revenue}</span> · {r.customers}{" "}
              cust · {r.rate} rate
            </span>
          </button>
        ))}
      </div>
    </Card>
  );
}

/** Which customer field a column sorts on, and how to read its value. */
type ColKey = "id" | "revenue" | "returnRevenue";
const SORT_VAL: Record<ColKey, (c: Customer) => number | string> = {
  id: (c) => c.id,
  revenue: (c) => parseMoney(c.revenue),
  returnRevenue: (c) => parseMoney(c.returnRevenue),
};

function SortHeader({
  label,
  col,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  col: ColKey;
  sort: { key: ColKey; dir: "asc" | "desc" } | null;
  onSort: (col: ColKey) => void;
  align?: "left" | "right";
}) {
  const active = sort?.key === col;
  return (
    <th className={`whitespace-nowrap px-3 py-2 font-normal ${align === "right" ? "text-right" : ""}`}>
      <button
        type="button"
        onClick={() => onSort(col)}
        className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""} ${
          active ? "font-semibold text-neutral-800" : "text-neutral-600 hover:text-neutral-800"
        }`}
      >
        {label}
        <span className={`text-[9px] leading-none ${active ? "text-primary-600" : "text-neutral-300"}`}>
          {active ? (sort!.dir === "asc" ? "▲" : "▼") : "▼"}
        </span>
      </button>
    </th>
  );
}

/** One accordion row: a compact always-visible summary line, expanding to the
    segment's KPI boxes and its sortable customer table. */
function AccordionRow({
  segment,
  open,
  onToggle,
}: {
  segment: Segment;
  open: boolean;
  onToggle: () => void;
}) {
  const showToast = useExportToast();
  const [sort, setSort] = useState<{ key: ColKey; dir: "asc" | "desc" } | null>(null);

  const rows = padCustomers(segment);
  const sorted = sort
    ? [...rows].sort((a, b) => {
        const av = SORT_VAL[sort.key](a);
        const bv = SORT_VAL[sort.key](b);
        const cmp =
          typeof av === "string" && typeof bv === "string"
            ? av.localeCompare(bv)
            : (av as number) - (bv as number);
        return sort.dir === "asc" ? cmp : -cmp;
      })
    : rows;

  const { slice, page, setPage, total, pageSize } = usePaged(sorted, 5);
  // A money column reads most useful highest-first; the ID column lowest-first.
  const onSort = (key: ColKey) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: key === "id" ? "asc" : "desc" },
    );
    setPage(0);
  };

  return (
    <div id={`seg-${slugify(segment.name)}`} className="scroll-mt-6 border-b border-neutral-200 last:border-b-0">
      <div className="flex items-center justify-between gap-3 py-3">
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          className="group flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={`shrink-0 text-neutral-400 transition-transform group-hover:text-primary-600 ${open ? "" : "-rotate-90"}`}
          >
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700">
              {segment.name}
            </span>
            <span className="text-xs text-neutral-600">
              <span className="font-semibold text-neutral-800">{summaryVal(segment, "Return Revenue")}</span>{" "}
              return rev · {summaryVal(segment, "Customer Count")} customers ·{" "}
              {summaryVal(segment, "Return Rate ($)")} rate
            </span>
          </span>
        </button>
        <ExportButton onClick={showToast} icon />
      </div>
      {open ? (
        <div className="pb-4">
          <p className="mb-3 text-xs text-neutral-600">{segment.thresholds}</p>
          <KpiStrip items={segment.summary} cols={6} />
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-neutral-200 text-[11px] [text-wrap:balance]">
                  <SortHeader label="Customer ID" col="id" sort={sort} onSort={onSort} />
                  <SortHeader label="Revenue" col="revenue" sort={sort} onSort={onSort} align="right" />
                  <SortHeader label="Return Revenue" col="returnRevenue" sort={sort} onSort={onSort} align="right" />
                  <th className="whitespace-nowrap px-3 py-2 font-normal text-neutral-600">Units Returned by Department</th>
                  <th className="whitespace-nowrap px-3 py-2 font-normal text-neutral-600">Units Returned by Item</th>
                </tr>
              </thead>
              <tbody>
                {slice.map((c) => (
                  <tr key={c.id} className="border-b border-primary-50 align-top last:border-b-0">
                    <td className="whitespace-nowrap py-3 pr-3 font-medium text-neutral-800">{c.id}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{c.revenue}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right font-medium text-primary-600">
                      {c.returnRevenue}
                    </td>
                    <td className="px-3 py-3 text-neutral-600">{c.depts}</td>
                    <td className="px-3 py-3 text-neutral-600">{c.items}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
        </div>
      ) : null}
    </div>
  );
}

/** All segments as a single accordion card — compact rows that expand one at a
    time, paginated so the full list stays scannable. */
function SegmentDetail({
  segments,
  openName,
  onToggle,
  page,
  pageSize,
  onPage,
}: {
  segments: Segment[];
  openName: string | null;
  onToggle: (name: string) => void;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  const slice = segments.slice(page * pageSize, page * pageSize + pageSize);
  return (
    <Card>
      <CardHeading
        title="Segment detail"
        subtitle="Open a segment to see its customers — sort any column by clicking its header."
      />
      <div className="mt-1">
        {slice.map((s) => (
          <AccordionRow
            key={s.name}
            segment={s}
            open={openName === s.name}
            onToggle={() => onToggle(s.name)}
          />
        ))}
      </div>
      <Pagination page={page} pageSize={pageSize} total={segments.length} onChange={onPage} />
    </Card>
  );
}

/** Pad each segment's customer list so pagination has real pages. */
function padCustomers(seg: Segment): Customer[] {
  const out = [...seg.customers];
  const depts = ["F Outerwear", "M Knits", "F Knits", "F Sweaters", "M Wovens", "F Swim", "M Pants", "F Skirts"];
  const items = ["Chino Pant", "Henley Tee", "Puffer Jacket", "Slim Crop Jean", "Cable Knit Sweater", "Linen Short"];
  let i = 0;
  while (out.length < 22) {
    const id = `C-${100000 + Math.round(seeded(seg.name + i, 31, 100000, 899999))}`;
    i += 1;
    if (out.some((c) => c.id === id)) continue;
    const d = (n: number) => depts[Math.round(seeded(id, n, 0, depts.length - 1))];
    const it = (n: number) => items[Math.round(seeded(id, n, 0, items.length - 1))];
    out.push({
      id,
      revenue: `$${Math.round(seeded(id, 41, 900, 6200)).toLocaleString()}`,
      returnRevenue: `$${Math.round(seeded(id, 42, 300, 3100)).toLocaleString()}`,
      depts: `${d(43)} (${Math.round(seeded(id, 44, 2, 9))}) \u00b7 ${d(45)} (${Math.round(seeded(id, 46, 2, 9))})`,
      items: `${it(47)} (${Math.round(seeded(id, 48, 1, 9))}) \u00b7 ${it(49)} (${Math.round(seeded(id, 50, 1, 9))})`,
    });
  }
  return out;
}

/* ----------------------------- tab ------------------------------- */

const SEG_RECS: RecItem[] = [
  { label: "Stop promoting to unprofitable customers", tone: "bad", impact: "$1.5M at risk", context: "Segments", department: "Unprofitable Customers", why: "836 customers return 48% of what they buy — acquisition spend here funds its own returns." },
  { label: "Review likely resellers", tone: "warn", impact: "$743K at risk", context: "Segments", department: "Likely Resellers", why: "1,947 accounts at a 59.7% return rate, the highest of any segment you track." },
  { label: "Win back new, no-repurchase customers", tone: "good", impact: "$4.3M", context: "Segments", department: "New customers", why: "1,574 new customers returned once and never came back — a targeted win-back list before the value is lost." },
];

const SEG_PAGE_SIZE = 8;

export default function SegmentsTab() {
  // One segment open at a time keeps the accordion compact.
  const [openName, setOpenName] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const toggle = (name: string) => setOpenName((prev) => (prev === name ? null : name));
  // Clicking a bar in the chart flips to the segment's page, opens it, and
  // scrolls its row into view.
  const jump = (name: string) => {
    const idx = SEGMENTS.findIndex((s) => s.name === name);
    if (idx >= 0) setPage(Math.floor(idx / SEG_PAGE_SIZE));
    setOpenName(name);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      document
        .getElementById(`seg-${slugify(name)}`)
        ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 80);
  };
  return (
    <ExportToastProvider>
      {/* Big picture first: every segment ranked, each a jump into its detail. */}
      <SegmentImpact segments={SEGMENTS} onSelect={jump} />
      <RecommendedActions context="Segments" items={SEG_RECS} />
      {/* Drill-down: every segment in one accordion, paginated 8 at a time. */}
      <SegmentDetail
        segments={SEGMENTS}
        openName={openName}
        onToggle={toggle}
        page={page}
        pageSize={SEG_PAGE_SIZE}
        onPage={setPage}
      />
    </ExportToastProvider>
  );
}
