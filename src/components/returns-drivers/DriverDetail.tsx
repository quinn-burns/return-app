"use client";

import { BackButton, Sheet, SheetHeaderActions } from "../shared/overlays";

/* ----------------------------- data ----------------------------- */

const INSIGHTS = Array.from({ length: 3 }, () => ({
  lead: "Insight text goes here",
  text: "During the summer months, Acme Outlet's swimwear category experienced a significant surge, with returns spiking by 43.1%.",
}));

const METRICS = [
  { value: "3.1%", lines: ["Text goes here", "Text goes here"] },
  { value: "2.8%", lines: ["Previous comparison", "Reflection on changes"] },
  { value: "3.7%", lines: ["Future projections", "Implications for strategy"] },
  { value: "4.5%", lines: ["Updated data point", "Additional notes here"] },
  { value: "5.0%", lines: ["Latest analysis", "Key takeaways"] },
];

const REASONS = [
  { label: "Too Snug/Tight", pct: 28.5, color: "#4169e1" },
  { label: "Too Large", pct: 21.4, color: "#22a06b" },
  { label: "Too Small", pct: 19.8, color: "#f5a623" },
  { label: "Not As Expected", pct: 16.2, color: "#d13636" },
  { label: "Quality Issues", pct: 14.1, color: "#38bdf8" },
];

const STYLES = [
  { name: "Marquette Thermo Pull On WP", sku: "WJ-12345", units: 171, lost: "$15,821", tags: ["Too Snug/Tight", "Too Small"] },
  { name: "Harper Pull On Waterproof", sku: "WJ-12346", units: 234, lost: "$23,876", tags: ["Too Snug/Tight", "Too Narrow"] },
  { name: "Encore Ice 5 Mid Zip", sku: "WJ-12347", units: 144, lost: "$22,904", tags: ["Too Large", "Too Loose"] },
  { name: "Clover Mid Wool Waterproof", sku: "WJ-12348", units: 218, lost: "$20,876", tags: ["Too Snug/Tight", "Too Small"] },
  { name: "Marquette Thermo Mule", sku: "WJ-12349", units: 167, lost: "$13,272", tags: ["Too Loose", "Heel Slippage"] },
];

const QUOTES = [
  {
    name: "Marquette Thermo Pull On WP",
    sku: "WJ-12345",
    items: [
      { tag: "Too Snug/Tight (58)", text: "Inconsistent sizing; thermal lining makes fit tighter than expected." },
      { tag: "Too Small (46)", text: "Runs small; customers recommend sizing up." },
    ],
  },
  {
    name: "Harper Pull On Waterproof",
    sku: "WJ-12346",
    items: [
      { tag: "Too Snug (52)", text: "Tight in ankle area; uncomfortable for extended walking." },
      { tag: "Too Narrow (38)", text: "Width issues especially for wider feet." },
    ],
  },
];

const RECOMMENDATIONS: {
  group: string;
  tint: string;
  title: string;
  items: string[];
}[] = [
  {
    group: "Ecommerce",
    tint: "bg-primary-50",
    title: "text-primary-600",
    items: ["Action title goes here", "Action title goes here"],
  },
  {
    group: "Merchandising",
    tint: "bg-success-50",
    title: "text-success-600",
    items: ["Action title goes here", "Action title goes here"],
  },
];

const RECOMMENDATION_BODY =
  "Lorem ipsum dolor sit amet consectetur. At nec non eget mattis ut varius augue.";

const IMPACT = [
  { label: "Revenue Opportunity", value: "$125.4k", tint: "bg-success-50" },
  { label: "Operational Savings", value: "$18.2k", tint: "bg-magenta-50" },
  { label: "Customer Impact", value: "4.4k", tint: "bg-info-50" },
  { label: "Return On Investment", value: "$73.4k", tint: "bg-amber-50" },
];

/* --------------------------- primitives -------------------------- */

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border border-neutral-200 bg-white p-4 ${className}`}
    >
      {children}
    </section>
  );
}

function CardTitle({
  icon,
  children,
  className = "text-neutral-800",
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`flex items-center gap-2 text-base font-semibold ${className}`}>
      {icon}
      {children}
    </h2>
  );
}

function RedTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap rounded bg-danger-50 px-2 py-0.5 text-[11px] font-medium text-danger-600">
      {children}
    </span>
  );
}

/* ---------------------------- sections --------------------------- */

function KeyInsights() {
  return (
    <Card>
      <CardTitle
        className="text-primary-600"
        icon={
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/overview/ai-logo.svg" alt="" className="size-5" />
        }
      >
        Key Insights
      </CardTitle>
      <div className="mt-3 flex flex-col gap-2">
        {INSIGHTS.map((ins, i) => (
          <p
            key={i}
            className="rounded border-l-2 border-primary-600 bg-primary-50 px-3 py-2 text-sm text-neutral-700"
          >
            <span className="font-bold">{ins.lead}</span> {ins.text}
          </p>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-center gap-2 text-sm text-neutral-600">
        Was this helpful?
        <button type="button" aria-label="Not helpful" className="text-danger-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M17 4h3v10h-3M17 13l-4.5 7a2.1 2.1 0 01-3.9-1.4l.9-4.1H5a2 2 0 01-2-2.4l1.2-6A2 2 0 016.2 4H17v9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" aria-label="Helpful" className="text-success-600">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M7 20H4V10h3M7 11l4.5-7a2.1 2.1 0 013.9 1.4l-.9 4.1H19a2 2 0 012 2.4l-1.2 6a2 2 0 01-2 1.6H7v-9z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </Card>
  );
}

function KeyMetrics() {
  return (
    <Card>
      <CardTitle
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" stroke="#4169e1" strokeWidth="1.6" strokeDasharray="4 3" />
            <path d="M12 8v4l2.5 2.5" stroke="#4169e1" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        }
      >
        Key Performance Metrics
      </CardTitle>
      <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {METRICS.map((m, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 p-3">
            <p className="text-xs text-neutral-500">Metric</p>
            <p className="my-1 text-xl font-bold text-neutral-800">{m.value}</p>
            {m.lines.map((line) => (
              <p key={line} className="text-[11px] leading-4 text-neutral-500">
                {line}
              </p>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

/* Simplified returns-trends line chart (Apr–Jan, forecast after Oct). */
function TrendChart() {
  const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];
  const x = (i: number) => 30 + i * 44;
  const y = (v: number) => 120 - v;
  const series: { color: string; dash?: string; points: number[] }[] = [
    { color: "#4169e1", points: [52, 55, 58, 56, 57, 55, 54] },
    { color: "#4169e1", dash: "4 4", points: [54, 56, 55, 57] },
    { color: "#8a8a8a", points: [46, 44, 47, 45, 44, 46, 45, 46, 45, 47] },
    { color: "#f5a623", points: [38, 36, 39, 37, 36, 38, 33, 37, 36, 38] },
    { color: "#212121", points: [44, 43, 45, 44, 43, 44, 43, 44, 43, 44] },
  ];
  const legend = [
    { label: "Return Rate (Actual)", color: "#4169e1" },
    { label: "Return Rate (Predicted)", color: "#4169e1", dash: true },
    { label: "Previous Year", color: "#8a8a8a" },
    { label: "Baseline", color: "#f5a623" },
    { label: "Industry Benchmark", color: "#212121" },
  ];
  return (
    <div className="min-w-0 flex-1">
      <svg viewBox="0 0 470 150" className="w-full" role="img" aria-label="Returns trends by month">
        {[0, 20, 40, 60, 80, 100].map((v) => (
          <g key={v}>
            <text x="22" y={y(v) + 3} textAnchor="end" fontSize="8" fill="#8a8a8a">
              {v}
            </text>
            <line x1="30" x2="440" y1={y(v)} y2={y(v)} stroke="#f0f0f0" />
          </g>
        ))}
        <line x1={x(6)} x2={x(6)} y1={y(100)} y2={y(0)} stroke="#dedede" strokeDasharray="3 3" />
        <text x={x(6)} y={y(100) - 4} textAnchor="middle" fontSize="8" fill="#ababab" fontStyle="italic">
          Forecast Start
        </text>
        {series.map((s, si) => {
          const offset = s.dash && si === 1 ? 6 : 0;
          return (
            <g key={si}>
              <polyline
                fill="none"
                stroke={s.color}
                strokeWidth="1.5"
                strokeDasharray={s.dash}
                points={s.points.map((p, i) => `${x(i + offset)},${y(p)}`).join(" ")}
              />
              {s.points.map((p, i) => (
                <circle key={i} cx={x(i + offset)} cy={y(p)} r="1.8" fill={s.color} />
              ))}
            </g>
          );
        })}
        {months.map((m, i) => (
          <text key={m} x={x(i)} y="138" textAnchor="middle" fontSize="8" fill="#8a8a8a">
            {m}
          </text>
        ))}
      </svg>
      <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
        {legend.map((l) => (
          <span key={l.label} className="flex items-center gap-1.5 text-[10px] text-neutral-600">
            <span
              className="inline-block h-0.5 w-4"
              style={{
                background: l.dash
                  ? `repeating-linear-gradient(90deg, ${l.color} 0 3px, transparent 3px 6px)`
                  : l.color,
              }}
            />
            {l.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ReasonsDonut() {
  const r = 40;
  const c = 2 * Math.PI * r;
  const segments = REASONS.map((seg, i) => ({
    ...seg,
    dash: (seg.pct / 100) * c,
    offset: REASONS.slice(0, i).reduce((sum, s) => sum + (s.pct / 100) * c, 0),
  }));
  return (
    <div className="w-full shrink-0 rounded-lg border border-neutral-200 p-3 lg:w-[240px]">
      <p className="text-xs text-neutral-600">Return Reasons</p>
      <div className="my-2 flex justify-center">
        <div className="relative size-[120px]">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            {segments.map((seg) => (
              <circle
                key={seg.label}
                cx="50"
                cy="50"
                r={r}
                fill="none"
                stroke={seg.color}
                strokeWidth="10"
                strokeDasharray={`${seg.dash} ${c - seg.dash}`}
                strokeDashoffset={-seg.offset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-neutral-800">432</span>
            <span className="text-[10px] text-neutral-500">Items Returned</span>
          </div>
        </div>
      </div>
      <ul className="flex flex-col gap-1">
        {REASONS.map((seg) => (
          <li key={seg.label} className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-neutral-700">
              <span className="size-2 rounded-full" style={{ backgroundColor: seg.color }} />
              {seg.label}
            </span>
            <span className="text-neutral-500">{seg.pct}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReturnsTrends() {
  return (
    <Card>
      <CardTitle
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" stroke="#4169e1" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        }
      >
        Returns Trends
      </CardTitle>
      <div className="mt-3 flex flex-col gap-4 lg:flex-row">
        <TrendChart />
        <ReasonsDonut />
      </div>
    </Card>
  );
}

function TopStyles() {
  return (
    <Card>
      <CardTitle
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 3s6 5.2 6 10a6 6 0 01-12 0c0-4.8 6-10 6-10z" stroke="#4169e1" strokeWidth="1.6" />
            <path d="M12 21v-6" stroke="#4169e1" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        }
      >
        Top Returning Styles
      </CardTitle>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="bg-neutral-50 text-neutral-600">
              <th className="rounded-l-lg px-3 py-2 font-normal">Product</th>
              <th className="px-3 py-2 font-normal">Rate</th>
              <th className="px-3 py-2 font-normal">Units</th>
              <th className="px-3 py-2 font-normal">Revenue lost</th>
              <th className="px-3 py-2 font-normal">Rate</th>
              <th className="rounded-r-lg px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {STYLES.map((s) => (
              <tr key={s.sku} className="border-b border-primary-50 last:border-b-0">
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-3">
                    <span className="size-10 shrink-0 rounded-lg bg-neutral-100" />
                    <span>
                      <span className="block font-semibold text-neutral-800">{s.name}</span>
                      <span className="block text-xs text-neutral-500">{s.sku}</span>
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2.5 font-bold text-danger-600">38%</td>
                <td className="px-3 py-2.5 text-neutral-700">{s.units}</td>
                <td className="px-3 py-2.5 font-semibold text-neutral-800">{s.lost}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1.5">
                    {s.tags.map((t) => (
                      <RedTag key={t}>{t}</RedTag>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2.5">
                  <button type="button" aria-label={`Open ${s.name}`} className="text-primary-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M14 4h6v6M20 4l-9 9M20 14v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5a1 1 0 011-1h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function CustomerQuotes() {
  return (
    <Card>
      <CardTitle
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" stroke="#4169e1" strokeWidth="1.6" />
            <circle cx="12" cy="10" r="3" stroke="#4169e1" strokeWidth="1.6" />
            <path d="M6.5 18.5a6 6 0 0111 0" stroke="#4169e1" strokeWidth="1.6" />
          </svg>
        }
      >
        What Customers Are Saying
      </CardTitle>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {QUOTES.map((q) => (
          <div key={q.sku} className="rounded-lg border border-neutral-200 p-4">
            <p className="font-semibold text-neutral-800">{q.name}</p>
            <p className="text-xs text-neutral-500">{q.sku}</p>
            <div className="mt-2 flex flex-col gap-2.5">
              {q.items.map((item) => (
                <div key={item.tag}>
                  <RedTag>{item.tag}</RedTag>
                  <p className="mt-1 text-sm text-neutral-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="mx-auto mt-3 flex items-center gap-1 text-sm font-medium text-primary-600"
      >
        Show more
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
          <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </Card>
  );
}

function Recommendations({ onCreateAction }: { onCreateAction: () => void }) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 3v6m0 0l4 4v8M12 9l-4 4v8" stroke="#4169e1" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          Recommendations
        </CardTitle>
        <button
          type="button"
          onClick={onCreateAction}
          className="flex h-9 items-center rounded-lg bg-primary-600 px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Create Action
        </button>
      </div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        {RECOMMENDATIONS.map((group) => (
          <div key={group.group} className="flex flex-col gap-2">
            <p className="text-sm font-medium text-neutral-800">{group.group}</p>
            {group.items.map((title, i) => (
              <div key={i} className={`rounded-lg p-3 ${group.tint}`}>
                <p className={`text-sm font-semibold ${group.title}`}>{title}</p>
                <p className="mt-1 text-sm text-neutral-600">{RECOMMENDATION_BODY}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Card>
  );
}

function BusinessImpact() {
  return (
    <Card>
      <CardTitle
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" stroke="#4169e1" strokeWidth="1.6" />
            <path d="M3 9h18M9 4v16" stroke="#4169e1" strokeWidth="1.6" />
          </svg>
        }
      >
        Business Impact
      </CardTitle>
      <p className="mt-1 text-sm text-neutral-600">
        Reducing returns to baseline over the next 12 months has a projected opportunity of:
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {IMPACT.map((s) => (
          <div
            key={s.label}
            className={`flex h-[60px] min-w-[150px] flex-col justify-center rounded-lg border border-neutral-200 px-3 py-2 ${s.tint}`}
          >
            <p className="text-xs text-neutral-500">{s.label}</p>
            <p className="text-base font-bold text-neutral-800">{s.value}</p>
          </div>
        ))}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/overview/info.svg" alt="More info" className="size-4" />
      </div>
    </Card>
  );
}

/* ----------------------------- sheet ----------------------------- */

export default function DriverDetail({
  open,
  onClose,
  onCreateAction,
  sku,
  title,
}: {
  open: boolean;
  onClose: () => void;
  onCreateAction: () => void;
  sku: string;
  title: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} label={`${sku} returns driver details`}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <BackButton onClick={onClose} />
          <SheetHeaderActions />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-500">{sku}</p>
          <h1 className="text-xl font-bold text-neutral-800">{title}</h1>
        </div>
        <KeyInsights />
        <KeyMetrics />
        <ReturnsTrends />
        <TopStyles />
        <CustomerQuotes />
        <Recommendations onCreateAction={onCreateAction} />
        <BusinessImpact />
      </div>
    </Sheet>
  );
}
