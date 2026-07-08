"use client";

import { useState } from "react";

/* ----------------------------- data ----------------------------- */

type Member = {
  name: string;
  email: string;
  position: string;
  team: string;
  status: string;
  lastLogin: string;
  credits: number;
  creditPct: number;
};

const MEMBERS: Member[] = [
  { name: "Jason Wilfork", email: "jasonwilfork@jcrew.com", position: "Merchandising Manager", team: "F Jeans", status: "Active", lastLogin: "11/02/2025", credits: 260, creditPct: 8 },
  { name: "Naomi Watts", email: "naomiwatts@jcrew.com", position: "Inventory Analyst", team: "G Suits", status: "Active", lastLogin: "11/03/2025", credits: 260, creditPct: 8 },
  { name: "Ricardo Gale", email: "ricardogale@jcrew.com", position: "Product Manager", team: "H Tees", status: "Active", lastLogin: "11/04/2025", credits: 260, creditPct: 8 },
  { name: "Elenore Fendt", email: "elenorefendt@jcrew.com", position: "Supply Chain Manager", team: "I Outerwear", status: "Active", lastLogin: "11/05/2025", credits: 260, creditPct: 8 },
  { name: "Ernie Branch", email: "erniebranch@jcrew.com", position: "Logistics Coordinator", team: "J Accessories", status: "Active", lastLogin: "11/06/2025", credits: 260, creditPct: 8 },
  { name: "Pete Seager", email: "peteseager@jcrew.com", position: "Marketing Manager", team: "K Shoes", status: "Active", lastLogin: "11/07/2025", credits: 260, creditPct: 8 },
  { name: "Della Reese", email: "dellareese@jcrew.com", position: "Sales Director", team: "L Intimates", status: "Active", lastLogin: "11/08/2025", credits: 260, creditPct: 8 },
  { name: "Lana Kane", email: "lanakane@jcrew.com", position: "Customer Service Manager", team: "M Swim", status: "Active", lastLogin: "11/09/2025", credits: 260, creditPct: 8 },
  { name: "Sterling Archer", email: "sterlingarcher@jcrew.com", position: "Returns Analyst", team: "N Suiting", status: "Active", lastLogin: "11/10/2025", credits: 260, creditPct: 8 },
  { name: "Cyril Figgis", email: "cyrilfiggis@jcrew.com", position: "Data Analyst", team: "O Loungewear", status: "Active", lastLogin: "11/11/2025", credits: 260, creditPct: 8 },
  { name: "Pam Poovey", email: "pampoovey@jcrew.com", position: "Financial Analyst", team: "P Activewear", status: "Active", lastLogin: "11/12/2025", credits: 260, creditPct: 8 },
];

const AVATAR_COLORS = [
  "bg-primary-100 text-primary-700",
  "bg-success-50 text-success-600",
  "bg-neutral-100 text-neutral-700",
  "bg-primary-50 text-primary-600",
];

/* --------------------------- primitives -------------------------- */

function Avatar({ name, index }: { name: string; index: number }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("");
  return (
    <span
      className={`flex size-11 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
    >
      {initials}
    </span>
  );
}

function Checkbox() {
  return (
    <span className="block size-[18px] rounded-[4px] border border-neutral-400 bg-white" />
  );
}

function KebabIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="5.5" r="1.6" fill="#454545" />
      <circle cx="12" cy="12" r="1.6" fill="#454545" />
      <circle cx="12" cy="18.5" r="1.6" fill="#454545" />
    </svg>
  );
}

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 4v16M8 20l-3.5-3.5M8 20l3.5-3.5" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 20V4M16 4l-3.5 3.5M16 4l3.5 3.5" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="#ababab" strokeWidth="1.8" />
      <path d="M16.5 16.5L21 21" stroke="#ababab" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PersonAddIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="10" cy="8" r="3.4" stroke="white" strokeWidth="1.7" />
      <path d="M3.5 19.5c.7-3 3.4-5 6.5-5s5.8 2 6.5 5" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
      <path d="M19 8v6M16 11h6" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function GroupIcon({ active }: { active: boolean }) {
  const stroke = active ? "#3457c9" : "#454545";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="3" stroke={stroke} strokeWidth="1.7" />
      <path d="M3 19c.6-2.7 3-4.5 6-4.5s5.4 1.8 6 4.5" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M16 6.2a3 3 0 010 5.6M18.5 14.7c1.4.7 2.4 1.9 2.8 3.6" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function TollIcon({ active }: { active: boolean }) {
  const stroke = active ? "#3457c9" : "#454545";
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="14.5" cy="12" r="7" stroke={stroke} strokeWidth="1.7" />
      <path d="M9.5 5.4a7 7 0 000 13.2" stroke={stroke} strokeWidth="1.7" strokeLinecap="round" strokeDasharray="2.6 2.6" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#8a8a8a" />
      <path d="M12 10.5v6M12 7.2v.2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function UpArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V6M12 6l-4.5 4.5M12 6l4.5 4.5M5 3.5h14" stroke="#4169e1" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProgressBar({ pct, className }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-neutral-100 ${className ?? ""}`}>
      <div
        className="h-full rounded-full bg-primary-600"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function HeadCell({ label }: { label: string }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 px-4">
      <span className="text-sm text-neutral-800">{label}</span>
      <SortIcon />
    </div>
  );
}

/* ---------------------------- sections --------------------------- */

function Header() {
  return (
    <header className="flex items-center justify-between bg-neutral-0 px-4 py-6">
      <div>
        <h1 className="text-4xl font-bold text-neutral-800">Admin</h1>
        <p className="text-sm text-neutral-800">Manage team members and AI credits</p>
      </div>
      <button
        type="button"
        aria-label="More options"
        className="flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50"
      >
        <KebabIcon />
      </button>
    </header>
  );
}

type Tab = "team" | "credits";

function TabBar({ tab, onChange }: { tab: Tab; onChange: (tab: Tab) => void }) {
  const tabs: { id: Tab; label: string; icon: (active: boolean) => React.ReactNode }[] = [
    { id: "team", label: "Team members", icon: (active) => <GroupIcon active={active} /> },
    { id: "credits", label: "AI credits", icon: (active) => <TollIcon active={active} /> },
  ];
  return (
    <div className="w-full border-b border-neutral-200">
      <div className="flex" role="tablist">
        {tabs.map(({ id, label, icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              onClick={() => onChange(id)}
              aria-selected={active}
              className="flex h-10 flex-col items-center"
            >
              <span className="flex flex-1 items-center gap-1.5 px-3.5">
                {icon(active)}
                <span
                  className={
                    active
                      ? "text-[13px] font-semibold text-primary-700"
                      : "text-[13px] font-medium text-neutral-700"
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
  );
}

function TeamMembersTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xl">
          <span className="text-neutral-700">All members:</span>{" "}
          <span className="text-neutral-800">76</span>
        </p>
        <div className="flex items-center gap-6">
          <label className="flex h-10 w-[300px] items-center gap-2 rounded-lg border border-neutral-200 bg-white pl-3 pr-2.5">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search name, email address, team..."
              className="min-w-0 flex-1 bg-transparent text-sm text-neutral-800 outline-none placeholder:text-neutral-400"
            />
          </label>
          <button
            type="button"
            className="flex h-10 items-center gap-1 rounded-lg bg-primary-600 px-4 text-sm font-medium text-white hover:bg-primary-700"
          >
            Add member
            <PersonAddIcon />
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex h-[46px] items-center gap-2 border-t border-primary-50 bg-neutral-50">
          <span className="flex w-12 shrink-0 justify-center">
            <Checkbox />
          </span>
          <span className="w-[71px] shrink-0" />
          <HeadCell label="Name" />
          <HeadCell label="Position" />
          <HeadCell label="Team" />
          <HeadCell label="Status" />
          <HeadCell label="Last Login" />
          <span className="w-[71px] shrink-0" />
        </div>
        {MEMBERS.map((member, i) => (
          <div
            key={member.email}
            className="flex h-[68px] items-center gap-2 border-b border-primary-50"
          >
            <span className="flex w-12 shrink-0 justify-center">
              <Checkbox />
            </span>
            <span className="flex w-[71px] shrink-0 justify-center">
              <Avatar name={member.name} index={i} />
            </span>
            <div className="min-w-0 flex-1 px-4 text-sm">
              <p className="truncate font-semibold text-neutral-800">{member.name}</p>
              <p className="truncate text-neutral-700">{member.email}</p>
            </div>
            <p className="min-w-0 flex-1 truncate px-4 text-sm text-neutral-700">
              {member.position}
            </p>
            <p className="min-w-0 flex-1 truncate px-4 text-sm text-neutral-700">
              {member.team}
            </p>
            <p className="min-w-0 flex-1 truncate px-4 text-sm text-neutral-700">
              {member.status}
            </p>
            <p className="min-w-0 flex-1 truncate px-4 text-sm text-neutral-700">
              {member.lastLogin}
            </p>
            <button
              type="button"
              aria-label={`Actions for ${member.name}`}
              className="flex w-[71px] shrink-0 justify-center"
            >
              <KebabIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AiCreditsTab() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-4">
          <div className="flex items-center gap-1">
            <span className="text-xs text-neutral-500">Total credit usage</span>
            <InfoIcon />
          </div>
          <p className="text-[28px] leading-tight">
            <span className="font-bold text-neutral-800">5,000 used</span>{" "}
            <span className="text-neutral-400">/ 12,500 total</span>
          </p>
          <ProgressBar pct={40} className="w-full" />
        </div>
        <div className="flex w-[424px] shrink-0 flex-col gap-2 rounded-lg border border-neutral-200 bg-white px-4 py-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-500">Plan details</span>
            <a
              href="#"
              className="flex items-center gap-1 text-sm font-medium text-primary-600 underline"
            >
              Get more credits
              <UpArrowIcon />
            </a>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-2xl leading-tight">
              <span className="font-bold text-neutral-800">12,500 credits</span>{" "}
              <span className="text-sm text-neutral-500">/ Year</span>
            </p>
            <p className="text-sm text-neutral-500">Reset: Sept 3, 2026</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex h-[46px] items-center gap-2 border-t border-primary-50 bg-neutral-50">
          <span className="flex w-12 shrink-0 justify-center">
            <Checkbox />
          </span>
          <span className="w-[71px] shrink-0" />
          <HeadCell label="Name" />
          <HeadCell label="Position" />
          <div className="flex min-w-0 flex-[1.4] items-center gap-1 px-4">
            <span className="text-sm text-neutral-800">Credit usage</span>
            <SortIcon />
          </div>
          <span className="w-[71px] shrink-0" />
        </div>
        {MEMBERS.slice(0, 9).map((member, i) => (
          <div
            key={member.email}
            className="flex h-[68px] items-center gap-2 border-b border-primary-50"
          >
            <span className="flex w-12 shrink-0 justify-center">
              <Checkbox />
            </span>
            <span className="flex w-[71px] shrink-0 justify-center">
              <Avatar name={member.name} index={i} />
            </span>
            <div className="min-w-0 flex-1 px-4 text-sm">
              <p className="truncate font-semibold text-neutral-800">{member.name}</p>
              <p className="truncate text-neutral-700">{member.email}</p>
            </div>
            <p className="min-w-0 flex-1 truncate px-4 text-sm text-neutral-700">
              {member.position}
            </p>
            <div className="flex min-w-0 flex-[1.4] items-center gap-4 px-4">
              <ProgressBar pct={member.creditPct * 4} className="w-[170px] shrink-0" />
              <span className="whitespace-nowrap text-sm text-neutral-700">
                {member.credits} credits / {member.creditPct}%
              </span>
            </div>
            <button
              type="button"
              aria-label={`Actions for ${member.name}`}
              className="flex w-[71px] shrink-0 justify-center"
            >
              <KebabIcon />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ----------------------------- page ----------------------------- */

export default function AdminContent() {
  const [tab, setTab] = useState<Tab>("team");
  return (
    <div className="flex flex-col gap-4 px-4 pb-10">
      <Header />
      <TabBar tab={tab} onChange={setTab} />
      {tab === "team" ? <TeamMembersTab /> : <AiCreditsTab />}
    </div>
  );
}
