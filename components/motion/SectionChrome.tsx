"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { splitText } from "@/lib/splitText";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Entrance for the shared section chrome: the rule draws, the eyebrow lifts,
 * the heading climbs out from behind a mask.
 *
 * It animates by attribute rather than by ref so `Section` can stay a server
 * component — only this wrapper ships to the client, its children don't.
 */
export function SectionChrome({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = ref.current;
      if (!root || reduced) return;

      const rule = root.querySelector<HTMLElement>("[data-sec-rule]");
      const eyebrow = root.querySelector<HTMLElement>("[data-sec-eyebrow]");
      const heading = root.querySelector<HTMLElement>("[data-sec-heading]");

      let revertHeading: (() => void) | undefined;
      let words: HTMLElement[] = [];

      if (heading) {
        const split = splitText(heading, "words", true);
        revertHeading = split.revert;
        words = split.parts;
        // The heading is held at opacity 0 by CSS until the split exists, so
        // the unmasked text never flashes.
        gsap.set(heading, { opacity: 1 });
        gsap.set(words, { yPercent: 110 });
      }

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });

      if (rule) {
        tl.fromTo(
          rule,
          { scaleX: 0 },
          { scaleX: 1, duration: 0.8, ease: "power3.out" },
          0
        );
      }
      if (eyebrow) {
        tl.fromTo(
          eyebrow,
          { opacity: 0, y: 12 },
          { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" },
          0.08
        );
      }
      if (words.length) {
        tl.to(
          words,
          {
            yPercent: 0,
            duration: 0.9,
            ease: "expo.out",
            stagger: 0.035,
            // Cleared so nothing downstream measures a transformed heading.
            clearProps: "transform",
          },
          0.14
        );
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
        revertHeading?.();
      };
    },
    { scope: ref, dependencies: [reduced] }
  );

  return (
    <div ref={ref} className="shell">
      {children}
    </div>
  );
}
