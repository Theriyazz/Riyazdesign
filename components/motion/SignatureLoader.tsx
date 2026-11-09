"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "./SmoothScroll";
import {
  SIGNATURE_STROKES,
  SIGNATURE_VIEWBOX,
  SIGNATURE_WIDTH,
} from "./signature-paths";

/** Vertical panels the overlay is cut into for the reveal. */
const PANELS = 7;

/** Light streaks available to the timeline. Two lead in, one before each
 *  `streakBefore` stroke, two at the finish. */
const STREAKS = 6;

/** Pen travel, in viewBox units per second. Sets the whole draw's tempo. */
const PEN_SPEED = 3400;

/** Length of the wet-ink head trailing the pen tip, in viewBox units. */
const HEAD = 140;

/** Thinnest the ink may render, in CSS px, however small the signature is drawn. */
const MIN_INK_PX = 1.2;

/** Longest we hold the finished signature waiting for the page's `load`. */
const LOAD_WAIT_MS = 2500;

/**
 * Head layers, tip outwards: each is a fraction of the head length and a
 * multiple of the ink width. Stacked shortest-and-thickest last, so the pen
 * tip is fattest and the trail tapers back down to the hairline.
 */
const HEAD_LAYERS = [
  { len: 1.0, width: 1.9, color: "#e6f9ff" },
  { len: 0.6, width: 2.6, color: "#f6fdff" },
  { len: 0.3, width: 3.3, color: "#ffffff" },
] as const;

/**
 * First-visit intro: "Riyaz Malek" signs itself.
 *
 * Modelled on a pen signature reveal. Thin ink draws stroke by stroke in
 * writing order at a roughly constant pen speed, each stroke eased in and out,
 * with short pauses where the pen lifts. The newest stretch of each stroke is
 * thicker and glows cyan, like wet ink, then settles to the hairline once the
 * stroke ends. Thin cyan light streaks cross the screen at the pen lifts and
 * at the finish. A 1px rule along the bottom edge tracks progress.
 *
 * When the signature is done and the page has loaded (or LOAD_WAIT_MS runs
 * out), the signature lifts away and the overlay is cut into panels that rise
 * left to right, uncovering the page a slice at a time.
 *
 * Whether it plays at all is decided by the boot script in `app/layout.tsx`
 * (first visit per session, full motion only), which sets `data-preload` before
 * first paint. The markup is server-rendered with every stroke hidden, so the
 * first frame is the empty dark card rather than a flash of the signature.
 */
export function SignatureLoader() {
  const cardRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const barTrackRef = useRef<HTMLSpanElement>(null);
  const streaksRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<HTMLDivElement>(null);

  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    setPlaying(document.documentElement.dataset.preload === "1");
  }, []);

  useEffect(() => {
    if (!playing) return;

    const card = cardRef.current;
    const svg = svgRef.current;
    const bar = barRef.current;
    const barTrack = barTrackRef.current;
    const streakWrap = streaksRef.current;
    const panelWrap = panelsRef.current;
    if (!card || !svg || !bar || !barTrack || !streakWrap || !panelWrap) return;

    // Lenis drives the scroll position itself, so `overflow: hidden` alone
    // does not hold the page still. Retried on a frame because Lenis is created
    // on SmoothScroll's second effect pass.
    let stopped = false;
    const holdScroll = () => {
      const lenis = getLenis();
      if (!lenis) return;
      lenis.stop();
      stopped = true;
    };
    holdScroll();
    const holdFrame = requestAnimationFrame(holdScroll);

    // Each stroke keeps the weight measured from the artwork (viewBox units),
    // floored so it never renders thinner than MIN_INK_PX on a small screen.
    const scale = svg.getBoundingClientRect().width / SIGNATURE_WIDTH || 0.4;
    const minInk = MIN_INK_PX / scale;

    const strokes = SIGNATURE_STROKES.map((s, i) => {
      const g = svg.querySelector<SVGGElement>(`[data-stroke="${i}"]`)!;
      const inkPath = g.querySelector<SVGPathElement>("[data-ink]")!;
      const heads = Array.from(g.querySelectorAll<SVGPathElement>("[data-head]"));
      const glow = g.querySelector<SVGPathElement>("[data-glow]")!;
      const len = inkPath.getTotalLength();
      const ink = Math.max(s.w, minInk);
      inkPath.style.strokeWidth = String(ink);
      heads.forEach((h, k) => (h.style.strokeWidth = String(ink * HEAD_LAYERS[k].width)));
      glow.style.strokeWidth = String(ink * 4);
      return { ...s, len, inkPath, heads, glow, st: { p: 0, h: 0 } };
    });

    // Paths carry pathLength="1", so every dash value here is a fraction of
    // the stroke. The head is sized in viewBox units and converted per stroke.
    const paint = () => {
      for (const s of strokes) {
        const { p, h } = s.st;
        s.inkPath.style.strokeDashoffset = String(1 - p);
        const head = Math.min(h, s.len * p) / s.len;
        const visible = head > 0.0005;
        s.heads.forEach((path, k) => {
          const seg = head * HEAD_LAYERS[k].len;
          path.style.strokeDasharray = `${seg} 3`;
          path.style.strokeDashoffset = String(-(p - seg));
          path.style.visibility = visible ? "visible" : "hidden";
        });
        s.glow.style.strokeDasharray = `${head} 3`;
        s.glow.style.strokeDashoffset = String(-(p - head));
        s.glow.style.visibility = visible ? "visible" : "hidden";
      }
    };

    const streaks = Array.from(streakWrap.children) as HTMLElement[];
    let nextStreak = 0;
    const streak = (
      at: number,
      { y = 0, w = 30, dur = 0.3 }: { y?: number; w?: number; dur?: number }
    ) => {
      const el = streaks[nextStreak++];
      if (!el) return;
      gsap.set(el, { width: `${w}vw`, y: `${y}vh`, x: "-75vw", opacity: 0 });
      tl.to(el, { x: "75vw", duration: dur, ease: "power2.in" }, at).to(
        el,
        {
          keyframes: [
            { opacity: 1, duration: dur * 0.25 },
            { opacity: 1, duration: dur * 0.45 },
            { opacity: 0, duration: dur * 0.3 },
          ],
        },
        at
      );
    };

    const release = () => {
      delete document.documentElement.dataset.preload;
      cancelAnimationFrame(holdFrame);
      if (stopped) getLenis()?.start();
      setDone(true);
    };

    const tl = gsap.timeline({ onUpdate: paint, onComplete: release });

    // --- Draw ----------------------------------------------------------------
    let t = 0.25;
    streak(0, { y: -6, w: 30, dur: 0.3 });
    streak(0.12, { y: 9, w: 22, dur: 0.28 });
    for (const s of strokes) {
      if (s.streakBefore) {
        streak(t - 0.04, s.streakBefore);
        t += 0.1;
      }
      const speed = PEN_SPEED * (s.kind === "swash" ? 1.4 : s.kind === "dot" ? 0.5 : 1);
      // Capped high enough that the M (entry loop, both peaks and the foot in
      // one stroke) keeps the same pen speed as everything else.
      const dur = gsap.utils.clamp(0.12, 0.8, s.len / speed);
      const head = Math.min(HEAD, s.len * 0.45);
      tl.to(s.st, { p: 1, duration: dur, ease: s.kind === "swash" ? "power3.inOut" : "power1.inOut" }, t)
        // The head swells in as the pen lands, and once the stroke ends its
        // tail catches up to the tip: the wet ink settling into the hairline.
        .to(s.st, { h: head, duration: Math.min(0.18, dur * 0.4), ease: "power1.out" }, t)
        .to(s.st, { h: 0, duration: 0.22, ease: "power2.out" }, t + dur);
      t += dur + (s.gap ?? 0.06) * 0.8;
    }
    streak(t - 0.05, { y: -3, w: 40, dur: 0.34 });
    streak(t + 0.06, { y: 8, w: 28, dur: 0.3 });

    // --- Progress rule -------------------------------------------------------
    // Paced to the draw, stopping short of the end: the last stretch is held
    // back for the real `load`, so the rule only completes once the page has.
    tl.fromTo(bar, { scaleX: 0 }, { scaleX: 0.92, duration: t, ease: "power1.inOut" }, 0);

    // --- Wait for load -------------------------------------------------------
    let loadTimer = 0;
    const onLoad = () => {
      window.clearTimeout(loadTimer);
      if (tl.paused()) tl.play();
    };
    tl.add(() => {
      if (document.readyState === "complete") return;
      tl.pause();
      window.addEventListener("load", onLoad, { once: true });
      loadTimer = window.setTimeout(onLoad, LOAD_WAIT_MS);
    }, t + 0.3);

    // --- Exit ----------------------------------------------------------------
    tl.to(bar, { scaleX: 1, duration: 0.35, ease: "power2.out" }, t + 0.3)
      .to(svg, { opacity: 0, y: -14, scale: 0.985, duration: 0.5, ease: "power2.inOut" }, ">-0.05")
      .to(barTrack, { opacity: 0, duration: 0.3, ease: "power1.out" }, "<0.1")
      .set(panelWrap, { opacity: 1 })
      .set(card, { opacity: 0 });

    // --- Reveal --------------------------------------------------------------
    const panels = Array.from(panelWrap.querySelectorAll<HTMLElement>("[data-panel]"));
    tl.to(panels, { yPercent: -100, duration: 0.62, ease: "power2.inOut", stagger: 0.065 });

    // Not on <body>: a transform there would become the containing block for
    // every fixed element on the page. See Preloader.tsx for the full story.
    const main = document.getElementById("main");
    if (main) {
      tl.fromTo(
        main,
        { opacity: 0.98 },
        {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          force3D: false,
          immediateRender: false,
          clearProps: "opacity,transform",
        },
        "-=0.45"
      );
    }

    return () => {
      tl.kill();
      window.clearTimeout(loadTimer);
      window.removeEventListener("load", onLoad);
      delete document.documentElement.dataset.preload;
      cancelAnimationFrame(holdFrame);
      if (stopped) getLenis()?.start();
      if (main) gsap.set(main, { clearProps: "opacity,transform" });
    };
  }, [playing]);

  if (done) return null;

  return (
    <div
      aria-hidden
      className="preloader pointer-events-none fixed inset-0 z-[100] overflow-hidden"
    >
      <div
        ref={cardRef}
        className="absolute inset-0 grid place-items-center"
        style={{ background: "var(--ink-950)" }}
      >
        <svg
          ref={svgRef}
          viewBox={SIGNATURE_VIEWBOX}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: "min(86vw, 720px)", height: "auto", overflow: "visible" }}
        >
          <defs>
            <filter id="sig-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="6" />
            </filter>
          </defs>
          {SIGNATURE_STROKES.map((s, i) => (
            <g key={s.id} data-stroke={i}>
              {/* Every path starts fully dashed out, so the server-rendered
                  frame is an empty card, never the finished signature. */}
              <path
                data-glow
                d={s.d}
                pathLength={1}
                stroke="#6fe3ff"
                strokeWidth={16}
                filter="url(#sig-glow)"
                opacity={0.55}
                strokeDasharray="0 3"
                visibility="hidden"
              />
              <path
                data-ink
                d={s.d}
                pathLength={1}
                stroke="var(--paper-50)"
                strokeWidth={s.w}
                strokeDasharray="1 2"
                strokeDashoffset={1}
              />
              {HEAD_LAYERS.map((h, k) => (
                <path
                  key={k}
                  data-head
                  d={s.d}
                  pathLength={1}
                  stroke={h.color}
                  strokeWidth={4 * h.width}
                  strokeDasharray="0 3"
                  visibility="hidden"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      {/* Light streaks. Parked off-screen until the timeline sends them across. */}
      <div ref={streaksRef} className="absolute inset-0">
        {Array.from({ length: STREAKS }, (_, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 block"
            style={{
              height: 2,
              width: "30vw",
              borderRadius: 2,
              opacity: 0,
              translate: "-50% -50%",
              rotate: "-28deg",
              transform: "translateX(-75vw)",
              background:
                "linear-gradient(90deg, transparent, rgba(111,227,255,0.15) 30%, #6fe3ff 72%, #e9fcff 92%, transparent)",
              filter: "drop-shadow(0 0 6px rgba(111,227,255,0.9))",
              willChange: "transform, opacity",
            }}
          />
        ))}
      </div>

      {/* Progress rule: 1px, edge to edge, along the bottom. */}
      <span
        ref={barTrackRef}
        className="absolute inset-x-0 bottom-0 block"
        style={{
          height: 1,
          background: "color-mix(in srgb, var(--paper-50) 6%, transparent)",
        }}
      >
        <span
          ref={barRef}
          className="absolute inset-0 block"
          style={{
            transformOrigin: "left center",
            transform: "scaleX(0)",
            background:
              "linear-gradient(90deg, color-mix(in srgb, var(--paper-50) 10%, transparent), color-mix(in srgb, var(--paper-50) 42%, transparent))",
          }}
        />
      </span>

      {/* The reveal surface: transparent until the handover, then it is the
          overlay. Panels overlap by a pixel so no seam shows. */}
      <div ref={panelsRef} className="absolute inset-0" style={{ opacity: 0 }}>
        {Array.from({ length: PANELS }, (_, i) => (
          <div
            key={i}
            data-panel
            className="absolute top-0 h-full"
            style={{
              left: `calc(${i} * 100% / ${PANELS})`,
              width: `calc(100% / ${PANELS} + 1px)`,
              background: "var(--ink-950)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
