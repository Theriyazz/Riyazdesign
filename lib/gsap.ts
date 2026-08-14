"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

/**
 * Solves a CSS `cubic-bezier()` so GSAP can run the exact same curve the
 * stylesheet does.
 *
 * Hand-rolled rather than pulled from GSAP's CustomEase. CustomEase ships with
 * GSAP and is free, but this module sits in the layout's first client chunk
 * (Nav imports it), so it is paid for on every page load — and we want one
 * curve out of it, used only while navigating. Twenty lines is the cheaper
 * trade.
 *
 * Newton-Raphson with a bisection fallback, which is what WebKit's own
 * UnitBezier does: Newton is fast but our curve has crossing control points
 * (x1 0.7 > x2 0.31), so it cannot be trusted alone.
 */
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const solveX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const solveY = (t: number) => ((ay * t + by) * t + cy) * t;
  const slopeX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (p: number) => {
    if (p <= 0) return 0;
    if (p >= 1) return 1;

    let t = p;
    for (let i = 0; i < 8; i++) {
      const err = solveX(t) - p;
      if (Math.abs(err) < 1e-5) return solveY(t);
      const d = slopeX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }

    let lo = 0;
    let hi = 1;
    t = p;
    while (lo < hi) {
      const x = solveX(t);
      if (Math.abs(x - p) < 1e-5) break;
      if (p > x) lo = t;
      else hi = t;
      t = (hi - lo) / 2 + lo;
    }
    return solveY(t);
  };
}

// Registered once, at module scope, so no component has to think about it.
// `useGSAP` is registered too, which is what gives us automatic timeline
// cleanup on unmount.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);

  // Twin of `--ease-through` in styles/tokens.css. Declared here so the page
  // transition and the CSS that has to match it name the same curve rather
  // than each carrying their own copy of four numbers.
  gsap.registerEase("through", cubicBezier(0.7, 0.01, 0.31, 1));

  // Twin of `--ease-settle`. A mild overshoot for things that should land with
  // some weight rather than glide to a stop. The solver only inverts the x
  // curve, so a y control point past 1 is fine — that is where the overshoot
  // comes from.
  gsap.registerEase("settle", cubicBezier(0.34, 1.56, 0.64, 1));

  // We only ever animate transform/opacity, so force3D is safe and keeps
  // work on the compositor.
  //
  // It belongs in `config`, not `defaults`. `defaults` merges its keys into
  // every tween's vars, and force3D is a CSSPlugin property — on a tween that
  // targets a plain object (the preloader counter) or animates opacity alone,
  // GSAP finds no such property on the target and warns "Invalid property
  // force3D ... Missing plugin?" on every single tween. `config` is the global
  // switch CSSPlugin actually reads, so transforms still get the 3D hint and
  // nothing is handed a property it cannot use.
  gsap.config({ force3D: true });
  gsap.defaults({ ease: "power2.out", duration: 0.6 });
}

export { gsap, ScrollTrigger, useGSAP };
