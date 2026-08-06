import { site } from "@/lib/site";
import { LocalTime } from "./LocalTime";
import { RevealGroup } from "@/components/motion/RevealText";
import { WordmarkParallax } from "@/components/motion/WordmarkParallax";

export function Footer() {
  return (
    <footer className="mt-[var(--section-y)] overflow-hidden border-t border-[var(--border)] pt-10">
      <RevealGroup
        className="shell flex flex-wrap items-start justify-between gap-8"
        y={14}
      >
        <div className="flex flex-col gap-1">
          <LocalTime />
          <span className="mono text-fg-subtle">
            © {site.name}, {new Date().getFullYear()}
          </span>
        </div>

        <span className="mono text-fg-subtle sm:text-right">
          Designed and built in {site.location}.
        </span>
      </RevealGroup>

      {/*
        Texture, not a heading — but texture that lands inside the column.

        It used to be sized in vw and clipped by the viewport edge. That reads
        as an accident rather than a decision at any width where the column is
        narrower than the screen, so it now fills `.shell` exactly and stops
        where every other element on the page stops (see `.wordmark-fit`).

        Lighthouse/axe flags this for contrast (1.17:1). That is a known false
        positive here: WCAG 1.4.3 explicitly exempts text that is "pure
        decoration", and this carries no information the page doesn't already
        state — the wordmark is in the nav, the <title>, and the contact block.
        Raising it to 3:1 would turn a background texture into what reads as
        content. It stays low, aria-hidden, and unselectable.
      */}
      <div aria-hidden className="shell mt-12 select-none">
        <div className="wordmark-fit">
          <WordmarkParallax>
            <span className="wordmark-text">{site.wordmark}</span>
          </WordmarkParallax>
        </div>
      </div>
    </footer>
  );
}
