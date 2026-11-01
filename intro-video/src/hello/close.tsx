import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { copy } from "./copy";
import { Backdrop, c, Chip, ease, Label, ramp, Rise, s, sans, settle, Stage } from "./kit";
import { CENTER, DOT } from "./open";

/* ----------------------------------------------------------------- tools --- */
export const TOOLS_DUR = s(2.5);

/** 7. How he works: the pull quote from About, and the tools he reaches for. */
export const Tools: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icon = 96;
  return (
    <Stage dur={TOOLS_DUR}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        {copy.quote.map((line, i) => (
          <Rise
            key={i}
            at={s(0.15) + i * s(0.2)}
            size={96}
            weight={500}
            tracking="-0.04em"
            em={line.em}
            mark={line.em?.[0]}
            markAt={s(0.95)}
            style={{ justifyContent: "center" }}
          >
            {line.text}
          </Rise>
        ))}
        <div style={{ height: 92 }} />
        <div style={{ display: "flex", gap: 30 }}>
          {copy.tools.map((t, i) => {
            const p = settle(f, fps, s(0.75) + i * 3, 190);
            return (
              <Img
                key={t}
                src={staticFile(`tools/${t}.webp`)}
                style={{
                  width: icon,
                  height: icon,
                  objectFit: "contain",
                  opacity: Math.min(1, p * 1.8),
                  transform: `translateY(${(1 - p) * 60}px) scale(${0.6 + 0.4 * p})`,
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </Stage>
  );
};

/* ---------------------------------------------------------------- outro --- */
export const OUTRO_DUR = s(3.5);

const MARK = 212;
/* Screen position of the wordmark's full stop at rest, measured from a still.
   It flies from here back to the centre, where the film began. */
export const STOP = { x: 1650, y: 472 };

/** 8. The wordmark, the way in, and the full stop that becomes frame 0. */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();

  const leave = ramp(f, OUTRO_DUR - s(0.85), OUTRO_DUR - s(0.45), 0, 1, ease.in);
  const home = ramp(f, OUTRO_DUR - s(0.7), OUTRO_DUR - s(0.18), 0, 1, ease.inOut);
  const vanish = ramp(f, OUTRO_DUR - s(0.22), OUTRO_DUR, 0, 1, ease.in);

  const stopIn = settle(f, fps, s(1.0), 220);
  const dotX = interpolate(home, [0, 1], [STOP.x, CENTER.x]);
  const dotY = interpolate(home, [0, 1], [STOP.y, CENTER.y]) - Math.sin(Math.PI * home) * 120;

  const avatar = settle(f, fps, s(0.1), 120);
  const rule = ramp(f, s(0.7), s(1.4), 0, 1, ease.inOut);
  const pulse = (Math.sin(f / 9) + 1) / 2;

  return (
    <Stage dur={OUTRO_DUR} exit="none">
      <Backdrop />
      <AbsoluteFill style={{ opacity: 1 - leave, filter: leave > 0.02 ? `blur(${leave * 10}px)` : undefined }}>
        <div style={{ position: "absolute", left: 160, top: 300, display: "flex", alignItems: "center", gap: 44 }}>
          <div
            style={{
              width: 176,
              height: 176,
              borderRadius: 999,
              overflow: "hidden",
              boxShadow: `0 0 0 2px ${c.ink700}`,
              transform: `scale(${avatar})`,
              flexShrink: 0,
            }}
          >
            <Img src={staticFile("hello/portrait.webp")} style={{ width: "100%", height: "100%" }} />
          </div>
          <Rise at={s(0.18)} size={MARK} weight={700} tracking="-0.055em" step={3}>
            {copy.wordmark}
          </Rise>
        </div>

        <div style={{ position: "absolute", left: 160, top: 560, width: 1600, height: 2, background: c.ink700, transformOrigin: "left", transform: `scaleX(${rule})` }} />

        <div style={{ position: "absolute", left: 160, top: 606, width: 1600, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: ramp(f, s(1.0), s(1.4)) }}>
            <div style={{ position: "relative", width: 16, height: 16 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 99, background: c.signal }} />
              <div style={{ position: "absolute", inset: 0, borderRadius: 99, border: `2px solid ${c.signal}`, opacity: 1 - pulse, transform: `scale(${1 + pulse * 1.4})` }} />
            </div>
            <div style={{ fontFamily: sans, fontSize: 34, color: c.paper200, letterSpacing: "-0.015em" }}>{copy.available}</div>
          </div>
          <Label at={s(1.1)} size={22}>
            {copy.roleLine}
          </Label>
        </div>

        <div style={{ position: "absolute", left: 160, top: 700, display: "flex", gap: 16 }}>
          {copy.contact.map((t, i) => (
            <Chip key={t} at={s(1.3) + i * s(0.1)} filled={i === 0} size={24}>
              {t}
            </Chip>
          ))}
        </div>
      </AbsoluteFill>

      {/* the full stop: lands after the wordmark, then carries the loop home */}
      <div
        style={{
          position: "absolute",
          left: dotX,
          top: dotY,
          width: DOT,
          height: DOT,
          marginLeft: -DOT / 2,
          marginTop: -DOT / 2,
          borderRadius: 999,
          background: c.signal,
          transform: `translateY(${(1 - stopIn) * -140}px) scale(${Math.min(1, stopIn * 1.2) * (1 - vanish)})`,
          opacity: f < s(1.0) ? 0 : 1,
        }}
      />
    </Stage>
  );
};

