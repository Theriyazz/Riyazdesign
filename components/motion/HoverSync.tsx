"use client";

import { useEffect } from "react";
import { setCursorMode } from "@/lib/hoverTarget";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Resolves what the pointer is over, and keeps resolving it while the page
 * moves underneath a pointer that hasn't.
 *
 * The browser only re-runs its hover hit-test when it believes something moved.
 * A wheel gesture never reaches it as a scroll here: Lenis takes the wheel
 * event, cancels it, and moves the page itself from a RAF loop. The pointer has
 * not moved and, as far as the browser is concerned, neither has anything else
 * — so `:hover` stays pinned to whatever it landed on before the scroll began,
 * and `pointerover` never fires for whatever scrolled into its place.
 *
 * Reported as: a work card's "View" cursor still showing three sections later,
 * a row staying lit after it has scrolled away, and the row now under the
 * cursor never lighting. One pixel of mouse movement fixes all of it, because
 * that is a real pointer event and the browser re-tests.
 *
 * The first attempt at this tried to make the browser re-test — flipping
 * `pointer-events` for a frame to invalidate its cached hit-test. It does not
 * work: displacing an element under a stationary pointer and then flipping
 * `pointer-events` leaves `:hover` exactly where it was. So this does not ask
 * the browser anything. It hit-tests with `elementFromPoint`, which always
 * answers against current geometry, and writes the answer to the DOM itself.
 *
 * `data-hovered` is that answer. The stylesheet pairs it with `:hover`
 * everywhere, so ordinary mouse-move hover keeps working untouched (and still
 * works with JS off), and this only has to carry the case the browser drops.
 */

/**
 * What we mark. Everything whose appearance depends on being hovered:
 * the row treatments, the underline sweep, and the work card's `group`, whose
 * cover scale and label colours are all `group-hover:` utilities.
 */
const TARGETS = ".hover-row, .link-sweep, .group";

/**
 * Minimum gap between hit-tests while the page is moving. A hit-test is cheap
 * but it is not free, and hover has no visible resolution finer than this.
 */
const THROTTLE_MS = 60;

/**
 * One more pass after the page stops. Lenis keeps emitting scroll events
 * through its easing tail, so this only fires once movement has truly finished
 * — the state the reader is left looking at is the one that has to be right.
 */
const SETTLE_MS = 100;

export function HoverSync() {
  const reduced = useReducedMotion();

  useEffect(() => {
    // No fine pointer means no hover to keep in sync.
    if (!window.matchMedia("(pointer: fine)").matches) return;
    // Under reduced motion Lenis never mounts. Scrolling is native, the browser
    // re-tests hover on its own, and the custom cursor is disabled — so there
    // is nothing here left to fix.
    if (reduced) return;

    let x: number | null = null;
    let y: number | null = null;
    let marked: Element[] = [];
    let timer: number | undefined;
    let last = 0;

    const clear = () => {
      for (const el of marked) el.removeAttribute("data-hovered");
      marked = [];
      setCursorMode(null);
    };

    const resolve = () => {
      last = performance.now();
      if (x === null || y === null) return;

      const under = document.elementFromPoint(x, y);
      if (!under) return clear();

      // The whole ancestor chain, not just the nearest match: a `.link-sweep`
      // inside a `.hover-row` means both are hovered, which is what `:hover`
      // would have done.
      const next: Element[] = [];
      for (let node: Element | null = under; node; node = node.parentElement) {
        if (node.matches(TARGETS)) next.push(node);
      }

      for (const el of marked) {
        if (!next.includes(el)) el.removeAttribute("data-hovered");
      }
      for (const el of next) {
        if (!marked.includes(el)) el.setAttribute("data-hovered", "");
      }
      marked = next;

      const owner = under.closest<HTMLElement>("[data-cursor]");
      setCursorMode(owner?.dataset.cursor ?? null);
    };

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      resolve();
    };

    // Pointer gone from the window: drop everything rather than leave a row lit
    // at the last coordinate we happened to see.
    const onLeave = () => {
      x = null;
      y = null;
      clear();
    };

    const onScroll = () => {
      if (performance.now() - last >= THROTTLE_MS) resolve();
      window.clearTimeout(timer);
      timer = window.setTimeout(resolve, SETTLE_MS);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    // The native scroll event rather than Lenis's own, so this keeps working if
    // Lenis is ever switched off or swapped out.
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      clear();
    };
  }, [reduced]);

  return null;
}
