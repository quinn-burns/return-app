"use client";

import { useState } from "react";

/* ----------------------------- data ----------------------------- */

const SELECTED_INSIGHTS = [
  {
    title: "Trend Over Time  - Revenue & Return Rate %",
    desc: "Monitor performance trends and identify patterns or shifts across selected periods.",
  },
  {
    title: "Reasons for Returns",
    desc: "Break down the main return reasons to identify recurring issues and improvement opportunities.",
  },
  {
    title: "Top Returning Styles",
    desc: "Spot specific styles driving returns and prioritize actions to reduce them.",
  },
  {
    title: "Performance by Brand",
    desc: "Analyze how each brand contributes to revenue and return behavior.",
  },
];

const UNSELECTED_INSIGHTS = [
  {
    title: "Performance by Product Category",
    desc: "Understand which categories are performing well and which need attention.",
  },
  {
    title: "Rate Change Decomposition",
    desc: "Analyze key factors influencing return increases or decreases in return behavior.",
  },
];

const RETURN_DRIVERS = [
  { title: "Assortment", desc: "Understand if product mix, variety, or availability is influencing return behavior.", default: true },
  { title: "Customer Experience", desc: "Identify friction points in the customer journey that may lead to dissatisfaction.", default: true },
  { title: "Marketing", desc: "Assess whether expectations set by campaigns align with the actual product experience.", default: true },
  { title: "Operations", desc: "Examine logistics, fulfillment, and delivery issues that may contribute to returns.", default: true },
  { title: "Product Design", desc: "Identify issues related to aesthetics, functionality, or product expectations.", default: false },
  { title: "Product Quality", desc: "Detect defects or inconsistencies that may be causing product dissatisfaction.", default: false },
  { title: "Size & Fit", desc: "Detect inconsistencies or mismatches between customer expectations and actual fit.", default: false },
];

type TabId =
  | "personal"
  | "business"
  | "display"
  | "overview"
  | "returns"
  | "notifications";

/* --------------------------- icons ------------------------------- */

function ic(active: boolean) {
  return active ? "#3457c9" : "#454545";
}

function PersonalIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke={ic(active)} strokeWidth="1.6" />
      <path d="M5 20a7 7 0 0114 0" stroke={ic(active)} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function BusinessIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" stroke={ic(active)} strokeWidth="1.6" />
      <path d="M3.5 9.5h17M9 9.5v10" stroke={ic(active)} strokeWidth="1.6" />
    </svg>
  );
}
function DisplayIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 5v14M17 5v14" stroke={ic(active)} strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="7" cy="9" r="2.2" fill="#fff" stroke={ic(active)} strokeWidth="1.6" />
      <circle cx="17" cy="15" r="2.2" fill="#fff" stroke={ic(active)} strokeWidth="1.6" />
    </svg>
  );
}
function OverviewTabIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke={ic(active)} strokeWidth="1.6" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke={ic(active)} strokeWidth="1.6" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke={ic(active)} strokeWidth="1.6" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke={ic(active)} strokeWidth="1.6" />
    </svg>
  );
}
function ReturnsTabIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15l4-4 3 3 6-6" stroke={ic(active)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 8h4v4" stroke={ic(active)} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function NotificationsIcon({ active }: { active: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 9a6 6 0 0112 0c0 5 2 6 2 6H4s2-1 2-6z" stroke={ic(active)} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 004 0" stroke={ic(active)} strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

const TABS: { id: TabId; label: string; icon: (active: boolean) => React.ReactNode }[] = [
  { id: "personal", label: "Personal Info", icon: (a) => <PersonalIcon active={a} /> },
  { id: "business", label: "Business Scope", icon: (a) => <BusinessIcon active={a} /> },
  { id: "display", label: "Display & Filtering Info", icon: (a) => <DisplayIcon active={a} /> },
  { id: "overview", label: "Overview", icon: (a) => <OverviewTabIcon active={a} /> },
  { id: "returns", label: "Returns Drivers", icon: (a) => <ReturnsTabIcon active={a} /> },
  { id: "notifications", label: "Notifications", icon: (a) => <NotificationsIcon active={a} /> },
];

/* --------------------------- primitives -------------------------- */

function DragHandle() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M4 7.5h12M4 12.5h12" stroke="#ababab" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CheckMark() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M2.5 6.2l2.3 2.3L9.5 3.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ResetButton() {
  return (
    <button
      type="button"
      className="w-fit rounded-lg bg-primary-100 px-3 py-2 text-sm font-medium text-primary-700 transition-opacity hover:opacity-90"
    >
      Reset to Default
    </button>
  );
}

function SectionIntro({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-xl font-bold text-neutral-800">{title}</h2>
      <p className="text-sm text-neutral-700">{desc}</p>
    </div>
  );
}

/* ---------------------------- tab content ------------------------ */

function OverviewTab() {
  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="Overview Dashboard"
        desc="Manage which insights and metrics are displayed in your overview dashboard."
      />
      <ResetButton />

      <div className="flex flex-col gap-3">
        {SELECTED_INSIGHTS.map((item, i) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-lg border border-primary-600 bg-primary-50 p-4"
          >
            <DragHandle />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-primary-600 text-[11px] font-semibold text-white">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold text-primary-600">{item.title}</span>
              </div>
              <p className="text-sm text-neutral-700">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-1">
        <span className="shrink-0 text-sm text-neutral-500">Not selected</span>
        <span className="h-px flex-1 bg-neutral-200" />
      </div>

      <div className="flex flex-col gap-3">
        {UNSELECTED_INSIGHTS.map((item) => (
          <div
            key={item.title}
            className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4"
          >
            <DragHandle />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="text-sm font-semibold text-neutral-800">{item.title}</span>
              <p className="text-sm text-neutral-700">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReturnsTab() {
  const [checked, setChecked] = useState<boolean[]>(RETURN_DRIVERS.map((d) => d.default));
  return (
    <div className="flex flex-col gap-4">
      <SectionIntro
        title="Return Drivers"
        desc="Manage the factors used to analyze and understand your return performance."
      />
      <ResetButton />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {RETURN_DRIVERS.map((driver, i) => {
          const on = checked[i];
          return (
            <button
              key={driver.title}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() =>
                setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
              }
              className={`flex items-start gap-2.5 rounded-lg border p-4 text-left transition-colors ${
                on
                  ? "border-primary-600 bg-primary-50"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <span
                className={`mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-[4px] border ${
                  on ? "border-primary-600 bg-primary-600" : "border-neutral-400 bg-white"
                }`}
              >
                {on && <CheckMark />}
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-1">
                <span
                  className={`text-sm font-semibold ${on ? "text-primary-600" : "text-neutral-800"}`}
                >
                  {driver.title}
                </span>
                <span className="text-sm text-neutral-700">{driver.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-1 text-center">
      <p className="text-base font-semibold text-neutral-800">{label}</p>
      <p className="text-sm text-neutral-500">This section is coming soon.</p>
    </div>
  );
}

/* ----------------------------- page ------------------------------ */

export default function MyAccountContent() {
  const [tab, setTab] = useState<TabId>("overview");

  return (
    <div className="flex min-h-screen flex-col gap-4 bg-neutral-0 px-4 pb-10">
      <header className="flex flex-col gap-1 py-6">
        <h1 className="text-4xl font-bold text-neutral-800">My Account</h1>
        <p className="text-sm text-neutral-700">Configure your preferences.</p>
      </header>

      {/* Tab bar */}
      <div className="w-full overflow-x-auto border-b border-neutral-200">
        <div className="flex min-w-max" role="tablist">
          {TABS.map(({ id, label, icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className="flex h-10 flex-col items-center"
              >
                <span className="flex flex-1 items-center gap-1.5 px-3.5">
                  {icon(active)}
                  <span
                    className={
                      active
                        ? "whitespace-nowrap text-[13px] font-semibold text-primary-700"
                        : "whitespace-nowrap text-[13px] font-medium text-neutral-700"
                    }
                  >
                    {label}
                  </span>
                </span>
                <span className={`h-0.5 w-full ${active ? "bg-primary-700" : ""}`} />
              </button>
            );
          })}
        </div>
      </div>

      {/* Content card */}
      <div className="rounded-xl border border-neutral-200 bg-white p-6">
        {tab === "overview" ? (
          <OverviewTab />
        ) : tab === "returns" ? (
          <ReturnsTab />
        ) : (
          <PlaceholderTab label={TABS.find((t) => t.id === tab)?.label ?? ""} />
        )}
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          className="flex h-10 items-center rounded-lg border border-neutral-200 bg-white px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50"
        >
          Discard Changes
        </button>
        <button
          type="button"
          className="flex h-10 items-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
