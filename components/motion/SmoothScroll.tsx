"use client";

import { useEffect } from "react";
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

  // A new route is a new document height; stale triggers would fire at the
  // wrong offsets. Recalculate once the fresh DOM has painted.
  useEffect(() => {
    // Landing on /#work must not be yanked back to the top.
    if (!window.location.hash) window.scrollTo(0, 0);
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
