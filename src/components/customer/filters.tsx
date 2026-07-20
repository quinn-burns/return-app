"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FilterButton } from "../overview/Buttons";

export const BRAND_OPTS = ["All Brands", "Caterpillar", "Chaco", "Merrell", "Saucony", "Wolverine"];
export const COUNTRY_OPTS = ["All Countries", "UK", "US"];
export const CATEGORY_OPTS = [
  "All Product Categories", "Accessories", "All Other", "Alloy Toe", "Apparel", "Boots", "Bottoms",
  "Canyon", "Carbon Composite Toe", "Casual", "Casual Bottoms", "Casual Jackets", "Casual Tops",
  "Composite Toe", "Cush", "Custom", "Fields", "Flame Resistant", "Gift Card", "Heritage",
  "Hydro Hike", "Licensed", "Light Hike", "Lowdown", "Mid Layers", "Non-Footwear", "Non-Licensed",
  "None", "Originals", "Outerwear", "Pack Hike", "Performance Bottoms", "Performance Jackets",
  "Performance Tops", "Pro", "Ramble", "Rapid Pro", "Rugged Outdoor", "Running", "Sandals", "Shirts",
  "Shoes", "Slippers", "Sneakers", "Socks", "Soft Toe", "Steel Toe", "Tactical", "Tech",
  "Trail Running", "Training", "Utility", "Walking", "Winter Casual", "Winter Hike", "Z",
];
export const CUSTOMER_TYPE_OPTS = ["All Customers", "New", "Existing"];
export const DEPARTMENT_OPTS = ["All Departments", ...CATEGORY_OPTS.slice(1)];
export const PERIOD_OPTS = [
  "Rolling 12 Months", "Rolling 90 Days", "Rolling 30 Days", "Year to Date",
];

/**
 * Shared state for one filter bar: tracks whether any select differs from its
 * preset (so Apply Filters can light up) and lets Reset clear them all.
 */
type FilterBarCtx = {
  report: (id: string, nonDefault: boolean) => void;
  resetSignal: number;
  pending: boolean;
  anyDirty: boolean;
  apply: () => void;
  reset: () => void;
};
const FilterBarContext = createContext<FilterBarCtx | null>(null);

export function FilterBarProvider({ children }: { children: ReactNode }) {
  const [dirty, setDirty] = useState<Record<string, boolean>>({});
  const [pending, setPending] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const report = useCallback((id: string, nonDefault: boolean) => {
    setDirty((prev) => (prev[id] === nonDefault ? prev : { ...prev, [id]: nonDefault }));
    setPending(true);
  }, []);
  const apply = useCallback(() => setPending(false), []);
  const reset = useCallback(() => {
    setDirty({});
    setPending(false);
    setResetSignal((s) => s + 1);
  }, []);
  const anyDirty = useMemo(() => Object.values(dirty).some(Boolean), [dirty]);
  const value = useMemo(
    () => ({ report, resetSignal, pending, anyDirty, apply, reset }),
    [report, resetSignal, pending, anyDirty, apply, reset],
  );
  return <FilterBarContext.Provider value={value}>{children}</FilterBarContext.Provider>;
}

/** Apply Filters lights up primary once a real filter is chosen. */
export function ApplyFiltersButton() {
  const ctx = useContext(FilterBarContext);
  return (
    <FilterButton label="Apply Filters" disabled={!ctx?.pending} onClick={() => ctx?.apply()} />
  );
}

export function ResetFiltersButton() {
  const ctx = useContext(FilterBarContext);
  return <FilterButton label="Reset" disabled={!ctx?.anyDirty} onClick={() => ctx?.reset()} />;
}

/**
 * Working select styled to match the static FilterDropdown used on Overview,
 * so every filter bar in the app reads the same. The label names the control
 * for assistive tech; the option text ("All Brands") is the visible label.
 */
export function FilterSelect({ label, options }: { label: string; options: string[] }) {
  const [value, setValue] = useState(options[0]);
  const ctx = useContext(FilterBarContext);
  // Snap back to the preset when the surrounding bar is reset.
  useEffect(() => {
    setValue(options[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx?.resetSignal]);
  return (
    <div className="relative flex h-10 min-w-[160px] flex-1">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          ctx?.report(label, e.target.value !== options[0]);
        }}
        className="h-10 w-full appearance-none truncate rounded-lg border border-neutral-200 bg-neutral-0 pl-3 pr-9 text-sm text-neutral-800 transition-colors hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-primary-600/40"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        aria-hidden="true"
      >
        <path d="M1 1l4 4 4-4" stroke="#8a8a8a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
