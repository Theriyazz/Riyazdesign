import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { glide, linear, pop, ramp, SceneProps } from "../lib";
import { c } from "../theme";
import { copy } from "./copy";
import { Pointer, Say, Shot } from "./kit";
import { HEARD, within } from "./voice";

const SNAP_AT = 40;

export const Figure: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const snap = glide(frame, fps, SNAP_AT);
  const loose = 1 - snap;
  return (
    <Shot ground="paper" dur={dur}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 26,
          maxWidth: 880,
          fontSize: 108,
          fontWeight: 700,
          letterSpacing: "-0.04em",
          lineHeight: 1.12,
        }}
      >
        {copy.figure.split(" ").map((word, i) => {
          // Each word hangs somewhere wrong until the snap pulls it into the sentence.
          const dx = (random(`figure-x-${i}`) - 0.5) * 420;
          const dy = (random(`figure-y-${i}`) - 0.5) * 700;
          const turn = (random(`figure-r-${i}`) - 0.5) * 70;
          const arrive = pop(frame, fps, 2 + i * 3);
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                opacity: Math.min(1, arrive * 2),
                transform: `translate(${dx * loose}px, ${dy * loose}px) rotate(${turn * loose}deg) scale(${0.5 + 0.5 * arrive})`,
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </Shot>
  );
};

const TYPED = 178;

export const Daily: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { lead, land } = copy.daily;
  const total = land.reduce((sum, line) => sum + line.length, 0);
  // Typed in step with the voice saying it.
  const { from, to } = HEARD.onePost;
  const typed = Math.floor(linear(frame, within("daily", from) - 2, within("daily", to) - 4) * total);
  // The line being typed owns the caret; it never scrolls, so nothing leaves the frame.
  const before = (i: number) => land.slice(0, i).reduce((sum, line) => sum + line.length, 0);
  const active = land.reduce((found, _, i) => (typed > before(i) ? i : found), 0);
  const blink = typed < total || Math.floor(frame / 8) % 2 === 0;

  return (
    <Shot ground="glow" dur={dur}>
      <div style={{ marginBottom: 56 }}>
        <Say text={lead} size={70} />
      </div>
      <div style={{ width: 940, fontSize: TYPED, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1.04 }}>
        {land.map((line, i) => (
          <div key={line} style={{ display: "flex", alignItems: "center", height: TYPED * 1.04, whiteSpace: "pre" }}>
            {line.slice(0, Math.max(0, typed - before(i)))}
            {i === active ? (
              <span
                style={{
                  width: 12,
                  height: TYPED * 0.84,
                  marginLeft: 12,
                  borderRadius: 6,
                  background: c.signal,
                  boxShadow: `0 0 34px ${c.signal}`,
                  opacity: blink ? 1 : 0.15,
                }}
              />
            ) : null}
          </div>
        ))}
      </div>
    </Shot>
  );
};

const TILES = [
  { box: { left: 0, top: 0, width: 960, height: 320 }, from: [0, -1], fill: c.ink, ink: c.paper },
  { box: { left: 0, top: 340, width: 470, height: 480 }, from: [-1, 0], fill: c.signal, ink: c.ink },
  { box: { left: 490, top: 340, width: 470, height: 480 }, from: [1, 0], fill: c.ink850, ink: c.signal },
  { box: { left: 0, top: 840, width: 960, height: 400 }, from: [0, 1], fill: c.white, ink: c.ink },
] as const;
const TOOLS = ["figma", "framer", "claude", "miro"];

export const Week: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <Shot ground="paper" dur={dur}>
      <div style={{ position: "relative", width: 960, height: 1240 }}>
        {copy.week.map((item, i) => {
          const tile = TILES[i];
          const p = pop(frame, fps, within("week", HEARD.week[i]) - 2);
          return (
            <div
              key={item.day}
              style={{
                position: "absolute",
                ...tile.box,
                borderRadius: 40,
                padding: 44,
                background: tile.fill,
                color: tile.ink,
                border: i === 3 ? "2px solid #d6d6d2" : undefined,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                opacity: Math.min(1, p * 2),
                transform: `translate(${tile.from[0] * (1 - p) * 500}px, ${tile.from[1] * (1 - p) * 500}px)`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: "0.08em", opacity: 0.6 }}>{item.day}</span>
                {i === 0 ? (
                  <span style={{ display: "flex", gap: 14 }}>
                    {TOOLS.map((tool, t) => (
                      <Img
                        key={tool}
                        src={staticFile(`tools/${tool}.webp`)}
                        style={{ width: 64, height: 64, borderRadius: 16, transform: `scale(${pop(frame, fps, 16 + t * 3)})` }}
                      />
                    ))}
                  </span>
                ) : null}
              </div>
              <span style={{ fontSize: i === 0 || i === 3 ? 88 : 66, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.04 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </Shot>
  );
};

/** Both halves share one frame; the light moves when the second question is asked. */
export const Audiences: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const heard = HEARD.audiences.map((line) => ({
    ask: within("audiences", line.ask),
    answer: within("audiences", line.answer),
  }));
  const second = glide(frame, fps, heard[1].ask - 6);
  return (
    <Shot ground="ink" dur={dur}>
      <AbsoluteFill>
        {copy.audiences.map((side, i) => {
          const light = i === 0 ? 1 - second : second;
          const words = side.answer.split(" ");
          return (
            <div
              key={side.ask}
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: i * 965,
                height: 955,
                padding: "0 80px 110px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                gap: 26,
                background: i === 0 ? c.paper : c.ink850,
                color: i === 0 ? c.ink : c.paper,
                opacity: 0.3 + 0.7 * light,
                transform: `translateY(${(i === 0 ? -1 : 1) * (1 - glide(frame, fps, 0)) * 300}px)`,
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 500, opacity: 0.55 * linear(frame, heard[i].ask - 2, heard[i].ask + 6) }}>
                {side.ask}
              </div>
              <Say
                text={side.answer}
                size={104}
                weight={700}
                width={920}
                align="left"
                start={heard[i].answer - 2}
                em={Object.fromEntries(
                  words.flatMap((_, w) =>
                    w >= side.accentFrom ? [[w, i === 0 ? { background: c.signal, padding: "0 0.1em" } : { color: c.signal }]] : [],
                  ),
                )}
              />
            </div>
          );
        })}
      </AbsoluteFill>
    </Shot>
  );
};

export const You: React.FC<SceneProps> = ({ dur }) => (
  <Shot ground="paper" dur={dur}>
    <Say text={copy.you} size={116} weight={700} />
  </Shot>
);

export const FollowAlong: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { handle, land, tail } = copy.follow;
  const said = {
    land: within("follow", HEARD.follow.land),
    tail: within("follow", HEARD.follow.tail),
  };
  // The click waits for the last word, so it lands as the full stop.
  const CLICK = within("follow", HEARD.follow.done) + 4;
  const following = frame >= CLICK;
  const press = Math.max(0, 1 - Math.abs(frame - CLICK) / 4);
  const arrive = glide(frame, fps, CLICK - 18);
  const ripple = ramp(frame, CLICK, CLICK + 16);

  return (
    <Shot ground="glow" dur={dur}>
      <Img
        src={staticFile("avatar.webp")}
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          border: `8px solid ${c.signal}`,
          transform: `scale(${pop(frame, fps, 2)})`,
        }}
      />
      <div style={{ marginTop: 30, fontSize: 46, fontWeight: 500, color: c.paper300, opacity: linear(frame, 8, 16) }}>
        {handle}
      </div>
      <div style={{ marginTop: 50 }}>
        <Say text={land} size={150} weight={700} start={said.land - 2} step={4} />
      </div>
      <div style={{ position: "relative", marginTop: 70, transform: `scale(${pop(frame, fps, said.land + 10)})` }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 70,
            border: `6px solid ${c.signal}`,
            opacity: frame >= CLICK ? 1 - ripple : 0,
            transform: `scale(${1 + ripple * 0.9})`,
          }}
        />
        <div
          style={{
            width: 460,
            height: 128,
            borderRadius: 64,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            fontSize: 54,
            fontWeight: 600,
            background: following ? "transparent" : c.signal,
            border: `4px solid ${following ? c.paper300 : c.signal}`,
            color: following ? c.paper : c.ink,
            transform: `scale(${1 - 0.1 * press})`,
          }}
        >
          {following ? "Following" : "Follow"}
          {following ? (
            <svg viewBox="0 0 24 24" width={50} height={50} fill="none" stroke={c.signal} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : null}
        </div>
        <Pointer
          size={96}
          style={{
            left: 380 + (1 - arrive) * 300,
            top: 84 + (1 - arrive) * 340,
            opacity: linear(frame, CLICK - 18, CLICK - 12),
            transform: `scale(${1 - 0.14 * press})`,
          }}
        />
      </div>
      <div style={{ marginTop: 80, fontSize: 56, fontWeight: 500, color: c.paper200, opacity: linear(frame, said.tail - 2, said.tail + 10) }}>
        {tail}
      </div>
    </Shot>
  );
};
