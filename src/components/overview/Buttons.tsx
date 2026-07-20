/*
 * Reusable buttons mapped from the design system
 * (file gexI7NyC9mclenMQQdqL8X). The Overview header uses the
 * "secondary-med" icon button; the filter bar uses "dd-default"
 * dropdowns and the disabled "Apply Filters" / "Reset" actions.
 */

export function IconButton({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-neutral-200 bg-neutral-0 transition-colors hover:bg-neutral-50"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="size-6" />
    </button>
  );
}

function Chevron() {
  return (
    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true">
      <path
        d="M1 1l4 4 4-4"
        stroke="#8a8a8a"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FilterDropdown({ label }: { label: string }) {
  return (
    <button
      type="button"
      className="flex h-10 min-w-[160px] flex-1 items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-neutral-0 px-3 text-sm text-neutral-800 transition-colors hover:bg-neutral-50"
    >
      <span className="truncate">{label}</span>
      <span className="flex shrink-0">
        <Chevron />
      </span>
    </button>
  );
}

export function FilterButton({
  label,
  disabled = false,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex h-10 shrink-0 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors",
        disabled
          ? "cursor-not-allowed bg-neutral-100 text-neutral-600"
          : "bg-primary-600 text-white hover:bg-primary-700",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
