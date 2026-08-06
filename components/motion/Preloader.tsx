"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "./SmoothScroll";
import { imageProps } from "@/lib/images";

/** Vertical panels the white overlay is cut into for the reveal. */
const PANELS = 7;

/**
 * Previews shown one at a time while the counter climbs.
 *
 * The three case study covers are the real work; the portraits are standing in
 * until dedicated 16:9 preview crops exist. Hardcoded rather than read from
 * `lib/content.ts`, which is `server-only` — these paths are validated at build
 * time by the pages that own them, so a rename fails there first.
 */
const PREVIEWS = [
  "/work/careerlogica/cover.avif",
  "/work/pecuc/cover.avif",
  "/work/atrc/cover.avif",
  "/riyaz/wide.avif",
  "/riyaz/alt-1.avif",
  "/riyaz/portrait.avif",
] as const;

/** Loading phase, before the overlay blooms to full white. */
const COUNT_MS = 2300;

/**
 * A monotonic run of uneven steps to 100.
 *
 * A linear count-up reads as a progress bar, which is a promise we can't keep —
 * the number is a pacing device, not a real measurement. Uneven jumps read as
 * work happening. Generated per visit so a second look isn't identical.
 */
function progressSteps() {
  const steps: number[] = [];
  let at = 0;
  while (at < 88) {
    // Smaller jumps as it climbs, so the tail feels like it's settling rather
    // than sprinting to the end.
    const room = 100 - at;
    at += Math.round(gsap.utils.random(room * 0.09, room * 0.22));
    steps.push(Math.min(at, 96));
  }
  steps.push(100);
  return steps;
}

/**
 * First-visit intro.
 *
 * A white card on a dark ground, portfolio previews cycling inside it, a
 * counter in its bottom corner. At 100 the card blooms out to a full white
 * overlay, which is then cut into seven vertical panels that fall away left to
 * right, and the homepage settles in behind them.
 *
 * Whether it plays at all is decided by the boot script in `app/layout.tsx`,
 * which sets `data-preload` before first paint. The markup is server-rendered
 * so the opening frame is never blank; the later previews are client-gated so
 * a session that skips the intro never fetches them.
 *
 * The sequence runs on a fixed ~3.5s timeline rather than tracking real load
 * progress. It is choreography, and choreography that waits on the network
 * stutters.
 */
export function Preloader() {
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  /** Mirrors `data-preload`. Unknown until mount, so later previews start absent. */
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setPlaying(document.documentElement.dataset.preload === "1");
  }, []);

  useEffect(() => {
    if (!playing) return;

    const card = cardRef.current;
    const stage = stageRef.current;
    const count = countRef.current;
    const panelWrap = panelsRef.current;
    if (!card || !stage || !count || !panelWrap) return;

    // `overflow: hidden` alone does not hold: Lenis reads wheel events and
    // drives the scroll position itself, so the page kept moving behind the
    // overlay. It has to be stopped, not just visually clipped.
    //
    // Retried on a frame because Lenis is created on `SmoothScroll`'s *second*
    // effect pass — `useReducedMotion` reports `true` until it has read the
    // media query — so on the first pass there is nothing here yet to stop.
    let stopped = false;
    const holdScroll = () => {
      const lenis = getLenis();
      if (!lenis) return;
      lenis.stop();
      stopped = true;
    };
    holdScroll();
    const holdFrame = requestAnimationFrame(holdScroll);

    const thumbs = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-preview]")
    );
    const panels = Array.from(
      panelWrap.querySelectorAll<HTMLElement>("[data-panel]")
    );

    const counter = { value: 0 };
    const paint = () => {
      count.textContent = `${Math.round(counter.value)}%`;
    };

    const release = () => {
      delete document.documentElement.dataset.preload;
      cancelAnimationFrame(holdFrame);
      if (stopped) getLenis()?.start();
      setDone(true);
    };

    const tl = gsap.timeline({ onComplete: release });

    // --- Counter -------------------------------------------------------------
    // Built as its own timeline so the uneven steps can be laid end to end and
    // then scaled as a whole to fit the loading phase exactly.
    const steps = progressSteps();
    const countTl = gsap.timeline();
    for (const value of steps) {
      countTl
        .to(counter, {
          value,
          duration: gsap.utils.random(0.1, 0.2),
          ease: "power2.out",
          onUpdate: paint,
          // The global default is meant for DOM nodes; on a plain object GSAP
          // warns about an unknown property on every tween.
          force3D: false,
        })
        // The pause after a jump is what sells it as work finishing, not a
        // needle sweeping.
        .to(counter, { value, duration: gsap.utils.random(0.06, 0.24) });
    }
    countTl.totalDuration(COUNT_MS / 1000);
    tl.add(countTl, 0);

    // --- Previews ------------------------------------------------------------
    // One at a time, each fading out as the next fades in so the stage is never
    // empty. Laid across the same span as the counter.
    const slot = COUNT_MS / 1000 / thumbs.length;
    thumbs.forEach((thumb, i) => {
      const at = i * slot;
      tl.fromTo(
        thumb,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.inOut" },
        at
      );
      // The last one holds until the bloom takes it, rather than leaving a
      // blank card at the moment of transition.
      if (i < thumbs.length - 1) {
        tl.to(
          thumb,
          { opacity: 0, duration: 0.45, ease: "power2.inOut" },
          at + slot - 0.1
        );
      }
    });

    // --- Hand over to the panels ---------------------------------------------
    // Only the content animates out. The card and the panels are both
    // full-bleed `--paper-50`, so the handover itself is a `set`, not a
    // crossfade — fading one into the other would leave both partly
    // transparent for a few frames and show the page through the gap.
    tl.to(stage, { scale: 1.06, opacity: 0, duration: 0.4, ease: "power2.inOut" })
      .to(count, { opacity: 0, duration: 0.4, ease: "power2.inOut" }, "<")
      .set(panelWrap, { opacity: 1 })
      .set(card, { opacity: 0 });

    // --- Reveal --------------------------------------------------------------
    // Left to right, each panel falling away a beat after the one before it.
    tl.to(panels, {
      yPercent: 100,
      duration: 0.62,
      ease: "power2.inOut", // GSAP's power2 is the cubic curve.
      stagger: 0.065,
    });

    // --- Settle --------------------------------------------------------------
    // The page eases the last 2% into place as the final panel clears.
    //
    // Deliberately *not* on <body>. GSAP initialises its transform cache on
    // any DOM target it touches, so even an opacity-only tween left
    // `transform: translate(0px, 0px)` behind — and a transform on <body>
    // makes it the containing block for every fixed descendant. The nav, the
    // cursor and the page-transition curtain all stopped being fixed and
    // scrolled away with the document. `#main` holds no fixed elements, so the
    // same write is harmless there, and `clearProps` removes it regardless.
    //
    // `immediateRender: false` because a `fromTo` otherwise applies its start
    // value the moment the timeline is built, dimming the page for the whole
    // intro rather than for the half second this runs.
    const main = document.getElementById("main");
    if (main) {
      tl.fromTo(
        main,
        { opacity: 0.98 },
        {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          force3D: false,
          immediateRender: false,
          clearProps: "opacity,transform",
        },
        "-=0.45"
      );
    }

    return () => {
      tl.kill();
      countTl.kill();
      delete document.documentElement.dataset.preload;
      cancelAnimationFrame(holdFrame);
      if (stopped) getLenis()?.start();
      // An interrupted settle would otherwise leave the page at 98%.
      if (main) gsap.set(main, { clearProps: "opacity,transform" });
    };
  }, [playing]);

  if (done) return null;

  return (
    <div
      aria-hidden
      className="preloader pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <div className="absolute inset-0">
        <div
          ref={cardRef}
          className="absolute inset-0 grid place-items-center"
          style={{ background: "var(--paper-50)" }}
        >
          <div
            ref={stageRef}
            className="relative"
            style={{
              // Fixed 320x180 by design; it only gives way below ~420px, where
              // holding it would leave no whitespace at all.
              width: "min(320px, 68vw)",
              aspectRatio: "16 / 9",
            }}
          >
            {PREVIEWS.map((src, i) => {
              // The first preview is server-rendered and priority-loaded so the
              // opening frame is never an empty card — on a phone the
              // client-gated version had not decoded before the intro ended.
              // It costs nothing on a repeat visit: this is also the first work
              // card's cover, which the homepage loads with priority anyway.
              if (i > 0 && !playing) return null;
              return (
                <Image
                  key={src}
                  {...imageProps(src)}
                  data-preview
                  alt=""
                  priority
                  sizes="(max-width: 420px) 68vw, 320px"
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ borderRadius: 12, opacity: i === 0 ? 1 : 0 }}
                />
              );
            })}
          </div>

          <span
            ref={countRef}
            data-preload-count
            className="mono absolute tabular-nums"
            style={{
              // Sits on the page gutter, so it lines up with the nav wordmark
              // and the footer rather than floating at an arbitrary inset.
              right: "var(--gutter)",
              bottom: "var(--gutter)",
              // Twice the 12px micro size the `.mono` class would otherwise
              // give it.
              fontSize: 24,
              color: "var(--ink-950)",
              opacity: 0.55,
            }}
          >
            0%
          </span>
        </div>
      </div>

      {/* The reveal surface. Transparent until the bloom, then it *is* the
          overlay. Panels overlap by a pixel so no seam shows between them
          at fractional viewport widths. */}
      <div ref={panelsRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {Array.from({ length: PANELS }, (_, i) => (
          <div
            key={i}
            data-panel
            className="absolute top-0 h-full"
            style={{
              left: `calc(${i} * 100% / ${PANELS})`,
              width: `calc(100% / ${PANELS} + 1px)`,
              background: "var(--paper-50)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
