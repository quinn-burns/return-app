"use client";

import { BackButton, Sheet, SheetHeaderActions } from "../shared/overlays";

/* ----------------------------- data ----------------------------- */

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

const TASKS = [
  { name: "Update PDP Size & Fit Guidance", id: "T302" },
  { name: "Update Material Descriptions", id: "T507" },
];

/* --------------------------- primitives -------------------------- */

function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path d="M1 1l4 4 4-4" stroke="#8a8a8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" stroke="#8a8a8a" strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3v4M16 3v4" stroke="#8a8a8a" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Avatar({ name, size = 24 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-medium text-primary-600"
      style={{ width: size, height: size, fontSize: size * 0.38 }}
    >
      {initials}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-xs text-neutral-600">
      {label}
      {children}
    </label>
  );
}

function SelectBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-10 items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800">
      {children}
      <Chevron />
    </span>
  );
}

function DateBox({ value }: { value: string }) {
  return (
    <span className="flex h-10 items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800">
      {value}
      <CalendarIcon />
    </span>
  );
}

function StatusPill() {
  return (
    <button
      type="button"
      className="flex h-7 items-center gap-1.5 rounded-full bg-success-50 px-3 text-xs font-medium text-success-600"
    >
      In Progress
      <Chevron />
    </button>
  );
}

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-xl border border-neutral-200 bg-white p-4 ${className}`}>
      {children}
    </section>
  );
}

export function ScopeTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-1.5 rounded bg-success-50 px-2 py-1 text-xs font-medium text-success-600">
      {children}
      <button type="button" aria-label="Remove">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M1.5 1.5l7 7m0-7l-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
    </span>
  );
}

export function ProductScope({ plain = false }: { plain?: boolean }) {
  const body = (
    <>
      <p className="text-sm text-neutral-600">Product / Style ID</p>
      <div className="mt-1.5 flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 bg-white p-2">
        <ScopeTag>SLIM-FIT-2847</ScopeTag>
        <ScopeTag>SLIM-FIT-2847</ScopeTag>
        <button
          type="button"
          className="flex items-center gap-1 rounded-full border border-primary-400 px-2.5 py-1 text-xs font-medium text-primary-600"
        >
          Add +
        </button>
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        If no products are added to this list, the action will apply to the entire filter set
      </p>
    </>
  );
  if (plain) {
    return (
      <div className="rounded-xl border border-neutral-200 p-4">
        <h2 className="text-lg font-bold text-neutral-800">Product Scope</h2>
        <div className="mt-2">{body}</div>
      </div>
    );
  }
  return (
    <Card>
      <h2 className="flex items-center gap-2 text-base font-semibold text-neutral-800">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.5" stroke="#4169e1" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="4.5" stroke="#4169e1" strokeWidth="1.6" />
          <circle cx="12" cy="12" r="1.2" fill="#4169e1" />
        </svg>
        Product Scope
      </h2>
      <div className="mt-3">{body}</div>
    </Card>
  );
}

/* ---------------------------- sections --------------------------- */

function DetailsCard() {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="flex gap-16">
          <div className="flex flex-col gap-1.5 text-xs text-neutral-600">
            Returns Driver
            <a href="#" className="text-sm font-medium text-success-600">
              CN297
            </a>
          </div>
          <div className="flex flex-col items-start gap-1.5 text-xs text-neutral-600">
            Status
            <StatusPill />
          </div>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <Field label="Brand">
            <SelectBox>Acme</SelectBox>
          </Field>
          <Field label="Region">
            <SelectBox>US</SelectBox>
          </Field>
          <Field label="Channel">
            <SelectBox>Web</SelectBox>
          </Field>
          <Field label="Department">
            <SelectBox>Women&rsquo;s Sweaters</SelectBox>
          </Field>
        </div>
        <div className="flex flex-col gap-4 md:flex-row">
          <Field label="Assignee">
            <SelectBox>
              <span className="flex items-center gap-2">
                <Avatar name="Brandon Woods" size={22} />
                Brandon Woods
              </span>
            </SelectBox>
          </Field>
          <Field label="Date started">
            <DateBox value="12/13/2026" />
          </Field>
          <Field label="Date Completed">
            <DateBox value="12/13/2026" />
          </Field>
          <span className="hidden min-w-0 flex-1 md:block" />
        </div>
        <Field label="Description">
          <textarea
            readOnly
            rows={5}
            defaultValue={LOREM}
            className="resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm leading-5 text-neutral-700 focus:outline-none"
          />
        </Field>
      </div>
    </Card>
  );
}

function TasksCard() {
  return (
    <Card>
      <h2 className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-base font-semibold text-neutral-800">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4" y="3" width="16" height="18" rx="2" stroke="#4169e1" strokeWidth="1.6" />
          <path d="M8 8h8M8 12h8M8 16h5" stroke="#4169e1" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Tasks
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead>
            <tr className="text-neutral-600">
              <th className="py-3 pr-3 font-normal">Tasks</th>
              <th className="px-3 py-3 font-normal">TaskID</th>
              <th className="px-3 py-3 font-normal">Assigned To</th>
              <th className="px-3 py-3 font-normal">Rate</th>
              <th className="py-3 pl-3 font-normal">Date Completed</th>
            </tr>
          </thead>
          <tbody>
            {TASKS.map((t) => (
              <tr key={t.id} className="border-t border-primary-50">
                <td className="py-4 pr-3 font-semibold text-neutral-800">{t.name}</td>
                <td className="px-3 py-4 text-neutral-700">{t.id}</td>
                <td className="px-3 py-4">
                  <span className="flex items-center gap-2 text-neutral-700">
                    <Avatar name="Brandon Woods" />
                    Brandon Woods
                  </span>
                </td>
                <td className="px-3 py-4">
                  <span className="rounded-full bg-success-50 px-2.5 py-1 text-xs font-medium text-success-600">
                    In Progress
                  </span>
                </td>
                <td className="py-4 pl-3 text-neutral-700">12/13/2026</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        type="button"
        className="mt-2 flex h-9 items-center rounded-lg border border-primary-400 px-3.5 text-sm font-medium text-primary-600 transition-colors hover:bg-primary-50"
      >
        Add Linked Task +
      </button>
    </Card>
  );
}

function Comment({ nested = false }: { nested?: boolean }) {
  return (
    <div className={nested ? "ml-10" : ""}>
      <p className="flex items-center gap-2 text-sm">
        <Avatar name="Brandon Woods" size={22} />
        <span className="font-semibold text-neutral-800">Brandon Woods</span>
        <span className="text-neutral-500">· 1 hour ago</span>
      </p>
      <p className="mt-1.5 text-sm leading-5 text-neutral-700">{LOREM}</p>
      {!nested && (
        <button
          type="button"
          className="mt-2 flex items-center gap-1 rounded-full border border-primary-400 px-2.5 py-1 text-xs font-medium text-primary-600"
        >
          Reply
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 14L4 9l5-5M4 9h10a6 6 0 016 6v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
    </div>
  );
}

function CommentsCard() {
  return (
    <Card>
      <h2 className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-base font-semibold text-neutral-800">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M21 12a8 8 0 01-8 8H4l1.5-3A8 8 0 1121 12z" stroke="#4169e1" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8 10h8M8 14h5" stroke="#4169e1" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        Comments
        <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs font-medium text-neutral-700">
          8
        </span>
      </h2>
      <div className="mt-4 flex flex-col gap-5">
        <Comment />
        <Comment />
        <Comment />
        <Comment nested />
      </div>
      <div className="mt-5 flex items-start gap-2 rounded-lg border border-neutral-200 p-3">
        <Avatar name="Brandon Woods" size={22} />
        <input
          type="text"
          placeholder="Add comment..."
          className="h-16 min-w-0 flex-1 bg-transparent text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none"
        />
        <button type="button" aria-label="Send comment" className="self-end text-primary-600">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M3 20l18-8L3 4v6l12 2-12 2v6z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </Card>
  );
}

/* ----------------------------- sheet ----------------------------- */

export default function ActionDetail({
  open,
  onClose,
  title,
  sku,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  sku: string;
}) {
  return (
    <Sheet open={open} onClose={onClose} label={`${sku} action details`}>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center justify-between">
          <BackButton onClick={onClose} />
          <SheetHeaderActions />
        </div>
        <div>
          <h1 className="text-xl font-bold text-neutral-800">{title}</h1>
          <p className="mt-1 flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-500">{sku}</span>
            <span className="rounded bg-primary-100 px-1.5 py-0.5 text-xs font-bold text-primary-500">
              Action
            </span>
          </p>
        </div>
        <DetailsCard />
        <TasksCard />
        <ProductScope />
        <CommentsCard />
      </div>
    </Sheet>
  );
}
