"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { site } from "@/lib/site";

const SEEN_KEY = "rm:preloaded";
/** Hard ceiling. A recruiter's ten seconds are not ours to spend. */
const MAX_MS = 1400;

/**
 * First-visit-only intro: a mono counter to 100, the name wipes up, the
 * curtain splits.
 *
 * Three things keep it from being a tax:
 *  - sessionStorage means it plays once per session, never on a back-nav
 *  - it resolves early the moment fonts and the hero are ready
 *  - MAX_MS caps it regardless of what the network is doing
 */
export function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);

  // Rendered only after we've confirmed it should play, so the markup never
  // flashes for repeat visitors or reduced-motion users.
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    // Skipped on small screens. The curtain is opaque, so while it plays it
    // *is* the largest contentful paint — it pushed mobile LCP from ~1.5s to
    // ~3.3s on a throttled connection. A brand moment isn't worth two seconds
    // of a phone user's first impression; on desktop, where the budget is far
    // looser, it stays.
    if (window.matchMedia("(max-width: 767px)").matches) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    sessionStorage.setItem(SEEN_KEY, "1");
    setActive(true);
  }, []);

  useEffect(() => {
    if (!active) return;

    const root = rootRef.current;
    const count = countRef.current;
    const name = nameRef.current;
    if (!root || !count || !name) return;

    document.body.style.overflow = "hidden";

    const counter = { value: 0 };
    const started = performance.now();

    const finish = () => {
      const elapsed = performance.now() - started;
      // Let the count-up read as intentional even on a fast connection.
      const wait = Math.max(0, Math.min(MAX_MS, 700) - elapsed);

      gsap
        .timeline({
          delay: wait / 1000,
          onComplete: () => {
            document.body.style.overflow = "";
            setActive(false);
          },
        })
        .to(counter, {
          value: 100,
          duration: 0.34,
          ease: "power2.out",
          onUpdate: () => {
            count.textContent = String(Math.round(counter.value)).padStart(3, "0");
          },
        })
        .to([count, name], { yPercent: -110, duration: 0.5, ease: "expo.inOut" }, "+=0.08")
        .to(root, { yPercent: -100, duration: 0.7, ease: "expo.inOut" }, "-=0.25");
    };

    // Tick the counter toward 92 while we genuinely wait; `finish` takes it home.
    const drift = gsap.to(counter, {
      value: 92,
      duration: MAX_MS / 1000,
      ease: "power1.out",
      onUpdate: () => {
        count.textContent = String(Math.round(counter.value)).padStart(3, "0");
      },
    });

    const ready = Promise.all([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    ]);

    const cap = new Promise((r) => setTimeout(r, MAX_MS));

    Promise.race([ready, cap]).then(() => {
      drift.kill();
      finish();
    });

    return () => {
      drift.kill();
      document.body.style.overflow = "";
    };
  }, [active]);

  if (!active) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="motion-only fixed inset-0 z-[100] flex items-end justify-between overflow-hidden bg-bg px-[var(--gutter)] pb-[var(--gutter)]"
    >
      <span ref={nameRef} className="mono inline-block text-fg-muted">
        {site.wordmark}
      </span>
      <span
        ref={countRef}
        className="mono inline-block text-fg tabular-nums"
      >
        000
      </span>
    </div>
  );
}
