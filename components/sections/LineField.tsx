"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The flowing line mesh behind the hero (Edwin Le, Screenshot 164224).
 *
 * Canvas rather than SVG: ~40 stroked paths redrawn per frame is cheap on a
 * canvas and expensive as DOM. It is purely decorative, so it is aria-hidden,
 * skipped entirely under reduced motion, and pauses when the tab is hidden or
 * the hero scrolls away — an offscreen animation is pure battery cost.
 */
export function LineField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    // Desktop only. A continuous RAF redraw is the single most expensive thing
    // on the page: on a throttled phone it accounted for ~7s of main-thread
    // work and pushed mobile TBT from 110ms to 1130ms. At 375px the field is
    // also mostly hidden behind the hero text, so it was costing a second of
    // interactivity to render something almost nobody sees.
    const mql = window.matchMedia("(min-width: 768px)");
    const apply = () => setEnabled(mql.matches);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [reduced]);

  useEffect(() => {
    if (reduced || !enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Cap DPR at 2: beyond that the pixel cost doubles for no visible gain.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let t = 0;
    let running = true;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const LINES = 38;
    const STEP = 14;

    const draw = () => {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;

      for (let i = 0; i < LINES; i++) {
        const p = i / LINES;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(168,168,164,${0.03 + p * 0.09})`;

        for (let x = 0; x <= w; x += STEP) {
          const nx = x / w;
          const y =
            h * 0.58 +
            Math.sin(nx * 3.1 + t * 0.6 + p * 2.4) * (h * 0.16) * (0.35 + p) +
            Math.sin(nx * 7.3 - t * 0.35 + p * 1.1) * (h * 0.05) +
            (p - 0.5) * h * 0.42;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      t += 0.005;
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const setRunning = (next: boolean) => {
      if (next === running) return;
      running = next;
      if (next) raf = requestAnimationFrame(draw);
      else cancelAnimationFrame(raf);
    };

    // Pause offscreen and on a hidden tab.
    const io = new IntersectionObserver(
      ([entry]) => setRunning(entry.isIntersecting && !document.hidden),
      { threshold: 0 }
    );
    io.observe(canvas);

    const onVisibility = () => setRunning(!document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced, enabled]);

  if (!enabled) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="motion-only pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}
