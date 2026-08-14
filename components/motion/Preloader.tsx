"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "./SmoothScroll";

/** Vertical panels the white overlay is cut into for the reveal. */
const PANELS = 7;

/**
 * Digits stacked in each roll column: 0-9, then a second 0.
 *
 * The duplicate is what makes the wrap invisible. A column position is a float
 * in [0, 10); as it approaches 10 the slot is showing item 10 — a zero — and
 * when it wraps to 0 it shows item 0, the same glyph. The reset never paints.
 */
const ROLL_DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;

/** Loading phase, before the overlay blooms to full white. */
const COUNT_MS = 2600;

/**
 * How far into the timeline the count begins.
 *
 * The digits rise out of their masks first. Long enough that the number is on
 * screen before it starts climbing, short enough that the two moves still
 * overlap and the intro does not stall at zero.
 */
const ENTRY_S = 0.3;

/**
 * A monotonic run of uneven steps to 100.
 *
 * A linear count-up reads as a progress bar, which is a promise we can't keep —
 * the number is a pacing device, not a real measurement. Uneven steps read as
 * work happening. Generated per visit so a second look isn't identical.
 *
 * Deliberately few and large. An earlier version took 0.09-0.22 of the
 * remaining room per step, which produced a dozen short ticks inside the same
 * 2.6s — accurate to how loading actually behaves, and far too busy to watch.
 * Taking a fifth to a third of the room at a time gives five or six long
 * glides, which is what makes the roll read as smooth rather than nervous.
 */
function progressSteps() {
  const steps: number[] = [];
  let at = 0;
  while (at < 82) {
    // Smaller steps as it climbs, so the tail feels like it's settling rather
    // than sprinting to the end.
    const room = 100 - at;
    at += Math.round(gsap.utils.random(room * 0.2, room * 0.33));
    steps.push(Math.min(at, 94));
  }
  steps.push(100);
  return steps;
}

/**
 * Mechanical carry.
 *
 * A digit holds still until the digit below it is nearly through its cycle,
 * then rolls over fast. Without this the tens column sits permanently a
 * fraction of a turn off its glyph and never reads as a crisp number —
 * technically what a real odometer does, but at this size it just looks
 * misaligned.
 *
 * `k` is how sharp the carry is: 10 spends the last tenth of the cycle
 * rolling, 100 the last hundredth.
 */
function carry(x: number, k = 10) {
  return Math.floor(x) + Math.max(0, (x % 1) * k - (k - 1));
}

/**
 * First-visit intro.
 *
 * A white card on a dark ground with the loading percentage set huge in the
 * middle of it, counting up on three odometer columns. At 100 the card blooms
 * out to a full white overlay, which is then cut into seven vertical panels
 * that fall away left to right, and the homepage settles in behind them.
 *
 * Whether it plays at all is decided by the boot script in `app/layout.tsx`,
 * which sets `data-preload` before first paint. The markup is server-rendered
 * so the opening frame reads `000%` rather than being blank.
 *
 * The sequence runs on a fixed ~3.5s timeline rather than tracking real load
 * progress. It is choreography, and choreography that waits on the network
 * stutters.
 */
export function Preloader() {
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const growRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const eyebrowRef = useRef<HTMLSpanElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  /** Mirrors `data-preload`. Unknown until mount; gates the whole timeline. */
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setPlaying(document.documentElement.dataset.preload === "1");
  }, []);

  useEffect(() => {
    if (!playing) return;

    const card = cardRef.current;
    const stage = stageRef.current;
    const grow = growRef.current;
    const pop = popRef.current;
    const rule = ruleRef.current;
    const eyebrow = eyebrowRef.current;
    const panelWrap = panelsRef.current;
    if (!card || !stage || !grow || !pop || !rule || !eyebrow || !panelWrap)
      return;

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

    // Two nested translate layers per slot, on purpose. `paint` owns yPercent
    // on the column and rewrites it every frame; if the entry and exit moves
    // also wrote yPercent there they would be overwritten the moment the
    // counter started. The lift lives on its own wrapper instead.
    const lifts = Array.from(stage.querySelectorAll<HTMLElement>("[data-lift]"));
    const columns = Array.from(
      stage.querySelectorAll<HTMLElement>("[data-roll]")
    );
    const panels = Array.from(
      panelWrap.querySelectorAll<HTMLElement>("[data-panel]")
    );

    // One slot's share of its column's height. yPercent is a percentage of the
    // element's own box, and the column is `ROLL_DIGITS.length` slots tall.
    const STEP = 100 / ROLL_DIGITS.length;

    const counter = { value: 0 };

    /**
     * Drives the columns straight off the counter value.
     *
     * Deliberately not a tween per digit change: the counter updates every
     * frame, so change-triggered tweens would stack on the ones column and
     * read as noise. Setting position from the value instead gives real
     * odometer behaviour for one `gsap.set` per column per frame.
     */
    const paint = () => {
      const v = counter.value;
      const at = [carry(v / 100, 100), carry(v / 10), v % 10];
      columns.forEach((column, i) => {
        gsap.set(column, { yPercent: -at[i] * STEP });
      });
      gsap.set(rule, { scaleX: v / 100 });
    };

    // --- Ambient -------------------------------------------------------------
    // Two slow loops that never resolve, running underneath everything else.
    // They are what keeps the card from feeling like a still frame between
    // counter jumps — long enough that you register them as breathing rather
    // than as animation.
    //
    // Kept outside the timeline: an infinitely repeating child would mean the
    // timeline never reaches its end and `onComplete` never fires. They are
    // killed by hand in the cleanup instead.
    //
    // The float is on `stage`, whose only other tweens are scale and opacity
    // at the exit, so the two never write the same property.
    const ambient = [
      gsap.to(stage, {
        y: -7,
        duration: 3.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      }),
      gsap.to(eyebrow, {
        opacity: 0.18,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      }),
    ];
    // Called once the exit starts, so the float is not still nudging the stage
    // while it scales and fades out.
    const stopAmbient = () => ambient.forEach((t) => t.kill());

    const release = () => {
      delete document.documentElement.dataset.preload;
      cancelAnimationFrame(holdFrame);
      if (stopped) getLenis()?.start();
      setDone(true);
    };

    const tl = gsap.timeline({ onComplete: release });

    // The markup starts the lifts at `translateY(100%)`, but the browser
    // resolves that to pixels in the computed matrix, so GSAP reads it as
    // `y: 224.6, yPercent: 0` — two independent channels. Tweening `yPercent`
    // then left the pixel offset in place and the digits never came out of
    // their masks. This restates the same visual position in the channel the
    // tweens actually use.
    gsap.set(lifts, { y: 0, yPercent: 100 });

    // --- Entry ---------------------------------------------------------------
    // Each column rises into its own slot mask, so the number assembles rather
    // than appearing, and the rule wipes in under it from the left.
    //
    // `to`, not `from`, because both start states are written into the markup.
    // A `from` would have shown the finished number for however long hydration
    // takes — a beat on desktop, closer to a second on a mid-range phone — and
    // then yanked it back down to replay the entry. The card is never blank
    // during that window either: the eyebrow and the rule track carry it.
    //
    // "settle" rather than a plain ease-out: each digit sails a few pixels past
    // the top of its slot and drops back. Inside a mask that reads as weight
    // arriving, which is the whole point of the move.
    tl.to(lifts, {
      yPercent: 0,
      duration: 0.62,
      ease: "settle",
      stagger: 0.07,
    }).to(
      rule.parentElement,
      { scaleX: 1, duration: 0.6, ease: "power3.out" },
      0.1
    );

    // --- Counter -------------------------------------------------------------
    // Built as its own timeline so the uneven steps can be laid end to end and
    // then scaled as a whole to fit the loading phase exactly.
    const steps = progressSteps();
    const countTl = gsap.timeline();
    for (const value of steps) {
      countTl
        .to(counter, {
          value,
          duration: gsap.utils.random(0.4, 0.62),
          // Eased at both ends, not just the out. `power2.out` left every step
          // starting at full speed, so each one began with a snap — the thing
          // that made the run feel jumpy rather than fast.
          ease: "power2.inOut",
          onUpdate: paint,
          // A small kick on each step, on its own element so it does not fight
          // the slow growth tween below. Out on "settle" so it overshoots and
          // rebounds, back on a plain ease so it does not bounce twice — a
          // symmetric yoyo of an overshoot ease reads as a wobble.
          //
          // Kept to 2% and stretched over the step: at 3.5% and 0.14s it was
          // reading as a flinch on every number.
          onStart: () => {
            gsap.to(pop, {
              scale: 1.02,
              duration: 0.26,
              ease: "settle",
              overwrite: true,
              onComplete: () => {
                gsap.to(pop, { scale: 1, duration: 0.4, ease: "power2.inOut" });
              },
            });
          },
        })
        // The rest after a step is what sells it as work finishing, not a
        // needle sweeping. Short relative to the step now that the steps
        // themselves are long — a long hold after a long glide reads as a
        // stall.
        .to(counter, {
          value,
          duration: gsap.utils.random(0.08, 0.18),
          onUpdate: paint,
        });
    }
    countTl.totalDuration(COUNT_MS / 1000);
    // Held back until the digits have cleared their masks. Started at 0 the
    // count was already past 20 by the time anything was visible, which threw
    // away the opening of the climb.
    tl.add(countTl, ENTRY_S);

    // --- Growth --------------------------------------------------------------
    // The number swells across the whole run, so it is physically larger at 100
    // than it was at 0. Slow enough that it is felt rather than watched.
    // Starts from the 0.86 written into the markup rather than a `fromTo`, so
    // the first painted frame is already at the small size instead of showing
    // full size for a frame and snapping down.
    tl.to(
      grow,
      { scale: 1, duration: COUNT_MS / 1000, ease: "power1.inOut" },
      ENTRY_S
    );

    // --- Hand over to the panels ---------------------------------------------
    // Only the content animates out. The card and the panels are both
    // full-bleed `--paper-50`, so the handover itself is a `set`, not a
    // crossfade — fading one into the other would leave both partly
    // transparent for a few frames and show the page through the gap.
    tl.add(stopAmbient)
      .to(lifts, {
        yPercent: -110,
        duration: 0.62,
        // Eased both ends rather than `power3.in`, which snatched the digits
        // away. They should leave the same way they arrived.
        ease: "power2.inOut",
        stagger: 0.05,
      })
      .to(
        stage,
        { scale: 1.06, opacity: 0, duration: 0.4, ease: "power2.inOut" },
        "-=0.2"
      )
      .set(panelWrap, { opacity: 1 })
      .set(card, { opacity: 0 });

    // --- Reveal --------------------------------------------------------------
    // Left to right, each panel lifting away a beat after the one before it.
    // Upward, so the curtain rises off the page rather than dropping past it.
    tl.to(panels, {
      yPercent: -100,
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
      stopAmbient();
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
          <div ref={stageRef} className="flex flex-col items-center">
            <span
              ref={eyebrowRef}
              className="mono"
              style={{
                fontSize: "var(--text-micro)",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--ink-950)",
                opacity: 0.4,
                marginBottom: "var(--space-6)",
              }}
            >
              Loading
            </span>

            <div ref={growRef} style={{ transform: "scale(0.86)" }}>
              <div
                ref={popRef}
                className="flex items-end"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontWeight: 700,
                  fontSize: "var(--preload-count)",
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                  fontVariantNumeric: "tabular-nums",
                  color: "var(--ink-950)",
                }}
              >
                {/* Hundreds, tens, ones. Two nested masks of the same height,
                    which is what keeps them independent:

                    - the OUTER one clips the digit's travel, so the entry and
                      exit can slide it in and out of view;
                    - the INNER one clips the column to exactly one digit, so
                      only the digit `paint` selected is ever visible.

                    Both are needed. With a single mask, sliding the inner box
                    dragged the column under a stationary window and showed the
                    *neighbouring* digits — on the way out `100` briefly read
                    `2 1`, because the hundreds column moved off `1` onto `2`
                    and the ones off `0` onto `1`. */}
                {[0, 1, 2].map((slot) => (
                  <span
                    key={slot}
                    // 0.78em rather than 1em: digits carry no descender, so a
                    // full em box leaves a visible gap under the glyph and the
                    // mask reads loose.
                    style={{
                      display: "block",
                      overflow: "hidden",
                      height: "0.78em",
                    }}
                  >
                    {/* Starts pushed out of the outer mask so the entry tween
                        can lift it into place. Written here rather than left
                        to a `from()` because a `from()` only takes hold once
                        the component hydrates, which showed the finished
                        number first and then snatched it back down. */}
                    <span
                      data-lift
                      style={{
                        display: "block",
                        overflow: "hidden",
                        height: "0.78em",
                        transform: "translateY(100%)",
                      }}
                    >
                      <span data-roll style={{ display: "block" }}>
                        {ROLL_DIGITS.map((digit, i) => (
                          <span
                            key={i}
                            style={{
                              display: "block",
                              height: "0.78em",
                              lineHeight: "0.78em",
                            }}
                          >
                            {digit}
                          </span>
                        ))}
                      </span>
                    </span>
                  </span>
                ))}
                <span
                  style={{
                    fontSize: "0.42em",
                    lineHeight: 1,
                    opacity: 0.3,
                    // `items-end` aligns the boxes, not the glyphs, and the
                    // percent sign does not reach the bottom of its own line
                    // box the way a digit does. This drops it onto the digits'
                    // baseline instead of leaving it floating above them.
                    paddingBottom: "0.24em",
                    paddingLeft: "0.1em",
                    letterSpacing: 0,
                  }}
                >
                  %
                </span>
              </div>

              {/* Progress rule. The track holds the full width; the fill inside
                  it is scaled straight from the counter value in `paint`, so it
                  cannot drift out of step with the number above it.

                  Inside the growth wrapper, not a sibling of it: layout width
                  ignores the scale, so a rule outside would have been drawn at
                  the number's *final* width while the number itself was still
                  at 0.86 — a rule visibly overhanging the digits for most of
                  the run, closing up only at the end. */}
              <span
                style={{
                  display: "block",
                  width: "100%",
                  height: 2,
                  marginTop: "var(--space-6)",
                  background:
                    "color-mix(in srgb, var(--ink-950) 12%, transparent)",
                  transformOrigin: "left center",
                  // Wiped in by the entry tween. Same reasoning as the digit
                  // lifts: the start state is in the markup, not in a `from()`.
                  transform: "scaleX(0)",
                }}
              >
                <span
                  ref={ruleRef}
                  style={{
                    display: "block",
                    height: "100%",
                    background: "var(--ink-950)",
                    transformOrigin: "left center",
                    transform: "scaleX(0)",
                  }}
                />
              </span>
            </div>
          </div>
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
