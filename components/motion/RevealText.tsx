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
 * Resting state of an unrevealed word. Mirrored by the `[data-reveal-sheen]`
 * rule in globals.css, which paints the same values before the split exists —
 * change one and you must change the other, or the block flashes crisp for a
 * frame before GSAP takes over.
 */
const SHEEN_REST_OPACITY = 0.35;
const SHEEN_REST_BLUR = 8;

/**
 * Sheen fill: words resolve out of a blur, in one continuous pass.
 *
 * The difference from `RevealText` is that this splits *every* paragraph
 * inside it and puts all their words on a single scrubbed timeline, in DOM
 * order. Two sibling `RevealText`s each own a trigger, so their fills overlap
 * — the second paragraph starts brightening while the first is still going.
 * Here the first block always finishes before the second begins, because
 * they're one stagger.
 *
 * `duration` is deliberately much longer than `stagger`, so roughly seven
 * words are mid-transition at any moment. That overlap is the effect: a hard
 * edge would read as a wipe, the falloff reads as a sheen.
 */
export function RevealSheen({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      const lines = Array.from(
        el.querySelectorAll<HTMLElement>("[data-sheen-line]")
      );
      if (!lines.length) return;

      const words: HTMLElement[] = [];
      const reverts: Array<() => void> = [];
      for (const line of lines) {
        const { parts, revert } = splitText(line, "words");
        words.push(...parts);
        reverts.push(revert);
      }
      if (!words.length) return;

      const tween = gsap.fromTo(
        words,
        { opacity: SHEEN_REST_OPACITY, filter: `blur(${SHEEN_REST_BLUR}px)` },
        {
          opacity: 1,
          filter: "blur(0px)",
          ease: "none",
          duration: 2.2,
          stagger: 0.3,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            // Ends while the block is still well inside the viewport rather
            // than as it leaves. A reader who stops scrolling mid-statement
            // should be looking at finished text, not at blur.
            end: "bottom 72%",
            scrub: 0.6,
          },
        }
      );

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
        // Reverted in reverse so each restore sees the DOM it was taken from.
        for (const revert of reverts.reverse()) revert();
      };
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <div ref={ref} data-reveal-sheen className={cn(className)}>
      {children}
    </div>
  );
}

/**
 * A rule that draws itself on scroll.
 *
 * `SectionChrome` does this inline for the section `hr`; this is the same move
 * for the one-off rules — a pull quote's edge, a divider — that live outside
 * that chrome. Scale only, so it stays on the compositor.
 */
export function DrawRule({
  className,
  style,
  axis = "y",
}: {
  className?: string;
  style?: React.CSSProperties;
  /** "y" draws downward for a vertical rule; "x" draws rightward. */
  axis?: "x" | "y";
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || reduced) return;

      const from = axis === "y" ? { scaleY: 0 } : { scaleX: 0 };
      const to = axis === "y" ? { scaleY: 1 } : { scaleX: 1 };

      const tween = gsap.fromTo(el, from, {
        ...to,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });

      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    },
    { scope: ref, dependencies: [reduced, axis] }
  );

  return <span ref={ref} aria-hidden className={cn(className)} style={style} />;
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
