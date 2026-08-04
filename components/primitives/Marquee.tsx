"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

/**
 * Seamless horizontal marquee.
 *
 * The track is duplicated and wrapped with modifiers so it loops without a
 * visible seam and without ever re-measuring. Under reduced motion it renders
 * as a static, horizontally scrollable row — the content stays reachable
 * rather than disappearing with the animation.
 */
export function Marquee({
  children,
  speed = 40,
  className,
}: {
  children: ReactNode;
  /** Seconds for one full pass. Higher is slower. */
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced) return;
      const track = ref.current;
      if (!track) return;

      const items = Array.from(track.children) as HTMLElement[];
      if (!items.length) return;

      const total = track.scrollWidth / 2;

      gsap.set(items, { x: 0 });
      const tween = gsap.to(items, {
        x: `-=${total}`,
        duration: speed,
        ease: "none",
        repeat: -1,
        modifiers: {
          x: (x) => `${gsap.utils.wrap(-total, 0, parseFloat(x))}px`,
        },
      });

      return () => tween.kill();
    },
    { scope: ref, dependencies: [reduced, speed] }
  );

  // Under reduced motion the track wraps instead of scrolling, so every item
  // stays visible without motion. Browsers make overflow containers keyboard-
  // focusable, and a focusable aria-hidden element is an axe violation — so we
  // never combine `aria-hidden` with a scrollable box.
  if (reduced) {
    return (
      <div className={cn("relative w-full", className)} aria-hidden>
        <div className="flex flex-wrap items-center gap-x-[var(--space-16)] gap-y-3">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full overflow-hidden", className)} aria-hidden>
      <div ref={ref} className="flex w-max items-center gap-[var(--space-16)]">
        {children}
        {children}
      </div>
    </div>
  );
}
