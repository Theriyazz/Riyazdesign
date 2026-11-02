import React from "react";
import { interpolateColors, useCurrentFrame, useVideoConfig } from "remotion";
import { glide, linear, pop, ramp, Scene, SceneProps } from "../lib";
import { script } from "../script";
import { c } from "../theme";

export const Typing: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const count = Math.round(linear(frame, 6, 34) * script.typed.length);
  const blink = count < script.typed.length || Math.floor(frame / 8) % 2 === 0;

  return (
    <Scene bg={`linear-gradient(135deg, #1a2700 0%, ${c.ink} 55%, #223300 140%)`} dur={dur} exit="left">
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <span
          style={{
            fontSize: 78,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            color: c.paper200,
            whiteSpace: "pre",
          }}
        >
          {script.typed.slice(0, count)}
        </span>
        <span
          style={{
            width: 8,
            height: 96,
            borderRadius: 4,
            background: c.signal,
            boxShadow: `0 0 34px ${c.signal}, 0 0 8px ${c.signal}`,
            opacity: blink ? 1 : 0.15,
          }}
        />
      </div>
    </Scene>
  );
};

const Icon: React.FC<{ d: string; size?: number; color?: string }> = ({ d, size = 34, color = c.paper200 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const PLUS = "M12 5v14M5 12h14";
const CLOSE = "M7 7l10 10M17 7L7 17";
const FRAME = "M5 8h14v11H5zM9 8V5h6v3";
const CHEVRON = "M7 10l5 5 5-5";
const MIC = "M12 4a3 3 0 0 1 3 3v4a3 3 0 0 1-6 0V7a3 3 0 0 1 3-3zM6 11a6 6 0 0 0 12 0M12 17v3";
const ARROW_UP = "M12 19V6M6 12l6-6 6 6";

const PAN_AT = 58;
const MENU_AT = 72;
const ROW_STEP = 16;

export const Prompt: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const portrait = width <= height;
  const words = script.prompt.split(" ");
  const reading = Math.floor(linear(frame, 8, 54) * words.length);

  // The box drifts while it is read, then the camera pushes in on the menu.
  // Portrait has no width to spare, so the push there is a nudge, not a pan.
  const pan = ramp(frame, PAN_AT, PAN_AT + 18);
  const x = ramp(frame, 0, PAN_AT, 70, -10, (t) => t) * (1 - pan) - (portrait ? 40 : 250) * pan;
  const open = pop(frame, fps, MENU_AT);
  const row = Math.min(script.menu.length - 1, Math.max(0, Math.floor((frame - MENU_AT - 8) / ROW_STEP)));

  return (
    <Scene bg={`radial-gradient(circle at 50% 110%, #1c2a00 0%, ${c.ink} 60%)`} dur={dur}>
      <div
        style={{
          width: 900,
          padding: "40px 44px 34px",
          borderRadius: 52,
          background: c.ink800,
          border: `2px solid ${c.ink700}`,
          transform: `translate(${x}px, ${-120 * pan}px) scale(${1 + (portrait ? 0.06 : 0.22) * pan})`,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", columnGap: 9, fontSize: 31, fontWeight: 500, lineHeight: 1.3 }}>
          {words.map((word, i) => (
            <span key={i} style={{ color: i < reading ? c.paper : i === reading ? c.signal : c.paper500 }}>
              {word}
            </span>
          ))}
        </div>

        <div style={{ marginTop: 44, display: "flex", alignItems: "center", gap: 22 }}>
          <Icon d={PLUS} size={40} />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "8px 16px",
              borderRadius: 16,
              background: "rgba(170, 255, 0, 0.14)",
            }}
          >
            <Icon d={FRAME} size={28} color={c.signal} />
            <Icon d={CLOSE} size={24} color={c.signal} />
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ position: "relative" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 16px 10px 22px",
                borderRadius: 999,
                background: c.ink700,
                color: c.paper,
                fontSize: 24,
                fontWeight: 500,
              }}
            >
              {script.menuLabel}
              <Icon d={CHEVRON} size={26} />
            </div>
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 14,
                width: 240,
                padding: 8,
                borderRadius: 22,
                background: c.ink850,
                border: `2px solid ${c.ink700}`,
                opacity: Math.min(1, open * 1.5),
                transformOrigin: "top left",
                transform: `scale(${0.7 + 0.3 * open})`,
              }}
            >
              {script.menu.map((item, i) => (
                <div
                  key={item}
                  style={{
                    padding: "12px 18px",
                    borderRadius: 14,
                    fontSize: 26,
                    fontWeight: 500,
                    color: i === row ? c.signal : c.paper300,
                    background: i === row ? "rgba(170, 255, 0, 0.14)" : "transparent",
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
          <Icon d={MIC} size={36} />
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 26,
              background: c.signal,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon d={ARROW_UP} size={30} color={c.ink} />
          </div>
        </div>
      </div>
    </Scene>
  );
};

const SEGMENT = 284;

export const Segmented: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const first = glide(frame, fps, 18);
  const second = glide(frame, fps, 36);
  const position = first + second;
  const active = Math.round(position);

  return (
    <Scene bg={`radial-gradient(circle at 50% 110%, #1c2a00 0%, ${c.ink} 60%)`} dur={dur}>
      <div
        style={{
          position: "relative",
          display: "flex",
          padding: 12,
          borderRadius: 999,
          background: c.ink850,
          border: `2px solid ${c.ink700}`,
          transform: `scale(${0.9 + 0.1 * pop(frame, fps, 2)})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12 + position * SEGMENT,
            width: SEGMENT,
            height: 92,
            borderRadius: 999,
            background: interpolateColors(second, [0, 1], [c.ink600, c.signal]),
          }}
        />
        {script.segments.map((label, i) => (
          <div
            key={label}
            style={{
              position: "relative",
              width: SEGMENT,
              height: 92,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 500,
              color: i !== active ? c.paper300 : second > 0.5 ? c.ink : c.paper,
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </Scene>
  );
};

const bubble: React.CSSProperties = {
  padding: "22px 36px",
  borderRadius: "44px 44px 12px 44px",
  background: c.signal,
  color: c.ink,
  fontSize: 42,
  fontWeight: 500,
  letterSpacing: "-0.01em",
  whiteSpace: "nowrap",
  transformOrigin: "bottom right",
};

export const Bubbles: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const first = pop(frame, fps, 6);
  const second = pop(frame, fps, 44);
  const room = glide(frame, fps, 40);

  return (
    <Scene bg={c.paper} dur={dur}>
      <div style={{ width: 640, display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
        <div style={{ ...bubble, transform: `scale(${first})` }}>{script.bubbles[0]}</div>
        <div style={{ height: 118 * room, display: "flex", alignItems: "flex-end" }}>
          <div style={{ ...bubble, opacity: Math.min(1, second * 2), transform: `scale(${second})` }}>
            {script.bubbles[1]}
          </div>
        </div>
        <div style={{ marginTop: 14, fontSize: 22, fontWeight: 500, color: c.paper500, opacity: linear(frame, 14, 22) }}>
          Delivered
        </div>
      </div>
    </Scene>
  );
};
