/**
 * Single source of truth for the Customers tabs and their URL slugs. Imported by
 * both the server page (to resolve ?tab into the panel it renders) and the client
 * content (to read and write the active tab), so slug literals live in one place.
 */

// "Briefing", not "Overview" — the global sidebar nav already has an Overview,
// and this tab synthesizes across the others rather than mirroring that page.
export const TABS = ["Briefing", "Bracketing", "Exchange", "Segments", "Behavioral Flow"] as const;
export type Tab = (typeof TABS)[number];

export const TAB_SLUG: Record<Tab, string> = {
  Briefing: "briefing",
  Bracketing: "bracketing",
  Exchange: "exchange",
  Segments: "segments",
  "Behavioral Flow": "behavioral-flow",
};

export const SLUG_TAB: Record<string, Tab> = {
  ...Object.fromEntries((Object.entries(TAB_SLUG) as [Tab, string][]).map(([t, s]) => [s, t])),
  // Legacy alias: links to the old ?tab=overview still resolve to Briefing.
  overview: "Briefing",
};

/** Validate a raw ?tab value against the allowlist; anything unknown → Briefing. */
export function resolveTab(slug?: string | string[] | null): Tab {
  return typeof slug === "string" && SLUG_TAB[slug] ? SLUG_TAB[slug] : "Briefing";
}
