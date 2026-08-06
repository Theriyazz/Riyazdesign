"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Wake shape. All tunable together — these are the whole look.
 *
 * Deliberately restrained. The reference for this is a large, bright, purple
 * crescent; the palette has no purple and the accent is budgeted to six uses
 * as a signal, never a fill. So the wake is monochrome and quiet enough to
 * read as atmosphere rather than as a light show.
 */
const MAX_PARTICLES = 140;
/** Per particle. They stack additively, so the visible glow is well above this. */
const ALPHA_PEAK = 0.12;
const SIZE_MIN = 30;
const SIZE_MAX = 84;
/** How much a particle grows across its life. */
const SIZE_GROWTH = 1.35;
/**
 * Short on purpose. At ~1s the wake outlived the gesture and marked out the
 * whole path the pointer had taken, which reads as drawing on the page rather
 * than as something trailing the cursor.
 */
const LIFE_MIN = 300;
const LIFE_MAX = 560;
/** Fraction of pointer speed a particle inherits, pointing backwards. */
const TRAIL_FACTOR = 0.26;
/** Sideways fan, in px/frame. This is what curves the wake into a crescent. */
const SPREAD = 1.6;
const DRAG = 0.88;
/** Speed (px/frame) at which the spawn rate saturates. */
const SPEED_FOR_MAX_SPAWN = 36;
const MAX_SPAWN_PER_FRAME = 3;

/** After this long with nothing left to draw, stop the RAF. */
const IDLE_MS = 200;

const SPRITE_PX = 128;

/**
 * Any CSS colour to `"r, g, b"`, via the browser's own parser.
 *
 * The gradient stops below need per-stop alpha, and `addColorStop` *throws* on
 * a colour it cannot parse — so building `rgba()` strings by hand is safer
 * than passing `color-mix()` through and hoping the engine handles it.
 */
function toRgbChannels(color: string) {
  const probe = document.createElement("span");
  probe.style.color = color;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();

  const match = computed.match(/-?[\d.]+/g);
  if (!match || match.length < 3) return "168, 168, 164";
  return `${match[0]}, ${match[1]}, ${match[2]}`;
}

/**
 * One soft disc, drawn once and blitted per particle.
 *
 * A `createRadialGradient` per particle per frame is the obvious way and the
 * wrong one — the cost here is fillrate, and a cached sprite is the fix.
 * `DottedSurface` uses the same trick for its point sprites; this needs its
 * own because that one is a hard disc plus a CSS blur, and a wake needs a
 * smooth falloff all the way to zero or the particles show their edges where
 * they overlap.
 */
function makeGlowSprite(color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = SPRITE_PX;
  canvas.height = SPRITE_PX;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const rgb = toRgbChannels(color);
  const r = SPRITE_PX / 2;
  const gradient = ctx.createRadialGradient(r, r, 0, r, r, r);
  // Eased rather than linear: a straight ramp reads as a hard-edged ball.
  gradient.addColorStop(0, `rgba(${rgb}, 1)`);
  gradient.addColorStop(0.25, `rgba(${rgb}, 0.55)`);
  gradient.addColorStop(0.55, `rgba(${rgb}, 0.18)`);
  gradient.addColorStop(1, `rgba(${rgb}, 0)`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, SPRITE_PX, SPRITE_PX);
  return canvas;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  age: number;
  life: number;
  /** Dead particles stay in the pool and are reused in place. */
  alive: boolean;
}

/**
 * A soft particle wake trailing the pointer.
 *
 * Particles spawn while the pointer moves, inherit a fraction of its velocity
 * *backwards*, and fan sideways — so the trail lags and curves into a crescent
 * rather than following in a straight line. They're drawn additively, so
 * overlapping particles build into a diffuse glow.
 *
 * The RAF is not free, so it runs only while there is something to draw: it
 * stops once the last particle has died and the pointer has gone quiet, and on
 * a hidden tab. The pool is fixed-size and reused in place, so a moving
 * pointer allocates nothing per frame.
 */
export function CursorTrail() {
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

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

    const canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    canvas.dataset.cursorTrail = "";
    canvas.style.cssText =
      "position:fixed;inset:0;z-index:89;pointer-events:none";
    document.body.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      canvas.remove();
      return;
    }

    // Canvas can't read a CSS variable — resolve it once. The site has a
    // single dark theme, so once is enough. A mid grey rather than white:
    // additive stacking does the brightening, and starting from white blows
    // out the moment two particles overlap.
    const color =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--fg-muted")
        .trim() || "#a8a8a4";

    const sprite = makeGlowSprite(color);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // setTransform resets composite state on some engines; re-assert it.
      ctx.globalCompositeOperation = "lighter";
    };
    resize();
    window.addEventListener("resize", resize);

    const pool: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      size: 0,
      age: 0,
      life: 0,
      alive: false,
    }));
    let cursor = 0;

    let px = -1;
    let py = -1;
    let pointerX = -1;
    let pointerY = -1;
    let lastMove = 0;
    let lastFrame = 0;
    let raf = 0;
    let running = false;

    const spawn = (x: number, y: number, dx: number, dy: number, speed: number) => {
      const p = pool[cursor];
      cursor = (cursor + 1) % MAX_PARTICLES;

      // Unit vector along travel, and its perpendicular.
      const ux = dx / speed;
      const uy = dy / speed;
      const fan = (Math.random() * 2 - 1) * SPREAD;

      p.x = x;
      p.y = y;
      p.vx = -ux * speed * TRAIL_FACTOR - uy * fan;
      p.vy = -uy * speed * TRAIL_FACTOR + ux * fan;
      p.size = SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN);
      p.age = 0;
      p.life = LIFE_MIN + Math.random() * (LIFE_MAX - LIFE_MIN);
      p.alive = true;
    };

    const frame = (now: number) => {
      // Clamped: a backgrounded tab resuming would otherwise hand us a delta
      // large enough to kill every particle in a single step.
      const dt = Math.min(now - lastFrame, 48);
      lastFrame = now;

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      let live = 0;

      for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = pool[i];
        if (!p.alive) continue;

        p.age += dt;
        if (p.age >= p.life) {
          p.alive = false;
          continue;
        }
        live++;

        p.vx *= DRAG;
        p.vy *= DRAG;
        p.x += p.vx;
        p.y += p.vy;

        const t = p.age / p.life;
        // Quick in, slow out — a linear fade pops on arrival.
        const alpha = Math.sin(t * Math.PI) * ALPHA_PEAK;
        const size = p.size * (1 + (SIZE_GROWTH - 1) * t);
        const half = size / 2;

        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, p.x - half, p.y - half, size, size);
      }

      ctx.globalAlpha = 1;

      if (live === 0 && now - lastMove > IDLE_MS) {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        running = false;
        return;
      }
      raf = requestAnimationFrame(frame);
    };

    const wake = () => {
      if (running || document.hidden) return;
      running = true;
      lastFrame = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      pointerX = e.clientX;
      pointerY = e.clientY;

      // The preloader curtain is opaque and covers the screen; particles drawn
      // under it are work nobody will ever see.
      if (document.documentElement.dataset.preload === "1") {
        px = pointerX;
        py = pointerY;
        return;
      }

      if (px < 0) {
        // First sample has no previous point, so no direction to trail along.
        px = pointerX;
        py = pointerY;
        return;
      }

      const dx = pointerX - px;
      const dy = pointerY - py;
      const speed = Math.hypot(dx, dy);
      px = pointerX;
      py = pointerY;

      if (speed < 0.5) return;

      lastMove = performance.now();

      const count = Math.max(
        1,
        Math.round((Math.min(speed, SPEED_FOR_MAX_SPAWN) / SPEED_FOR_MAX_SPAWN) *
          MAX_SPAWN_PER_FRAME)
      );

      for (let i = 0; i < count; i++) {
        // Spread spawns along the segment just travelled, so a fast flick
        // leaves a continuous wake instead of a dotted line of clusters.
        const f = count === 1 ? 1 : i / (count - 1);
        spawn(pointerX - dx * (1 - f), pointerY - dy * (1 - f), dx, dy, speed);
      }

      wake();
    };

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        running = false;
      } else if (performance.now() - lastMove < IDLE_MS) {
        wake();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", resize);
      canvas.remove();
    };
  }, [enabled]);

  return null;
}
