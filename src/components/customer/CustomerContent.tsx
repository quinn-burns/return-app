"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ActionModalProvider } from "./ActionSubmit";
import { AiInsight } from "./parts";
import { TABS, TAB_SLUG, SLUG_TAB, type Tab } from "./tabs";
import {
  BRAND_OPTS,
  COUNTRY_OPTS,
  CATEGORY_OPTS,
  CUSTOMER_TYPE_OPTS,
  DEPARTMENT_OPTS,
  PERIOD_OPTS,
  FilterSelect,
  FilterBarProvider,
  ApplyFiltersButton,
  ResetFiltersButton,
} from "./filters";
import ExchangeTab from "./ExchangeTab";
import SegmentsTab from "./SegmentsTab";
import BehavioralFlowTab from "./BehavioralFlowTab";
import OverviewTab from "./OverviewTab";
import BracketingTab from "./BracketingTab";

/* ----------------------------- data ----------------------------- */

// TABS / TAB_SLUG / SLUG_TAB / Tab now live in ./tabs so the server page and this
// client component share one slug source. The tab itself lives in the URL.

// Overview folds its AI summary into OverviewTab's own panel, so it has no
// standalone insight here — hence insight is optional.
const TAB_META: Record<Tab, { description: string; insight?: React.ReactNode }> = {
  Overview: {
    description:
      "Everything the other four tabs conclude, totalled and ranked in one place — including the findings that only appear when two areas are read together.",
  },
  Bracketing: {
    description:
      "How customers order multiple sizes or colors of the same style to compare at home — and where that bracketing adds or erodes margin.",
    insight: (
      <>
        Color bracketing is almost always profitable — color-bracketed orders generate{" "}
        <span className="font-semibold text-neutral-800">$20–50 more revenue per order</span>{" "}
        than non-bracketed. Size bracketing, by contrast, breaks even or loses money across your top
        categories, so it&rsquo;s the lever with the most downside to manage.
      </>
    ),
  },
  Exchange: {
    description:
      "How often returns are recovered as same-style exchanges instead of lost sales, broken down by department.",
    insight: (
      <>
        Exchanges recover revenue that returns otherwise lose. A true same-style exchange keeps the
        sale, and departments with{" "}
        <span className="font-semibold text-neutral-800">
          low exchange rates or high re-return rates
        </span>{" "}
        are your biggest untapped opportunities — Light Hike and Running lead on size-exchange
        upside.
      </>
    ),
  },
  Segments: {
    description:
      "Actionable customer groups surfaced from return behavior — ready to filter by loyalty tier and export.",
    insight: (
      <>
        Your <span className="font-semibold text-neutral-800">836 unprofitable customers</span>{" "}alone
        account for $1.5M in return revenue at a 48% return rate. Overlaying them with the high
        return-rate and likely-reseller segments gives you a targeted list to act on before the cost
        compounds.
      </>
    ),
  },
  "Behavioral Flow": {
    description:
      "The full journey from how customers bracket, through what they keep, to whether they come back and what they buy next.",
    insight: (
      <>
        Customers who <span className="font-semibold text-neutral-800">keep all</span>{" "}of a bracketed
        order are far more valuable downstream — they repurchase at high rates and drive most net
        value into W Denim and W Tops. Those who return everything and don&rsquo;t come back are the
        clearest early churn signal to intervene on.
      </>
    ),
  },
};

/* ---------------------------- sections --------------------------- */

function Header() {
  return (
    <header className="flex flex-wrap items-start justify-between gap-4 bg-neutral-0 px-4 py-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-[36px] font-bold leading-tight text-neutral-800">Customers</h1>
        <p className="text-sm text-neutral-600">
          Understand customer behavior including bracketing, exchanges, and returns by department
        </p>
      </div>
    </header>
  );
}

function FilterBar({ tab }: { tab: Tab }) {
  return (
    <FilterBarProvider>
      <div className="flex flex-wrap items-center gap-3">
        <FilterSelect label="Brand" options={BRAND_OPTS} />
        <FilterSelect label="Country" options={COUNTRY_OPTS} />
        <FilterSelect label="Product Category" options={CATEGORY_OPTS} />
        {tab === "Behavioral Flow" ? (
          <>
            <FilterSelect label="Customer Type" options={CUSTOMER_TYPE_OPTS} />
            <FilterSelect label="1st Purchase Department" options={DEPARTMENT_OPTS} />
          </>
        ) : null}
        <FilterSelect label="Period" options={PERIOD_OPTS} />
        <div className="ml-auto flex shrink-0 items-center gap-3">
          <ApplyFiltersButton />
          <ResetFiltersButton />
        </div>
      </div>
    </FilterBarProvider>
  );
}

function TabBar({ tab, onChange }: { tab: Tab; onChange: (t: Tab) => void }) {
  return (
    <div className="w-full overflow-x-auto border-b border-neutral-200">
      <div className="flex min-w-max" role="tablist">
        {TABS.map((t) => {
          const active = t === tab;
          return (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t)}
              className="flex h-10 flex-col items-center"
            >
              <span className="flex flex-1 items-center px-3.5">
                <span
                  className={
                    active
                      ? "whitespace-nowrap text-[13px] font-semibold text-primary-600"
                      : "whitespace-nowrap text-[13px] font-medium text-neutral-600"
                  }
                >
                  {t}
                </span>
              </span>
              <span className={`h-0.5 w-full ${active ? "bg-primary-600" : ""}`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Copies the current URL — which now carries the tab — so a view can be
    forwarded to someone else. */
function CopyLinkButton() {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        } catch {
          /* clipboard blocked — nothing to do */
        }
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-neutral-200 bg-neutral-0 px-2.5 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 15l6-6M11 6l.8-.9a3.5 3.5 0 015 5l-2 2M13 18l-.8.9a3.5 3.5 0 01-5-5l2-2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {copied ? "Link copied" : "Copy link"}
    </button>
  );
}

/* ----------------------------- page ------------------------------ */

export default function CustomerContent({ initialTab }: { initialTab: Tab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // The URL is the source of truth. useSearchParams drives client transitions and
  // Back/Forward (the router owns popstate); initialTab is the server-resolved
  // value, used until useSearchParams has one so the first render matches the HTML.
  const slug = searchParams.get("tab");
  const tab: Tab = (slug && SLUG_TAB[slug]) || initialTab;

  // Drill-through carries a card to flash and the origin scroll to return to.
  const pendingAnchor = useRef<string | null>(null);
  const overviewScroll = useRef(0);
  const [returnFrom, setReturnFrom] = useState<Tab | null>(null);

  const navigate = (t: Tab) => router.push(`?tab=${TAB_SLUG[t]}`, { scroll: false });

  // Picking a tab by hand: a plain URL navigation, and a fresh intent, so any
  // pending "back to overview" offer is dropped.
  const selectTab = (t: Tab) => {
    setReturnFrom(null);
    navigate(t);
  };

  // Drill from Overview: navigate to the tab, remember where to return, and stash
  // the card to scroll to and flash once the new panel renders.
  const go = (next: string, anchor?: string) => {
    overviewScroll.current = window.scrollY;
    pendingAnchor.current = anchor ?? null;
    setReturnFrom(tab);
    navigate(next as Tab);
  };

  // Back button and the pill are the same thing now: step back in history, which
  // the router turns into the previous ?tab.
  const backToOverview = () => router.back();

  // One effect drives both directions of a drill, keyed on the URL-derived tab:
  // landing back where a drill started restores the scroll; landing on the target
  // scrolls to the card and flashes it.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (returnFrom && tab === returnFrom) {
      const y = overviewScroll.current;
      setReturnFrom(null);
      window.scrollTo({ top: y, behavior: "auto" });
      return;
    }

    const anchor = pendingAnchor.current;
    if (!anchor) return;
    pendingAnchor.current = null;
    const el = document.getElementById(anchor);
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    el.classList.remove("anchor-flash");
    // Reflow so the animation restarts even if the same card is revisited.
    void el.offsetWidth;
    el.classList.add("anchor-flash");
    window.setTimeout(() => el.classList.remove("anchor-flash"), 2600);
    // returnFrom is read but intentionally not a dep: this should fire on tab change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <ActionModalProvider>
      <div className="min-h-screen bg-neutral-0">
        <Header />
        <div className="flex flex-col gap-5 px-4 pb-24 pt-3.5">
          <FilterBar tab={tab} />
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0 flex-1">
              <TabBar tab={tab} onChange={selectTab} />
            </div>
            <CopyLinkButton />
          </div>
          {/* Bracketing and Exchange render their own insight box with the KPI
              strip folded in, so they are skipped here to avoid a second one.
              The rest fold the description into the box; Overview keeps a plain
              line since its AI section lives in OverviewTab. */}
          {tab === "Bracketing" || tab === "Exchange" ? null : TAB_META[tab].insight ? (
            <AiInsight title={`${tab} Insights`} subtitle={TAB_META[tab].description}>
              {TAB_META[tab].insight}
            </AiInsight>
          ) : (
            <p className="-mt-1 text-sm text-neutral-600">{TAB_META[tab].description}</p>
          )}
          {tab === "Overview" ? (
            <OverviewTab onGo={go} />
          ) : tab === "Bracketing" ? (
            <BracketingTab
              insight={TAB_META.Bracketing.insight}
              description={TAB_META.Bracketing.description}
            />
          ) : tab === "Exchange" ? (
            <ExchangeTab
              insight={TAB_META.Exchange.insight}
              description={TAB_META.Exchange.description}
            />
          ) : tab === "Segments" ? (
            <SegmentsTab />
          ) : (
            <BehavioralFlowTab />
          )}
        </div>
      </div>
      {returnFrom && tab !== returnFrom ? (
        <button
          type="button"
          onClick={backToOverview}
          className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-0 py-2 pl-3 pr-4 text-sm font-medium text-neutral-800 shadow-lg transition-colors hover:bg-neutral-50"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M19 12H5M11 18l-6-6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Back to overview
        </button>
      ) : null}
    </ActionModalProvider>
  );
}
