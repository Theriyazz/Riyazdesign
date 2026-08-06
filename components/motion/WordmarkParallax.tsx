"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The footer wordmark rising as the footer comes into view.
 *
 * Scrubbed, so unlike every entrance on the page it keeps working the whole
 * time the element is on screen. That is the cost, and it is why this is
 * desktop-only: on a phone the footer is a long scroll of its own and the
 * effect would run for most of it.
 *
 * Safe to scrub precisely because the wordmark is decoration — it is already
 * `aria-hidden`, it repeats the nav and the contact block, and nothing about
 * reading the page depends on where it happens to sit.
 */
export function WordmarkParallax({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      const target = inner.current;
      if (!el || !target || reduced) return;
      if (!window.matchMedia("(min-width: 768px)").matches) return;

      // Trigger is the outer element, target is the inner one — deliberately
      // not the same node. When a scrubbed tween moves its own trigger, the
      // end position ("bottom bottom") moves down with it, so the scrub can
      // never resolve: at the true bottom of the page the wordmark was still
      // sitting ~12px low, which the footer's `overflow: hidden` then took off
      // the descenders. Only the inner div is transformed, so the measurement
      // the trigger depends on stays still.
      const tween = gsap.fromTo(
        target,
        { yPercent: 30 },
        {
          yPercent: 0,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom bottom",
            scrub: true,
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <div ref={ref}>
      <div ref={inner}>{children}</div>
    </div>
  );
}
