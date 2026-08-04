"use client";

import { useRef, type ElementType, type ReactNode } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";
import { splitText } from "@/lib/splitText";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

interface Props {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** "scrub" fills word-by-word with the scrollbar; "burst" plays once on enter. */
  mode?: "scrub" | "burst";
}

/**
 * Word-by-word opacity fill, as in the IntegratedBio statements.
 *
 * The text ships in the DOM as plain text — the split happens client-side
 * after mount. With JS off, or under reduced motion, the paragraph is simply
 * a paragraph.
 */
export function RevealText({
  children,
  as: Tag = "p",
  className,
  mode = "scrub",
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      const { parts, revert } = splitText(el, "words");

      const tween =
        mode === "scrub"
          ? gsap.fromTo(
              parts,
              // Matches the CSS resting floor in globals.css — see the note
              // there on why it can't go lower.
              { opacity: 0.5 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.5,
                scrollTrigger: {
                  trigger: el,
                  start: "top 78%",
                  end: "bottom 55%",
                  scrub: 0.8,
                },
              }
            )
          : gsap.fromTo(
              parts,
              { opacity: 0, yPercent: 60 },
              {
                opacity: 1,
                yPercent: 0,
                duration: 0.7,
                ease: "expo.out",
                stagger: 0.035,
                scrollTrigger: { trigger: el, start: "top 85%" },
              }
            );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        revert();
      };
    },
    { scope: ref, dependencies: [reduced, mode] }
  );

  return (
    // Polymorphic: the ref type is widened to HTMLElement by the caller's `as`.
    <Tag ref={ref} data-reveal className={cn(className)}>
      {children}
    </Tag>
  );
}

/**
 * Staggered entrance for a group's direct children (cards, rows, grid cells).
 * Capped at 8 by the plan: past that the last item reads as lag, not rhythm.
 */
export function RevealGroup({
  children,
  className,
  as: Tag = "div",
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  y?: number;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      const items = Array.from(el.children) as HTMLElement[];
      if (!items.length) return;

      gsap.fromTo(
        items,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration: 0.62,
          ease: "power3.out",
          stagger: 0.075,
          scrollTrigger: { trigger: el, start: "top 88%" },
        }
      );
      ScrollTrigger.refresh();
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    // Polymorphic: the ref type is widened to HTMLElement by the caller's `as`.
    <Tag ref={ref} data-reveal-group className={cn(className)}>
      {children}
    </Tag>
  );
}
