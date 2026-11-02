import React from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { glide, linear, OVERLAP, pop, ramp, Words } from "../lib";
import { Sfx, Sound, Taps } from "./sfx";
import { cl } from "./theme";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export type Key = [frame: number, value: number];
export type Rect = [x: number, y: number, w: number, h: number];

/** Keyframed value, eased between each pair of keys. */
export const track = (frame: number, keys: Key[]) =>
  keys.length === 1
    ? keys[0][1]
    : interpolate(
        frame,
        keys.map((k) => k[0]),
        keys.map((k) => k[1]),
        { ...clamp, easing: Easing.inOut(Easing.cubic) },
      );

/** How far the pointer is into hovering (0..1) and pressing (0..1) a target clicked at `at`. */
export const hoverAt = (frame: number, at: number) =>
  ramp(frame, at - 13, at - 5) * (1 - ramp(frame, at + 8, at + 15));
export const pressAt = (frame: number, at: number) =>
  Math.max(0, 1 - Math.abs(frame - at) / 4);

type Tone = "night" | "day" | "dusk";

const TONES: Record<Tone, { base: string; blobs: [string, number, number, number][] }> = {
  night: {
    base: cl.night,
    blobs: [
      [cl.blue, 0.2, 0.85, 900],
      [cl.yellow, 0.8, 0.95, 700],
      [cl.sky, 0.55, 0.8, 600],
    ],
  },
  dusk: {
    base: "#0a0a3c",
    blobs: [
      ["#6a5cff", 0.25, 0.9, 900],
      [cl.blue, 0.7, 0.85, 800],
      [cl.sky, 0.5, 1, 500],
    ],
  },
  day: {
    base: cl.paper,
    blobs: [
      ["#bfe3ff", 0.15, 0.2, 900],
      ["#fff1b8", 0.85, 0.9, 800],
      ["#d7ecff", 0.6, 0.6, 700],
    ],
  },
};

/** The drifting gradient wash every scene sits on. */
export const Aurora: React.FC<{ tone: Tone }> = ({ tone }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { base, blobs } = TONES[tone];

  return (
    <AbsoluteFill style={{ background: base, overflow: "hidden" }}>
      {blobs.map(([color, x, y, size], i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: x * width - size / 2 + Math.sin(frame / 38 + i * 2.1) * 90,
            top: y * height - size / 2 + Math.cos(frame / 46 + i * 1.3) * 60,
            width: size,
            height: size * 0.62,
            borderRadius: "50%",
            background: color,
            opacity: tone === "day" ? 0.9 : 0.55,
            filter: "blur(130px)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

/** One scene: background fades in, content cross-blurs with its neighbours. */
export const Shot: React.FC<{
  dur: number;
  tone: Tone;
  exit?: "blur" | "zoom";
  children: React.ReactNode;
}> = ({ dur, tone, exit = "blur", children }) => {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, OVERLAP);
  const out = ramp(frame, dur - OVERLAP, dur, 0, 1, Easing.in(Easing.cubic));
  const zoom = (exit === "zoom" ? 1 + out * 0.5 : 1 + out * 0.04) * (1.05 - 0.05 * enter);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ opacity: enter }}>
        <Aurora tone={tone} />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          opacity: enter * (1 - out),
          filter: `blur(${(1 - enter) * 14 + out * 18}px)`,
          transform: `scale(${zoom})`,
        }}
      >
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** A centred line of copy; `accent` is the index of the gradient word. */
export const Line: React.FC<{
  text: string;
  color: string;
  size?: number;
  start?: number;
  accent?: number;
  accentStyle?: React.CSSProperties;
}> = ({ text, color, size = 104, start = 0, accent, accentStyle }) => (
  <>
    <Taps at={start + 1} words={text.split(" ").length} step={4} volume={0.22} />
    <Words
      text={text}
      color={color}
      size={size}
      start={start}
      step={4}
      weight={600}
      accents={accent === undefined || !accentStyle ? {} : { [accent]: accentStyle }}
    />
  </>
);

/** Darkens the foot of a screen scene so the captions read over any page. */
export const Scrim: React.FC = () => (
  <AbsoluteFill
    style={{
      background:
        "linear-gradient(to top, rgba(5,15,69,0.96) 0%, rgba(5,15,69,0.82) 14%, rgba(5,15,69,0) 36%)",
    }}
  />
);

/**
 * Kinetic caption along the bottom: each word kicks up into place, the
 * accent words get a yellow marker wiped in behind them.
 */
export const Kinetic: React.FC<{
  text: string;
  accent?: readonly number[];
  from?: number;
  to: number;
  step?: string;
}> = ({ text, accent = [], from = 0, to, step }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < from || frame > to + 10) return null;

  const out = ramp(frame, to, to + 10, 0, 1, Easing.in(Easing.cubic));
  const chip = pop(frame, fps, from);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: 64,
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
        transform: `translateY(${out * 36}px)`,
      }}
    >
      <Taps at={from + 5} words={text.split(" ").length} step={3} />
      {step && (
        <div
          style={{
            marginBottom: 20,
            padding: "9px 24px",
            borderRadius: 999,
            border: `2px solid ${cl.yellow}`,
            color: cl.yellow,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "0.16em",
            opacity: linear(frame, from, from + 6),
            transform: `scale(${0.7 + 0.3 * chip})`,
          }}
        >
          {step}
        </div>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          columnGap: 22,
          rowGap: 6,
          maxWidth: 1600,
          fontSize: 80,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.12,
        }}
      >
        {text.split(" ").map((word, i) => {
          const delay = from + 4 + i * 3;
          const p = spring({
            frame: frame - delay,
            fps,
            config: { damping: 9, stiffness: 190, mass: 0.6 },
          });
          const marked = accent.includes(i);
          const wipe = ramp(frame, delay + 3, delay + 12);
          return (
            <span
              key={i}
              style={{
                position: "relative",
                display: "inline-block",
                padding: marked ? "0 16px" : 0,
                opacity: linear(frame, delay, delay + 3),
                transform: `translateY(${(1 - p) * 80}px) rotate(${(1 - p) * (i % 2 ? 7 : -7)}deg) scale(${0.55 + 0.45 * p})`,
                color: marked && wipe > 0.5 ? cl.night : cl.white,
                textShadow: marked ? "none" : "0 6px 30px rgba(2, 8, 50, 0.6)",
              }}
            >
              {marked && (
                <span
                  style={{
                    position: "absolute",
                    inset: "6px 0 2px",
                    borderRadius: 14,
                    background: cl.yellow,
                    transformOrigin: "0 50%",
                    transform: `scaleX(${wipe}) rotate(-1.5deg)`,
                  }}
                />
              )}
              <span style={{ position: "relative" }}>{word}</span>
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** `rect` is the element being clicked; it lifts on hover and sinks on press. */
export type Click = {
  at: number;
  x: number;
  y: number;
  rect?: Rect;
  radius?: number;
  /** Leaves a selected ring behind until the page changes. */
  stick?: boolean;
};

/** Text typed into an input. `inset` is where the text starts inside the field. */
export type Field = {
  rect: Rect;
  text: string;
  from: number;
  show?: number;
  inset?: number;
  mask?: boolean;
};

/** A block of the page that slides in at `at`. */
export type Tile = { rect: Rect; at: number };

type Cam = { x: Key[]; y: Key[]; zoom: Key[]; scroll?: Key[]; tiltX?: Key[]; tiltY?: Key[] };

/** Frames per typed character. */
const TYPE = 2;
/** How far above centre the window sits, leaving the foot for captions. */
const LIFT = 90;

const Pointer: React.FC = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" style={{ display: "block" }}>
    <path
      d="M5 3l14 7.2-6.2 1.9L10.6 19z"
      fill="#fff"
      stroke={cl.night}
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * A product screen in a glass window with a camera on it.
 * Every coordinate is in the screen's own design pixels (page space), so
 * click targets can be read straight off the Figma frame.
 */
export const Screen: React.FC<{
  layers: { src: string; from: number }[];
  width: number;
  view: number;
  cam: Cam;
  clicks?: Click[];
  fields?: Field[];
  tiles?: Tile[];
  /** Page colour behind the tiles before they arrive. */
  ground?: string;
  /** Where the pointer rests before its first click. */
  rest?: [number, number];
  /** Extra UI drawn in page space, above the page and below the pointer. */
  children?: React.ReactNode;
}> = ({ layers, width, view, cam, clicks = [], fields = [], tiles = [], ground, rest, children }) => {
  const frame = useCurrentFrame();
  const { width: W, height: H, fps } = useVideoConfig();

  const zoom = track(frame, cam.zoom);
  const scroll = cam.scroll ? track(frame, cam.scroll) : 0;
  const fx = track(frame, cam.x);
  const fy = track(frame, cam.y) - scroll;
  const tiltX = cam.tiltX ? track(frame, cam.tiltX) : 0;
  const tiltY = cam.tiltY ? track(frame, cam.tiltY) : 0;

  const layerAt = (f: number) => layers.filter((l) => l.from <= f).length - 1;
  const crop = (src: string, [x, y]: Rect | [number, number]) => ({
    backgroundImage: `url(${staticFile(src)})`,
    backgroundSize: `${width}px auto`,
    backgroundPosition: `${-x}px ${-y}px`,
  });

  // The pointer reaches each target early enough to be seen hovering it.
  const stops: [number, number, number][] = [];
  if (clicks.length) {
    const [rx, ry] = rest ?? [width * 0.72, view * 0.82];
    stops.push([clicks[0].at - 36, rx, ry]);
    clicks.forEach((c) => stops.push([c.at - 12, c.x, c.y], [c.at + 7, c.x, c.y]));
  }
  const px = stops.length ? track(frame, stops.map((s) => [s[0], s[1]] as Key)) : 0;
  const py = stops.length ? track(frame, stops.map((s) => [s[0], s[2]] as Key)) - scroll : 0;
  const press = clicks.reduce((m, c) => Math.max(m, pressAt(frame, c.at)), 0);

  return (
    <AbsoluteFill style={{ perspective: 2400 }}>
      {layers.map(
        ({ src, from }) => from > 0 && <Sfx key={src} name="swipe" at={from - 1} volume={0.28} />,
      )}
      {tiles.map(({ at }, i) => (
        <Sfx key={i} name="pop" at={at} volume={0.26} rate={0.9 + i * 0.08} />
      ))}
      {fields.map(({ text, from }, i) => (
        <Sfx
          key={i}
          name={i % 2 ? "typingB" : "typingA"}
          at={from + TYPE}
          frames={text.length * TYPE + 1}
          volume={0.4}
        />
      ))}
      {clicks.map((c, i) => (
        <React.Fragment key={i}>
          <Sfx name="hover" at={c.at - 10} volume={0.14} />
          <Sfx name="click" at={c.at} volume={0.58} />
          {c.stick && <Sfx name="select" at={c.at + 1} volume={0.26} />}
        </React.Fragment>
      ))}
      <AbsoluteFill style={{ transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)` }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width,
            height: view,
            transformOrigin: "0 0",
            transform: `translate(${W / 2 - fx * zoom}px, ${H / 2 - LIFT - fy * zoom}px) scale(${zoom})`,
            borderRadius: 22,
            overflow: "hidden",
            background: cl.white,
            boxShadow: `0 60px 140px rgba(2, 8, 50, 0.55), 0 0 0 1.5px rgba(255,255,255,0.35)`,
          }}
        >
          <div style={{ position: "absolute", left: 0, top: -scroll, width }}>
            {layers.map(({ src, from }) => (
              <Img
                key={src}
                src={staticFile(src)}
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width,
                  opacity: from === 0 ? 1 : linear(frame, from, from + 8),
                }}
              />
            ))}

            {tiles.map(({ rect: [x, y, w, h], at }, i) => {
              // The cover hides the block until its copy has slid into place.
              if (frame > at + 26) return null;
              const p = glide(frame, fps, at);
              const m = 12;
              const box = { left: x - m, top: y - m, width: w + m * 2, height: h + m * 2 };
              return (
                <React.Fragment key={i}>
                  <div style={{ position: "absolute", ...box, background: ground }} />
                  <div
                    style={{
                      position: "absolute",
                      ...box,
                      ...crop(layers[0].src, [x - m, y - m]),
                      opacity: linear(frame, at, at + 8),
                      transform: `translateY(${(1 - p) * 46}px) scale(${0.96 + 0.04 * p})`,
                    }}
                  />
                </React.Fragment>
              );
            })}

            {fields.map(({ rect: [x, y, w, h], text, from, show = 0, inset = 14, mask }, i) => {
              if (frame < show) return null;
              const typed = Math.max(0, Math.min(text.length, Math.floor((frame - from) / TYPE)));
              const end = from + text.length * TYPE;
              const active = frame >= from - 6 && frame < end + 8;
              const shown = mask ? "•".repeat(typed) : text.slice(0, typed);
              return (
                <React.Fragment key={i}>
                  <div
                    style={{
                      position: "absolute",
                      left: x + inset - 2,
                      top: y + 3,
                      width: w - inset - 2,
                      height: h - 6,
                      background: cl.white,
                      borderRadius: 6,
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: x,
                      top: y,
                      width: w,
                      height: h,
                      borderRadius: 8,
                      boxShadow: active
                        ? `0 0 0 1.5px ${cl.blue}, 0 0 0 5px rgba(31,107,255,0.16)`
                        : "none",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      left: x + inset,
                      top: y,
                      height: h,
                      display: "flex",
                      alignItems: "center",
                      fontSize: mask ? 20 : 16,
                      letterSpacing: mask ? "0.12em" : 0,
                      color: "#141b3c",
                      whiteSpace: "pre",
                    }}
                  >
                    {shown}
                    {active && (
                      <span
                        style={{
                          width: 1.5,
                          height: 20,
                          marginLeft: 1,
                          background: cl.blue,
                          opacity: typed < text.length || Math.floor(frame / 8) % 2 ? 1 : 0,
                        }}
                      />
                    )}
                  </div>
                </React.Fragment>
              );
            })}

            {clicks.map((c, i) => {
              if (!c.rect) return null;
              const [x, y, w, h] = c.rect;
              const samePage = layerAt(frame) === layerAt(c.at) && frame >= c.at - 16;
              if (!samePage) return null;
              const hover = hoverAt(frame, c.at);
              const down = pressAt(frame, c.at);
              const kept = c.stick && frame >= c.at ? 1 : 0;
              if (hover === 0 && down === 0 && !kept) return null;
              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: x,
                    top: y,
                    width: w,
                    height: h,
                    borderRadius: c.radius ?? 8,
                    ...crop(layers[layerAt(c.at)].src, c.rect),
                    transform: `translateY(${-5 * hover + 3 * down}px) scale(${1 + 0.035 * hover - 0.07 * down})`,
                    filter: `brightness(${1 + 0.05 * hover - 0.14 * down})`,
                    boxShadow: [
                      `0 ${16 * hover}px ${34 * hover}px rgba(31,107,255,${0.38 * hover})`,
                      `0 0 0 ${2.5 * Math.max(hover, kept)}px rgba(31,107,255,${0.9 * Math.max(hover * 0.6, kept)})`,
                      kept ? "inset 0 0 0 100px rgba(31,107,255,0.14)" : "0 0 0 0 transparent",
                    ].join(", "),
                  }}
                />
              );
            })}

            {children}
          </div>

          {clicks.map((c, i) => {
            const t = (frame - c.at) / 16;
            if (t < 0 || t > 1) return null;
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: c.x,
                  top: c.y - scroll,
                  width: 30 + t * 110,
                  height: 30 + t * 110,
                  marginLeft: -(15 + t * 55),
                  marginTop: -(15 + t * 55),
                  borderRadius: "50%",
                  background: `rgba(31, 107, 255, ${0.22 * (1 - t)})`,
                  border: `2px solid rgba(31, 107, 255, ${0.8 * (1 - t)})`,
                }}
              />
            );
          })}

          {stops.length > 0 && (
            <div
              style={{
                position: "absolute",
                left: px,
                top: py,
                opacity: linear(frame, stops[0][0], stops[0][0] + 6),
                transform: `scale(${(1 - press * 0.22) / Math.max(zoom, 0.7)})`,
                transformOrigin: "0 0",
                filter: "drop-shadow(0 6px 10px rgba(2, 8, 50, 0.35))",
              }}
            >
              <Pointer />
            </div>
          )}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** The brand character: a soft glowing orb. */
export const Orb: React.FC<{ size: number; soft?: boolean }> = ({ size, soft }) => {
  const frame = useCurrentFrame();
  const breathe = 1 + Math.sin(frame / 9) * 0.03;
  // The glow is a gradient that fades to nothing, not a blurred shadow: a big
  // shadow on a spinning element gets rasterised as a visible square.
  const glow = soft ? "92, 184, 255" : "31, 107, 255";
  return (
    <div style={{ position: "relative", width: size, height: size, transform: `scale(${breathe})` }}>
      <div
        style={{
          position: "absolute",
          inset: -size * 0.7,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, rgba(${glow}, ${soft ? 0.5 : 0.6}) 38%, rgba(${glow}, 0.18) 62%, rgba(${glow}, 0) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          transform: `rotate(${frame * 1.4}deg)`,
          background: soft
            ? `radial-gradient(circle at 35% 35%, #ffffff 0%, #bfe0ff 38%, #8cc4ff 62%, #ffe9a3 100%)`
            : `radial-gradient(circle at 35% 35%, #9fd4ff 0%, ${cl.blue} 45%, #3a2bd6 75%, ${cl.yellow} 100%)`,
          boxShadow: soft ? "none" : `inset 0 0 ${size * 0.2}px rgba(255,255,255,0.5)`,
        }}
      />
    </div>
  );
};

/** Frosted pill used for doubts, proof points and the booking toast. */
export const Glass: React.FC<{
  children: React.ReactNode;
  delay: number;
  size?: number;
  style?: React.CSSProperties;
  /** What it sounds like arriving; null keeps it silent. */
  sound?: Sound | null;
}> = ({ children, delay, size = 34, style, sound = "pop" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = pop(frame, fps, delay);
  return (
    <div
      style={{
        position: "absolute",
        padding: `${size * 0.5}px ${size * 0.9}px`,
        borderRadius: 999,
        fontSize: size,
        fontWeight: 500,
        color: cl.white,
        whiteSpace: "nowrap",
        background: "rgba(255, 255, 255, 0.12)",
        border: "1.5px solid rgba(255, 255, 255, 0.28)",
        boxShadow: "0 20px 50px rgba(2, 8, 50, 0.35)",
        opacity: linear(frame, delay, delay + 5),
        transform: `scale(${0.7 + 0.3 * p})`,
        filter: `blur(${Math.max(0, 1 - p) * 10}px)`,
        ...style,
      }}
    >
      {sound && (
        <Sfx name={sound} at={delay} volume={0.26} rate={0.86 + ((delay * 37) % 30) / 100} />
      )}
      {children}
    </div>
  );
};
