"use client";

import { Modal } from "../shared/overlays";
import { Avatar, ProductScope } from "./ActionDetail";

const LOREM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";

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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm text-neutral-700">
      {label}
      {children}
    </label>
  );
}

function SelectBox({ children }: { children: React.ReactNode }) {
  return (
    <span className="flex h-11 items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800">
      {children}
      <Chevron />
    </span>
  );
}

function DateBox({ value }: { value: string }) {
  return (
    <span className="flex h-11 items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800">
      {value}
      <CalendarIcon />
    </span>
  );
}

export default function CreateActionModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} label="Create new action">
      <div className="flex items-center justify-between border-b border-neutral-200 px-6 py-4">
        <h1 className="text-xl font-bold text-neutral-800">Create New Action</h1>
        <button type="button" aria-label="Close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        <Field label="Name">
          <input
            type="text"
            placeholder="Action Name"
            className="h-11 rounded-lg border border-neutral-200 bg-white px-3 text-sm text-neutral-800 placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary-600/40"
          />
        </Field>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Field label="Brand">
            <SelectBox>Acme</SelectBox>
          </Field>
          <Field label="Region">
            <SelectBox>US</SelectBox>
          </Field>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Field label="Channel">
            <SelectBox>Web</SelectBox>
          </Field>
          <Field label="Department">
            <SelectBox>Women&rsquo;s Sweaters</SelectBox>
          </Field>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
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
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Field label="Date Completed">
            <DateBox value="12/13/2026" />
          </Field>
          <span className="hidden min-w-0 flex-1 sm:block" />
        </div>
        <Field label="Description">
          <textarea
            rows={6}
            defaultValue={LOREM}
            className="resize-none rounded-lg border border-neutral-200 bg-white p-3 text-sm leading-5 text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-600/40"
          />
        </Field>
        <ProductScope plain />
        <div className="flex items-center justify-end gap-5">
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-medium text-primary-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 items-center rounded-lg bg-primary-600 px-4 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Create Action
          </button>
        </div>
      </div>
    </Modal>
  );
}
