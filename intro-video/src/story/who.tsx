import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { glide, linear, pop, ramp, SceneProps } from "../lib";
import { c } from "../theme";
import { copy } from "./copy";
import { payoff, Say, Shot, Star } from "./kit";
import { HEARD, within } from "./voice";

const last = (text: string) => text.split(" ").length - 1;

export const Never: React.FC<SceneProps> = ({ dur }) => (
  <Shot ground="paper" dur={dur}>
    <Say text={copy.never} size={104} dots />
  </Shot>
);

export const Commerce: React.FC<SceneProps> = ({ dur }) => (
  <Shot ground="glow" dur={dur}>
    <Say text={copy.commerce} size={100} step={4} em={{ [last(copy.commerce)]: payoff }} />
  </Shot>
);

export const Hi: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Shot ground="ink" dur={dur}>
      <Img
        src={staticFile("avatar.webp")}
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          border: `10px solid ${c.signal}`,
          marginBottom: 64,
          transform: `scale(${pop(frame, fps, 2)})`,
        }}
      />
      <Say text={copy.hi} size={120} start={10} step={4} em={{ [last(copy.hi)]: payoff }} />
      <Star at={24} size={90} style={{ left: 850, top: 1010 }} />
    </Shot>
  );
};

const WEDGE_AT = 30;

export const Became: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // The image has no room at first; growing it is what pushes the two lines apart.
  const open = glide(frame, fps, WEDGE_AT);
  return (
    <Shot ground="paper" dur={dur}>
      <Say text={copy.became.lead} size={78} width={860} />
      <div style={{ height: 600 * open, margin: `${44 * open}px 0`, display: "flex", alignItems: "center" }}>
        <Img
          src={staticFile(copy.became.image)}
          style={{
            width: 800,
            borderRadius: 28,
            boxShadow: "0 40px 90px rgba(8, 8, 10, 0.3)",
            opacity: Math.min(1, open * 1.6),
            transform: `scale(${0.4 + 0.6 * open}) rotate(${-3 + (1 - open) * -8}deg)`,
          }}
        />
      </div>
      <Say text={copy.became.land} size={132} weight={700} start={22} step={4} />
    </Shot>
  );
};

export const Jump: React.FC<SceneProps> = ({ dur }) => (
  <Shot ground="paper" dur={dur}>
    <Say text={copy.jump} size={96} />
  </Shot>
);

export const Edge: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Arrives far too large for the frame and pulls back to size.
  const settle = ramp(frame, 0, 18);
  const land = pop(frame, fps, 22);
  return (
    <Shot ground="glow" dur={dur}>
      <div
        style={{
          fontSize: 82,
          fontWeight: 600,
          letterSpacing: "-0.035em",
          whiteSpace: "nowrap",
          transform: `scale(${1 + (1 - settle) * 7})`,
          filter: `blur(${(1 - settle) * 10}px)`,
        }}
      >
        {copy.edge.lead}
      </div>
      <div
        style={{
          ...payoff,
          fontSize: 230,
          lineHeight: 1.1,
          opacity: Math.min(1, land * 2),
          transform: `scale(${0.6 + 0.4 * land})`,
        }}
      >
        {copy.edge.land}
      </div>
      <Star at={32} size={110} style={{ left: 900, top: 1090 }} />
    </Shot>
  );
};

// The photo of Riyaz at his desk. FOCUS is his eyeline, as a fraction of the image;
// the push closes in on it, and the next shot's ripple opens from the same point.
const FOCUS = { x: 0.56, y: 0.26 };
const SCREEN_W = 1320;
const SCREEN_H = SCREEN_W * (1381 / 2000);
const SCREEN_TOP = 800;
const PUSH_AT = 46;

export const Look: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { text, image } = copy.look;
  const typed = text.slice(0, Math.round(linear(frame, 4, 44) * text.length));
  const rise = glide(frame, fps, 6);
  const push = ramp(frame, PUSH_AT, dur, 0, 1, (t) => t * t);
  const bx = SCREEN_W * FOCUS.x;
  const by = SCREEN_H * FOCUS.y;

  return (
    <Shot ground="ink" dur={dur}>
      <AbsoluteFill>
        <div
          style={{
            position: "absolute",
            left: 540 - bx,
            top: SCREEN_TOP + (1 - rise) * 1300,
            width: SCREEN_W,
            height: SCREEN_H,
            transformOrigin: `${bx}px ${by}px`,
            transform: `scale(${1 + push * 0.55})`,
          }}
        >
          <Img
            src={staticFile(image)}
            style={{ width: "100%", borderRadius: 24, boxShadow: "0 40px 120px rgba(0, 0, 0, 0.7)" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 760,
            padding: "250px 90px 0",
            background: "linear-gradient(180deg, #0c0c0f 70%, rgba(12, 12, 15, 0) 100%)",
            fontSize: 68,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.14,
            textAlign: "center",
          }}
        >
          {typed}
          <span style={{ color: c.signal, fontWeight: 400 }}>|</span>
        </div>
      </AbsoluteFill>
    </Shot>
  );
};

export const Costing: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { lead, land, tail } = copy.costing;
  // Opens from where the previous shot's push ended, so the cut reads as one move.
  const ripple = ramp(frame, 0, 18);
  const hit = pop(frame, fps, 22);
  return (
    <Shot ground="glow" dur={dur}>
      <div
        style={{
          position: "absolute",
          left: 540 - 150,
          top: SCREEN_TOP + SCREEN_H * FOCUS.y - 150,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: c.signal,
          opacity: (1 - ripple) * 0.9,
          transform: `scale(${0.2 + ripple * 9})`,
        }}
      />
      <Say text={lead} size={84} start={10} />
      <div
        style={{
          ...payoff,
          fontSize: 250,
          lineHeight: 1.12,
          opacity: Math.min(1, hit * 2),
          transform: `scale(${0.6 + 0.4 * hit})`,
        }}
      >
        {land}
      </div>
      <Say text={tail} size={84} start={32} />
    </Shot>
  );
};

export const Years: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { count, text } = copy.years;
  const value = Math.round(ramp(frame, 4, 26, 0, count, (t) => t));
  const shrink = glide(frame, fps, 36);
  return (
    <Shot ground="paper" dur={dur}>
      <div
        style={{
          fontSize: 620,
          fontWeight: 700,
          letterSpacing: "-0.06em",
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
          transform: `translateY(${-shrink * 60}px) scale(${1 - 0.42 * shrink})`,
        }}
      >
        {value}
        <span style={{ opacity: value === count ? 1 : 0 }}>+</span>
      </div>
      <div style={{ marginTop: -120 * shrink }}>
        <Say text={text} size={76} width={820} start={40} />
      </div>
    </Shot>
  );
};

export const Fields: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { lead, panels } = copy.fields;
  const drift = linear(frame, 0, dur) * 70;

  return (
    <Shot ground="ink" dur={dur}>
      <AbsoluteFill style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 10 }}>
        {panels.map((panel, i) => {
          // Each panel lights as its industry is named.
          const lit = glide(frame, fps, within("fields", HEARD.fields[i]) - 2);
          return (
            <div key={panel.label} style={{ position: "relative", overflow: "hidden", background: c.ink850 }}>
              <Img
                src={staticFile(panel.image)}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: `${drift}% ${drift}%`,
                  opacity: 0.22 + 0.78 * lit,
                  transform: `scale(${1.25 - 0.15 * pop(frame, fps, i * 3)})`,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "flex-end",
                  padding: 44,
                  background: "linear-gradient(180deg, rgba(8, 8, 10, 0) 45%, rgba(8, 8, 10, 0.88) 100%)",
                  fontSize: 74,
                  fontWeight: 700,
                  letterSpacing: "-0.035em",
                  color: c.paper,
                }}
              >
                <span style={{ opacity: lit, transform: `translateY(${(1 - lit) * 40}px)` }}>{panel.label}</span>
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
      <div
        style={{
          position: "relative",
          padding: "14px 44px",
          borderRadius: 999,
          background: c.signal,
          color: c.ink,
          fontSize: 60,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.6)",
          transform: `scale(${pop(frame, fps, 4)})`,
        }}
      >
        {lead}
      </div>
    </Shot>
  );
};

export const Show: React.FC<SceneProps> = ({ dur }) => (
  <Shot ground="paper" dur={dur}>
    <Say text={copy.show} size={98} dots />
  </Shot>
);
