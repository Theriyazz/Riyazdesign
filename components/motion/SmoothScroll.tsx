"use client";

import { useEffect, useLayoutEffect } from "react";
import Lenis from "lenis";
import { usePathname } from "next/navigation";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The live instance, so anchor links can hand their scroll to Lenis instead
 * of fighting it with native `scrollIntoView`. Null under reduced motion —
 * callers fall back to native scrolling, which is what we want there anyway.
 */
let instance: Lenis | null = null;
export const getLenis = () => instance;

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Lenis, driven by GSAP's ticker so smooth scroll and ScrollTrigger share a
 * single RAF loop. Two loops fighting each other is the usual cause of
 * scroll-linked jitter.
 *
 * Never mounts under reduced motion — native scrolling is handed back intact.
 */
export function SmoothScroll() {
  const reduced = useReducedMotion();
  const pathname = usePathname();

  useEffect(() => {
    if (reduced) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      // Native momentum on touch beats anything we can emulate.
      syncTouch: false,
    });

    instance = lenis;
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      instance = null;
    };
  }, [reduced]);

  /*
   * A new route is a new document height; stale triggers would fire at the
   * wrong offsets. Recalculate once the fresh DOM has painted.
   *
   * A layout effect, and the timing is load-bearing. `PageTransition` measures
   * the viewport centre to pivot its bloom around, and this component is a
   * child of that provider — React runs effects child-first, so putting the
   * scroll reset here guarantees it has happened before the pivot is taken.
   * As a passive effect it would land a frame late and the page would appear
   * to slide as it bloomed.
   */
  useIsoLayoutEffect(() => {
    // Landing on /#work must not be yanked back to the top.
    if (!window.location.hash) {
      const lenis = instance;
      // Lenis is stopped for the duration of a page transition, and a bare
      // `window.scrollTo` would move the document without telling it — on
      // `.start()` it would snap back to its own cached position. `force`
      // scrolls even while stopped and keeps the two in agreement.
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
