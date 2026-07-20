"use client";

import { useEffect, useState } from "react";
import { FilterDropdown, IconButton } from "../overview/Buttons";
import {
  BRAND_OPTS,
  PERIOD_OPTS,
  FilterSelect,
  FilterBarProvider,
  ApplyFiltersButton,
  ResetFiltersButton,
} from "../customer/filters";
import { SUBMITTED_ACTIONS_KEY, type SubmittedAction } from "../customer/ActionSubmit";
import CustomizeMenu from "../overview/CustomizeMenu";
import ActionDetail from "./ActionDetail";
import CreateActionModal from "./CreateActionModal";

/* ----------------------------- data ----------------------------- */

// Brand and period are real selects; the rest stay static for now.
const FILTERS = ["All Regions", "All Channels", "All Categories"];

type Kind = "Action" | "Task";
type Card = {
  id: string;
  kind: Kind;
  title: string;
  desc: string;
  assignee: string;
  count?: number;
  value: string;
};

const DESC =
  "The Drop Waist Dress in smaller sizes is too long for some customers. Customers are ...";

function makeCards(kinds: Kind[]): Card[] {
  return kinds.map((kind, i) => ({
    id: String(12 + i).padStart(3, "0"),
    kind,
    title: "Update PDP Size & Fit Guidance",
    desc: DESC,
    assignee: "AJ",
    count: kind === "Action" ? 2 : undefined,
    value: "$850k",
  }));
}

const COLUMNS: { title: string; count: number; cards: Card[] }[] = [
  { title: "To Do", count: 24, cards: makeCards(["Action", "Task", "Action", "Task"]) },
  { title: "In Progress", count: 10, cards: makeCards(["Action", "Task", "Action", "Task"]) },
  { title: "Done", count: 6, cards: makeCards(["Action", "Task", "Action", "Task"]) },
];

/* --------------------------- primitives -------------------------- */

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="#ababab" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="#ababab" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="#8a8a8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChecklistBadge({ count }: { count: number }) {
  return (
    <span className="flex h-10 w-[57px] items-center justify-center gap-1 rounded-lg border border-neutral-200 bg-white text-xs text-neutral-600">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 6l2 2 3-3M4 13l2 2 3-3M4 20l2 2 3-3M12 6h8M12 13h8M12 20h8" stroke="#676767" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {count}
    </span>
  );
}

function BranchBadge() {
  return (
    <span className="flex h-10 w-[57px] items-center justify-center rounded-lg border border-neutral-200 bg-white">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="5" r="2.2" stroke="#676767" strokeWidth="1.6" />
        <circle cx="6" cy="19" r="2.2" stroke="#676767" strokeWidth="1.6" />
        <circle cx="18" cy="9" r="2.2" stroke="#676767" strokeWidth="1.6" />
        <path d="M6 7.2v9.6M6 12h6a4 4 0 004-4v-.8" stroke="#676767" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function ActionCard({
  card,
  status,
  onSelect,
}: {
  card: Card;
  status: string;
  onSelect: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className="flex cursor-pointer flex-col gap-3 rounded-lg border border-neutral-200 bg-neutral-0 p-4 text-left transition-colors hover:border-primary-400 focus-visible:ring-2 focus-visible:ring-primary-600/40"
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-600">{card.id}</span>
            <span className="rounded-sm bg-primary-100 px-1 text-xs font-bold text-primary-500">
              {card.kind}
            </span>
          </div>
          <span className="text-xs font-bold text-neutral-600">{status}</span>
        </div>
        <p className="text-base font-medium text-neutral-800">{card.title}</p>
        <p className="line-clamp-2 text-sm leading-5 text-neutral-600">{card.desc}</p>
      </div>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-10 items-center justify-center rounded-full bg-primary-100 text-xs text-primary-600">
            {card.assignee}
          </span>
          {card.count != null ? <ChecklistBadge count={card.count} /> : <BranchBadge />}
        </div>
        <span className="flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-success-50 px-3 text-xs font-bold text-neutral-800">
          {card.value}
        </span>
      </div>
    </div>
  );
}

/* ---------------------------- sections --------------------------- */

function Header() {
  return (
    <header className="flex items-center justify-between bg-neutral-0 px-4 py-6">
      <div className="flex flex-col justify-center">
        <h1 className="text-[36px] font-bold leading-tight text-neutral-800">Actions</h1>
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

function Toolbar({ onAddAction }: { onAddAction: () => void }) {
  const secondaryBtn =
    "flex h-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-0 px-4 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50";
  const dd =
    "flex h-10 w-[162px] items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 pl-3 pr-2.5 text-sm text-neutral-700";
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onAddAction}
          className="flex h-10 items-center justify-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700"
        >
          Add Action
        </button>
        <button type="button" className={secondaryBtn}>Won&rsquo;t Do List</button>
        <button type="button" className={secondaryBtn}>My Actions</button>
        <button type="button" className={dd}>
          Assigned To <Chevron />
        </button>
        <button type="button" className={dd}>
          User Department <Chevron />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/overview/info.svg" alt="More info" className="size-4" />
      </div>
      <div className="flex h-10 w-full max-w-[300px] items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-0 pl-3 pr-2.5">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search..."
          className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
        />
      </div>
    </div>
  );
}

/* ----------------------------- page ------------------------------ */

export default function ActionsContent() {
  const [detailOpen, setDetailOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [submitted, setSubmitted] = useState<Card[]>([]);

  // Actions submitted from the Customer insights pages land in "To Do".
  useEffect(() => {
    try {
      const raw: SubmittedAction[] = JSON.parse(
        localStorage.getItem(SUBMITTED_ACTIONS_KEY) || "[]",
      );
      setSubmitted(
        raw.map((s) => ({
          id: s.id,
          kind: "Action" as Kind,
          title: s.title,
          desc: s.notes || `Submitted from ${s.context} · ${s.department}`,
          assignee:
            (s.owner || "")
              .split(" ")
              .map((w) => w[0])
              .filter(Boolean)
              .slice(0, 2)
              .join("") || "—",
          value: "New",
        })),
      );
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <div className="min-h-screen bg-neutral-0">
      <Header />
      <div className="page-enter flex flex-col gap-5 px-4 pb-10 pt-3.5">
        <FilterBar />
        <Toolbar onAddAction={() => setCreateOpen(true)} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {COLUMNS.map((col) => {
            const cards =
              col.title === "To Do" ? [...submitted, ...col.cards] : col.cards;
            const count = col.title === "To Do" ? col.count + submitted.length : col.count;
            return (
              <div key={col.title} className="flex flex-col gap-4">
                <h2 className="px-1 text-xl font-semibold text-neutral-800">
                  {col.title} ({count})
                </h2>
                {cards.map((card, i) => (
                  <ActionCard
                    key={`${card.id}-${i}`}
                    card={card}
                    status={col.title === "To Do" ? "To do" : col.title}
                    onSelect={() => setDetailOpen(true)}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      <ActionDetail
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title="Cozy Winter Styles Have 20.7% Return Rate"
        sku="CN297"
      />
      <CreateActionModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </div>
  );
}
