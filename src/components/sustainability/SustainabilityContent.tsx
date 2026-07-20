"use client";

import { ActionModalProvider } from "../customer/ActionSubmit";
import { AiInsight, Card, CardHeading, ExportButton, TakeAction } from "../customer/parts";
import { BRAND_OPTS, CATEGORY_OPTS, COUNTRY_OPTS, PERIOD_OPTS, FilterSelect } from "../customer/filters";

/* ----------------------------- data ----------------------------- */

const AVOIDED = [
  { label: "Returns prevented", value: "12,400", sub: "before they happened" },
  { label: "CO₂e never emitted", value: "310 t", sub: "vs. the same order returned" },
  { label: "Units never shipped twice", value: "12.4K", sub: "no reverse leg" },
  { label: "Margin protected", value: "$2.1M", sub: "sale kept, no markdown" },
];

// The waste hierarchy applied to returns: prevention is tier 1. Bars show where
// volume actually lands today, so the headroom above tier 3 is visible.
const HIERARCHY = [
  {
    rank: 1,
    label: "Prevented",
    desc: "The return never happened — no reverse shipping, handling, or markdown.",
    units: 12400,
    display: "12.4K",
    carbon: "0.0 kg",
    retained: "100%",
    color: "#059467",
    owned: true,
  },
  {
    rank: 2,
    label: "Kept or exchanged",
    desc: "Customer kept the item or swapped same-style — the sale is retained.",
    units: 8100,
    display: "8.1K",
    carbon: "1.2 kg",
    retained: "94%",
    color: "#27cba7",
  },
  {
    rank: 3,
    label: "Restocked",
    desc: "Returned, inspected, and back to full-price inventory.",
    units: 102000,
    display: "102K",
    carbon: "2.4 kg",
    retained: "98%",
    color: "#1d97ff",
  },
  {
    rank: 4,
    label: "Resold or repaired",
    desc: "Used Gear and ReBIRD — value recovered, but at a discount.",
    units: 27000,
    display: "27K",
    carbon: "3.1 kg",
    retained: "61%",
    color: "#4169e1",
  },
  {
    rank: 5,
    label: "Recycled",
    desc: "Material recovered; the product value itself is lost.",
    units: 7100,
    display: "7.1K",
    carbon: "5.8 kg",
    retained: "12%",
    color: "#f59f0a",
  },
  {
    rank: 6,
    label: "Landfill",
    desc: "No value recovered and a disposal cost on top.",
    units: 2800,
    display: "2.8K",
    carbon: "7.4 kg",
    retained: "0%",
    color: "#dc2828",
  },
];

type Lever = {
  lever: string;
  dept: string;
  prevented: string;
  carbon: string;
  value: string;
  share: number;
};
const LEVERS: Lever[] = [
  { lever: "Size & fit guidance on PDP", dept: "Footwear", prevented: "4,820", carbon: "121 t", value: "$780K", share: 100 },
  { lever: "Bracketing nudges at checkout", dept: "Outerwear", prevented: "3,140", carbon: "78 t", value: "$520K", share: 65 },
  { lever: "Product imagery & detail fixes", dept: "Apparel", prevented: "2,260", carbon: "57 t", value: "$410K", share: 47 },
  { lever: "Fit predictor at checkout", dept: "Hike", prevented: "1,410", carbon: "35 t", value: "$240K", share: 29 },
  { lever: "Quality flag interventions", dept: "Climb", prevented: "770", carbon: "19 t", value: "$150K", share: 16 },
];

const TARGETS = [
  {
    label: "Scope 3 emissions reduction",
    current: 31,
    goal: 42,
    detail: "31% of the 42% cut by 2030",
    contribution: "Prevention delivered 18% of this year's reduction",
  },
  {
    label: "Units kept out of waste streams",
    current: 87,
    goal: 95,
    detail: "87% today · 95% by 2030",
    contribution: "Prevention + circular recovery combined",
  },
  {
    label: "Return emissions vs. last year",
    current: 14,
    goal: 20,
    detail: "−14% year over year · −20% target",
    contribution: "Two thirds of the drop came from prevented returns",
  },
];

type HeadRow = {
  category: string;
  rate: string;
  preventable: string;
  carbon: string;
  value: string;
  share: number;
};
const HEADROOM: HeadRow[] = [
  { category: "Footwear", rate: "22.1%", preventable: "38%", carbon: "142 t", value: "$1.4M", share: 100 },
  { category: "Outerwear", rate: "18.4%", preventable: "31%", carbon: "118 t", value: "$1.1M", share: 82 },
  { category: "Hike", rate: "12.9%", preventable: "24%", carbon: "61 t", value: "$620K", share: 44 },
  { category: "Climb", rate: "11.2%", preventable: "19%", carbon: "42 t", value: "$430K", share: 30 },
  { category: "Accessories", rate: "9.4%", preventable: "14%", carbon: "18 t", value: "$190K", share: 13 },
];

/* --------------------------- sections ---------------------------- */

function Header() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 bg-neutral-0 px-4 py-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-[36px] font-bold leading-tight text-neutral-800">Sustainability</h1>
        <p className="text-sm text-neutral-600">
          The most sustainable return is the one that never happens — here is the footprint you
          avoided by preventing them
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
    { value: "18%", label: "of this year's cut from prevention" },
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
      <p className="mt-2 text-sm leading-6 text-neutral-700">
        Arc&rsquo;teryx is committed to halving its environmental footprint, with science-based
        targets validated by the SBTi. Resale, repair, and recycling all reduce the damage a return
        does — prevention removes it entirely. Everything below is measured against that standard:
        the emissions, waste, and margin that never existed because the return was stopped first.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        {goals.map((g) => (
          <div
            key={g.label}
            className="flex flex-col rounded-lg border border-success-100 bg-neutral-0 px-3 py-2"
          >
            <span className="text-base font-bold text-neutral-800">{g.value}</span>
            <span className="text-xs text-neutral-600">{g.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function AvoidedImpact() {
  return (
    <section className="rounded-lg border border-neutral-200 bg-neutral-0 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-neutral-800">Avoided impact this period</h2>
          <p className="text-sm text-neutral-600">
            Returns stopped before they happened, and the footprint that was never created as a
            result.
          </p>
        </div>
        <span className="rounded-full bg-success-600 px-3 py-1 text-xs font-semibold text-white">
          Tier 1 · Prevention
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {AVOIDED.map((a) => (
          <div key={a.label} className="flex flex-col gap-1 rounded-lg bg-success-50 p-4">
            <span className="text-xs text-neutral-600">{a.label}</span>
            <span className="text-[28px] font-bold leading-[34px] text-neutral-800">{a.value}</span>
            <span className="text-xs text-neutral-600">{a.sub}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-neutral-600">
        Roughly the annual emissions of 67 gas cars, or 1.2M km of freight never driven.
      </p>
    </section>
  );
}

function PreventionHierarchy() {
  const max = Math.max(...HIERARCHY.map((h) => h.units));
  return (
    <Card>
      <CardHeading
        title="The prevention hierarchy"
        subtitle="Every returned unit lands somewhere on this ladder. The higher it lands, the less carbon and value is lost — and only prevention avoids the impact completely."
      />
      <div className="mt-4 flex flex-col gap-2">
        {HIERARCHY.map((h) => (
          <div
            key={h.label}
            className={`flex flex-col gap-2 rounded-lg border p-3 lg:flex-row lg:items-center lg:gap-4 ${
              h.owned ? "border-success-600 bg-success-50" : "border-neutral-200 bg-neutral-0"
            }`}
          >
            <div className="flex min-w-0 items-start gap-3 lg:w-[300px]">
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                style={{ backgroundColor: h.color }}
              >
                {h.rank}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-neutral-800">{h.label}</span>
                  {h.owned && (
                    <span className="rounded-full bg-success-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Returnalyze works here
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs leading-4 text-neutral-600">{h.desc}</p>
              </div>
            </div>

            <div className="h-4 min-w-0 flex-1 overflow-hidden rounded-[4px] bg-neutral-100">
              <div
                data-anim-bar
                className="h-4 rounded-[4px]"
                style={{ width: `${(h.units / max) * 100}%`, backgroundColor: h.color }}
              />
            </div>

            <div className="flex shrink-0 gap-4 text-right lg:w-[260px] lg:justify-end">
              <div className="min-w-[70px]">
                <p className="text-sm font-semibold text-neutral-800">{h.display}</p>
                <p className="text-[11px] text-neutral-600">units</p>
              </div>
              <div className="min-w-[70px]">
                <p className="text-sm font-semibold text-neutral-800">{h.carbon}</p>
                <p className="text-[11px] text-neutral-600">CO₂e / unit</p>
              </div>
              <div className="min-w-[70px]">
                <p className="text-sm font-semibold text-neutral-800">{h.retained}</p>
                <p className="text-[11px] text-neutral-600">value kept</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-[11px] leading-4 text-neutral-600">
        Recommerce and recycling programs operate at tiers 4–5. Moving volume up one tier is worth
        more than optimizing within it.
      </p>
    </Card>
  );
}

function Levers() {
  return (
    <Card>
      <CardHeading
        title="What prevented them"
        subtitle="The interventions doing the work, ranked by returns avoided."
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Prevention lever</th>
              <th className="whitespace-nowrap px-3 py-2 font-normal">Top department</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Returns Prevented</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">CO₂e Avoided</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Margin Protected</th>
              <th className="py-2 pl-3 font-normal" />
            </tr>
          </thead>
          <tbody>
            {LEVERS.map((l) => (
              <tr key={l.lever} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-3 font-medium text-neutral-800">{l.lever}</td>
                <td className="whitespace-nowrap px-3 py-3 text-neutral-700">{l.dept}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-neutral-800">
                  {l.prevented}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{l.carbon}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-success-600">
                  {l.value}
                </td>
                <td className="py-3 pl-3 text-right">
                  <TakeAction context="Sustainability" department={l.dept} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function TargetContribution() {
  return (
    <Card>
      <CardHeading
        title="Prevention's contribution to your 2030 targets"
        subtitle="Attributable progress you can carry straight into your climate report."
        action={<ExportButton />}
      />
      <div className="mt-4 flex flex-col gap-5">
        {TARGETS.map((t) => {
          const pct = Math.min((t.current / t.goal) * 100, 100);
          return (
            <div key={t.label} className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium text-neutral-800">{t.label}</span>
                <span className="text-sm font-semibold text-success-600">{t.contribution}</span>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-[4px] bg-neutral-100">
                <div
                  data-anim-bar
                  className="h-3 rounded-[4px] bg-success-600"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-neutral-600">{t.detail}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Headroom() {
  return (
    <Card>
      <CardHeading
        title="Where prevention still has headroom"
        subtitle="Categories with the most returns Returnalyze predicts are preventable but not yet prevented."
      />
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-200 text-neutral-600">
              <th className="whitespace-nowrap py-2 pr-3 font-normal">Category</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Return Rate</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Predicted Preventable</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">CO₂e at Stake</th>
              <th className="whitespace-nowrap px-3 py-2 text-right font-normal">Margin at Stake</th>
              <th className="whitespace-nowrap py-2 pl-3 font-normal">Opportunity</th>
            </tr>
          </thead>
          <tbody>
            {HEADROOM.map((r) => (
              <tr key={r.category} className="border-b border-primary-50 last:border-b-0">
                <td className="whitespace-nowrap py-3 pr-3 font-medium text-neutral-800">{r.category}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.rate}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-neutral-800">
                  {r.preventable}
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-right text-neutral-700">{r.carbon}</td>
                <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-success-600">
                  {r.value}
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
            Returnalyze prevented{" "}
            <span className="font-semibold text-neutral-800">12,400 returns</span>{" "}this period —
            310 t CO₂e that was never emitted and $2.1M of margin that stayed booked. Prevention now
            accounts for{" "}
            <span className="font-semibold text-neutral-800">18% of your Scope 3 reduction</span>{" "}
            against the 2030 target. Footwear is the biggest remaining gap: 38% of its returns are
            predicted preventable, worth 142 t CO₂e and $1.4M still on the table.
          </AiInsight>
          <AvoidedImpact />
          <PreventionHierarchy />
          <Levers />
          <TargetContribution />
          <Headroom />
        </div>
      </div>
    </ActionModalProvider>
  );
}
