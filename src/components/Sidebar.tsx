"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  label: string;
  icon: string; // file name in /public/nav
  href: string;
  badge?: number;
};

const MAIN_ITEMS: NavItem[] = [
  { label: "Overview", icon: "dashboard", href: "/" },
  { label: "Returns Drivers", icon: "lightbulb", href: "/returns-drivers" },
  { label: "Actions", icon: "lists", href: "/actions" },
  { label: "My Workspace", icon: "team-dashboard", href: "/workspace" },
  { label: "Products", icon: "shopping-bag", href: "/products" },
  { label: "Data Explorer", icon: "database", href: "/data-explorer" },
  { label: "Reports", icon: "assignment", href: "/reports" },
];

const UTILITY_ITEMS: NavItem[] = [
  { label: "Help Center", icon: "help", href: "/help" },
  { label: "Admin", icon: "admin", href: "/admin" },
  { label: "Notifications", icon: "notifications", href: "/notifications", badge: 3 },
  { label: "My Account", icon: "account-circle", href: "/account" },
];

function NavLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const selected =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={selected ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={[
        "flex h-10 w-full items-center rounded-lg p-2 transition-colors",
        collapsed ? "justify-center" : "gap-1",
        selected
          ? "bg-primary-100"
          : "hover:bg-neutral-100 focus-visible:bg-neutral-100",
        "outline-none focus-visible:ring-2 focus-visible:ring-primary-600/40",
      ].join(" ")}
    >
      <span className="relative flex shrink-0 items-center justify-center">
        <span
          aria-hidden="true"
          className="size-6"
          style={{
            backgroundColor: selected
              ? "var(--color-primary-600)"
              : "var(--color-neutral-700)",
            maskImage: `url(/nav/${item.icon}.svg)`,
            WebkitMaskImage: `url(/nav/${item.icon}.svg)`,
            maskSize: "contain",
            WebkitMaskSize: "contain",
            maskRepeat: "no-repeat",
            WebkitMaskRepeat: "no-repeat",
            maskPosition: "center",
            WebkitMaskPosition: "center",
          }}
        />
        {collapsed && item.badge ? (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-error-600 text-[12px] leading-none text-white">
            {item.badge}
          </span>
        ) : null}
      </span>
      {!collapsed && (
        <span
          className={[
            "whitespace-nowrap text-sm",
            selected
              ? "font-medium text-primary-600"
              : "font-normal text-neutral-700",
          ].join(" ")}
        >
          {item.label}
        </span>
      )}
      {!collapsed && item.badge ? (
        <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-error-600 text-[12px] leading-none text-white">
          {item.badge}
        </span>
      ) : null}
    </Link>
  );
}

function AiCreditUsage({ collapsed }: { collapsed?: boolean }) {
  if (collapsed) {
    return (
      <div className="flex h-[60px] w-full flex-col items-center justify-between overflow-hidden rounded-lg bg-neutral-0 px-1 py-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/nav/sparkle.svg" alt="AI credit usage" className="size-4" />
        <span className="text-[12px] font-bold text-neutral-800">78%</span>
        <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-1 rounded-full bg-primary-600" style={{ width: "78%" }} />
        </div>
      </div>
    );
  }
  return (
    <div className="h-[60px] w-full overflow-hidden rounded-lg bg-neutral-0">
      <div className="flex h-full flex-col px-3 py-2">
        <div className="flex flex-1 flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nav/sparkle.svg" alt="" className="size-4" />
              <span className="text-[12px] text-neutral-500">AI credit usage</span>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/nav/info.svg" alt="More info" className="size-4" />
          </div>
          <div className="flex items-center gap-0.5 text-[12px] leading-none">
            <span className="font-bold text-neutral-800">9,700</span>
            <span className="font-semibold text-neutral-500">/ 12,500</span>
          </div>
          <div className="h-1 w-full overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-1 rounded-full bg-primary-600"
              style={{ width: "78%" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const WIDE_QUERY = "(min-width: 1280px)";

export default function Sidebar() {
  const [scrolled, setScrolled] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [narrowExpanded, setNarrowExpanded] = useState(false);

  // ≥1280px: sidebar sits in the layout flow. Below that it is a fixed rail
  // that can expand as an overlay without pushing the page content.
  const subscribeToWidth = useCallback((onStoreChange: () => void) => {
    const mq = window.matchMedia(WIDE_QUERY);
    const onChange = () => {
      setNarrowExpanded(false);
      onStoreChange();
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  const isWide = useSyncExternalStore(
    subscribeToWidth,
    () => window.matchMedia(WIDE_QUERY).matches,
    () => true,
  );

  // Restore the desktop collapsed preference. Reading localStorage must wait
  // until after hydration, so the post-mount setState is intentional.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem("sidebar:collapsed") === "1");
  }, []);

  const toggleCollapsed = () => {
    if (!isWide) {
      setNarrowExpanded((open) => !open);
      return;
    }
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar:collapsed", next ? "1" : "0");
      return next;
    });
  };

  // Sticky shadow after 50px of page scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const collapseOverlay = () => setNarrowExpanded(false);

  const showCollapsed = isWide ? collapsed : !narrowExpanded;

  return (
    <>
      {/* Reserves the rail width while the sidebar is fixed (narrow screens) */}
      <div aria-hidden="true" className="w-sidebar-collapsed shrink-0 xl:hidden" />

      {/* Backdrop while the expanded sidebar overlays content (narrow screens) */}
      <div
        onClick={collapseOverlay}
        aria-hidden="true"
        className={[
          "fixed inset-0 z-30 bg-black/40 transition-opacity duration-300 xl:hidden",
          narrowExpanded
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 h-screen overflow-y-auto overscroll-contain bg-neutral-50 px-4 py-5",
          "transition-[width,box-shadow] duration-300 ease-in-out",
          "xl:sticky xl:top-0 xl:z-0",
          showCollapsed ? "w-sidebar-collapsed" : "w-sidebar",
          narrowExpanded
            ? "shadow-[2px_0_16px_rgba(0,0,0,0.16)]"
            : scrolled
              ? "shadow-[2px_0_16px_rgba(0,0,0,0.08)]"
              : "shadow-none",
        ].join(" ")}
      >
       <div className="flex min-h-full flex-col gap-6">
        {/* Logo header */}
        {showCollapsed ? (
          <div className="flex h-20 shrink-0 items-center justify-center py-1">
            <button
              type="button"
              aria-label="Expand sidebar"
              onClick={toggleCollapsed}
              className="flex size-[34px] items-center justify-center rounded-lg hover:bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nav/left-panel-open.svg" alt="" className="size-6" />
            </button>
          </div>
        ) : (
          <div className="flex h-20 shrink-0 items-center gap-1 py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nav/arcteryx-logo.svg"
              alt="Arc'teryx"
              className="h-[72px] w-[122px] object-contain"
            />
            <button
              type="button"
              aria-label="Collapse sidebar"
              onClick={toggleCollapsed}
              className="flex size-9 shrink-0 items-center justify-center rounded-lg hover:bg-neutral-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nav/right-panel-open.svg" alt="" className="size-6" />
            </button>
          </div>
        )}

        {/* Pages */}
        <nav className="flex min-h-0 w-full flex-1 flex-col justify-between">
          <div className="flex w-full flex-col gap-2">
            {MAIN_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                collapsed={showCollapsed}
                onNavigate={collapseOverlay}
              />
            ))}
          </div>

          <div className="flex w-full flex-col gap-4 border-t border-neutral-200 pt-4">
            <div className="flex w-full flex-col gap-2">
              {UTILITY_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  item={item}
                  collapsed={showCollapsed}
                  onNavigate={collapseOverlay}
                />
              ))}
            </div>

            <AiCreditUsage collapsed={showCollapsed} />

            {showCollapsed ? (
              <div className="flex h-[34px] w-full items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nav/returnalyze-mark.svg"
                  alt="Returnalyze"
                  className="h-auto w-6"
                />
              </div>
            ) : (
              <div className="flex h-[34px] w-full items-center px-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/nav/returnalyze-logo.svg"
                  alt="Returnalyze"
                  className="h-[21px] w-auto"
                />
              </div>
            )}
          </div>
        </nav>
       </div>
      </aside>
    </>
  );
}
