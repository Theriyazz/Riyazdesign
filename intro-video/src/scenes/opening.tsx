import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { linear, pop, ramp, Scene, SceneProps, Words } from "../lib";
import { script } from "../script";
import { c, serif } from "../theme";

const EMOJI = [
  { glyph: "👋", x: -330, y: -170 },
  { glyph: "✏️", x: 330, y: -180 },
  { glyph: "🗒️", x: -340, y: 150 },
  { glyph: "📱", x: 330, y: 160 },
];

export const Hello: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <Scene bg={c.paper} dur={dur}>
      {EMOJI.map((m, i) => {
        const p = pop(frame, fps, 4 + i * 4);
        const bob = Math.sin((frame + i * 9) / 9) * 8;
        return (
          <div
            key={m.glyph}
            style={{
              position: "absolute",
              left: 540 + m.x,
              top: 540 + m.y,
              fontSize: 64,
              transform: `translate(-50%, -50%) translateY(${bob}px) scale(${p}) rotate(${(1 - p) * -30}deg)`,
            }}
          >
            {m.glyph}
          </div>
        );
      })}
      <Words text={script.hello} color={c.ink} size={64} start={6} flash={c.signalDeep} />
    </Scene>
  );
};

const STAR = "M12 0C13 8 16 11 24 12C16 13 13 16 12 24C11 16 8 13 0 12C8 11 11 8 12 0Z";
const STARS = [
  { x: -330, y: -110, size: 30 },
  { x: 330, y: -130, size: 46 },
  { x: -350, y: 120, size: 52 },
  { x: 350, y: 100, size: 64 },
];

export const Name: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const last = script.name.split(" ").length - 1;

  return (
    <Scene bg={`radial-gradient(circle at 50% 50%, #233400 0%, ${c.ink} 68%)`} dur={dur}>
      {STARS.map((s, i) => {
        const p = pop(frame, fps, 6 + i * 3);
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            width={s.size}
            height={s.size}
            style={{
              position: "absolute",
              left: 540 + s.x,
              top: 540 + s.y,
              transform: `translate(-50%, -50%) scale(${p}) rotate(${frame * 1.2 + i * 40}deg)`,
            }}
          >
            <path d={STAR} fill={c.paper} />
          </svg>
        );
      })}
      <Words
        text={script.name}
        color={c.paper}
        size={78}
        start={4}
        step={5}
        accents={{
          [last]: { fontFamily: serif, fontStyle: "italic", fontWeight: 400, fontSize: "1.3em", color: c.signal },
        }}
      />
    </Scene>
  );
};

export const Pill: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const typed = script.pill.slice(0, Math.round(linear(frame, 3, 20) * script.pill.length));
  const spread = pop(frame, fps, 6);
  const settle = ramp(frame, 6, 42);
  const spin = (1 - settle) * 3.4;

  return (
    <Scene bg={c.paper} dur={dur}>
      {script.tools.map((tool, i) => {
        const angle = (i / script.tools.length) * Math.PI * 2 - spin;
        return (
          <div
            key={tool}
            style={{
              position: "absolute",
              left: 540 + Math.cos(angle) * 310 * spread,
              top: 540 + Math.sin(angle) * 310 * spread,
              width: 108,
              height: 108,
              borderRadius: 28,
              background: c.white,
              boxShadow: "0 14px 40px rgba(8, 8, 10, 0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: Math.min(1, spread),
              filter: `blur(${(1 - ramp(frame, 6, 34)) * 10}px)`,
              transform: `translate(-50%, -50%) rotate(${(1 - settle) * -90}deg)`,
            }}
          >
            <Img src={staticFile(`tools/${tool}.webp`)} style={{ width: 64, height: 64, objectFit: "contain" }} />
          </div>
        );
      })}
      <div
        style={{
          minWidth: 120,
          padding: "22px 40px",
          borderRadius: 999,
          background: c.ink,
          color: c.paper,
          fontSize: 32,
          fontWeight: 500,
          letterSpacing: "-0.01em",
          whiteSpace: "pre",
          boxShadow: "0 18px 50px rgba(8, 8, 10, 0.3)",
        }}
      >
        {typed || " "}
      </div>
    </Scene>
  );
};

export const Stepper: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { from, to, label, source } = script.metric;
  const value = Math.round(ramp(frame, 10, 38, from, to));
  const done = ramp(frame, 34, 44);

  return (
    <Scene bg={c.paper} dur={dur}>
      <div
        style={{
          width: 520,
          padding: 44,
          borderRadius: 64,
          background: c.white,
          boxShadow: `0 30px 80px rgba(8, 8, 10, 0.1), 0 0 ${140 * done}px rgba(170, 255, 0, ${0.75 * done})`,
          transform: `scale(${ramp(frame, 0, dur, 0.82, 1.14, (t) => t)})`,
        }}
      >
        <div
          style={{
            height: 34 * done + 24 * done,
            opacity: done,
            overflow: "hidden",
            textAlign: "center",
            fontSize: 30,
            fontWeight: 600,
            color: c.ink,
          }}
        >
          {label}
        </div>
        <div
          style={{
            height: 124,
            padding: "0 34px",
            borderRadius: 30,
            background: c.ink,
            color: c.signal,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 76,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <span style={{ fontWeight: 500 }}>−</span>
          <span>{value}</span>
          <span style={{ fontWeight: 500, opacity: 0.45 }}>+</span>
        </div>
        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            fontSize: 24,
            fontWeight: 500,
            color: c.paper500,
          }}
        >
          <span>{source}</span>
          <span>
            was {from}
          </span>
        </div>
      </div>
    </Scene>
  );
};
