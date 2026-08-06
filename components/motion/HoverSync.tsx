"use client";

import { useEffect } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Keeps hover honest when the page scrolls under a stationary pointer.
 *
 * The browser only re-runs its hover hit-test when it believes something
 * moved. A wheel gesture here never reaches it as a scroll: Lenis takes the
 * wheel event, cancels it, and moves the page itself from a RAF loop. The
 * pointer has not moved and, as far as the browser is concerned, neither has
 * anything else — so `:hover` stays pinned to whatever it landed on before the
 * scroll began.
 *
 * That is the reported bug. A row stays lit long after it has scrolled away,
 * the row now under the cursor never lights, and the custom cursor keeps the
 * `data-cursor` mode it last resolved. Nudging the mouse one pixel fixes all
 * three at once, because that is a real pointer event and the browser re-tests.
 *
 * Every hover treatment on the site rides on that single browser state —
 * `.hover-row`, `.link-sweep`, Tailwind's `group-hover`, and the `pointerover`
 * the cursor listens for — so correcting the state fixes all of them, and
 * anything added later, rather than re-implementing each one in JS.
 */

/**
 * How long after the last scroll event to re-test.
 *
 * The final check, after the page has stopped moving. Lenis keeps emitting
 * scroll events through its own easing tail, so this timer does not start
 * counting until the movement has actually finished — which is the moment the
 * hover state has to be right, because it is the state the reader is left
 * looking at.
 */
const SETTLE_MS = 120;

/**
 * Minimum gap between checks while the page is still moving.
 *
 * Correcting on every scrolled frame was the first attempt and it was wrong
 * twice over: the document is untargetable for the frame a correction takes,
 * so a click landing mid-scroll could be swallowed, and hover genuinely lags
 * `elementFromPoint` by a frame during a scroll, which made the staleness
 * check fire constantly on a browser that had nothing wrong with it.
 *
 * At 100ms hover keeps up with a scroll closely enough to read as live, while
 * the untargetable frames add up to a few percent of the gesture — and a wheel
 * scroll is not a gesture anyone clicks during.
 */
const THROTTLE_MS = 100;

/**
 * Module scope, not per-instance.
 *
 * React runs effects twice in development, so there can be two of these alive
 * at once. With the flag on the instance, the second could begin a correction
 * while the first was mid-correction and restore `pointer-events` to the
 * `none` it had read from the first — latching it on and leaving the whole
 * page unclickable. It is a module-wide lock on a document-wide property.
 */
let correcting = false;

export function HoverSync() {
  const reduced = useReducedMotion();

  useEffect(() => {
    // Under reduced motion Lenis never mounts, scrolling is native, and the
    // browser keeps hover in sync by itself. No fine pointer, no hover at all.
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    /** Last real pointer position. Null until the pointer has been seen. */
    let x: number | null = null;
    let y: number | null = null;
    let timer: number | undefined;
    let lastCheck = 0;

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
    };

    // Pointer outside the window: hover is the browser's business again, and
    // `elementFromPoint` would be answering about a coordinate we no longer own.
    const onLeave = () => {
      x = null;
      y = null;
    };

    /**
     * There is no API for "re-run your hit test". Making the document briefly
     * untargetable is what works: changing `pointer-events` invalidates the
     * cached result, and on the next frame the browser resolves hover against
     * the geometry as it now is, firing the pointerout/pointerover pair it
     * skipped. One frame, and only when something is actually stale.
     */
    const correct = () => {
      if (correcting) return;
      correcting = true;
      document.body.style.pointerEvents = "none";
      requestAnimationFrame(() => {
        // Cleared outright rather than restored to a remembered value. The
        // only correct state afterwards is "no inline override", and reading
        // the old value back is exactly how this used to latch itself on.
        document.body.style.pointerEvents = "";
        correcting = false;
      });
    };

    const check = () => {
      lastCheck = performance.now();
      if (correcting || x === null || y === null) return;

      const under = document.elementFromPoint(x, y);
      if (!under) return;

      // `:hover` applies to the whole ancestor chain, so whatever sits under
      // the pointer is hovered too — unless the browser's idea of that chain
      // is stale, which is the only case worth paying a correction for.
      if (!under.matches(":hover")) correct();
    };

    const onScroll = () => {
      // Throttled while moving, so hover tracks the scroll rather than waiting
      // for it to end...
      if (performance.now() - lastCheck >= THROTTLE_MS) check();
      // ...and once more after it stops, because the throttled pass can land
      // mid-glide and leave the final resting position untested.
      window.clearTimeout(timer);
      timer = window.setTimeout(check, SETTLE_MS);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    // The native scroll event rather than Lenis's own: Lenis moves the page
    // with `scrollTo`, so this fires either way and keeps working if Lenis is
    // ever switched off or swapped out.
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      // Never leave the document untargetable behind us.
      document.body.style.pointerEvents = "";
      correcting = false;
    };
  }, [reduced]);

  return null;
}
