import React from "react";
import { AbsoluteFill, Easing, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { glide, linear, OVERLAP, pop, ramp, Scene, SceneProps, STAGE, Words } from "../lib";
import { screens } from "../screens";
import { script } from "../script";
import { c, marker } from "../theme";

/** Same seed, same order: Remotion renders frames out of sequence, so no Math.random. */
const shuffled = (salt: string) =>
  screens
    .map((screen, i) => ({ screen, key: random(`${script.shuffleSeed}-${salt}-${i}`) }))
    .sort((a, b) => a.key - b.key)
    .map(({ screen }) => screen);

const PERIMETER = 14;
const RING = 4;
const squared = (v: number) => Math.sign(v) * Math.pow(Math.abs(v), 0.55);

/** Clockwise round the frame edge from top-left, then an inner ring, then the centre. */
const slot = (i: number) => {
  if (i < PERIMETER) {
    const a = -Math.PI * 0.75 + (i / PERIMETER) * Math.PI * 2;
    return { x: squared(Math.cos(a)) * 0.43, y: squared(Math.sin(a)) * 0.42 };
  }
  if (i < PERIMETER + RING) {
    const a = Math.PI * 0.25 + ((i - PERIMETER) / RING) * Math.PI * 2;
    return { x: Math.cos(a) * 0.21, y: Math.sin(a) * 0.2 };
  }
  return { x: (i - PERIMETER - RING - 0.5) * 0.14, y: (i - PERIMETER - RING - 0.5) * 0.05 };
};

const FIRST_CARD = 12;
const CARD_EVERY = 4;
/** The word stays readable until the last cards land on top of it. */
const WORD_LAYER = PERIMETER + RING;

export const Collage: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const size = Math.sqrt(width * height) / STAGE;
  const cards = React.useMemo(() => shuffled("collage"), []);

  const enter = ramp(frame, 0, OVERLAP);
  const out = ramp(frame, dur - OVERLAP, dur, 0, 1, Easing.in(Easing.cubic));

  return (
    <AbsoluteFill style={{ background: c.ink, opacity: enter, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          opacity: 1 - out,
          filter: `blur(${out * 20}px)`,
          transform: `scale(${1 + 0.05 * linear(frame, 0, dur) + out * 0.6})`,
        }}
      >
        {cards.map((card, i) => {
          const at = FIRST_CARD + i * CARD_EVERY;
          if (frame < at) return null;
          const p = pop(frame, fps, at);
          const { x, y } = slot(i);
          const tilt = (random(`${script.shuffleSeed}-tilt-${i}`) - 0.5) * 26;
          const swing = i % 2 === 0 ? 16 : -16;
          const w = (card.aspect > 1 ? 440 : 270) * size;
          return (
            <Img
              key={card.file}
              src={staticFile(card.file)}
              style={{
                position: "absolute",
                left: width / 2 + x * width - w / 2,
                top: height / 2 + y * height - w / card.aspect / 2,
                width: w,
                height: w / card.aspect,
                borderRadius: 18 * size,
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.55)",
                zIndex: i,
                transform: `rotate(${tilt + (1 - p) * swing}deg) scale(${1.45 - 0.45 * p})`,
              }}
            />
          );
        })}
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", zIndex: WORD_LAYER }}>
          <div
            style={{
              fontSize: 110 * size,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: c.paper,
              textShadow: "0 6px 40px rgba(0, 0, 0, 0.9)",
              transform: `scale(${0.9 + 0.1 * pop(frame, fps, 2)})`,
            }}
          >
            {script.collageWord}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const GAP = 22;
const DRIFT = 9;

export const Wall: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const size = Math.min(width / STAGE, (height / STAGE) * 1.35);
  const count = width > height ? 5 : 3;
  // Wider than the frame so the tilt never shows a bare corner.
  const span = width * 1.3;
  const columnWidth = (span - GAP * (count - 1)) / count;
  const columns = React.useMemo(() => {
    const all = shuffled("wall");
    return Array.from({ length: count }, (_, col) => all.filter((_, i) => i % count === col));
  }, [count]);

  const enter = ramp(frame, 0, OVERLAP + 6);
  const out = ramp(frame, dur - OVERLAP, dur, 0, 1, Easing.in(Easing.cubic));

  return (
    <AbsoluteFill style={{ background: c.ink, opacity: enter, overflow: "hidden" }}>
      <AbsoluteFill style={{ opacity: 1 - out, filter: `blur(${(1 - enter) * 16 + out * 18}px)` }}>
        <div
          style={{
            position: "absolute",
            left: (width - span) / 2,
            top: 0,
            width: span,
            display: "flex",
            gap: GAP,
            transform: `rotate(-9deg) scale(${1.5 - 0.3 * enter})`,
            transformOrigin: `50% ${height / 2}px`,
          }}
        >
          {columns.map((column, col) => {
            const lap = column.reduce((sum, card) => sum + columnWidth / card.aspect + GAP, 0);
            const direction = col % 2 === 0 ? -1 : 1;
            // Three laps stacked, started one lap up, so either direction stays covered.
            return (
              <div
                key={col}
                style={{
                  width: columnWidth,
                  flexShrink: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: GAP,
                  transform: `translateY(${-lap + direction * (frame * DRIFT * size + col * 40)}px)`,
                }}
              >
                {[0, 1, 2].flatMap((copy) =>
                  column.map((card) => (
                    <Img
                      key={`${copy}-${card.file}`}
                      src={staticFile(card.file)}
                      style={{
                        width: columnWidth,
                        height: columnWidth / card.aspect,
                        flexShrink: 0,
                        borderRadius: 16 * size,
                      }}
                    />
                  )),
                )}
              </div>
            );
          })}
        </div>
        <AbsoluteFill
          style={{ background: "radial-gradient(circle at 50% 50%, rgba(8, 8, 10, 0.72) 0%, rgba(8, 8, 10, 0.1) 62%)" }}
        />
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
          <div
            style={{
              ...marker,
              padding: "0.12em 0.4em",
              fontSize: 76 * size,
              fontWeight: 700,
              letterSpacing: "-0.035em",
              color: c.ink,
              boxShadow: "0 30px 90px rgba(0, 0, 0, 0.6)",
              transform: `scale(${pop(frame, fps, 12)}) rotate(-3deg)`,
            }}
          >
            {script.workTitle}
          </div>
        </AbsoluteFill>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const CLICK = 80;

export const Follow: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { text, accents, handle } = script.follow;
  const following = frame >= CLICK;
  const press = Math.max(0, 1 - Math.abs(frame - CLICK) / 4);
  const arrive = glide(frame, fps, CLICK - 18);

  return (
    <Scene bg={`radial-gradient(circle at 50% 40%, #233400 0%, ${c.ink} 66%)`} dur={dur}>
      <Img
        src={staticFile("avatar.webp")}
        style={{
          width: 190,
          height: 190,
          borderRadius: 95,
          border: `6px solid ${c.signal}`,
          transform: `scale(${pop(frame, fps, 4)})`,
        }}
      />
      <div style={{ marginTop: 26, fontSize: 38, fontWeight: 600, color: c.paper200, opacity: linear(frame, 12, 20) }}>
        {handle}
      </div>
      <div style={{ marginTop: 40 }}>
        <Words
          text={text}
          color={c.paper}
          size={56}
          weight={700}
          start={18}
          step={3}
          maxWidth={880}
          accents={Object.fromEntries(accents.map((i) => [i, { color: c.signal }]))}
        />
      </div>
      <div style={{ position: "relative", marginTop: 56, transform: `scale(${pop(frame, fps, 52)})` }}>
        <div
          style={{
            width: 320,
            height: 88,
            borderRadius: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            fontSize: 36,
            fontWeight: 600,
            background: following ? "transparent" : c.signal,
            border: `3px solid ${following ? c.paper300 : c.signal}`,
            color: following ? c.paper : c.ink,
            transform: `scale(${1 - 0.1 * press})`,
          }}
        >
          {following ? "Following" : "Follow"}
          {following ? (
            <svg viewBox="0 0 24 24" width={34} height={34} fill="none" stroke={c.signal} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          ) : null}
        </div>
        <svg
          viewBox="0 0 24 24"
          width={68}
          height={68}
          style={{
            position: "absolute",
            left: 262 + (1 - arrive) * 220,
            top: 56 + (1 - arrive) * 240,
            opacity: linear(frame, CLICK - 18, CLICK - 12),
            transform: `scale(${1 - 0.14 * press})`,
            filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))",
          }}
        >
          <path d="M5 3l14 8-6 1.5L10 19z" fill={c.paper} stroke={c.ink} strokeWidth={1.5} strokeLinejoin="round" />
        </svg>
      </div>
    </Scene>
  );
};
