import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { glide, linear, pop, ramp, Scene, SceneProps, Words } from "../lib";
import { script } from "../script";
import { c, marker } from "../theme";

const CLICKS = [48, 76];
const SLIDE = 700;

const ArrowButton: React.FC<{ flip?: boolean; press?: number }> = ({ flip, press = 0 }) => (
  <div
    style={{
      width: 76,
      height: 76,
      borderRadius: 38,
      background: c.ink,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transform: `scale(${1 - 0.16 * press}) rotate(${flip ? 180 : 0}deg)`,
    }}
  >
    <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={c.paper} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 6l6 6-6 6" />
    </svg>
  </div>
);

export const Carousel: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const position = CLICKS.reduce((sum, at) => sum + glide(frame, fps, at), 0);
  const current = script.work[Math.round(position)];
  // A press is a quick dip and release around each click frame.
  const press = Math.max(...CLICKS.map((at) => Math.max(0, 1 - Math.abs(frame - at) / 4)));
  const arrive = ramp(frame, 26, 42);

  return (
    <Scene bg={`linear-gradient(180deg, ${c.paper} 30%, #e4f5b8 100%)`} dur={dur}>
      <Words text={script.workTitle} color={c.ink} size={62} start={4} />
      <div
        style={{
          marginTop: 56,
          display: "flex",
          alignItems: "center",
          gap: 34,
          transform: `scale(${pop(frame, fps, 14)})`,
        }}
      >
        <ArrowButton flip />
        <div
          style={{
            position: "relative",
            width: 640,
            height: 420,
            borderRadius: 44,
            overflow: "hidden",
            background: c.white,
            boxShadow: "0 30px 80px rgba(8, 8, 10, 0.16)",
          }}
        >
          {script.work.map((item, i) => (
            <Img
              key={item.title}
              src={staticFile(item.image)}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transform: `translateX(${(i - position) * SLIDE}px)`,
              }}
            />
          ))}
        </div>
        <ArrowButton press={press} />
      </div>
      <div style={{ marginTop: 40, display: "flex", alignItems: "baseline", gap: 18, opacity: linear(frame, 18, 26) }}>
        <span style={{ fontSize: 26, fontWeight: 500, color: c.paper500 }}>{current.index}</span>
        <span style={{ fontSize: 38, fontWeight: 600, letterSpacing: "-0.02em", color: c.ink }}>{current.title}</span>
      </div>
      <svg
        viewBox="0 0 24 24"
        width={68}
        height={68}
        style={{
          position: "absolute",
          left: 920 + (1 - arrive) * 90,
          top: 556 + (1 - arrive) * 220,
          opacity: linear(frame, 26, 32),
          transform: `scale(${1 - 0.14 * press})`,
          filter: "drop-shadow(0 4px 8px rgba(8, 8, 10, 0.3))",
        }}
      >
        <path d="M5 3l14 8-6 1.5L10 19z" fill={c.ink} stroke={c.white} strokeWidth={1.5} strokeLinejoin="round" />
      </svg>
    </Scene>
  );
};

export const Beat: React.FC<SceneProps & { text: string; accent: number; dark: boolean }> = ({
  dur,
  text,
  accent,
  dark,
}) => (
  <Scene bg={dark ? c.ink : c.paper} dur={dur} exit="left">
    <Words
      text={text}
      color={dark ? c.paper : c.ink}
      size={96}
      weight={700}
      start={5}
      step={3}
      accents={{ [accent]: dark ? { color: c.signal } : marker }}
    />
  </Scene>
);

const SLAM_EVERY = 15;

export const Slam: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const index = Math.min(script.slam.length - 1, Math.floor(frame / SLAM_EVERY));
  const local = frame - index * SLAM_EVERY;
  const hit = ramp(local, 0, 6);

  return (
    <Scene bg={c.paper} dur={dur}>
      <div
        style={{
          fontSize: 160,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: c.ink,
          transform: `scale(${1.5 - 0.5 * hit})`,
          filter: `blur(${(1 - hit) * 14}px)`,
          ...(index === script.slam.length - 1 ? marker : null),
        }}
      >
        {script.slam[index]}
      </div>
    </Scene>
  );
};

const CELL = 120;
const WEEKS = [8, 15, 22];
const TODAY = 15;
const UNKNOWN = 21;

export const Calendar: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // Opens tight on today, then pulls back as the range runs out to the unknown.
  const pull = ramp(frame, 8, 44);
  const zoom = 1.7 - 0.7 * pull;
  const reach = ramp(frame, 22, 50);
  const asked = pop(frame, fps, 46);

  return (
    <Scene bg={c.paper} dur={dur}>
      <div
        style={{
          position: "relative",
          width: CELL * 7,
          height: CELL * 3,
          transform: `translateX(${CELL * 3 * zoom * (1 - pull)}px) scale(${zoom})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: CELL / 2 - 44,
            top: CELL * 1.5 - 44,
            width: 88 + CELL * 6 * reach,
            height: 88,
            borderRadius: 44,
            background: "rgba(170, 255, 0, 0.55)",
          }}
        />
        {WEEKS.flatMap((monday, r) =>
          Array.from({ length: 7 }, (_, col) => {
            const day = monday + col;
            const distance = Math.abs(day - TODAY);
            const pinned = day === TODAY || day === UNKNOWN;
            const scale = day === TODAY ? pop(frame, fps, 0) : day === UNKNOWN ? asked : 1;
            return (
              <div
                key={day}
                style={{
                  position: "absolute",
                  left: col * CELL,
                  top: r * CELL,
                  width: CELL,
                  height: CELL,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 44,
                  fontWeight: pinned ? 700 : 500,
                  color: c.ink,
                  opacity: day === TODAY ? 1 : linear(frame, 8 + distance * 2, 14 + distance * 2),
                }}
              >
                {pinned ? (
                  <div
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: 48,
                      background: c.ink,
                      color: c.signal,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transform: `scale(${scale})`,
                    }}
                  >
                    {day === UNKNOWN ? "?" : day}
                  </div>
                ) : (
                  day
                )}
              </div>
            );
          }),
        )}
      </div>
    </Scene>
  );
};

export const Open: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { text, accentFrom } = script.open;
  const accents = Object.fromEntries(
    text.split(" ").flatMap((_, i) => (i >= accentFrom ? [[i, { color: c.signal }]] : [])),
  );

  return (
    <Scene bg={c.ink} dur={dur} exit="zoom">
      <div style={{ transform: `scale(${ramp(frame, 0, dur, 1, 1.16, (t) => t)})` }}>
        <Words text={text} color={c.paper} size={84} weight={700} start={4} accents={accents} />
      </div>
    </Scene>
  );
};

export const End: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const reveal = ramp(frame, 4, 22);

  return (
    <Scene bg={c.ink} dur={dur} exit="none">
      <div
        style={{
          fontSize: 92,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          color: c.paper,
          opacity: reveal,
          filter: `blur(${(1 - reveal) * 20}px)`,
          textShadow: `0 0 ${50 * reveal}px rgba(244, 243, 240, 0.75)`,
        }}
      >
        {script.wordmark}
      </div>
      <div style={{ marginTop: 22, fontSize: 30, fontWeight: 500, color: c.paper300, opacity: linear(frame, 20, 30) }}>
        {script.url}
      </div>
    </Scene>
  );
};
