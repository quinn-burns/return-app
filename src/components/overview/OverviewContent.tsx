import { FilterDropdown, IconButton } from "./Buttons";
import {
  BRAND_OPTS,
  PERIOD_OPTS,
  FilterSelect,
  FilterBarProvider,
  ApplyFiltersButton,
  ResetFiltersButton,
} from "../customer/filters";
import CustomizeMenu from "./CustomizeMenu";

/* ----------------------------- data ----------------------------- */

const RETURNS_DRIVERS = [
  "Assortment",
  "Size & Fit",
  "Customer Experience",
  "Best Performers",
  "Product Design",
  "Product Quality",
  "Operations",
  "ECommerce",
];

type Trend = "up" | "down" | "flat";

const KPIS: { label: string; value: string; change: string; trend: Trend }[] = [
  { label: "Return Rate", value: "3.1%", change: "↑ 3%", trend: "up" },
  { label: "Items Sold", value: "250k", change: "↑ 26%", trend: "up" },
  { label: "Items Returned", value: "7.5k", change: "↓ 26%", trend: "down" },
  { label: "Return Rate ($)", value: "17%", change: "↓ 19%", trend: "down" },
  { label: "Exchange Rate", value: "14%", change: "– 0.0%", trend: "flat" },
  { label: "Bracketing Rate", value: "5%", change: "– 0.0%", trend: "flat" },
];

// Brand and period are real selects; the rest stay static for now.
const FILTERS = ["All Regions", "All Channels", "All Departments"];

/* --------------------------- primitives -------------------------- */

function Pill({ change, trend }: { change: string; trend: Trend }) {
  const styles: Record<Trend, string> = {
    up: "bg-success-50 text-success-600",
    down: "bg-danger-50 text-danger-600",
    flat: "bg-neutral-100 text-neutral-600",
  };
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`flex items-center rounded-full px-2 py-[3px] text-[11px] font-medium ${styles[trend]}`}
      >
        {change}
      </span>
      <span className="text-[11px] text-neutral-600">vs last period</span>
    </div>
  );
}

/* ---------------------------- sections --------------------------- */

function Header() {
  return (
    <header className="flex items-center justify-between bg-neutral-0 px-4 py-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-[36px] font-bold leading-tight text-neutral-800">
          Overview
        </h1>
        <p className="text-sm text-neutral-600">May 11, 2025 - May 10, 2026</p>
      </div>
      <div className="flex items-center gap-3">
        <CustomizeMenu />
        <IconButton src="/overview/discover-tune.svg" label="Adjust filters" />
        <IconButton src="/overview/ios-share.svg" label="Share" />
      </div>
    </header>
  );
}

function FilterBar() {
  return (
    <FilterBarProvider>
      <div className="flex flex-wrap items-center gap-4">
        <FilterSelect label="Brand" options={BRAND_OPTS} />
        {FILTERS.map((f) => (
          <FilterDropdown key={f} label={f} />
        ))}
        <FilterSelect label="Period" options={PERIOD_OPTS} />
        <div className="ml-auto flex items-center gap-4">
          <ApplyFiltersButton />
          <ResetFiltersButton />
        </div>
      </div>
    </FilterBarProvider>
  );
}

function ReturnsDriversRow() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* Returns Drivers */}
      <div className="flex-1 rounded-lg border border-neutral-200 bg-success-50 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-semibold text-neutral-800">
            Returns Drivers
          </h2>
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-800">
              Total Revenue Opportunity
            </span>
            <span className="text-base font-bold text-neutral-800">$173.2M</span>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {RETURNS_DRIVERS.map((label) => (
            <div key={label} className="rounded-lg bg-neutral-0 px-2 py-1">
              <p className="truncate text-xs text-neutral-600">{label}</p>
              <p className="text-base font-bold text-neutral-800">$35.3M</p>
            </div>
          ))}
        </div>
      </div>

      {/* Realized Impact */}
      <div className="flex w-full shrink-0 flex-col justify-between gap-7 rounded-lg border border-neutral-200 bg-neutral-0 p-4 lg:w-[183px]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-0.5">
            <span className="text-xs text-neutral-800">Realized Impact</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/overview/info.svg" alt="" className="size-4" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overview/download.svg" alt="Download" className="size-6" />
        </div>
        <div className="flex flex-col gap-1.5">
          <p className="text-[28px] font-bold leading-[34px] text-neutral-800">
            $73.4k
          </p>
          <Pill change="↑ 3%" trend="up" />
        </div>
      </div>
    </div>
  );
}

function KpiRow() {
  return (
    <div className="grid grid-cols-2 rounded-lg border border-neutral-200 bg-neutral-0 px-4 sm:grid-cols-3 lg:grid-cols-6">
      {KPIS.map((kpi) => (
        <div key={kpi.label} className="flex flex-col gap-1.5 p-4">
          <p className="text-xs text-neutral-600">{kpi.label}</p>
          <p className="text-[28px] font-bold leading-[34px] text-neutral-800">
            {kpi.value}
          </p>
          <Pill change={kpi.change} trend={kpi.trend} />
        </div>
      ))}
    </div>
  );
}

function AiSummary() {
  return (
    <div className="rounded-lg border border-primary-100 bg-primary-50 p-4">
      <div className="flex items-center gap-1.5">
        <span className="flex items-center justify-center rounded-full bg-gradient-to-b from-[#27cba7] to-[#0b61dd] p-[3.5px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overview/ai-logo.svg" alt="" className="size-[17px]" />
        </span>
        <h2 className="text-xl font-semibold text-primary-700">
          AI Returns Summary
        </h2>
      </div>
      <p className="mt-1.5 max-w-[871px] text-sm leading-5 text-neutral-600">
        During the summer months, Acme Outlet&rsquo;s swimwear category
        experienced a significant surge, with returns spiking by 43.1%. This
        increase in swimwear returns contributed to an overall return rate
        increase of 7.2% across all Acme brands.
      </p>
    </div>
  );
}

function PerformanceTrends() {
  const yLeft = ["100%", "80%", "60%", "40%", "20%", "0%"];
  const yRight = ["500K", "400K", "300K", "200K", "100K", "0%"];
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-0 p-4">
      <h2 className="text-xl font-semibold text-neutral-800">
        Performance Trends
      </h2>

      <div className="relative mt-2 h-[354px] w-full text-[13px] text-neutral-600">
        {/* Legend */}
        <div className="absolute right-4 top-3.5 z-10 flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span className="size-3 rounded-full bg-chart-return" />
            Return Rate (v)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-neutral-600">
            <span className="size-3 rounded-full bg-chart-revenue" />
            Revenue
          </span>
        </div>

        {/* Y axis – left (%) */}
        <div className="absolute left-0 top-[50px] flex h-[246px] w-9 flex-col justify-between text-right">
          {yLeft.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        {/* Y axis – right (K) */}
        <div className="absolute right-0 top-[52px] flex h-[244px] w-11 flex-col justify-between text-right">
          {yRight.map((l, i) => (
            <span key={`${l}-${i}`}>{l}</span>
          ))}
        </div>

        {/* Gridlines */}
        <div className="absolute left-[6.3%] right-[5.45%] top-[63px] h-[242px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/overview/chart-grid.svg" alt="" className="block size-full" />
        </div>

        {/* Trend line – Return Rate (blue) */}
        <div className="absolute inset-[18.11%_5.33%_35.02%_6.35%]">
          <div className="absolute inset-[17.26%_0_-0.88%_0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/overview/trend-vector11.svg" alt="" className="block size-full" />
          </div>
        </div>
        {/* Trend line – Revenue (orange) */}
        <div className="absolute inset-[46.87%_5.46%_16.38%_6.67%]">
          <div className="absolute inset-[5.33%_0_6.78%_0]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/overview/trend-vector9.svg" alt="" className="block size-full" />
          </div>
        </div>

        {/* X axis – months */}
        <div className="absolute left-[6.35%] right-[5%] top-[328px] flex justify-between">
          {months.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------------- page ------------------------------ */

export default function OverviewContent() {
  return (
    <div className="min-h-screen bg-neutral-0">
      <Header />
      <div className="page-enter flex flex-col gap-5 px-4 pb-10 pt-3.5">
        <FilterBar />
        <ReturnsDriversRow />
        <KpiRow />
        <AiSummary />
        <PerformanceTrends />
      </div>
    </div>
  );
}
