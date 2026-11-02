import React from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  interpolateColors,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/** Frames each scene shares with the next one; the cross-blur lives here. */
export const OVERLAP = 8;

/** Scenes are laid out on a 1080 square and scaled to fit either format. */
export const STAGE = 1080;

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const easeOut = Easing.bezier(0.22, 1, 0.36, 1);

export const ramp = (
  frame: number,
  from: number,
  to: number,
  a = 0,
  b = 1,
  easing: (t: number) => number = easeOut,
) => interpolate(frame, [from, to], [a, b], { ...clamp, easing });

export const linear = (frame: number, from: number, to: number) =>
  interpolate(frame, [from, to], [0, 1], clamp);

export const pop = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 170, mass: 0.7 } });

/** Spring with no overshoot, for things that slide rather than bounce. */
export const glide = (frame: number, fps: number, delay = 0) =>
  spring({ frame: frame - delay, fps, config: { damping: 200, stiffness: 160 } });

export type SceneProps = { dur: number };

type Exit = "blur" | "left" | "zoom" | "none";

export const Scene: React.FC<{
  bg: string;
  dur: number;
  exit?: Exit;
  children: React.ReactNode;
}> = ({ bg, dur, exit = "blur", children }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const fit = Math.min(width / STAGE, (height / STAGE) * 1.35);

  const enter = ramp(frame, 0, OVERLAP);
  const out = exit === "none" ? 0 : ramp(frame, dur - OVERLAP, dur, 0, 1, Easing.in(Easing.cubic));

  const x = exit === "left" ? -out * 260 * fit : 0;
  const zoom = (exit === "zoom" ? 1 + out * 0.4 : 1) * (1.06 - 0.06 * enter);
  const smear = exit === "left" ? 1 + out * 0.5 : 1;

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: bg, opacity: enter }} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          opacity: enter * (1 - out),
          filter: `blur(${(1 - enter) * 14 + out * 18}px)`,
          transform: `translateX(${x}px) scale(${zoom}) scaleX(${smear})`,
        }}
      >
        <div
          style={{
            position: "relative",
            flexShrink: 0,
            width: STAGE,
            height: STAGE,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            transform: `scale(${fit})`,
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Words that pop in one after another, optionally flashing a colour first. */
export const Words: React.FC<{
  text: string;
  color: string;
  size?: number;
  start?: number;
  step?: number;
  weight?: number;
  flash?: string;
  accents?: Record<number, React.CSSProperties>;
  /** Lets the line wrap; without it the words stay on one line. */
  maxWidth?: number;
}> = ({ text, color, size = 68, start = 0, step = 4, weight = 600, flash, accents = {}, maxWidth }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "baseline",
        columnGap: size * 0.26,
        fontSize: size,
        fontWeight: weight,
        letterSpacing: "-0.03em",
        lineHeight: 1.15,
        whiteSpace: "nowrap",
        maxWidth,
      }}
    >
      {text.split(" ").map((word, i) => {
        const delay = start + i * step;
        const p = pop(frame, fps, delay);
        const accent = accents[i];
        const settled = (accent?.color as string | undefined) ?? color;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: linear(frame, delay, delay + 4),
              transform: `translateY(${(1 - p) * size * 0.45}px) scale(${0.85 + 0.15 * p})`,
              filter: `blur(${Math.max(0, 1 - p) * 8}px)`,
              ...accent,
              color: flash
                ? interpolateColors(frame, [delay + 4, delay + 12], [flash, settled])
                : settled,
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
