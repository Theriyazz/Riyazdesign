"use client";

/**
 * Shared-element handoff between a work row's cover and the case study hero.
 *
 * WHY NOT GSAP Flip: Flip.getState holds live element references, and the
 * source row unmounts the instant the route changes — by the time the
 * destination exists there is nothing left to measure from. So we do the FLIP
 * technique by hand: record the source rect before navigating, then invert
 * the destination onto it and play forward. Same result, no cross-route
 * lifetime problem.
 *
 * WHY THIS REPLACES THE CURTAIN ON WORK LINKS: the two motions are mutually
 * exclusive. An opaque curtain covers the screen for the whole navigation, so
 * a shared-element morph underneath it is invisible. The rule is therefore:
 * navigating *into* a case study morphs its cover; every other route change
 * wipes. One motion per navigation, chosen by what the navigation means.
 */

interface Handoff {
  slug: string;
  rect: { top: number; left: number; width: number; height: number };
  at: number;
}

let pending: Handoff | null = null;

/** Stale entries would fire a morph from a rect the user has long scrolled past. */
const MAX_AGE_MS = 1200;

export function setHandoff(slug: string, el: HTMLElement) {
  const r = el.getBoundingClientRect();
  pending = {
    slug,
    rect: { top: r.top, left: r.left, width: r.width, height: r.height },
    at: performance.now(),
  };
}

/**
 * Consumes the handoff for `slug`, if there is a fresh one.
 * Always clears — a handoff is single-use, and a leftover would fire on the
 * wrong page later.
 */
export function takeHandoff(slug: string): Handoff["rect"] | null {
  const p = pending;
  pending = null;
  if (!p || p.slug !== slug) return null;
  if (performance.now() - p.at > MAX_AGE_MS) return null;
  return p.rect;
}
