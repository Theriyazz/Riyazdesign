"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { imageProps } from "@/lib/images";
import { site } from "@/lib/site";
import { SplitButton } from "@/components/primitives/SplitButton";
import { DottedSurface } from "./DottedSurface";

/**
 * Off for now: the card shows a still and the film is not embedded, so its
 * files are never requested. Set to true to bring back the film and its buttons.
 */
const SHOW_FILM: boolean = false;

const TYPE_MS = 52;
const ERASE_MS = 26;
const HOLD_MS = 2000;

/** Reserves the bubble's width so the typewriter can't reflow it. */
const longest = [...site.rotating].sort((a, b) => b.length - a.length)[0];

/** Scroll distance of the pinned scene, as a multiple of the viewport height. */
const SCENE_VH = 1.25;
/** Progress past which the film counts as having landed. */
const LANDED = 0.985;
/** Breathing room above and below the film once it has landed. */
const LANDED_MARGIN = 80;
/** Phone: where the landed card's top edge sits, just under the nav bar. */
const MOBILE_TOP = 100;
/** Phone: the space left between the landed card and the tools row. */
const MOBILE_GAP = 48;
/** Phone: the card starts at this share of the column width (295 of 372px). */
const MOBILE_START_W = 0.793;

/**
 * Hero: the statement on the left, the film on the right.
 *
 * On a desktop screen the hero is one pinned scene. The card starts small with
 * the "Creating ..." bubble sitting on its corner; as the visitor scrolls, the
 * statement lifts away, the bubble leaves to the right, and the card grows to
 * the full width of the column. By the time it lands, it IS the intro film.
 *
 * Playback rules, in order:
 *  - Nothing plays by itself while the card is small. The poster stands in and
 *    the play button is the only way to start it early.
 *  - If the visitor never touches the button, it starts the moment the card
 *    lands, and stops again if they scroll back up.
 *  - A visitor who pressed pause is left alone: it never restarts on its own.
 *  - It always starts muted, because browsers block autoplay with sound. The
 *    sound button is the only thing that unmutes it.
 *  - Under reduced motion there is no scene and no autoplay. It is a poster,
 *    the buttons and a static layout.
 *
 * Below `lg` it is a shorter version of the same idea. The card sits under the
 * title with the bubble on its corner; scrolling lifts the statement away,
 * grows the card to the full column and brings it up under the nav, and the
 * tools row rises to meet it. The scene ends exactly there, so no gap is left.
 * The same playback rules apply.
 *
 * The entrance is CSS and transform-only (see globals.css) so the LCP text
 * paints on the first frame. The exit tweens here run on wrapper elements, never
 * on the elements carrying the CSS entrance: that animation uses
 * `fill-mode: both`, which would pin its end transform over anything GSAP set.
 */
export function Hero() {
  const reduced = useReducedMotion();
  const [word, setWord] = useState<string>(site.rotating[0]);
  const [playing, setPlaying] = useState(false);
  const [soundOn, setSoundOn] = useState(false);

  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const filmRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const playRef = useRef<HTMLButtonElement>(null);
  const soundRef = useRef<HTMLButtonElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /** What the visitor asked for. "auto" means they have not touched it. */
  const intent = useRef<"auto" | "play" | "pause">("auto");
  /** Whether the scene says it should be playing without being asked. */
  const autoWanted = useRef(false);
  /** Whether the hero is anywhere near the screen. */
  const onScreen = useRef(true);

  const sync = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const want =
      intent.current === "play" || (intent.current === "auto" && autoWanted.current);
    if (want && onScreen.current && !document.hidden) {
      video.play().catch((err: DOMException) => {
        // AbortError is a pause landing before play resolved. Anything else
        // (low power mode, a blocked autoplay policy) means it is not going to
        // run, so hand control back to the button instead of leaving it saying
        // Pause.
        if (err.name !== "AbortError") {
          intent.current = "auto";
          autoWanted.current = false;
          setPlaying(false);
        }
      });
    } else if (!video.paused) {
      video.pause();
    }
  }, []);

  const toggle = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.preload = "auto";
      intent.current = "play";
    } else {
      intent.current = "pause";
    }
    sync();
  };

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setSoundOn(!video.muted);
    // Asking for sound on a film that isn't running means they want to hear it.
    if (!video.muted && video.paused) toggle();
  };

  // The typewriter. It waits for `load` so the sentence is painted and measured
  // once, statically, before it ever animates.
  useEffect(() => {
    if (reduced) return;
    let cancelled = false;
    let i = 0;
    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

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

  // Pause for a hidden tab and for a hero that has scrolled away.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen.current = entry.isIntersecting;
        sync();
      },
      { rootMargin: "200px 0px", threshold: 0 }
    );
    io.observe(stage);
    document.addEventListener("visibilitychange", sync);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [sync]);

  useGSAP(
    () => {
      const stage = stageRef.current;
      const box = boxRef.current;
      const anchor = anchorRef.current;
      const film = filmRef.current;
      const media = mediaRef.current;
      const bubble = bubbleRef.current;
      const play = playRef.current;
      const sound = soundRef.current;
      const video = videoRef.current;
      if (!stage || !box || !anchor || !film || !media || !bubble) return;
      const controls = [play, sound].filter(Boolean);

      const mm = gsap.matchMedia();

      // ---- Desktop: the pinned scene.
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const exits = gsap.utils.toArray<HTMLElement>("[data-exit]", copyRef.current);

        // Where the card lands, in the box's own coordinates. Read from the
        // current layout every refresh, so a resize or a late font can't leave
        // it aimed at last frame's geometry.
        const landed = () => {
          const w = box.clientWidth;
          const h = Math.min((w * 9) / 16, window.innerHeight - LANDED_MARGIN * 2);
          const width = (h * 16) / 9;
          return {
            width,
            height: h,
            // The anchor's right edge is the box's right edge, so centring is a
            // right offset of half the slack.
            right: (w - width) / 2,
            // The anchor sits 64px above the stage floor; the card lands
            // vertically centred in the stage.
            bottom: (stage.clientHeight - h) / 2 - parseFloat(getComputedStyle(anchor).bottom),
          };
        };

        gsap.set(film, { transformOrigin: "100% 100%" });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            end: () => `+=${Math.round(window.innerHeight * SCENE_VH)}`,
            pin: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              autoWanted.current = self.progress >= LANDED;
              // Start fetching before the card lands, so the first frame is
              // there when it does. `preload="none"` alone would wait for play.
              if (video && self.progress > 0.12 && video.preload === "none") video.preload = "auto";
              sync();
            },
          },
        });

        // 1. The statement lifts away, line by line, and fades out.
        tl.to(
          exits,
          { y: -110, opacity: 0, ease: "power2.in", duration: 0.34, stagger: 0.035 },
          0
        )
          // 2. The bubble leaves first, to the right, with a little tilt so it
          //    reads as thrown off rather than faded.
          .to(
            bubble,
            { x: 220, y: -36, rotate: 6, opacity: 0, ease: "power3.in", duration: 0.26 },
            0
          )
          // 3. The card grows into the intro film.
          .fromTo(
            film,
            {
              width: () => anchor.offsetWidth,
              height: () => anchor.offsetHeight,
              right: 0,
              bottom: 0,
              borderRadius: 14,
            },
            {
              width: () => landed().width,
              height: () => landed().height,
              right: () => landed().right,
              bottom: () => landed().bottom,
              borderRadius: 28,
              ease: "power3.inOut",
              duration: 0.8,
            },
            0.08
          )
          // The picture inside settles from slightly zoomed, so it feels like
          // the lens pulling back rather than a box being stretched.
          .fromTo(media, { scale: 1.12 }, { scale: 1, ease: "power2.out", duration: 0.8 }, 0.08)
          // The dotted field recedes so the film owns the frame.
          .to(stage.querySelector("[data-hero-dots]"), { opacity: 0.2, duration: 0.6 }, 0.1)
          // Hold on the landed frame, so there is a beat before the page moves.
          .to({}, { duration: 0.12 }, 0.88);

        if (controls.length) {
          tl.to(controls, { scale: 1.2, ease: "power2.inOut", duration: 0.8 }, 0.08);
        }

        return () => {
          autoWanted.current = false;
        };
      });

      // ---- Below `lg`: a shorter scene. The statement lifts away, the card
      // grows to the full width of the column and climbs to just under the nav,
      // and the tools row rises to sit right beneath it.
      mm.add("(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)", () => {
        // The mobile URL bar shows and hides while scrolling, which fires a
        // resize. Refreshing on each one would restart the scene mid-swipe.
        ScrollTrigger.config({ ignoreMobileResize: true });

        const exits = gsap.utils.toArray<HTMLElement>("[data-exit]", copyRef.current);

        // Where the card lands, in the anchor's own coordinates: full column
        // width, 16:9, with its top just under the nav. The anchor and the stage
        // move together, so their difference is the same at any scroll offset.
        const landed = () => {
          const width = box.clientWidth;
          const gap =
            anchor.getBoundingClientRect().top - stage.getBoundingClientRect().top;
          return { width, height: (width * 9) / 16, top: MOBILE_TOP - gap };
        };

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: stage,
            start: "top top",
            // No spacer: the scene is exactly as long as it takes the tools row
            // to climb to the landed card, so there is no gap left under it.
            pinSpacing: false,
            end: () =>
              `+=${Math.max(
                240,
                Math.round(stage.offsetHeight - (MOBILE_TOP + landed().height + MOBILE_GAP))
              )}`,
            pin: true,
            scrub: 0.5,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              autoWanted.current = self.progress >= LANDED;
              // Start fetching before the card lands, so the first frame is
              // there when it does. `preload="none"` alone would wait for play.
              if (video && self.progress > 0.12 && video.preload === "none") video.preload = "auto";
              sync();
            },
          },
        });

        tl.to(
          exits,
          { y: -90, opacity: 0, ease: "power2.in", duration: 0.4, stagger: 0.04 },
          0
        )
          .to(
            bubble,
            { x: 340, y: -24, rotate: 6, opacity: 0, ease: "power3.in", duration: 0.3 },
            0
          )
          .fromTo(
            film,
            {
              left: 0,
              top: 0,
              bottom: "auto",
              width: () => anchor.offsetWidth * MOBILE_START_W,
              height: () => anchor.offsetHeight,
              borderRadius: 14,
            },
            {
              left: 0,
              top: () => landed().top,
              width: () => landed().width,
              height: () => landed().height,
              borderRadius: 20,
              ease: "power3.inOut",
              duration: 0.85,
            },
            0.05
          )
          .fromTo(media, { scale: 1.1 }, { scale: 1, ease: "power2.out", duration: 0.85 }, 0.05)
          .to({}, { duration: 0.1 }, 0.9);

        return () => {
          autoWanted.current = false;
        };
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [sync] }
  );

  return (
    <section ref={rootRef} id="hero" aria-label="Introduction" className="relative">
      <div
        ref={stageRef}
        className="edge-fade-x relative flex h-[100svh] min-h-[640px] flex-col overflow-hidden pb-[var(--space-12)] pt-[var(--space-32)] lg:block lg:min-h-[680px] lg:p-0"
      >
        <div data-hero-dots aria-hidden className="pointer-events-none absolute inset-0">
          <DottedSurface />
        </div>

        <div className="shell relative flex flex-1 flex-col lg:block lg:h-full">
          <div ref={boxRef} className="relative flex flex-1 flex-col lg:h-full">
            {/* ---- The statement. Desktop pins it to the left column. On a phone
                the wrapper dissolves (`contents`) and its two parts take their
                places in the column by `order`: statement, then the film, then
                the button at the bottom. */}
            <div
              ref={copyRef}
              className="contents lg:absolute lg:inset-y-0 lg:left-0 lg:flex lg:w-[min(589px,46%)] lg:flex-col lg:justify-between lg:pb-16 lg:pt-32"
            >
              <div className="order-1 mt-auto lg:mt-0 lg:flex lg:flex-1 lg:flex-col lg:justify-center">
                <div data-exit className="mb-8">
                  <p data-hero-sub="0">
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
                      <span className="mono hero-pill-text text-fg-muted">
                        {site.availableLabel}
                      </span>
                    </span>
                  </p>
                </div>

                {/* `--text-hero` bottoms out at its 46px floor on phones, where
                    the name wraps and the base `h1` line-height of 0.92 would
                    set the lines tighter than the glyphs are tall. Desktop keeps
                    0.92. "Hi," is the one serif word, in the accent. Each line
                    clips its own overflow so the entrance wipe reads cleanly. */}
                <h1
                  data-exit
                  className="text-[length:var(--text-hero)] font-bold tracking-[-0.08em] max-md:leading-[1.125]"
                >
                  {/* "Hi," shares a line with the name on a phone, and sits
                      above it from `lg`. The serif is set a fifth larger on a
                      phone, as in the design (48px against 40px). */}
                  <span className="flex items-end gap-3 lg:block">
                    <span className="block overflow-hidden py-[0.06em]">
                      <span data-hero-line="1" className="block">
                        <span
                          className="serif-em max-lg:text-[1.2em]"
                          style={{ color: "var(--accent)" }}
                        >
                          Hi,
                        </span>
                      </span>
                    </span>
                    <span className="block overflow-hidden py-[0.06em]">
                      <span data-hero-line="1" className="block">
                        I&rsquo;m {site.name}
                      </span>
                    </span>
                  </span>
                  <span className="mt-2 block overflow-hidden py-[0.06em]">
                    <span
                      data-hero-line="2"
                      className="block text-[length:var(--text-hero-title)] font-normal normal-case leading-[1.25] tracking-[-0.02em] text-fg-muted"
                      style={{ animationDelay: "90ms" }}
                    >
                      {site.role} based in Vadodara
                    </span>
                  </span>
                </h1>
              </div>

              <div data-exit className="order-3 pt-14 lg:pt-0">
                <div data-hero-sub="2" className="flex">
                  <SplitButton href="#work" emphasis size="lg">
                    See the work
                  </SplitButton>
                </div>
              </div>
            </div>

            {/* ---- The film's resting place. It defines where the card starts;
                the card itself is the child that grows. */}
            <div
              ref={anchorRef}
              className="relative order-2 mt-[72px] aspect-[2.24/1] w-full lg:absolute lg:bottom-16 lg:right-0 lg:mt-0 lg:aspect-video lg:w-[43.2%]"
            >
              {/* On a phone the card starts at 79% of the column, left aligned,
                  with the bubble hanging past its right edge; from `lg` it
                  fills the anchor. */}
              <div
                ref={filmRef}
                className="absolute bottom-0 left-0 h-full w-[79.3%] overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised lg:left-auto lg:right-0 lg:w-full"
              >
                <div ref={mediaRef} className="absolute inset-0">
                  {SHOW_FILM ? (
                    <video
                      ref={videoRef}
                      muted
                      loop
                      playsInline
                      preload="none"
                      poster="/riyaz-intro-poster.webp"
                      aria-label="Intro film: Riyaz Malek, product designer, with sound effects."
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                      className="block h-full w-full object-cover"
                    >
                      <source src="/riyaz-intro.webm" type="video/webm" />
                      <source src="/riyaz-intro.mp4" type="video/mp4" />
                    </video>
                  ) : (
                    <Image
                      {...imageProps("/riyaz-intro-poster.avif")}
                      alt="Illustration of Riyaz Malek at a desk beside the words: Hi, I'm Riyaz Malek, product designer."
                      sizes="(max-width: 1024px) 100vw, 1280px"
                      priority
                      className="block h-full w-full object-cover"
                    />
                  )}
                </div>

                {SHOW_FILM ? (
                  <>
                    <button
                      ref={soundRef}
                      type="button"
                      onClick={toggleSound}
                      aria-label={soundOn ? "Turn intro film sound off" : "Turn intro film sound on"}
                      aria-pressed={soundOn}
                      className="absolute bottom-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] transition-colors duration-200 hover:border-[var(--btn-secondary-border-hover)] hover:bg-[var(--btn-secondary-bg-hover)] hover:text-[var(--btn-secondary-fg-hover)] right-[72px]"
                    >
                      <svg
                        viewBox="0 0 16 16"
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M2.5 6.25v3.5h2.25L8 12.5v-9L4.75 6.25H2.5Z" fill="currentColor" />
                        {soundOn ? (
                          <path d="M10.5 5.75a3.2 3.2 0 0 1 0 4.5M12.5 3.75a6 6 0 0 1 0 8.5" />
                        ) : (
                          <path d="m10.75 6.25 3.5 3.5m0-3.5-3.5 3.5" />
                        )}
                      </svg>
                    </button>

                    {/* Always there, so anything that moves for more than five
                        seconds has a way to stop it (WCAG 2.2.2). */}
                    <button
                      ref={playRef}
                      type="button"
                      onClick={toggle}
                      aria-label={playing ? "Pause intro film" : "Play intro film"}
                      className="absolute bottom-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] transition-colors duration-200 hover:border-[var(--btn-secondary-border-hover)] hover:bg-[var(--btn-secondary-bg-hover)] hover:text-[var(--btn-secondary-fg-hover)] right-4"
                    >
                      {playing ? (
                        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="currentColor" aria-hidden>
                          <rect x="3.5" y="2.5" width="3" height="11" rx="0.75" />
                          <rect x="9.5" y="2.5" width="3" height="11" rx="0.75" />
                        </svg>
                      ) : (
                        <svg
                          viewBox="0 0 16 16"
                          className="h-4 w-4 translate-x-[1px]"
                          fill="currentColor"
                          aria-hidden
                        >
                          <path d="M4.5 2.9v10.2a.75.75 0 0 0 1.14.64l8.1-5.1a.75.75 0 0 0 0-1.28l-8.1-5.1a.75.75 0 0 0-1.14.64Z" />
                        </svg>
                      )}
                    </button>
                  </>
                ) : null}
              </div>

              {/* The sentence, as a speech bubble on the card's corner. The word
                  is overlaid on an invisible copy of the longest option in the
                  same grid cell, so the bubble never resizes and the typewriter
                  animates text rather than layout. */}
              <div
                ref={bubbleRef}
                className="hero-bubble absolute bottom-[calc(100%-25px)] right-[3.8%] z-20 max-w-[92%] bg-[var(--accent)] p-4 text-[color:var(--btn-chip-fg)] lg:p-5"
              >
                <p
                  data-hero-sub="1"
                  className="text-[length:var(--text-bubble)] font-medium leading-[1.25] tracking-[-0.03em]"
                >
                  <span className="block">
                    Creating{" "}
                    <span className="relative inline-grid align-bottom">
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
                          style={{ background: "var(--btn-chip-fg)" }}
                        />
                      </span>
                    </span>
                  </span>
                  <span className="block">for humans since 2023.</span>
                  {/* The rotation is decorative; the full list is spoken once
                      here so a screen reader hears a sentence, not a stream of
                      keystrokes. */}
                  <span className="sr-only">
                    {" "}
                    Disciplines: {site.rotating.slice(0, -1).join(", ")}, and{" "}
                    {site.rotating[site.rotating.length - 1]}.
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
