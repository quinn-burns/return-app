"use client";

import { useState } from "react";
import { FilterButton, FilterDropdown, IconButton } from "../overview/Buttons";
import CreateActionModal from "../actions/CreateActionModal";
import DriverDetail from "./DriverDetail";

/* ----------------------------- data ----------------------------- */

const SUMMARY = [
  { label: "Revenue Opportunity", value: "$125.4k", tint: "bg-success-50" },
  { label: "Operational Savings", value: "$18.2k", tint: "bg-magenta-50" },
  { label: "Customer Impact", value: "4.4k", tint: "bg-info-50" },
  { label: "Return On Investment", value: "$73.4k", tint: "bg-amber-50" },
];

const FILTERS = [
  "All Brands",
  "All Regions",
  "All Channels",
  "All Departments",
  "Rolling 12 Months",
];

const TABS = [
  { label: "Assortment", count: "$1.1M" },
  { label: "Customer Experience", count: "$512k" },
  { label: "Operations", count: "$190k" },
  { label: "Best Performers", count: "$174k" },
  { label: "Size & Fit", count: "$884k" },
  { label: "Product Design", count: "$51k" },
  { label: "All", count: "$1.5M" },
];
const ACTIVE_TAB = "All";

const CARD = {
  tags: ["Assortment", "Operations"],
  sku: "CN297",
  title: "Returns Driver Title Goes Here per SKU",
  metrics: [
    { label: "Return Rate", value: "20.5%" },
    { label: "Revenue Opportunity", value: "$130.3k" },
    { label: "Realized Impact", value: "$30k" },
  ],
};
const CARDS = Array.from({ length: 12 }, () => CARD);

/* --------------------------- sections ---------------------------- */

function Header() {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 bg-neutral-0 px-4 py-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-[36px] font-bold leading-tight text-neutral-800">
          Returns Drivers
        </h1>
        <p className="text-sm text-neutral-500">May 11, 2025 - May 10, 2026</p>
      </div>

      <div className="flex items-center gap-3">
        {SUMMARY.map((s) => (
          <div
            key={s.label}
            className={`flex h-[60px] flex-col justify-center rounded-lg border border-neutral-200 px-3 py-2 ${s.tint}`}
          >
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-base font-bold text-neutral-800">{s.value}</p>
          </div>
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/overview/info.svg" alt="More info" className="size-4" />
      </div>

      <IconButton src="/overview/dashboard-customize.svg" label="Customize" />
    </header>
  );
}

function FilterBar() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {FILTERS.map((f) => (
        <FilterDropdown key={f} label={f} />
      ))}
      <div className="ml-auto flex items-center gap-4">
        <FilterButton label="Apply Filters" disabled />
        <FilterButton label="Reset" disabled />
      </div>
    </div>
  );
}

function ResultsRow() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-neutral-800">Showing 120 Results</p>
      <div className="flex h-10 w-full max-w-[300px] items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-0 px-3">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="#8a8a8a" strokeWidth="1.8" />
          <path d="M16.5 16.5L21 21" stroke="#8a8a8a" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Search driver, keyword..."
          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none"
        />
      </div>
    </div>
  );
}

function TabBar() {
  return (
    <div className="-mx-4 overflow-x-auto border-b border-neutral-200 px-4">
      <div className="flex min-w-max items-end">
        {TABS.map((tab) => {
          const active = tab.label === ACTIVE_TAB;
          return (
            <button
              key={tab.label}
              type="button"
              className="flex h-10 flex-col items-center justify-center"
            >
              <span className="flex flex-1 items-center gap-1.5 px-3.5">
                <span
                  className={`text-[13px] ${
                    active
                      ? "font-semibold text-primary-600"
                      : "font-medium text-neutral-500"
                  }`}
                >
                  {tab.label}
                </span>
                <span
                  className={`rounded-full px-1.5 py-px text-[10px] font-medium ${
                    active
                      ? "bg-primary-100 text-primary-700"
                      : "bg-neutral-100 text-neutral-500"
                  }`}
                >
                  {tab.count}
                </span>
              </span>
              <span
                className={`h-0.5 w-full ${active ? "bg-primary-600" : "bg-transparent"}`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DriverCard({ card, onSelect }: { card: typeof CARD; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-0 p-4 text-left transition-colors hover:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-600/40"
    >
      <div className="flex flex-col gap-2">
        <div className="flex gap-1.5">
          {card.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="text-xs font-bold text-neutral-500">{card.sku}</p>
        <p className="text-base font-medium text-neutral-800">{card.title}</p>
      </div>
      <div className="flex gap-2">
        {card.metrics.map((m) => (
          <div key={m.label} className="flex flex-col gap-1.5">
            <p className="text-xs text-neutral-500">{m.label}</p>
            <p className="text-xs font-bold text-neutral-800">{m.value}</p>
          </div>
        ))}
      </div>
    </button>
  );
}

/* ----------------------------- page ------------------------------ */

export default function ReturnsDriversContent() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <div className="min-h-screen bg-neutral-0">
      <Header />
      <div className="flex flex-col gap-5 px-4 pb-10 pt-3.5">
        <FilterBar />
        <ResultsRow />
        <TabBar />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CARDS.map((card, i) => (
            <DriverCard key={i} card={card} onSelect={() => setDetailOpen(true)} />
          ))}
        </div>
      </div>
      <DriverDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onCreateAction={() => setCreateOpen(true)}
        sku={CARD.sku}
        title={CARD.title}
      />
      <CreateActionModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
