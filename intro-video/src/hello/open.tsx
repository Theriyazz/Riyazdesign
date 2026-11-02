import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, c, ease, glide, Label, mono, ramp, Rise, s, sans, serif, settle, Stage } from "./kit";
import { copy } from "./copy";

/** The dot's size at rest: the same as the full stop in the closing wordmark, so the loop closes. */
export const DOT = 34;
export const CENTER = { x: 960, y: 540 };

/* Where the tittle of the ı in "Riyaz" sits on screen. Measured from a still,
   because the dot is placed in screen space rather than inside the glyph. */
export const TITTLE = { x: 390, y: 258 };

const NAME_SIZE = 290;
const NAME_LEFT = 160;

/** Letters rising through a mask, a few frames apart. */
const Letters: React.FC<{ text: string; at: number; color: string; step?: number }> = ({ text, at, color, step = 3 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ display: "flex", overflow: "hidden", padding: "0.02em 0 0.16em", color }}>
      {text.split("").map((ch, i) => {
        const p = glide(f, fps, at + i * step);
        return (
          <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - p) * 135}%)`, opacity: p > 0.002 ? 1 : 0 }}>
            {ch}
          </span>
        );
      })}
    </div>
  );
};

export const NAME_DUR = s(2.8);

/** 1. A cursor dot clicks, lands on the i, and swells into lime. */
export const Name: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const born = settle(f, fps, s(0.05), 160);
  const press = 1 - 0.22 * Math.max(0, 1 - Math.abs(f - s(0.5)) / 5);
  const ring = ramp(f, s(0.5), s(0.95));

  // Arc from the centre to the tittle: x eases out, y eases in, so it lobs.
  const fly0 = s(0.78);
  const fly1 = s(1.32);
  const fx = ramp(f, fly0, fly1, 0, 1, ease.inOut);
  const fy = ramp(f, fly0, fly1, 0, 1, ease.in);
  const lift = Math.sin(Math.PI * ramp(f, fly0, fly1, 0, 1, (t) => t)) * -150;
  const x = interpolate(fx, [0, 1], [CENTER.x, TITTLE.x]);
  const y = interpolate(fy, [0, 1], [CENTER.y, TITTLE.y]) + lift;

  // Squash on landing, then settle.
  const land = settle(f, fps, fly1, 260);
  const squash = f < fly1 ? 1 : 1 + (1 - land) * 0.5;

  // The swell that carries the cut to the portrait.
  const swell = ramp(f, NAME_DUR - s(0.62), NAME_DUR, 0, 1, ease.in);
  const scale = born * press * (1 + swell * 160);

  const textOut = ramp(f, NAME_DUR - s(0.6), NAME_DUR - s(0.2));

  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ opacity: 1 - textOut, transform: `scale(${1 + textOut * 0.04})`, transformOrigin: `${TITTLE.x}px ${TITTLE.y}px` }}>
        <div style={{ position: "absolute", left: NAME_LEFT + 6, top: 150, fontFamily: serif, fontSize: 64, color: c.paper300, opacity: ramp(f, s(0.7), s(1.1)), transform: `translateY(${ramp(f, s(0.7), s(1.1), 20, 0)}px)` }}>
          {copy.hello}
        </div>
        <div
          style={{
            position: "absolute",
            left: NAME_LEFT,
            top: 222,
            fontFamily: sans,
            fontWeight: 700,
            fontSize: NAME_SIZE,
            lineHeight: 0.86,
            letterSpacing: "-0.055em",
          }}
        >
          {/* Dotless ı: the dot lands where its tittle would be. */}
          <Letters text={copy.first} at={s(0.85)} color={c.paper} />
          <Letters text={copy.last} at={s(1.15)} color={c.paper500} />
        </div>
        <Label at={s(1.55)} size={24} style={{ position: "absolute", left: NAME_LEFT + 8, top: 820 }}>
          {copy.role}
        </Label>
      </AbsoluteFill>

      {/* click ring */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x,
          top: CENTER.y,
          width: DOT,
          height: DOT,
          marginLeft: -DOT / 2,
          marginTop: -DOT / 2,
          borderRadius: 999,
          border: `2px solid ${c.signal}`,
          opacity: (1 - ring) * (f > s(0.5) ? 1 : 0),
          transform: `scale(${1 + ring * 3.2})`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: DOT,
          height: DOT,
          marginLeft: -DOT / 2,
          marginTop: -DOT / 2,
          borderRadius: 999,
          background: c.signal,
          transform: `scale(${scale * squash}, ${scale / squash})`,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ face --- */
export const FACE_DUR = s(3.4);
const P = { x: 560, y: 540, r: 250 };

const Ring: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const R = 312;
  const p = ramp(f, at, at + s(0.6));
  const turn = -18 + f * 0.18;
  return (
    <svg
      width={R * 2 + 80}
      height={R * 2 + 80}
      viewBox={`${-R - 40} ${-R - 40} ${R * 2 + 80} ${R * 2 + 80}`}
      style={{
        position: "absolute",
        left: P.x - R - 40,
        top: P.y - R - 40,
        opacity: p,
        transform: `rotate(${turn - (1 - p) * 40}deg) scale(${0.94 + 0.06 * p})`,
      }}
    >
      <defs>
        <path id="hello-ring" d={`M 0 ${-R} A ${R} ${R} 0 1 1 -0.01 ${-R}`} />
      </defs>
      <text fontFamily={mono} fontSize={20} letterSpacing={6.4} fill={c.paper500}>
        <textPath href="#hello-ring">{copy.ring}</textPath>
      </text>
    </svg>
  );
};

/** 2. The lime frame closes into the portrait; the thesis rises beside it. */
export const Face: React.FC = () => {
  const f = useCurrentFrame();
  const iris = ramp(f, 0, s(0.75), 0, 1, ease.inOut);
  const cx = interpolate(iris, [0, 1], [TITTLE.x, P.x]);
  const cy = interpolate(iris, [0, 1], [TITTLE.y, P.y]);
  const r = interpolate(iris, [0, 1], [2400, P.r]);
  const photo = ramp(f, s(0.42), s(0.78));
  const drift = 1.08 - 0.08 * ramp(f, 0, FACE_DUR, 0, 1, (t) => t);

  return (
    <Stage dur={FACE_DUR} enter="none">
      <Backdrop />
      <Ring at={s(0.7)} />
      <div
        style={{
          position: "absolute",
          left: P.x - P.r - 2,
          top: P.y - P.r - 2,
          width: P.r * 2 + 4,
          height: P.r * 2 + 4,
          borderRadius: 999,
          border: `1.5px solid ${c.ink700}`,
          opacity: ramp(f, s(0.7), s(1)),
        }}
      />
      <AbsoluteFill style={{ clipPath: `circle(${r}px at ${cx}px ${cy}px)`, background: c.signal }}>
        <Img
          src={staticFile("hello/portrait.webp")}
          style={{
            position: "absolute",
            left: P.x - P.r,
            top: P.y - P.r,
            width: P.r * 2,
            height: P.r * 2,
            borderRadius: 999,
            opacity: photo,
            transform: `scale(${drift})`,
          }}
        />
      </AbsoluteFill>

      <div style={{ position: "absolute", left: 1000, top: 318, width: 780 }}>
        <Label at={s(0.95)} size={22}>
          {copy.since}
        </Label>
        <div style={{ height: 34 }} />
        {copy.thesis.map((line, i) => (
          <Rise
            key={i}
            at={s(1.0) + i * s(0.16)}
            size={80}
            weight={500}
            em={line.em}
            mark={line.em?.[0]}
            markAt={s(2.0)}
          >
            {line.text}
          </Rise>
        ))}
      </div>
    </Stage>
  );
};
