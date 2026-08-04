import { site } from "@/lib/site";
import { LocalTime } from "./LocalTime";

export function Footer() {
  return (
    <footer className="mt-[var(--section-y)] overflow-hidden border-t border-[var(--border)] pt-10">
      <div className="shell flex flex-wrap items-start justify-between gap-8">
        <div className="flex flex-col gap-1">
          <LocalTime />
          <span className="mono text-fg-subtle">
            © {site.name}, {new Date().getFullYear()}
          </span>
        </div>

        <span className="mono text-fg-subtle sm:text-right">
          Designed and built in {site.location}.
        </span>
      </div>

      {/*
        Deliberately clipped by the viewport edge — texture, not a heading.

        Lighthouse/axe flags this for contrast (1.17:1). That is a known false
        positive here: WCAG 1.4.3 explicitly exempts text that is "pure
        decoration", and this carries no information the page doesn't already
        state — the wordmark is in the nav, the <title>, and the contact block.
        Raising it to 3:1 would turn a background texture into what reads as
        content. It stays low, aria-hidden, and unselectable.
      */}
      <div aria-hidden className="mt-12 select-none px-[var(--gutter)]">
        <span
          className="block whitespace-nowrap font-medium leading-[0.78] text-[var(--ink-800)]"
          style={{ fontSize: "var(--text-wordmark)", letterSpacing: "-0.045em" }}
        >
          {site.wordmark}
        </span>
      </div>
    </footer>
  );
}
