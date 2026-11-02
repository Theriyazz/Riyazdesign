import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";
import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/* ---------------------------------------------------------------- tokens ---
   The primitives from styles/tokens.css, so the film reads as the site. Lime is
   a signal: the dot, the availability mark, and the rule under whatever the
   film is pointing at. Nothing else gets it. */
export const c = {
  ink: "#08080a",
  ink900: "#0e0e11",
  ink850: "#141418",
  ink800: "#1c1c21",
  ink700: "#2a2a31",
  ink600: "#3a3a43",
  paper: "#f4f3f0",
  paper200: "#cfcfca",
  paper300: "#a8a8a4",
  paper500: "#7a7a7e",
  signal: "#aaff00",
} as const;

export const sans = loadGeist("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] }).fontFamily;
export const mono = loadMono("normal", { weights: ["400", "500"], subsets: ["latin"] }).fontFamily;
export const serif = loadSerif("italic", { weights: ["400"], subsets: ["latin"] }).fontFamily;

/* ---------------------------------------------------------------- timing --- */
export const FPS = 60;
export const s = (seconds: number) => Math.round(seconds * FPS);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// The site's three curves (tokens.css), so motion feels like the same hand.
export const ease = {
  out: Easing.bezier(0.16, 1, 0.3, 1),
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  through: Easing.bezier(0.7, 0.01, 0.31, 1),
  in: Easing.bezier(0.5, 0, 0.75, 0),
};

export const ramp = (f: number, from: number, to: number, a = 0, b = 1, easing = ease.out) =>
  interpolate(f, [from, to], [a, b], { ...clamp, easing });

/** Mild overshoot, the "settle" curve as a spring. */
export const settle = (f: number, fps: number, delay = 0, stiffness = 140) =>
  spring({ frame: f - delay, fps, config: { damping: 15, stiffness, mass: 0.9 } });

/** No overshoot, for things that slide rather than land. */
export const glide = (f: number, fps: number, delay = 0) =>
  spring({ frame: f - delay, fps, config: { damping: 200, stiffness: 110 } });

/* ------------------------------------------------------------ backdrop --- */
export const Backdrop: React.FC = () => (
  <AbsoluteFill
    style={{ background: `radial-gradient(120% 90% at 50% 45%, ${c.ink900} 0%, ${c.ink} 70%)` }}
  />
);

/* ------------------------------------------------------- scene hand-off ---
   Scenes overlap by HANDOFF frames. The outgoing one is pushed left and
   smeared, the incoming one arrives from the right out of a blur, so the cut
   reads as one camera move rather than two fades. */
export const HANDOFF = 14;

type Move = "push" | "fade" | "none";

export const Stage: React.FC<{
  dur: number;
  enter?: Move;
  exit?: Move;
  children: React.ReactNode;
}> = ({ dur, enter = "push", exit = "push", children }) => {
  const f = useCurrentFrame();
  const i = enter === "none" ? 1 : ramp(f, 0, HANDOFF, 0, 1, ease.out);
  const o = exit === "none" ? 0 : ramp(f, dur - HANDOFF, dur, 0, 1, ease.in);
  const shift = (enter === "push" ? (1 - i) * 220 : 0) - (exit === "push" ? o * 260 : 0);
  const smear = 1 + (enter === "push" ? (1 - i) * 0.12 : 0) + (exit === "push" ? o * 0.16 : 0);
  const blur = (enter === "none" ? 0 : (1 - i) * 18) + (exit === "none" ? 0 : o * 22);
  return (
    <AbsoluteFill
      style={{
        opacity: i * (1 - o),
        transform: `translateX(${shift}px) scaleX(${smear})`,
        filter: blur > 0.2 ? `blur(${blur}px)` : undefined,
      }}
    >
      {children}
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- type --- */

/** A line that rises word by word through its own mask. */
export const Rise: React.FC<{
  children: string;
  at: number;
  step?: number;
  size: number;
  weight?: number;
  color?: string;
  tracking?: string;
  /** Word indexes set in the serif italic, the site's one-accent-word rule. */
  em?: number[];
  /** Word index that gets the lime rule drawn under it, and when. */
  mark?: number;
  markAt?: number;
  style?: React.CSSProperties;
}> = ({ children, at, step = 4, size, weight = 500, color = c.paper, tracking = "-0.035em", em = [], mark, markAt = 0, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = children.split(" ");
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        columnGap: size * 0.24,
        fontFamily: sans,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing: tracking,
        lineHeight: 1.08,
        ...style,
      }}
    >
      {words.map((w, n) => {
        const p = glide(f, fps, at + n * step);
        const italic = em.includes(n);
        return (
          <span key={n} style={{ display: "inline-block", overflow: "hidden", padding: "0.06em 0 0.14em", margin: "-0.06em 0 -0.14em" }}>
            <span
              style={{
                display: "inline-block",
                position: "relative",
                transform: `translateY(${(1 - p) * 135}%)`,
                opacity: p > 0.002 ? 1 : 0,
                fontFamily: italic ? serif : undefined,
                fontWeight: italic ? 400 : undefined,
                letterSpacing: italic ? "-0.01em" : undefined,
              }}
            >
              {w}
              {mark === n ? (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    right: "0.12em",
                    bottom: "-0.02em",
                    height: Math.max(4, size * 0.065),
                    borderRadius: 99,
                    background: c.signal,
                    transformOrigin: "left center",
                    transform: `scaleX(${ramp(f, markAt, markAt + s(0.45), 0, 1, ease.inOut)})`,
                  }}
                />
              ) : null}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/** Mono micro label, the site's MicroLabel. */
export const Label: React.FC<{ children: React.ReactNode; at: number; color?: string; size?: number; style?: React.CSSProperties }> = ({
  children,
  at,
  color = c.paper500,
  size = 22,
  style,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + s(0.5));
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: size,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color,
        opacity: p,
        transform: `translateY(${(1 - p) * 14}px)`,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Pill chip: mono, like the site's Tag primitive. */
export const Chip: React.FC<{ children: React.ReactNode; at: number; filled?: boolean; size?: number }> = ({
  children,
  at,
  filled,
  size = 22,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = settle(f, fps, at, 170);
  return (
    <div
      style={{
        fontFamily: mono,
        fontSize: size,
        letterSpacing: "0.02em",
        padding: `${size * 0.5}px ${size * 0.95}px`,
        borderRadius: 999,
        border: `1.5px solid ${filled ? c.paper : c.ink700}`,
        background: filled ? c.paper : c.ink850,
        color: filled ? c.ink : c.paper200,
        whiteSpace: "nowrap",
        opacity: Math.min(1, p * 1.6),
        transform: `translateY(${(1 - p) * 22}px) scale(${0.9 + 0.1 * p})`,
      }}
    >
      {children}
    </div>
  );
};

/** The lime rule that draws under the word the film is pointing at. */
export const Underline: React.FC<{ at: number; width: number; thickness?: number; style?: React.CSSProperties }> = ({
  at,
  width,
  thickness = 6,
  style,
}) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + s(0.45), 0, 1, ease.inOut);
  return (
    <div
      style={{
        width,
        height: thickness,
        borderRadius: thickness,
        background: c.signal,
        transformOrigin: "left center",
        transform: `scaleX(${p})`,
        ...style,
      }}
    />
  );
};

/* ------------------------------------------------------------ odometer ---
   A nod to the site's preloader. Each digit is a strip of 0-9 that rolls to
   its target, the more significant digits arriving a beat later. */
export const Odometer: React.FC<{
  value: string;
  at: number;
  size: number;
  color?: string;
  dur?: number;
  weight?: number;
}> = ({ value, at, size, color = c.paper, dur = s(1.1), weight = 600 }) => {
  const f = useCurrentFrame();
  const chars = value.split("");
  const digits = chars.filter((ch) => /\d/.test(ch)).length;
  let d = 0;
  return (
    <div
      style={{
        display: "flex",
        fontFamily: sans,
        fontWeight: weight,
        fontSize: size,
        lineHeight: 1,
        letterSpacing: "-0.05em",
        color,
        fontVariantNumeric: "tabular-nums",
        opacity: ramp(f, at - 2, at + 8),
      }}
    >
      {chars.map((ch, n) => {
        if (!/\d/.test(ch)) {
          const p = ramp(f, at + dur * 0.6, at + dur * 0.6 + s(0.3));
          return (
            <span key={n} style={{ opacity: p, transform: `translateY(${(1 - p) * 0.3}em)` }}>
              {ch}
            </span>
          );
        }
        const target = Number(ch);
        const laps = digits - d; // leftmost digit spins the most
        const delay = d * s(0.08);
        d++;
        const p = ramp(f, at + delay, at + delay + dur, 0, 1, ease.out);
        const stops = laps * 10 + target;
        const strip = Array.from({ length: stops + 1 }, (_, k) => k % 10);
        const blur = Math.min(6, Math.abs(ramp(f, at + delay, at + delay + dur * 0.5, 1, 0)) * 6);
        return (
          <span key={n} style={{ display: "inline-block", height: "1em", overflow: "hidden", paddingBottom: "0.04em" }}>
            <span
              style={{
                display: "flex",
                flexDirection: "column",
                transform: `translateY(${-p * stops}em)`,
                filter: blur > 0.3 ? `blur(${blur}px)` : undefined,
              }}
            >
              {strip.map((k, j) => (
                <span key={j} style={{ height: "1em", lineHeight: 1 }}>
                  {k}
                </span>
              ))}
            </span>
          </span>
        );
      })}
    </div>
  );
};

/* ------------------------------------------------------------- devices ---
   Drawn frames, real screens. Screen ratio is 16:10 on the laptop; the phone
   takes the ratio of whatever screenshot it is given. */
export const Laptop: React.FC<{ width: number; children: React.ReactNode }> = ({ width, children }) => {
  const bezel = width * 0.024;
  const screenW = width - bezel * 2;
  const screenH = screenW / 1.6;
  return (
    <div style={{ position: "relative", width: width * 1.14, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div
        style={{
          width,
          padding: `${bezel}px ${bezel}px ${bezel * 1.35}px`,
          borderRadius: width * 0.026,
          background: "linear-gradient(180deg, #1d1d22 0%, #121215 100%)",
          boxShadow: `inset 0 0 0 1.5px #34343c, 0 60px 120px rgba(0,0,0,0.55), 0 20px 40px rgba(0,0,0,0.4)`,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: bezel * 0.36,
            left: "50%",
            width: bezel * 0.32,
            height: bezel * 0.32,
            marginLeft: -bezel * 0.16,
            borderRadius: 99,
            background: "#2c2c33",
          }}
        />
        <div style={{ position: "relative", width: screenW, height: screenH, overflow: "hidden", borderRadius: width * 0.006, background: "#fff" }}>
          {children}
          <AbsoluteFill
            style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 38%)", pointerEvents: "none" }}
          />
        </div>
      </div>
      {/* base */}
      <div
        style={{
          width: width * 1.14,
          height: width * 0.03,
          marginTop: -1,
          borderRadius: `${width * 0.004}px ${width * 0.004}px ${width * 0.03}px ${width * 0.03}px`,
          background: "linear-gradient(180deg, #4a4a53 0%, #2a2a30 35%, #17171b 100%)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            width: width * 0.15,
            height: width * 0.009,
            marginLeft: -width * 0.075,
            borderRadius: `0 0 ${width * 0.01}px ${width * 0.01}px`,
            background: "#1a1a1f",
          }}
        />
      </div>
    </div>
  );
};

export const Phone: React.FC<{ width: number; src: string; aspect: number; style?: React.CSSProperties }> = ({
  width,
  src,
  aspect,
  style,
}) => {
  const bezel = width * 0.04;
  const screenW = width - bezel * 2;
  const screenH = screenW / aspect;
  return (
    <div
      style={{
        width,
        padding: bezel,
        borderRadius: width * 0.17,
        background: "linear-gradient(160deg, #26262c 0%, #111114 60%)",
        boxShadow: `inset 0 0 0 1.5px #3a3a43, inset 0 0 0 ${bezel * 0.45}px #0b0b0d, 0 50px 100px rgba(0,0,0,0.6)`,
        position: "relative",
        ...style,
      }}
    >
      <div style={{ position: "relative", width: screenW, height: screenH, borderRadius: width * 0.13, overflow: "hidden", background: "#fff" }}>
        <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        <div
          style={{
            position: "absolute",
            top: screenW * 0.025,
            left: "50%",
            width: screenW * 0.3,
            height: screenW * 0.085,
            marginLeft: -screenW * 0.15,
            borderRadius: 99,
            background: "#050506",
          }}
        />
      </div>
    </div>
  );
};

/** A screenshot laid flat as a floating card, for the ATRC flow strip. */
export const Card: React.FC<{ src: string; width: number; aspect: number }> = ({ src, width, aspect }) => (
  <div
    style={{
      width,
      height: width / aspect,
      borderRadius: 20,
      overflow: "hidden",
      boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.08), 0 40px 80px rgba(0,0,0,0.55)",
      flexShrink: 0,
    }}
  >
    <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
  </div>
);
