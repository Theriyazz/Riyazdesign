"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { onCursorMode } from "@/lib/hoverTarget";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Accent dot with a lagging ring.
 *
 * Opt-in per element via `data-cursor`:
 *   data-cursor="view"  -> ring fills and shows a "View" label (project media)
 *   data-cursor="text"  -> ring collapses to a caret bar (headings, copy)
 *   data-cursor="hide"  -> both hide (native cursor takes over)
 *
 * The mode comes from `HoverSync` rather than from a `pointerover` listener
 * here. `pointerover` only fires when the browser re-runs its hit-test, which
 * it does on real pointer input and nothing else — so while Lenis scrolled the
 * page under a still pointer, the ring kept whatever mode it last resolved.
 * It would sit at "View", two sections past the card it belonged to, until the
 * mouse was nudged. `HoverSync` hit-tests on its own and publishes the answer.
 *
 * Mounts only where a real pointer exists, and never under reduced motion.
 */
export function Cursor() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) return;
    const mql = window.matchMedia("(pointer: fine)");
    const apply = () => setEnabled(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [reduced]);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    // quickTo keeps this to a single interpolated tween per axis rather than
    // allocating a new tween on every mousemove.
    const dotX = gsap.quickTo(dot, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring, "x", { duration: 0.42, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.42, ease: "power3.out" });

    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.2 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
    };

    const setMode = (mode: string | null) => {
      ring.dataset.mode = mode ?? "default";
      if (mode === "view") {
        gsap.to(ring, { scale: 2.1, duration: 0.34, ease: "power3.out" });
        gsap.to(dot, { scale: 0, duration: 0.24 });
      } else if (mode === "text") {
        gsap.to(ring, { scale: 0.4, duration: 0.3, ease: "power3.out" });
        gsap.to(dot, { scale: 1, duration: 0.24 });
      } else if (mode === "hide") {
        gsap.to([ring, dot], { scale: 0, duration: 0.2 });
      } else {
        gsap.to(ring, { scale: 1, duration: 0.34, ease: "power3.out" });
        gsap.to(dot, { scale: 1, duration: 0.24 });
      }
    };

    const unsubscribe = onCursorMode(setMode);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);

    return () => {
      unsubscribe();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      root.classList.remove("has-custom-cursor");
      gsap.killTweensOf([dot, ring]);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90]">
      <div
        ref={ringRef}
        data-mode="default"
        // Border colour lives in globals.css, not inline: an inline style wins
        // over every stylesheet rule, so the view-mode accent could never take.
        className="cursor-ring absolute -left-[18px] -top-[18px] grid h-9 w-9 place-items-center rounded-full border opacity-0"
      >
        {/* Size is set in globals.css too. A `text-[6px]` utility here is inert
            — `.mono` is unlayered and outranks every Tailwind utility, so this
            label has been rendering at the mono size all along. */}
        <span className="cursor-ring-label mono opacity-0">View</span>
      </div>
      <div
        ref={dotRef}
        className="absolute -left-1 -top-1 h-2 w-2 rounded-full opacity-0"
        style={{ background: "var(--cursor-dot)" }}
      />
    </div>
  );
}
