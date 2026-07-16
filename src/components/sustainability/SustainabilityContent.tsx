"use client";

import { ActionModalProvider } from "../customer/ActionSubmit";
import { AiInsight, Card, CardHeading, KpiStrip, TakeAction } from "../customer/parts";
import { BRAND_OPTS, CATEGORY_OPTS, COUNTRY_OPTS, PERIOD_OPTS, FilterSelect } from "../customer/filters";

/* ----------------------------- data ----------------------------- */

const KPIS = [
  { label: "Return Emissions", sub: "t CO₂e this period", value: "1,240" },
  { label: "Emissions per Return", sub: "kg CO₂e avg", value: "2.8" },
  { label: "Waste Diverted", sub: "from landfill", value: "87%" },
  { label: "Kept in Circulation", sub: "items", value: "142K" },
  { label: "Scope 3 Progress", sub: "to 2030 target", value: "31%" },
];

// Where returned items end up (mutually exclusive — sums to 100%).
const DISPOSITION = [
  { label: "Restocked as new", pct: 72, detail: "102K items", color: "#059467" },
  { label: "Resold · Used Gear", pct: 11, detail: "15.6K items", color: "#27cba7" },
  { label: "Repaired · ReBIRD", pct: 8, detail: "11.3K items", color: "#1d97ff" },
  { label: "Recycled", pct: 5, detail: "7.1K items", color: "#f59f0a" },
  { label: "Donated", pct: 2, detail: "2.8K items", color: "#4169e1" },
  { label: "Landfill", pct: 2, detail: "2.8K items", color: "#dc2828" },
];

// What drives the return-emissions footprint.
const SOURCES = [
  { label: "Return shipping", pct: 63, detail: "781 t CO₂e" },
  { label: "Processing & warehousing", pct: 18, detail: "223 t CO₂e" },
  { label: "Repackaging & materials", pct: 11, detail: "136 t CO₂e" },
  { label: "Disposal & recycling", pct: 8, detail: "100 t CO₂e" },
];

// Progress toward science-based targets. current / goal as % of goal.
const TARGETS = [
  { label: "Scope 3 emissions reduction", current: 31, goal: 42, unit: "% vs 2022", note: "2030 target −42%" },
  { label: "Waste diverted from landfill", current: 87, goal: 95, unit: "%", note: "2030 target 95%" },
  { label: "Returns kept in circulation", current: 76, goal: 90, unit: "%", note: "2030 target 90%" },
];

type CatRow = { category: string; returns: string; rate: string; emissions: string; share: number };
const BY_CATEGORY: CatRow[] = [
  { category: "Outerwear", returns: "38.2K", rate: "18.4%", emissions: "412 t", share: 100 },
  { category: "Footwear", returns: "44.1K", rate: "22.1%", emissions: "356 t", share: 86 },
  { category: "Hike", returns: "21.7K", rate: "12.9%", emissions: "198 t", share: 48 },
  { category: "Climb", returns: "14.3K", rate: "11.2%", emissions: "141 t", share: 34 },
  { category: "Accessories", returns: "9.8K", rate: "9.4%", emissions: "78 t", share: 19 },
];

type OppRow = { dept: string; lever: string; savings: string; cars: string };
const OPPORTUNITIES: OppRow[] = [
  { dept: "Footwear", lever: "Reduce size bracketing", savings: "180 t CO₂e / yr", cars: "≈ 39 cars" },
  { dept: "Outerwear", lever: "Cut re-return exchanges", savings: "96 t CO₂e / yr", cars: "≈ 21 cars" },
  { dept: "Hike", lever: "Consolidate return shipping", savings: "64 t CO₂e / yr", cars: "≈ 14 cars" },
  { dept: "Accessories", lever: "Restock instead of recycle", savings: "22 t CO₂e / yr", cars: "≈ 5 cars" },
];

/* --------------------------- sections ---------------------------- */

function Header() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 bg-neutral-0 px-4 py-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-[36px] font-bold leading-tight text-neutral-800">Sustainability</h1>
        <p className="text-sm text-neutral-500">
          The environmental footprint of returns — and how reducing them moves you toward your goals
        </p>
      </div>
    </header>
  );
}

function FilterBar() {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <FilterSelect label="Brand" options={BRAND_OPTS} />
      <FilterSelect label="Country" options={COUNTRY_OPTS} />
      <FilterSelect label="Product Category" options={CATEGORY_OPTS} />
      <FilterSelect label="Period" options={PERIOD_OPTS} />
    </div>
  );
}

function MissionBanner() {
  const goals = [
    { value: "Net-zero", label: "value chain by 2050" },
    { value: "−42%", label: "Scope 3 by 2030" },
    { value: "−90%", label: "Scope 1 & 2 by 2030" },
  ];
  return (
    <section className="overflow-hidden rounded-lg border border-success-100 bg-success-50 p-5">
      <div className="flex items-center gap-2">
        <span className="flex size-8 items-center justify-center rounded-full bg-success-600">
          <span
            aria-hidden="true"
            className="size-5"
            style={{
              backgroundColor: "#ffffff",
              maskImage: "url(/nav/sustainability.svg)",
              WebkitMaskImage: "url(/nav/sustainability.svg)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
        </span>
        <h2 className="text-xl font-bold text-success-700">Leave It Better</h2>
      </div>
      <p className="mt-2 w-full text-sm leading-6 text-neutral-700">
        Arc&rsquo;teryx is committed to halving its environmental footprint and growing its positive
        social impact — with science-based climate targets validated by the SBTi. Returns are a
        material part of that footprint, so every avoided return keeps product in use and carbon out
        of the atmosphere.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {goals.map((g) => (
          <div
            key={g.label}
            className="flex flex-col rounded-lg border border-success-100 bg-neutral-0 px-3 py-2"
          >
            <span className="text-base font-bold text-neutral-800">{g.value}</span>
            <span className="text-xs text-neutral-500">{g.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function ShareBars({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: { label: string; pct: number; detail: string; color: string }[];
}) {
  const max = Math.max(...rows.map((r) => r.pct));
  return (
    <Card>
      <CardHeading title={title} subtitle={subtitle} />
      <div className="mt-4 flex flex-col gap-3">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="w-44 shrink-0 truncate text-sm font-medium text-neutral-800">
              {r.label}
            </span>
            <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
              <div
                data-anim-bar
                className="h-5 rounded-[4px]"
                style={{ width: `${(r.pct / max) * 100}%`, backgroundColor: r.color }}
              />
            </div>
            <span className="w-28 shrink-0 text-right text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">{r.pct}%</span> · {r.detail}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SourceBars() {
  return (
    <Card>
      <CardHeading
        title="What drives return emissions?"
        subtitle="Estimated CO₂e footprint of the returns process, by source."
      />
      <div className="mt-4 flex flex-col gap-3">
        {SOURCES.map((s) => (
          <div key={s.label} className="flex items-center gap-3">
            <span className="w-52 shrink-0 truncate text-sm font-medium text-neutral-800">
              {s.label}
            </span>
            <div className="h-5 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
              <div
                data-anim-bar
                className="h-5 rounded-[4px] bg-neutral-500"
                style={{ width: `${s.pct}%` }}
              />
            </div>
            <span className="w-28 shrink-0 text-right text-xs text-neutral-500">
              <span className="font-semibold text-neutral-800">{s.pct}%</span> · {s.detail}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function TargetsProgress() {
  return (
    <Card>
      <CardHeading
        title="Progress toward 2030 targets"
        subtitle="How reducing returns tracks against science-based goals."
      />
      <div className="mt-4 flex flex-col gap-5">
        {TARGETS.map((t) => {
          const pct = Math.min((t.current / t.goal) * 100, 100);
          return (
            <div key={t.label} className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-medium text-neutral-800">{t.label}</span>
                <span className="text-xs text-neutral-500">
                  <span className="font-semibold text-neutral-800">
                    {t.current}
                    {t.unit.startsWith("%") ? "%" : ""}
                  </span>{" "}
                  · {t.note}
                </span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-[4px] bg-neutral-100">
                <div
                  data-anim-bar
                  className="h-3 rounded-[4px] bg-success-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function EmissionsByCategory() {
  return (
    <Card>
      <CardHeading
        title="Return emissions by category"
        subtitle="Which categories carry the heaviest return footprint."
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Category</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Returns</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Return Rate</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">CO₂e</th>
              <th className="whitespace-nowrap py-2 pl-3 font-normal">Share of footprint</th>
            </tr>
          </thead>
          <tbody>
            {BY_CATEGORY.map((r) => (
              <tr key={r.category} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-3 font-medium text-neutral-800">{r.category}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.returns}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.rate}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-neutral-800">
                  {r.emissions}
                </td>
                <td className="py-3 pl-3">
                  <div className="h-2.5 w-full min-w-[120px] overflow-hidden rounded-[4px] bg-neutral-100">
                    <div
                      data-anim-bar
                      className="h-2.5 rounded-[4px] bg-success-600"
                      style={{ width: `${r.share}%` }}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Opportunities() {
  return (
    <Card>
      <CardHeading
        title="Highest-impact reductions"
        subtitle="Return levers ranked by estimated annual carbon savings."
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-500">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Department</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">Lever</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Est. CO₂e Savings</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Equivalent</th>
              <th className="py-2 pl-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {OPPORTUNITIES.map((r) => (
              <tr key={r.dept} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-3 font-medium text-neutral-800">{r.dept}</td>
                <td className="whitespace-nowrap px-3 py-3 text-neutral-700">{r.lever}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-success-600">
                  {r.savings}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-500">{r.cars}</td>
                <td className="py-3 pl-3 text-right">
                  <TakeAction context="Sustainability" department={r.dept} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ----------------------------- page ------------------------------ */

export default function SustainabilityContent() {
  return (
    <ActionModalProvider>
      <div className="min-h-screen bg-neutral-0">
        <Header />
        <div className="flex flex-col gap-5 px-4 pb-10 pt-3.5">
          <FilterBar />
          <MissionBanner />
          <AiInsight>
            Returns generated an estimated{" "}
            <span className="font-semibold text-neutral-800">1,240 t CO₂e</span>{" "}this period — 63% of
            it from return shipping alone. Bringing Footwear&rsquo;s size bracketing down to the
            category average would avoid roughly{" "}
            <span className="font-semibold text-neutral-800">180 t CO₂e a year</span>{" "}(about 39 gas
            cars) and closes 4 points of the gap to your 2030 Scope 3 target.
          </AiInsight>
          <KpiStrip items={KPIS} cols={5} />
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <ShareBars
              title="Where do returned items go?"
              subtitle="Disposition of returned product — keeping items in use avoids emissions."
              rows={DISPOSITION}
            />
            <SourceBars />
          </div>
          <TargetsProgress />
          <EmissionsByCategory />
          <Opportunities />
        </div>
      </div>
    </ActionModalProvider>
  );
}
