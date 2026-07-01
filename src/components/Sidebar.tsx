"use client";

import { useEffect, useState } from "react";
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

function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="#212121"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="#212121"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Sidebar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Restore the desktop collapsed preference.
  useEffect(() => {
    setCollapsed(localStorage.getItem("sidebar:collapsed") === "1");
  }, []);

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem("sidebar:collapsed", next ? "1" : "0");
      return next;
    });

  // Sticky shadow after 50px of page scroll.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile panel is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Close the mobile panel when crossing back to desktop.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  // Collapse only applies on desktop; the mobile slide-in panel is always expanded.
  const showCollapsed = collapsed && !mobileOpen;

  return (
    <>
      {/* Mobile hamburger trigger (hidden ≥768px) */}
      <button
        type="button"
        aria-label="Open navigation menu"
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-30 flex size-10 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-0 shadow-sm md:hidden"
      >
        <HamburgerIcon />
      </button>

      {/* Backdrop overlay (mobile only) */}
      <div
        onClick={closeMobile}
        aria-hidden="true"
        className={[
          "fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 h-screen w-sidebar overflow-y-auto overscroll-contain bg-neutral-50 px-4 py-5",
          "transition-[transform,width,box-shadow] duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:sticky md:top-0 md:z-0 md:translate-x-0",
          showCollapsed ? "md:w-sidebar-collapsed" : "md:w-sidebar",
          scrolled ? "shadow-[2px_0_16px_rgba(0,0,0,0.08)]" : "shadow-none",
        ].join(" ")}
      >
       <div className="flex min-h-full flex-col gap-10">
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
          <div className="flex h-20 shrink-0 items-center justify-between py-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/nav/arcteryx-logo.svg"
              alt="Arc'teryx"
              className="h-[72px] w-[122px] object-contain"
            />
            {/* Mobile: close. Desktop: collapse. */}
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMobile}
              className="shrink-0 md:hidden"
            >
              <CloseIcon />
            </button>
            <button
              type="button"
              aria-label="Collapse sidebar"
              onClick={toggleCollapsed}
              className="hidden size-9 shrink-0 items-center justify-center rounded-lg hover:bg-neutral-100 md:flex"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/nav/right-panel-open.svg" alt="" className="size-6" />
            </button>
          </div>
        )}

        {/* Pages */}
        <nav className="flex min-h-0 w-full flex-1 flex-col justify-between">
          <div className="flex w-full flex-col gap-4">
            {MAIN_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                collapsed={showCollapsed}
                onNavigate={closeMobile}
              />
            ))}
          </div>

          <div className="flex w-full flex-col gap-5 border-t border-neutral-200 pt-4">
            <div className="flex w-full flex-col gap-2">
              {UTILITY_ITEMS.map((item) => (
                <NavLink
                  key={item.label}
                  item={item}
                  collapsed={showCollapsed}
                  onNavigate={closeMobile}
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
                  className="size-6"
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
