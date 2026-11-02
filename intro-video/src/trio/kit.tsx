import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, ramp, s, sans } from "../hello/kit";

/* Shared parts for the three hero film variations. Every film opens on a frame
   that is also its poster, so nothing here may depend on an entrance at f = 0. */

export const FILM_DUR = s(38);
const CUT_RATIO = 1086 / 1448;

/** The illustration, cut out. It breathes, so a held frame never looks paused. */
export const Riyaz: React.FC<{ h: number; x: number; y: number; style?: React.CSSProperties; breathe?: number }> = ({ h, x, y, style, breathe = 1 }) => {
  const f = useCurrentFrame();
  const b = Math.sin((f / 60) * 1.5) * breathe;
  return (
    <Img
      src={staticFile("trio/riyaz-cut.webp")}
      style={{
        position: "absolute",
        left: x,
        top: y,
        height: h,
        width: h * CUT_RATIO,
        transformOrigin: "50% 100%",
        transform: `translateY(${b * -5}px) rotate(${b * 0.35}deg)`,
        ...style,
      }}
    />
  );
};

/** Film grain from one tile, stepped at 12 fps so it reads as texture rather than noise. */
export const Grain: React.FC<{ opacity?: number; blend?: React.CSSProperties["mixBlendMode"] }> = ({ opacity = 0.09, blend = "overlay" }) => {
  const f = useCurrentFrame();
  const n = Math.floor(f / 5);
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile("trio/grain.png")})`,
        backgroundPosition: `${(n * 211) % 512}px ${(n * 379) % 512}px`,
        opacity,
        mixBlendMode: blend,
        pointerEvents: "none",
        zIndex: 9000,
      }}
    />
  );
};

/** One line rising through its own mask. */
export const Line: React.FC<{
  at: number;
  size: number;
  color: string;
  weight?: number;
  tracking?: string;
  out?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, size, color, weight = 700, tracking = "-0.04em", out, children, style }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 22, 0, 1, ease.out);
  const o = out === undefined ? 0 : ramp(f, out, out + 14, 0, 1, ease.in);
  return (
    <div style={{ overflow: "hidden", padding: "0.08em 0 0.14em", margin: "-0.08em 0 -0.14em", ...style }}>
      <div
        style={{
          fontFamily: sans,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.06,
          letterSpacing: tracking,
          color,
          whiteSpace: "nowrap",
          transform: `translateY(${(1 - p) * 125 - o * 125}%)`,
          opacity: p > 0.002 ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** A screenshot. `cover` from the top, because the top is where the real UI is. */
export const Shot: React.FC<{ src: string; w: number; h: number; r?: number; style?: React.CSSProperties; shadow?: string }> = ({
  src,
  w,
  h,
  r = 14,
  style,
  shadow = "0 30px 70px rgba(0,0,0,0.45)",
}) => (
  <div style={{ width: w, height: h, borderRadius: r, overflow: "hidden", boxShadow: shadow, flexShrink: 0, ...style }}>
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }} />
  </div>
);

/** A before and after: the old value struck through, the new one landing with weight. */
export const Swap: React.FC<{
  at: number;
  from: string;
  to: string;
  label: string;
  fg: string;
  dim: string;
  hit: string;
  size?: number;
  labelSize?: number;
}> = ({ at, from, to, label, fg, dim, hit, size = 132, labelSize = 32 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = ramp(f, at, at + 16);
  const strike = ramp(f, at + 14, at + 30, 0, 1, ease.inOut);
  const land = spring({ frame: f - at - 24, fps, config: { damping: 11, stiffness: 210, mass: 0.7 } });
  return (
    <div style={{ opacity: inn, transform: `translateY(${(1 - inn) * 26}px)` }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.2, fontFamily: sans, fontWeight: 800, fontSize: size, lineHeight: 1, letterSpacing: "-0.05em" }}>
        <span style={{ position: "relative", color: dim }}>
          {from}
          <span style={{ position: "absolute", left: "-4%", right: "-4%", top: "52%", height: size * 0.055, background: dim, transformOrigin: "left", transform: `scaleX(${strike})` }} />
        </span>
        <span style={{ color: hit, display: "inline-block", opacity: f >= at + 24 ? 1 : 0, transform: `scale(${0.5 + 0.5 * land})` }}>{to}</span>
      </div>
      <div style={{ fontFamily: sans, fontWeight: 500, fontSize: labelSize, letterSpacing: "-0.015em", color: fg, marginTop: 10, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
};

/** The multiplayer cursor, the one drawn mark in the set: it is a triangle with a name. */
export const Cursor: React.FC<{ x: number; y: number; name: string; color: string; text: string; scale?: number; press?: number }> = ({
  x,
  y,
  name,
  color,
  text,
  scale = 1,
  press = 0,
}) => (
  <div style={{ position: "absolute", left: x, top: y, transform: `scale(${scale * (1 - press * 0.14)})`, transformOrigin: "0 0", zIndex: 5000 }}>
    <svg width="44" height="48" viewBox="0 0 22 24" style={{ display: "block", filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))" }}>
      <path d="M2 2 L20 10 L11.5 12.5 L8 21 Z" fill={color} stroke="#fff" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
    <div
      style={{
        position: "absolute",
        left: 34,
        top: 40,
        padding: "8px 16px",
        borderRadius: 10,
        background: color,
        color: text,
        fontFamily: sans,
        fontWeight: 600,
        fontSize: 28,
        letterSpacing: "-0.01em",
        whiteSpace: "nowrap",
      }}
    >
      {name}
    </div>
  </div>
);

/** Interpolates through [frame, value] stops with the site's "through" curve. */
export const track = (f: number, stops: [number, number][]) => {
  for (let i = 0; i < stops.length - 1; i++) {
    const [a, va] = stops[i];
    const [b, vb] = stops[i + 1];
    if (f <= b) {
      return interpolate(f, [a, b], [va, vb], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.through });
    }
  }
  return stops[stops.length - 1][1];
};

/** Real screens from the shipped work. Nothing in the films is mocked up. */
export const WALL = [
  "hello/cl-student.webp",
  "hello/wall-counsellor-02-test-codes.webp",
  "hello/wall-student-02-counselling.webp",
  "hello/cl-admin.webp",
  "hello/wall-school-02-students.webp",
  "hello/wall-student-03-sessions.webp",
  "hello/cl-counsellor.webp",
  "hello/wall-admin-02-users.webp",
  "hello/wall-student-04-profile.webp",
  "hello/wall-counsellor-03-student-connect.webp",
  "hello/cl-school.webp",
  "hello/wall-student-05-admissions.webp",
  "hello/wall-admin-03-verification.webp",
  "hello/wall-student-06-library.webp",
  "hello/wall-school-03-test-codes.webp",
  "hello/wall-counsellor-04-appointments.webp",
  "hello/wall-student-07-payment.webp",
  "hello/wall-admin-04-payments.webp",
  "hello/wall-student-08-plan.webp",
  "hello/cl-english.webp",
];
