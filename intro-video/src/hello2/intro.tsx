import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { c, ease, ramp, s, sans, serif, settle } from "../hello/kit";
import { Slam } from "./kinetic";
import { CENTER, DOT } from "./scenes";

/* The opening: Riyaz's illustration and his own introduction, on the
   illustration's cream so the artwork has no visible edge. It opens out of
   the lime dot the outro ends on, and hands over to the skills flashes
   through a lime iris that opens from the centre. */
export const INTRO_DUR = s(9);

const cream = "#f3efe3";
const inkSoft = "#5b5a55";
// Illustration on the left, looking right into the text column.
const L = 1000;

/** Ink text with a lime highlighter behind it: lime fails as text on cream, so it marks instead. */
const Marker: React.FC<{ children: React.ReactNode; at: number; size: number; weight?: number }> = ({ children, at, size, weight = 600 }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 16, 0, 1, ease.inOut);
  const t = ramp(f, at - 6, at + 6);
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "0.04em 0.22em", fontFamily: sans, fontWeight: weight, fontSize: size, letterSpacing: "-0.03em", color: c.ink, lineHeight: 1.15, opacity: t }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: "0.18em", background: c.signal, transformOrigin: "left", transform: `scaleX(${p})` }} />
      <span style={{ position: "relative" }}>{children}</span>
    </span>
  );
};

const Fade: React.FC<{ at: number; out?: number; children: React.ReactNode; style?: React.CSSProperties; rise?: number }> = ({ at, out, children, style, rise = 24 }) => {
  const f = useCurrentFrame();
  const i = ramp(f, at, at + 16);
  const o = out === undefined ? 0 : ramp(f, out, out + 14, 0, 1, ease.in);
  return <div style={{ opacity: i * (1 - o), transform: `translateY(${(1 - i) * rise - o * 40}px)`, ...style }}>{children}</div>;
};

const Line: React.FC<{ at: number; size: number; color?: string; weight?: number; children: React.ReactNode }> = ({ at, size, color = c.ink, weight = 500, children }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 18, 0, 1, ease.out);
  return (
    <div style={{ overflow: "hidden", paddingBottom: "0.12em", marginBottom: "-0.06em" }}>
      <div style={{ fontFamily: sans, fontWeight: weight, fontSize: size, lineHeight: 1.12, letterSpacing: "-0.03em", color, transform: `translateY(${(1 - p) * 110}%)`, opacity: p > 0.002 ? 1 : 0 }}>
        {children}
      </div>
    </div>
  );
};

const B1_OUT = 176;
const B2_IN = 188;
const B2_OUT = 318;
const B3_IN = 330;

export const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  // open out of the dot; leave through a lime iris into the first skills flash
  const dot = settle(f, fps, 0, 160);
  const open = ramp(f, 12, 46, 0, 1, ease.inOut);
  const radius = interpolate(open, [0, 1], [DOT / 2, 1250]);
  const lime = f < 12 ? 1 : ramp(f, 12, 22, 1, 0);
  const exit = ramp(f, INTRO_DUR - 30, INTRO_DUR, 0, 1, ease.in);
  const ink = c.ink;

  const art = settle(f, fps, 30, 70);
  const drift = ramp(f, 30, INTRO_DUR, 0, 1, (t) => t);

  return (
    <AbsoluteFill style={{ background: ink }}>
      <AbsoluteFill style={{ background: cream, clipPath: `circle(${radius}px at ${CENTER.x}px ${CENTER.y}px)` }}>
        {/* the illustration */}
        <Img
          src={staticFile("hello/illustration.webp")}
          style={{
            position: "absolute",
            left: 90,
            top: 36,
            height: 1020,
            width: (1020 * 1086) / 1448,
            opacity: Math.min(1, art * 1.4),
            transform: `translateY(${(1 - art) * 120 - drift * 18}px) scale(${1.04 - drift * 0.04})`,
            transformOrigin: "50% 100%",
          }}
        />

        {/* beat 1: who */}
        <div style={{ position: "absolute", left: L, top: 210 }}>
          <Fade at={44} out={B1_OUT}>
            <div style={{ fontFamily: serif, fontStyle: "italic", fontSize: 72, color: inkSoft, marginLeft: 6 }}>Hi. I&rsquo;m</div>
          </Fade>
          <Fade at={0} out={B1_OUT} rise={0}>
            <Slam text="Riyaz" at={54} size={230} weight={800} color={c.ink} seed="i-riyaz" wobble={0.3} />
            <Slam text="Malek" at={66} size={230} weight={800} color={c.ink} seed="i-malek" wobble={0.3} />
          </Fade>
          <Fade at={96} out={B1_OUT} style={{ marginTop: 36 }}>
            <Marker at={104} size={64}>
              Product designer
            </Marker>
          </Fade>
        </div>

        {/* beat 2: where */}
        <div style={{ position: "absolute", left: L, top: 230, width: 860 }}>
          <Fade at={B2_IN} out={B2_OUT} rise={0}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 26 }}>
              <Slam text="3+" at={B2_IN} size={230} weight={800} color={c.ink} seed="i-3" wobble={0.3} />
              <Line at={B2_IN + 10} size={60} color={inkSoft}>
                years across
              </Line>
            </div>
            <div style={{ height: 26 }} />
            {["SaaS platforms", "EdTech", "Career assessment tools", "Non-profit websites"].map((t, i) => (
              <Slam key={t} text={t} at={B2_IN + 22 + i * 9} size={66} weight={700} color={c.ink} stagger={1} seed={`dom-${i}`} wobble={0.15} tracking="-0.035em" style={{ lineHeight: 1.12 }} />
            ))}
          </Fade>
        </div>

        {/* beat 3: what, most recently */}
        <div style={{ position: "absolute", left: L, top: 250, width: 860 }}>
          <Fade at={B3_IN} rise={0}>
            <Line at={B3_IN} size={46} color={inkSoft}>Most recently, I designed a</Line>
            <Line at={B3_IN + 5} size={46} color={inkSoft}>career-guidance platform solo,</Line>
            <Line at={B3_IN + 10} size={46} color={inkSoft}>from research through final screens.</Line>
            <div style={{ height: 54 }} />
            <Line at={B3_IN + 40} size={74} weight={600}>The founder came</Line>
            <Line at={B3_IN + 45} size={74} weight={600}>with one vision.</Line>
            <div style={{ height: 14 }} />
            <Line at={B3_IN + 70} size={74} weight={600}>I delivered the</Line>
            <div style={{ marginTop: 4 }}>
              <Marker at={B3_IN + 84} size={74}>
                end-to-end product.
              </Marker>
            </div>
          </Fade>
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ background: c.signal, clipPath: `circle(${exit * 1250}px at ${CENTER.x}px ${CENTER.y}px)` }} />
      {/* the dot it opens from */}
      <div
        style={{
          position: "absolute",
          left: CENTER.x - DOT / 2,
          top: CENTER.y - DOT / 2,
          width: DOT,
          height: DOT,
          borderRadius: 999,
          background: c.signal,
          opacity: lime,
          transform: `scale(${f < 12 ? dot : 1})`,
        }}
      />
    </AbsoluteFill>
  );
};
