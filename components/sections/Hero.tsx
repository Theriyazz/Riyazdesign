"use client";

import { useEffect, useState } from "react";

import { useReducedMotion } from "@/lib/useReducedMotion";
import { site } from "@/lib/site";
import { SplitButton } from "@/components/primitives/SplitButton";
import { DottedSurface } from "./DottedSurface";

const TYPE_MS = 52;
const ERASE_MS = 26;
const HOLD_MS = 2000;

/** Reserves the line's width so the typewriter can't reflow the paragraph. */
const longest = [...site.rotating].sort((a, b) => b.length - a.length)[0];

/**
 * Hero: status pill, "Think, Design, Ship", the rotating discipline, the CTA
 * pair.
 *
 * The entrance is CSS and transform-only (see globals.css) so the LCP text
 * paints on the first frame rather than waiting for hydration. The canvas
 * mounts after and never blocks paint.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const [word, setWord] = useState<string>(site.rotating[0]);

  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let i = 0;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

    /**
     * The rotating word sits inside the LCP text block, and every keystroke
     * registers a fresh text paint — which kept moving LCP later and later,
     * to 3.1s on throttled mobile. Waiting for `load` means the line is
     * painted and measured once, statically, before it ever animates.
     *
     * It also reads better: the first thing you see is a complete sentence.
     */
    const started = new Promise<void>((resolve) => {
      if (document.readyState === "complete") return resolve();
      window.addEventListener("load", () => resolve(), { once: true });
    });

    async function loop() {
      await started;
      while (!cancelled) {
        await sleep(HOLD_MS);
        const current = site.rotating[i];
        for (let n = current.length; n >= 0 && !cancelled; n--) {
          setWord(current.slice(0, n));
          await sleep(ERASE_MS);
        }
        i = (i + 1) % site.rotating.length;
        const next = site.rotating[i];
        for (let n = 1; n <= next.length && !cancelled; n++) {
          setWord(next.slice(0, n));
          await sleep(TYPE_MS);
        }
      }
    }
    loop();
    return () => {
      cancelled = true;
    };
  }, [reduced]);

  return (
    // Two stacked blocks: the statement takes the free space and centres in it,
    // the CTAs sit on the bottom edge of the fold. Anchoring the buttons low
    // gives the headline the breathing room it needs and makes the fold read as
    // a deliberate frame rather than a stack that happened to fit.
    <section className="edge-fade-x relative flex min-h-[94svh] flex-col overflow-hidden pb-[var(--space-12)] pt-[var(--space-32)]">
      <DottedSurface />

      <div className="shell relative flex flex-1 flex-col justify-center">
        <p data-hero-sub="0" className="mb-10">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-[var(--border)] px-3.5 py-2">
            <span className="relative grid h-2 w-2 place-items-center">
              <span
                className="motion-only absolute inset-0 animate-ping rounded-full opacity-70"
                style={{ background: "var(--accent)" }}
              />
              <span
                className="relative h-2 w-2 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            </span>
            <span className="mono text-fg-muted">{site.availableLabel}</span>
          </span>
        </p>

        <h1 className="text-[length:var(--text-3xl)] font-bold">
          {/* The line clips its own overflow so the entrance wipe reads cleanly. */}
          <span className="block overflow-hidden py-[0.06em]">
            {/* One face, one weight. The serif accent moved down to the
                rotating word, where the motion already draws the eye — two
                accents in one fold would compete. */}
            <span data-hero-line="1" className="block">
              Think, Design, Ship
            </span>
          </span>
        </h1>

        <p
          data-hero-sub="1"
          className="mt-14 text-[length:var(--text-hero-sub)] leading-[1.25] tracking-[-0.02em] text-fg-muted"
        >
          {/*
            The rotating word is overlaid on an invisible copy of the longest
            option in the same grid cell, so the box never resizes and the
            typewriter animates text rather than layout.

            It also gets its own line. Mid-sentence, the reserved width showed
            as a hole that opened and closed between the word and "for humans";
            at the end of a line the same reserved space is simply invisible.
          */}
          <span className="block">
            Creating{" "}
            {/* serif-em on both the sizer and the visible word — the sizer only
                reserves the right width if it is set in the same face. */}
            <span className="relative inline-grid align-bottom text-fg">
              <span
                aria-hidden
                className="serif-em invisible col-start-1 row-start-1 whitespace-nowrap"
              >
                {longest}
              </span>
              <span className="col-start-1 row-start-1 whitespace-nowrap">
                <span aria-hidden className="serif-em">
                  {word}
                </span>
                <span
                  aria-hidden
                  className="motion-only ml-[0.05em] inline-block h-[0.72em] w-[2px] translate-y-[0.06em] animate-[caret_1s_steps(1)_infinite]"
                  style={{ background: "var(--accent)" }}
                />
              </span>
            </span>
          </span>
          <span className="block">for humans since 2023.</span>
          {/* The rotation is decorative; the full list is spoken once here so a
              screen reader hears a sentence, not a stream of keystrokes. */}
          <span className="sr-only">
            {" "}
            Disciplines: {site.rotating.slice(0, -1).join(", ")}, and{" "}
            {site.rotating[site.rotating.length - 1]}.
          </span>
        </p>

      </div>

      {/* One CTA, not a pair. The resume already has a permanent home in the
          nav, so a second button here was competing with "See recent work"
          for the same glance and splitting it. */}
      <div data-hero-sub="2" className="shell relative mt-12 flex">
        <SplitButton href="#work" emphasis size="lg">
          See recent work
        </SplitButton>
      </div>
    </section>
  );
}
