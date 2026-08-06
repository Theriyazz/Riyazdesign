"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

/**
 * Image entrance: a panel wipes off the picture while the picture settles.
 *
 * The wipe is an opaque panel scaled away rather than a `clip-path: inset()`
 * on the frame. `clip-path` is the obvious way to do this and would be the
 * first thing on the page animating a property that is neither transform nor
 * opacity; a scaled panel looks identical and keeps that rule intact.
 *
 * `parallax` drifts the image inside its own frame as the page scrolls. It is
 * desktop-only and off by default: it is the one thing here that keeps working
 * after the entrance has finished, so it is also the only thing here with an
 * ongoing cost.
 */
export function ClipReveal({
  children,
  className,
  parallax = false,
  /** Delays the wipe so it can sit inside a larger sequence. */
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  parallax?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reduced) return;

      const panel = root.querySelector<HTMLElement>("[data-clip-panel]");
      const inner = root.querySelector<HTMLElement>("[data-clip-inner]");
      if (!panel || !inner) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
        delay,
      });

      tl.fromTo(
        panel,
        { scaleY: 1 },
        {
          scaleY: 0,
          duration: 1,
          ease: "expo.out",
          // The panel has done its job the moment it is gone. Leaving it
          // scaled to zero would keep an invisible transformed element in
          // front of the image for the rest of the session.
          onComplete: () => gsap.set(panel, { display: "none" }),
        },
        0
      ).fromTo(
        inner,
        { scale: 1.08 },
        {
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          // Only safe to clear when nothing else owns this element's
          // transform. With `parallax` on, the scrub below writes `yPercent`
          // to the same node, and `clearProps: "transform"` would wipe its
          // offset the moment the entrance finished — the image would jump,
          // then drift back on the next scroll frame.
          clearProps: parallax ? undefined : "transform",
        },
        0
      );

      let drift: gsap.core.Tween | undefined;
      if (parallax) {
        // Desktop only: a scrub keeps working for the whole time the element
        // is on screen, which is exactly the cost a phone should not carry.
        const mq = window.matchMedia("(min-width: 768px)");
        if (mq.matches) {
          drift = gsap.fromTo(
            inner,
            { yPercent: -6 },
            {
              yPercent: 6,
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            }
          );
        }
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        drift?.scrollTrigger?.kill();
        drift?.kill();
      };
    },
    { scope: ref, dependencies: [reduced, parallax, delay] }
  );

  return (
    <div ref={ref} data-clip-reveal className={cn("relative overflow-hidden", className)}>
      <div data-clip-inner className="h-full w-full">
        {children}
      </div>
      {/* Origin bottom: the panel shrinks downward, so the image is revealed
          from the top edge down.

          It is opaque and covers the whole picture, so it must never exist
          without the script that takes it away — see the `[data-clip-panel]`
          rules in globals.css, which keep it out of the no-JS and
          reduced-motion paths. Getting that wrong hides every image on the
          page for anyone browsing without JavaScript. */}
      <div
        data-clip-panel
        aria-hidden
        className="pointer-events-none absolute inset-0 origin-bottom"
        style={{ background: "var(--bg-raised)" }}
      />
    </div>
  );
}

/**
 * Refresh once images have settled.
 *
 * Covers arrive after first paint and change the document height when they do,
 * which leaves every trigger below them measuring against stale offsets.
 */
export function refreshTriggersOnLoad() {
  if (document.readyState === "complete") {
    ScrollTrigger.refresh();
    return;
  }
  window.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
}
