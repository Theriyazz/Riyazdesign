import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { glide, linear, pop, ramp } from "../lib";
import { hoverAt, pressAt } from "./kit";
import { film } from "./script";
import { Sfx } from "./sfx";
import { cl } from "./theme";

// Laid out in the psychometric page's own pixels, centred on its content area.
const CARD = { left: 540, top: 270, width: 760, height: 430 };
const PAD = 36;
const OPTION = { width: 128, height: 56, gap: 12, top: 300 };

/** Where the pointer has to land to pick option `i`. */
export const optionPoint = (i: number): [number, number] => [
  CARD.left + PAD + i * (OPTION.width + OPTION.gap) + OPTION.width / 2,
  CARD.top + OPTION.top + OPTION.height / 2,
];

const Question: React.FC<{ index: number; clickAt: number; progress: number }> = ({
  index,
  clickAt,
  progress,
}) => {
  const frame = useCurrentFrame();
  const q = film.questions[index];
  const hover = hoverAt(frame, clickAt);
  const down = pressAt(frame, clickAt);
  const picked = frame >= clickAt;

  return (
    <div style={{ position: "absolute", inset: PAD }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            padding: "6px 14px",
            borderRadius: 999,
            background: "#e8f1ff",
            color: cl.blue,
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {q.dimension}
        </div>
        <div style={{ fontSize: 14, color: "#6b7391" }}>{Math.round(progress * 100)}% complete</div>
      </div>
      <div style={{ marginTop: 16, height: 6, borderRadius: 3, background: "#e6ebf5" }}>
        <div
          style={{
            width: `${progress * 100}%`,
            height: "100%",
            borderRadius: 3,
            background: `linear-gradient(90deg, ${cl.blue}, ${cl.sky})`,
          }}
        />
      </div>

      <div
        style={{
          marginTop: 44,
          fontSize: 30,
          fontWeight: 600,
          lineHeight: 1.25,
          color: cl.ink,
          maxWidth: 600,
        }}
      >
        {q.text}
      </div>
      <div style={{ marginTop: 10, fontSize: 16, color: "#6b7391" }}>
        How much does this sound like you?
      </div>

      {film.scale.map((label, i) => {
        const mine = i === q.pick;
        const h = mine ? hover : 0;
        const d = mine ? down : 0;
        const on = mine && picked;
        return (
          <div
            key={label}
            style={{
              position: "absolute",
              left: i * (OPTION.width + OPTION.gap),
              top: OPTION.top - PAD,
              width: OPTION.width,
              height: OPTION.height,
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              fontSize: 14,
              fontWeight: 500,
              lineHeight: 1.15,
              color: on ? cl.white : cl.ink,
              background: on ? cl.blue : cl.white,
              border: `1.5px solid ${on || h > 0.3 ? cl.blue : "#d5d6da"}`,
              transform: `translateY(${-5 * h + 3 * d}px) scale(${1 + 0.04 * h - 0.07 * d})`,
              boxShadow: `0 ${14 * h}px ${28 * h}px rgba(31,107,255,${0.32 * h})`,
            }}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

const Profile: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { title, match, dimensions } = film.profile;
  const grow = glide(frame, fps, at + 8);
  const R = 118;
  const C = 150;
  const point = (i: number, r: number) => {
    const a = (-90 + i * 72) * (Math.PI / 180);
    return [C + Math.cos(a) * r, C + Math.sin(a) * r];
  };
  const ring = (k: number) => dimensions.map((_, i) => point(i, R * k).join(",")).join(" ");
  const shape = dimensions.map((d, i) => point(i, (R * d.value * grow) / 100).join(",")).join(" ");

  return (
    <div style={{ position: "absolute", inset: PAD, opacity: linear(frame, at, at + 8) }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 24, fontWeight: 600, color: cl.ink }}>{title}</div>
        <div
          style={{
            padding: "7px 16px",
            borderRadius: 999,
            background: cl.blue,
            color: cl.white,
            fontSize: 15,
            fontWeight: 600,
            transform: `scale(${pop(frame, fps, at + 40)})`,
          }}
        >
          {match}
        </div>
      </div>

      <svg width={300} height={300} style={{ position: "absolute", left: -4, top: 62 }}>
        {[0.33, 0.66, 1].map((k) => (
          <polygon key={k} points={ring(k)} fill="none" stroke="#dbe4f5" strokeWidth={1.2} />
        ))}
        {dimensions.map((_, i) => {
          const [x, y] = point(i, R);
          return <line key={i} x1={C} y1={C} x2={x} y2={y} stroke="#dbe4f5" strokeWidth={1.2} />;
        })}
        <polygon points={shape} fill="rgba(31,107,255,0.18)" stroke={cl.blue} strokeWidth={2.5} />
        {dimensions.map((d, i) => {
          const [x, y] = point(i, (R * d.value * grow) / 100);
          return <circle key={i} cx={x} cy={y} r={5} fill={cl.ink} />;
        })}
      </svg>

      <div style={{ position: "absolute", left: 330, right: 0, top: 84 }}>
        {dimensions.map((d, i) => {
          const fill = ramp(frame, at + 10 + i * 5, at + 34 + i * 5);
          return (
            <div key={d.name} style={{ display: "flex", alignItems: "center", marginBottom: 27 }}>
              <div style={{ width: 96, fontSize: 16, color: cl.ink }}>{d.name}</div>
              <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#e6ebf5" }}>
                <div
                  style={{
                    width: `${d.value * fill}%`,
                    height: "100%",
                    borderRadius: 4,
                    background: `linear-gradient(90deg, ${i % 2 ? "#7a5cff" : cl.blue}, ${cl.sky})`,
                  }}
                />
              </div>
              <div
                style={{
                  width: 52,
                  textAlign: "right",
                  fontSize: 16,
                  fontWeight: 600,
                  color: cl.ink,
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {Math.round(d.value * fill)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** The test itself: two statements answered, then the profile draws in. */
export const TestFlow: React.FC<{
  open: number;
  clicks: [number, number];
  swap: number;
  done: number;
}> = ({ open, clicks, swap, done }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < open) return null;

  const rise = glide(frame, fps, open);
  const slide = ramp(frame, swap, swap + 12);
  const finish = linear(frame, done, done + 8);
  const progress =
    0.34 + 0.16 * ramp(frame, clicks[0], clicks[0] + 14) + 0.5 * ramp(frame, clicks[1], clicks[1] + 16);

  return (
    <>
      <Sfx name="pop" at={open} volume={0.3} rate={0.8} />
      <Sfx name="select" at={clicks[0] + 1} volume={0.26} />
      <Sfx name="swipe" at={swap} volume={0.26} />
      <Sfx name="select" at={clicks[1] + 1} volume={0.26} rate={1.12} />
      <Sfx name="swipe" at={done} volume={0.28} />
      <Sfx name="success" at={done + 40} volume={0.4} />
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1544,
          height: 1758,
          background: "rgba(5, 15, 69, 0.5)",
          opacity: linear(frame, open, open + 8),
        }}
      />
      <div
        style={{
          position: "absolute",
          ...CARD,
          borderRadius: 20,
          background: cl.white,
          overflow: "hidden",
          boxShadow: "0 40px 90px rgba(2, 8, 50, 0.4)",
          opacity: linear(frame, open, open + 6),
          transform: `translateY(${(1 - rise) * 60}px) scale(${0.94 + 0.06 * rise})`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, opacity: 1 - finish }}>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: 1 - slide,
              transform: `translateX(${-slide * 120}px)`,
            }}
          >
            <Question index={0} clickAt={clicks[0]} progress={progress} />
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: slide,
              transform: `translateX(${(1 - slide) * 120}px)`,
            }}
          >
            <Question index={1} clickAt={clicks[1]} progress={progress} />
          </div>
        </div>
        {frame >= done && <Profile at={done} />}
      </div>
    </>
  );
};
