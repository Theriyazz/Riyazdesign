import { cn } from "@/lib/cn";

/**
 * `▪ SELECTED WORK` — the section-marker system used across the whole site.
 * The 6px accent square is one of the six sanctioned uses of the accent.
 */
export function MicroLabel({
  children,
  className,
  count,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Optional `01 / 03` counter, per the IntegratedBio pills. */
  count?: string;
  /**
   * Render as a real heading when this label *is* the section's heading.
   * It looks identical either way, but it keeps the document outline
   * sequential — otherwise an h1 page jumps straight to the h3s inside
   * project rows, which is a genuine screen-reader navigation failure.
   */
  as?: "div" | "h2" | "h3";
}) {
  return (
    <Tag className={cn("flex items-center gap-2.5 text-fg-muted", className)}>
      <span
        aria-hidden
        className="h-[6px] w-[6px] shrink-0"
        style={{ background: "var(--case-accent)" }}
      />
      <span className="mono font-normal">{children}</span>
      {count ? (
        <span className="mono ml-1 font-normal text-fg-subtle tabular-nums">
          {count}
        </span>
      ) : null}
    </Tag>
  );
}

/** Outlined chip used for roles, tools, and disciplines. */
export function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="mono inline-flex items-center rounded-[var(--radius-chip)] border border-[var(--tag-border)] bg-[var(--tag-bg)] px-2.5 py-1 text-[var(--tag-fg)]">
      {children}
    </span>
  );
}
