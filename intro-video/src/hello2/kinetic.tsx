import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import React from "react";
import { Img, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { c, mono, ramp, sans } from "../hello/kit";

// Heavier cuts of the brand face, for the kinetic slabs only.
loadGeist("normal", { weights: ["800", "900"], subsets: ["latin"] });

/* ----------------------------------------------------------- slam word ---
   Letters arrive tumbling: each starts rotated, displaced and blurred, then
   springs into place a couple of frames after the last. After landing they
   keep a faint wobble, as in the reference's MOVE. */
export const Slam: React.FC<{
  text: string;
  at: number;
  size: number;
  color?: string;
  weight?: number;
  stagger?: number;
  seed?: string;
  /** Offset shadow layers behind the letters (the reference's THINGS / DEPTH). */
  chroma?: [string, string];
  wobble?: number;
  tracking?: string;
  style?: React.CSSProperties;
}> = ({ text, at, size, color = c.paper, weight = 800, stagger = 2, seed = text, chroma, wobble = 1, tracking = "-0.045em", style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", fontFamily: sans, fontWeight: weight, fontSize: size, lineHeight: 0.92, letterSpacing: tracking, color, whiteSpace: "pre", ...style }}>
      {text.split("").map((ch, i) => {
        const p = spring({ frame: f - at - i * stagger, fps, config: { damping: 11, stiffness: 190, mass: 0.8 } });
        const r1 = random(`${seed}-r-${i}`) - 0.5;
        const r2 = random(`${seed}-y-${i}`) - 0.5;
        const idle = Math.sin((f + i * 11) / 9) * 1.6 * wobble * Math.min(1, p);
        const rot = r1 * 70 * (1 - p) + idle;
        const y = r2 * size * 0.9 * (1 - p);
        const blur = Math.max(0, (1 - p) * 9);
        const d = 0.035 * size * (0.35 + (1 - Math.min(1, p)) * 2);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: f >= at + i * stagger ? 1 : 0,
              transform: `translateY(${y}px) rotate(${rot}deg) scale(${0.55 + 0.45 * Math.min(1.08, p)})`,
              filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              textShadow: chroma ? `${d}px ${d * 0.8}px 0 ${chroma[0]}, ${d * 2}px ${d * 1.6}px 0 ${chroma[1]}` : undefined,
            }}
          >
            {ch}
          </span>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------- outline stack ---
   A word repeated above and below itself in outline, scrolling, with the
   middle copy solid. */
export const Stack: React.FC<{ text: string; at: number; size: number; count?: number; color?: string; stroke?: string; speed?: number }> = ({
  text,
  at,
  size,
  count = 7,
  color = c.paper,
  stroke = c.ink600,
  speed = 3.2,
}) => {
  const f = useCurrentFrame();
  const t = f - at;
  const line = size * 0.92;
  const drift = t * speed;
  const mid = Math.floor(count / 2);
  return (
    <div style={{ position: "relative", height: line, fontFamily: sans, fontWeight: 900, fontSize: size, lineHeight: 0.92, letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>
      {Array.from({ length: count }, (_, i) => {
        const k = i - mid;
        const solid = k === 0;
        const y = k * line - (drift % line);
        const appear = ramp(f, at + Math.abs(k) * 2, at + Math.abs(k) * 2 + 10);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              transform: `translateY(${solid ? 0 : y}px)`,
              color: solid ? color : "transparent",
              WebkitTextStroke: solid ? undefined : `2px ${stroke}`,
              opacity: solid ? 1 : appear * (1 - Math.abs(k) / (mid + 1)) * 1.4,
            }}
          >
            {text}
          </div>
        );
      })}
    </div>
  );
};

/* -------------------------------------------------------------- 3D ring ---
   Items placed on a horizontal circle and seen from slightly above, so the
   front of the ring dips and the back rises. Projection is done by hand so
   depth can drive draw order, size, brightness and blur together. */
export type RingItem = { x: number; y: number; scale: number; depth: number; facing: number; angle: number };

export const ringPose = (i: number, n: number, spin: number, radius: number, tiltDeg: number, perspective = 2200): RingItem => {
  const a = spin + (i / n) * Math.PI * 2;
  const t = (tiltDeg * Math.PI) / 180;
  const x = Math.sin(a) * radius;
  const z = Math.cos(a) * radius;
  const y = z * Math.sin(t);
  const zz = z * Math.cos(t);
  const scale = perspective / (perspective - zz);
  return { x: x * scale, y: y * scale, scale, depth: zz, facing: Math.cos(a), angle: a };
};

/** Letters on a 3D ring, like the reference's KINETIC TYPE band. */
export const TextRing: React.FC<{
  text: string;
  cx: number;
  cy: number;
  size: number;
  spin: number;
  tilt?: number;
  opacity?: number;
  color?: string;
  weight?: number;
  font?: string;
}> = ({ text, cx, cy, size, spin, tilt = 16, opacity = 1, color = c.paper, weight = 800, font = sans }) => {
  const chars = text.split("");
  const adv = size * 0.62;
  const radius = (chars.length * adv) / (Math.PI * 2);
  return (
    <>
      {chars.map((ch, i) => {
        const p = ringPose(i, chars.length, spin, radius, tilt, 1800);
        const back = p.facing < 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx + p.x,
              top: cy + p.y,
              width: adv,
              marginLeft: -adv / 2,
              marginTop: -size / 2,
              textAlign: "center",
              fontFamily: font,
              fontWeight: weight,
              fontSize: size,
              lineHeight: 1,
              color,
              opacity: opacity * (back ? 0.32 : 0.55 + 0.45 * p.facing),
              zIndex: Math.round(p.depth + 2000),
              transform: `perspective(1400px) rotateY(${(p.angle * 180) / Math.PI}deg) scale(${p.scale})`,
            }}
          >
            {ch}
          </div>
        );
      })}
    </>
  );
};

/** Screens (or tool marks) on a 3D ring. Back items darken and soften. */
export const ImageRing: React.FC<{
  srcs: string[];
  cx: number;
  cy: number;
  w: number;
  h: number;
  radius: number;
  spin: number;
  tilt?: number;
  radiusPx?: number;
  opacity?: number;
  /** Index of an item to leave out (it is being drawn elsewhere). */
  skip?: number;
  contain?: boolean;
  shade?: boolean;
  /** Sit each item on a raised tile, for marks that are dark on dark. */
  tile?: boolean;
  /** Keep every item facing the camera, like moons in orbit, instead of turning with the ring. */
  billboard?: boolean;
}> = ({ srcs, cx, cy, w, h, radius, spin, tilt = 12, radiusPx = 14, opacity = 1, skip = -1, contain, shade = true, tile, billboard }) => (
  <>
    {srcs.map((src, i) => {
      if (i === skip) return null;
      const p = ringPose(i, srcs.length, spin, radius, tilt);
      const light = shade ? (tile ? 0.5 : 0.28) + (tile ? 0.5 : 0.72) * Math.max(0, (p.facing + 1) / 2) ** 1.4 : 1;
      const blur = shade ? Math.max(0, -p.facing) * 3 : 0;
      return (
        <div
          key={src + i}
          style={{
            position: "absolute",
            left: cx + p.x - w / 2,
            top: cy + p.y - h / 2,
            width: w,
            height: h,
            zIndex: Math.round(p.depth + 2000),
            opacity,
            transform: billboard ? `scale(${p.scale})` : `scale(${p.scale}) perspective(1600px) rotateY(${(p.angle * 180) / Math.PI}deg)`,
            filter: `brightness(${light})${blur > 0.3 ? ` blur(${blur}px)` : ""}`,
            ...(tile ? { background: c.ink850, borderRadius: radiusPx, boxShadow: `inset 0 0 0 1.5px ${c.ink700}, 0 24px 48px rgba(0,0,0,0.5)`, padding: w * 0.16, boxSizing: "border-box" as const } : {}),
          }}
        >
          <Img
            src={staticFile(src)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: contain ? "contain" : "cover",
              objectPosition: "top",
              borderRadius: tile ? radiusPx * 0.5 : radiusPx,
              boxShadow: contain ? undefined : "inset 0 0 0 1px rgba(255,255,255,0.08), 0 30px 60px rgba(0,0,0,0.5)",
              display: "block",
            }}
          />
        </div>
      );
    })}
  </>
);

/* ------------------------------------------------------- repeating rows ---
   The reference's BRAND BRAND BRAND: rows of a word in outline, alternate
   rows travelling in opposite directions. */
export const Rows: React.FC<{ text: string; size: number; rows: number; top: number; gap: number; speed: number; stroke?: string; opacity?: number; skipRow?: number }> = ({
  text,
  size,
  rows,
  top,
  gap,
  speed,
  stroke = c.ink600,
  opacity = 1,
  skipRow = -1,
}) => {
  const f = useCurrentFrame();
  const unit = text.length * size * 0.56 + size * 0.6;
  return (
    <>
      {Array.from({ length: rows }, (_, r) => {
        if (r === skipRow) return null;
        const dir = r % 2 === 0 ? -1 : 1;
        const x = ((f * speed * dir) % unit) - unit;
        return (
          <div
            key={r}
            style={{
              position: "absolute",
              left: x,
              top: top + r * gap,
              display: "flex",
              gap: size * 0.6,
              fontFamily: sans,
              fontWeight: 900,
              fontSize: size,
              lineHeight: 1,
              letterSpacing: "-0.045em",
              color: "transparent",
              WebkitTextStroke: `2px ${stroke}`,
              whiteSpace: "nowrap",
              opacity,
            }}
          >
            {Array.from({ length: 5 }, (_, k) => (
              <span key={k}>{text}</span>
            ))}
          </div>
        );
      })}
    </>
  );
};

export const MonoTag: React.FC<{ children: React.ReactNode; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, color = c.paper500, size = 22, style }) => (
  <div style={{ fontFamily: mono, fontSize: size, letterSpacing: "0.14em", textTransform: "uppercase", color, whiteSpace: "nowrap", ...style }}>{children}</div>
);
