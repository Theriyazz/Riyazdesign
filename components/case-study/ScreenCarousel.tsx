"use client";

import { Children, isValidElement, useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * A horizontal gallery of final screens, one large screen at a time.
 *
 * WHY THIS EXISTS: a set of screens composed into one 3x3 board renders each
 * screen near 260px inside the 820px reading column, which is enough to see a
 * layout and not enough to read one. Showing one at a time puts each screen at
 * ~705px — the same pixels, spent on one screen instead of nine.
 *
 * WHY NOT AUTOPLAY: this scrolls only when the reader scrolls it. An
 * auto-advancing gallery moves content out from under someone mid-sentence,
 * and the usual patch for that — pause on hover — reaches neither keyboard nor
 * touch users, so a gallery that auto-advances also fails WCAG 2.2.2. Nothing
 * here starts on its own, so there is nothing to pause.
 *
 * WHY SCROLL-SNAP RATHER THAN A TRANSFORM TRACK: the browser already knows how
 * to do this. Touch swipe, trackpad momentum, snap physics and keyboard
 * scrolling all come free and behave natively per platform. The arrows are a
 * `scrollBy` on top, not a parallel state machine that can disagree with where
 * the track actually is — the active dot is read back from scroll position, so
 * one source of truth however the reader moved.
 *
 * This is for SHIPPED screens only. Wireframes, sitemaps and research artifacts
 * stay as single figures: they are one artifact to study, not a set to browse.
 */
export function ScreenCarousel({
  children,
  label,
}: {
  children: React.ReactNode;
  /** Names the set for screen readers, e.g. "Student dashboard". */
  label: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef(0);
  const [active, setActive] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => () => {
    if (tweenRef.current) cancelAnimationFrame(tweenRef.current);
  }, []);

  /**
   * A tween only advances while the page is painting. Backgrounding the tab
   * mid-scroll parks `requestAnimationFrame`, and the slide would be left
   * between two snap points with snapping still switched off. On the way back,
   * drop the dead tween and let snap resolve the position.
   */
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden || !tweenRef.current) return;
      cancelAnimationFrame(tweenRef.current);
      tweenRef.current = 0;
      if (trackRef.current) trackRef.current.style.scrollSnapType = "";
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const slides = Children.toArray(children).filter(isValidElement);
  const count = slides.length;

  /**
   * Active slide is derived from scroll position rather than tracked
   * separately, so arrows, swipe, trackpad and keyboard all land on the same
   * answer. rAF-throttled: scroll fires far more often than the dots change.
   */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let frame = 0;
    const read = () => {
      frame = 0;
      const children = Array.from(track.children) as HTMLElement[];
      if (!children.length) return;
      // Nearest slide to the track's left edge, measured in the track's own
      // coordinate space so it survives padding and gaps.
      let nearest = 0;
      let best = Infinity;
      for (let i = 0; i < children.length; i++) {
        const d = Math.abs(children[i].offsetLeft - track.scrollLeft);
        if (d < best) {
          best = d;
          nearest = i;
        }
      }
      setActive(nearest);
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(read);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    read();
    return () => {
      track.removeEventListener("scroll", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [count]);

  /**
   * Scroll to a slide.
   *
   * WHY NOT `scrollTo({ behavior: "smooth" })`: measured, it does nothing here —
   * the scroll position stays put, with or without snap, while `behavior:
   * "auto"` moves correctly. Native smooth scrolling is not dependable on this
   * page (Lenis is driving the document, and automated browsers routinely
   * no-op it), so the animation is run here instead of asked for. A tween we
   * own also lands on the exact snap offset, which a cancelled native scroll
   * would not.
   *
   * Snap is switched off for the duration: `scroll-snap-type: mandatory` pulls
   * against a scroll position being set every frame, and re-snapping mid-tween
   * reads as a stutter. It is restored the moment the tween lands, so a swipe
   * that starts a millisecond later still snaps normally.
   */
  const goTo = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const target = track.children[Math.max(0, Math.min(index, count - 1))] as
        | HTMLElement
        | undefined;
      if (!target) return;

      // `offsetLeft` is measured from the offsetParent, so the track has to be
      // positioned or these come back relative to the page and every target is
      // off by the page gutter.
      const left = target.offsetLeft;

      if (tweenRef.current) cancelAnimationFrame(tweenRef.current);

      if (reduced) {
        track.scrollLeft = left;
        return;
      }

      const from = track.scrollLeft;
      const distance = left - from;
      if (!distance) return;

      // Cleared to "" rather than to whatever was on the element a moment ago:
      // a second click while a tween is still running would otherwise read the
      // in-flight "none" as the value to restore, and snap would stay off for
      // the rest of the session. "" hands control back to the stylesheet, which
      // is the only thing that should own it.
      track.style.scrollSnapType = "none";
      const started = performance.now();
      const DURATION = 420;

      const step = (now: number) => {
        const p = Math.min((now - started) / DURATION, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        track.scrollLeft = from + distance * eased;
        if (p < 1) {
          tweenRef.current = requestAnimationFrame(step);
        } else {
          track.style.scrollSnapType = "";
          tweenRef.current = 0;
        }
      };
      tweenRef.current = requestAnimationFrame(step);
    },
    [count, reduced]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goTo(active + 1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      goTo(active - 1);
    }
  };

  if (!count) return null;

  return (
    <figure
      className="my-16"
      role="group"
      aria-roledescription="carousel"
      aria-label={label}
    >
      {/*
        `tabIndex={0}` because a scrollable region has to be reachable by
        keyboard on its own (WCAG 2.1.1) — the arrow buttons below are a
        convenience, not the only way through.
      */}
      <div
        ref={trackRef}
        tabIndex={0}
        onKeyDown={onKeyDown}
        aria-label={`${label} — ${count} screens, scrollable`}
        onPointerDown={() => {
          // The reader has taken over. Drop any running tween rather than
          // fight their finger for the scroll position.
          if (tweenRef.current) {
            cancelAnimationFrame(tweenRef.current);
            tweenRef.current = 0;
            if (trackRef.current) trackRef.current.style.scrollSnapType = "";
          }
        }}
        className="screen-track relative flex snap-x snap-mandatory gap-4 overflow-x-auto rounded-[var(--radius-squircle)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--case-accent)]"
      >
        {/* `Screen` brings its own frame and name — see the note on it in
            mdx.tsx. This only owns the slide's width and snap behaviour. */}
        {slides.map((slide, i) => (
          <div
            key={i}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}`}
            className="w-[86%] shrink-0 snap-start"
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex gap-2">
          <CarouselButton
            direction="prev"
            disabled={active === 0}
            onClick={() => goTo(active - 1)}
          />
          <CarouselButton
            direction="next"
            disabled={active === count - 1}
            onClick={() => goTo(active + 1)}
          />
        </div>

        {/*
          Dots are buttons, not decoration — each one is a real destination.

          Hidden below `sm`, and not because they don't fit: at twelve screens
          they would wrap to three rows on a 375px phone. Nothing is lost, since
          every slide is still reachable by swipe and by the 44px arrows, and
          the live counter says where you are.

          The button is a 24px square hit target with a small dot drawn inside
          it, rather than a 8px button. A control you have to aim at is a
          control most people miss.
        */}
        <div className="hidden flex-wrap items-center gap-1 sm:flex">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Screen ${i + 1} of ${count}`}
              aria-current={i === active ? "true" : undefined}
              className="group grid h-6 min-w-6 place-items-center px-1"
            >
              <span
                className={`h-2 rounded-full transition-all duration-300 ease-[var(--ease-out)] ${
                  i === active
                    ? "w-6 bg-[var(--case-accent)]"
                    : "w-2 bg-[var(--border-strong)] group-hover:bg-fg-muted"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Live count, so the position is available to a screen reader without
            having to walk the dots. */}
        <span className="label ml-auto tabular-nums text-fg-muted" aria-live="polite">
          {active + 1} / {count}
        </span>
      </div>
    </figure>
  );
}

function CarouselButton({
  direction,
  disabled,
  onClick,
}: {
  direction: "prev" | "next";
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={direction === "prev" ? "Previous screen" : "Next screen"}
      className="grid h-11 w-11 place-items-center rounded-full border border-[var(--btn-secondary-border)] bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-fg)] transition-colors duration-200 hover:border-[var(--btn-secondary-border-hover)] hover:bg-[var(--btn-secondary-bg-hover)] hover:text-[var(--btn-secondary-fg-hover)] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-[var(--btn-secondary-bg)] disabled:hover:text-[var(--btn-secondary-fg)]"
    >
      <svg
        viewBox="0 0 16 16"
        className={`h-4 w-4 ${direction === "prev" ? "rotate-180" : ""}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M6 3.5 10.5 8 6 12.5" />
      </svg>
    </button>
  );
}
