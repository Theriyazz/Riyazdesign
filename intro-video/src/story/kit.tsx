import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame, useVideoConfig } from "remotion";
import { glide, OVERLAP, pop, ramp } from "../lib";
import { c, marker, serif } from "../theme";

const INK = "#0c0c0f";

type Ground = "paper" | "ink" | "glow";

/** A full-bleed shot: its ground cross-fades in, its content blurs in and out. */
export const Shot: React.FC<{
  ground: Ground;
  dur: number;
  exit?: "blur" | "none";
  children: React.ReactNode;
}> = ({ ground, dur, exit = "blur", children }) => {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, OVERLAP);
  const out = exit === "none" ? 0 : ramp(frame, dur - OVERLAP, dur, 0, 1, Easing.in(Easing.cubic));
  // The glow rises from under the floor and then breathes.
  const rise = 130 - 18 * ramp(frame, 0, 26) + Math.sin(frame / 14) * 1.5;

  return (
    <AbsoluteFill style={{ color: ground === "paper" ? c.ink : c.paper }}>
      <AbsoluteFill style={{ background: ground === "paper" ? c.paper : INK, opacity: enter }} />
      {ground === "glow" ? (
        <AbsoluteFill
          style={{
            opacity: enter,
            background: `radial-gradient(ellipse 120% 52% at 50% ${rise}%, ${c.signalDeep} 0%, #233400 42%, transparent 76%)`,
          }}
        />
      ) : null}
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: enter * (1 - out),
          filter: `blur(${(1 - enter) * 14 + out * 18}px)`,
          transform: `scale(${1.05 - 0.05 * enter + out * 0.08})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** The payoff word: serif italic in lime on dark, a lime marker on paper. */
export const payoff: React.CSSProperties = {
  fontFamily: serif,
  fontStyle: "italic",
  fontWeight: 400,
  fontSize: "1.28em",
  letterSpacing: "-0.01em",
  color: c.signal,
};
export const payoffOnPaper: React.CSSProperties = { ...marker };

const Dots: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const frame = useCurrentFrame();
  return (
    <span style={{ display: "inline-flex", gap: size * 0.07, marginLeft: -size * 0.08 }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            width: size * 0.1,
            height: size * 0.1,
            borderRadius: "50%",
            background: "currentColor",
            opacity: frame < at + i * 3 ? 0 : 0.25 + 0.75 * Math.max(0, Math.sin((frame - at - i * 5) / 5)),
          }}
        />
      ))}
    </span>
  );
};

/** A sentence that blurs in one word at a time, left to right. */
export const Say: React.FC<{
  text: string;
  size?: number;
  start?: number;
  step?: number;
  width?: number;
  weight?: number;
  align?: "center" | "left";
  dots?: boolean;
  em?: Record<number, React.CSSProperties>;
}> = ({ text, size = 92, start = 4, step = 3, width = 900, weight = 600, align = "center", dots, em = {} }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(" ");

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: align === "center" ? "center" : "flex-start",
        alignItems: "baseline",
        columnGap: size * 0.24,
        maxWidth: width,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.035em",
        lineHeight: 1.12,
      }}
    >
      {words.map((word, i) => {
        const p = glide(frame, fps, start + i * step);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              filter: `blur(${(1 - p) * 14}px)`,
              transform: `translateY(${(1 - p) * size * 0.3}px)`,
              ...em[i],
            }}
          >
            {word}
          </span>
        );
      })}
      {dots ? <Dots at={start + words.length * step} size={size} /> : null}
    </div>
  );
};

const STAR = "M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z";

export const Star: React.FC<{ at: number; size: number; style: React.CSSProperties }> = ({ at, size, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, at);
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ position: "absolute", ...style, transform: `scale(${p}) rotate(${(1 - p) * -120 + frame * 0.6}deg)` }}
    >
      <path d={STAR} fill={c.signal} />
    </svg>
  );
};

export const Pointer: React.FC<{ size?: number; dark?: boolean; style: React.CSSProperties }> = ({
  size = 84,
  dark,
  style,
}) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={{ position: "absolute", filter: "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.45))", ...style }}
  >
    <path
      d="M5 3l14 8-6 1.5L10 19z"
      fill={dark ? c.ink : c.paper}
      stroke={dark ? c.white : c.ink}
      strokeWidth={1.5}
      strokeLinejoin="round"
    />
  </svg>
);
