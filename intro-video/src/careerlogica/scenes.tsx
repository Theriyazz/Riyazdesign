import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { linear, pop, ramp, SceneProps, Words } from "../lib";
import { Glass, Key, Kinetic, Line, Orb, Screen, Scrim, Shot } from "./kit";
import { logoPaths } from "./logoPaths";
import { film } from "./script";
import { Sfx, Taps } from "./sfx";
import { optionPoint, TestFlow } from "./TestFlow";
import { cl, gradientText } from "./theme";

const center = { alignItems: "center", justifyContent: "center" } as const;

// ── Act 1: the problem ──────────────────────────────────────────────────────

const DOUBT_SPOTS: [number, number][] = [
  [150, 150],
  [1370, 130],
  [250, 830],
  [1330, 850],
  [770, 80],
  [70, 330],
  [1470, 690],
  [830, 940],
];

export const Confusion: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  return (
    <Shot dur={dur} tone="night" exit="zoom">
      <AbsoluteFill style={{ transform: `scale(${1 + ramp(frame, 0, dur) * 0.08})` }}>
        {film.doubts.map((doubt, i) => (
          <Glass
            key={doubt}
            delay={2 + i * 4}
            style={{
              left: DOUBT_SPOTS[i][0] + Math.sin(frame / 22 + i) * 14,
              top: DOUBT_SPOTS[i][1] + Math.cos(frame / 26 + i * 2) * 12,
              opacity: linear(frame, 2 + i * 4, 7 + i * 4) * 0.85,
            }}
          >
            {doubt}
          </Glass>
        ))}
      </AbsoluteFill>
      <AbsoluteFill style={center}>
        <Line text={film.problem} color={cl.white} size={108} start={16} />
      </AbsoluteFill>
    </Shot>
  );
};

export const Promise: React.FC<SceneProps> = ({ dur }) => (
  <Shot dur={dur} tone="dusk">
    <AbsoluteFill style={center}>
      <Line
        text={film.promise.text}
        color={cl.white}
        size={124}
        start={6}
        accent={film.promise.accent}
        accentStyle={gradientText(cl.sky, cl.yellow)}
      />
    </AbsoluteFill>
  </Shot>
);

export const Hello: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const swap = 46;
  const leave = ramp(frame, swap - 6, swap + 4);

  return (
    <Shot dur={dur} tone="day">
      <AbsoluteFill style={center}>
        <div
          style={{
            position: "absolute",
            opacity: linear(frame, 2, 10) * 0.9,
            transform: `scale(${0.8 + 0.5 * ramp(frame, 0, dur)})`,
          }}
        >
          <Orb size={520} soft />
        </div>
        <div style={{ position: "absolute", opacity: 1 - leave, filter: `blur(${leave * 12}px)` }}>
          <Line text={film.welcome} color={cl.ink} size={112} start={6} />
        </div>

        <div style={{ position: "absolute", top: 210 }}>
          <Line text={film.pillarsLine} color={cl.ink} size={76} start={swap + 2} />
        </div>
        <div style={{ position: "absolute", top: 400, display: "flex", gap: 44 }}>
          {film.pillarCards.map((card, i) => {
            const delay = swap + 18 + i * 12;
            const p = pop(frame, fps, delay);
            return (
              <div
                key={card.n}
                style={{
                  width: 620,
                  padding: "44px 48px",
                  borderRadius: 32,
                  background: "rgba(255, 255, 255, 0.86)",
                  border: `2px solid ${i ? cl.yellow : cl.blue}`,
                  boxShadow: "0 40px 90px rgba(14, 29, 102, 0.16)",
                  opacity: linear(frame, delay, delay + 5),
                  transform: `translateY(${(1 - p) * 70}px) rotate(${(1 - p) * (i ? 5 : -5)}deg) scale(${0.8 + 0.2 * p})`,
                }}
              >
                <Sfx name="pop" at={delay} volume={0.3} rate={i ? 1.12 : 0.95} />
                <div
                  style={{
                    display: "inline-block",
                    padding: "8px 20px",
                    borderRadius: 999,
                    background: i ? cl.yellow : cl.blue,
                    color: i ? cl.night : cl.white,
                    fontSize: 28,
                    fontWeight: 700,
                  }}
                >
                  {card.n}
                </div>
                <div
                  style={{
                    marginTop: 26,
                    fontSize: 60,
                    fontWeight: 700,
                    color: cl.ink,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {card.title}
                </div>
                <div style={{ marginTop: 10, fontSize: 32, color: "#4a5380" }}>{card.note}</div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Shot>
  );
};

export const Tour: React.FC<SceneProps> = ({ dur }) => (
  <Shot dur={dur} tone="night">
    <AbsoluteFill style={center}>
      <Line text={film.tour} color={cl.white} size={112} start={4} />
    </AbsoluteFill>
  </Shot>
);

// ── Act 2: the product ──────────────────────────────────────────────────────
// Rects and click points are the Figma frames' own coordinates. Camera y is
// the page row that sits at the window's optical centre.

const AUTH = { width: 1440, view: 1024 };
const APP = { width: 1544, view: 965 };
const AUTH_Y = 512;
const APP_Y = 482;

const tiltIn = { tiltX: [[0, 7], [32, 0]] as Key[], tiltY: [[0, -16], [32, 0]] as Key[] };
const { account } = film;

export const SignUp: React.FC<SceneProps> = ({ dur }) => {
  const form = 92;
  return (
    <Shot dur={dur} tone="night">
      <Screen
        {...AUTH}
        layers={[
          { src: "cl/signup.webp", from: 0 },
          { src: "cl/identity.webp", from: form },
        ]}
        clicks={[
          { at: 44, x: 613, y: 470, rect: [511, 352, 203, 159], stick: true },
          { at: 76, x: 720, y: 553, rect: [511, 531, 418, 44] },
          { at: 214, x: 720, y: 771, rect: [511, 749, 418, 44] },
        ]}
        fields={[
          { rect: [511, 439, 199, 44], text: account.first, from: form + 14, show: form },
          { rect: [730, 439, 199, 44], text: account.last, from: form + 30, show: form },
          { rect: [511, 521, 418, 44], text: account.email, from: form + 50, show: form, inset: 42 },
        ]}
        rest={[980, 760]}
        cam={{
          ...tiltIn,
          zoom: [[0, 0.74], [24, 0.74], [48, 1.18], [form, 1.18], [form + 16, 1.42], [196, 1.42], [dur, 1.3]],
          x: [[0, 720]],
          y: [[0, AUTH_Y], [24, AUTH_Y], [48, 470], [form, 470], [form + 16, 500], [196, 500], [dur, 620]],
        }}
      />
      <Scrim />
      <Kinetic {...film.signup} to={form - 10} />
      <Kinetic {...film.identity} from={form + 4} to={dur - 14} />
    </Shot>
  );
};

export const LogIn: React.FC<SceneProps> = ({ dur }) => (
  <Shot dur={dur} tone="dusk">
    <Screen
      {...AUTH}
      layers={[{ src: "cl/login.webp", from: 0 }]}
      clicks={[{ at: 118, x: 398, y: 609, rect: [189, 587, 418, 44] }]}
      fields={[
        { rect: [189, 383, 418, 44], text: account.email, from: 22, inset: 42 },
        { rect: [189, 465, 418, 44], text: account.password, from: 78, mask: true },
      ]}
      rest={[640, 760]}
      cam={{
        tiltX: [[0, 5], [26, 0]],
        tiltY: [[0, 14], [26, 0]],
        zoom: [[0, 0.74], [10, 0.74], [30, 1.4], [dur, 1.48]],
        x: [[0, 720], [10, 720], [30, 420], [dur, 410]],
        y: [[0, AUTH_Y], [10, AUTH_Y], [30, 470], [dur, 490]],
      }}
    />
    <Scrim />
    <Kinetic {...film.login} to={dur - 14} />
  </Shot>
);

export const Dashboard: React.FC<SceneProps> = ({ dur }) => (
  <Shot dur={dur} tone="night" exit="zoom">
    <Screen
      {...APP}
      layers={[{ src: "cl/home.webp", from: 0 }]}
      ground="#eef8ff"
      tiles={[
        { rect: [352, 140, 1144, 232], at: 12 },
        { rect: [352, 420, 560, 318], at: 22 },
        { rect: [936, 420, 560, 318], at: 30 },
        { rect: [352, 762, 1144, 298], at: 38 },
      ]}
      clicks={[{ at: 116, x: 459, y: 328, rect: [383, 310, 152, 36] }]}
      rest={[1100, 700]}
      cam={{
        ...tiltIn,
        zoom: [[0, 0.8], [74, 0.8], [106, 1.5], [dur, 1.62]],
        x: [[0, 772], [74, 772], [106, 620], [dur, 570]],
        y: [[0, APP_Y], [74, APP_Y], [106, 350], [dur, 340]],
      }}
    />
    <Scrim />
    <Kinetic {...film.home} from={8} to={dur - 16} />
  </Shot>
);

export const Test: React.FC<SceneProps> = ({ dur }) => {
  const open = 52;
  const picks: [number, number] = [104, 172];
  const done = 192;
  const [a, b] = film.questions;
  return (
    <Shot dur={dur} tone="dusk">
      <Screen
        {...APP}
        layers={[{ src: "cl/psych.webp", from: 0 }]}
        clicks={[
          { at: picks[0], x: optionPoint(a.pick)[0], y: optionPoint(a.pick)[1] },
          { at: picks[1], x: optionPoint(b.pick)[0], y: optionPoint(b.pick)[1] },
        ]}
        rest={[1180, 700]}
        cam={{
          zoom: [[0, 1.3], [open - 6, 1.3], [open + 12, 1.42], [done, 1.42], [done + 16, 1.5], [dur, 1.56]],
          x: [[0, 920]],
          y: [[0, 380], [open - 6, 380], [open + 12, 500], [dur, 490]],
        }}
      >
        <TestFlow open={open} clicks={picks} swap={picks[0] + 14} done={done} />
      </Screen>
      <Scrim />
      <Kinetic {...film.testIntro} step={film.steps[0]} to={open - 4} />
      <Kinetic {...film.testAnswer} from={open + 8} to={done - 12} />
      <Kinetic {...film.testResult} from={done + 6} to={dur - 14} />
    </Shot>
  );
};

export const Booking: React.FC<SceneProps> = ({ dur }) => {
  const modal = 70;
  const booked = 170;
  return (
    <Shot dur={dur} tone="night">
      <Screen
        {...APP}
        layers={[
          { src: "cl/counselling.webp", from: 0 },
          { src: "cl/booking.webp", from: modal },
          { src: "cl/appointments.webp", from: booked - 4 },
        ]}
        clicks={[
          { at: 60, x: 497, y: 799, rect: [371, 781, 253, 36] },
          { at: 116, x: 931, y: 646, rect: [869, 628, 125, 36], stick: true },
          { at: 152, x: 829, y: 824, rect: [736, 806, 186, 36] },
        ]}
        rest={[1100, 560]}
        cam={{
          ...tiltIn,
          zoom: [[0, 0.8], [26, 0.8], [54, 1.2], [modal + 14, 1.45], [152, 1.5], [booked + 8, 0.9], [dur, 1.15]],
          x: [[0, 772], [26, 772], [54, 640], [modal + 14, 932], [152, 932], [booked + 8, 772], [dur, 800]],
          y: [[0, APP_Y], [26, APP_Y], [54, 690], [modal + 14, 650], [152, 680], [booked + 8, 500], [dur, 590]],
        }}
      />
      <Scrim />
      <Kinetic {...film.book} step={film.steps[1]} to={modal - 8} />
      <Kinetic {...film.slot} from={modal + 8} to={booked - 12} />
      <Kinetic {...film.booked} from={booked + 6} to={dur - 14} />
      <Sfx name="success" at={booked + 2} volume={0.4} />
      <AbsoluteFill style={{ alignItems: "center", top: 40 }}>
        <Glass
          delay={booked + 2}
          sound={null}
          size={34}
          style={{
            position: "relative",
            background: "rgba(5, 15, 69, 0.94)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <span style={{ color: cl.yellow, fontWeight: 700 }}>✓</span>
          {film.toast}
        </Glass>
      </AbsoluteFill>
    </Shot>
  );
};

export const Explore: React.FC<SceneProps> = ({ dur }) => (
  <Shot dur={dur} tone="dusk">
    <Screen
      {...APP}
      layers={[
        { src: "cl/library.webp", from: 0 },
        { src: "cl/finder.webp", from: 62 },
      ]}
      clicks={[{ at: 46, x: 520, y: 664, rect: [373, 601, 358, 131], radius: 12 }]}
      rest={[1050, 800]}
      cam={{
        ...tiltIn,
        zoom: [[0, 0.8], [44, 1.1], [70, 0.92], [dur, 1.06]],
        x: [[0, 772], [44, 660], [70, 860], [dur, 860]],
        y: [[0, APP_Y], [44, 640], [70, 1180], [dur, 1290]],
        scroll: [[0, 0], [58, 0], [70, 700], [dur, 800]],
      }}
    />
    <Scrim />
    <Kinetic {...film.library} to={52} />
    <Kinetic {...film.finder} from={68} to={dur - 14} />
  </Shot>
);

// ── Act 3: proof and sign-off ───────────────────────────────────────────────

const PROOF_SPOTS: [number, number][] = [
  [240, 250],
  [1290, 300],
  [1180, 760],
];

export const Proof: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const count = Math.round(ramp(frame, 8, 64, 0, film.stat.value));
  const p = pop(frame, fps, 4);

  return (
    <Shot dur={dur} tone="dusk">
      <AbsoluteFill style={center}>
        <div style={{ position: "absolute", transform: `scale(${0.6 + 0.4 * p})`, opacity: 0.9 }}>
          <Orb size={520} />
        </div>
        <div style={{ position: "relative", textAlign: "center", color: cl.white }}>
          <div
            style={{
              fontSize: 190,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
              textShadow: "0 10px 40px rgba(2, 8, 50, 0.45)",
            }}
          >
            {count.toLocaleString("en-US")}
            {film.stat.suffix}
          </div>
          <div style={{ fontSize: 50, fontWeight: 500, marginTop: 12, opacity: linear(frame, 14, 24) }}>
            {film.stat.label}
          </div>
        </div>
      </AbsoluteFill>
      <Sfx name="count" at={8} frames={58} volume={0.3} />
      <Sfx name="select" at={64} volume={0.3} rate={1.25} />
      {film.proof.map((line, i) => (
        <Glass
          key={line}
          delay={34 + i * 12}
          size={40}
          style={{
            left: PROOF_SPOTS[i][0],
            top: PROOF_SPOTS[i][1] + Math.sin(frame / 20 + i * 2) * 10,
          }}
        >
          {line}
        </Glass>
      ))}
    </Shot>
  );
};

export const Close: React.FC<SceneProps> = ({ dur }) => (
  <Shot dur={dur} tone="night">
    <AbsoluteFill style={center}>
      <Line
        text={film.close.text}
        color={cl.white}
        size={124}
        start={4}
        accent={film.close.accent}
        accentStyle={gradientText(cl.sky, cl.yellow)}
      />
    </AbsoluteFill>
  </Shot>
);

// On the dark sign-off the navy and blue letters go white and the brain goes navy.
const ON_DARK: Record<string, string> = {
  "#0E1D66": cl.white,
  "#035BE2": cl.white,
  "#D1B511": cl.yellow,
  white: cl.navy,
};

export const Logo: React.FC<SceneProps> = ({ dur }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = ramp(frame, 0, 10);
  const glow = pop(frame, fps, 40);
  const button = pop(frame, fps, 80);

  return (
    <AbsoluteFill style={{ opacity: enter }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 55% at 50% 46%, #1440b4 0%, ${cl.navy} 48%, ${cl.night} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          ...center,
          flexDirection: "column",
          transform: `scale(${1 + ramp(frame, 0, dur) * 0.04})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 1100,
            height: 300,
            marginTop: -150,
            borderRadius: "50%",
            background: cl.blue,
            filter: "blur(120px)",
            opacity: 0.45 * glow,
          }}
        />
        <Sfx name="logo" at={8} volume={0.6} />
        <Taps at={59} words={film.tagline.split(" ").length} step={3} />
        <Sfx name="pop" at={80} volume={0.32} />
        <svg width={1160} viewBox="26 36 474 92" style={{ overflow: "visible", position: "relative" }}>
          {logoPaths.map((path, i) => {
            const delay = 8 + ((path.x - 34) / 456) * 38;
            const p = pop(frame, fps, delay);
            return (
              <path
                key={i}
                d={path.d}
                fill={ON_DARK[path.fill] ?? path.fill}
                style={{
                  transformBox: "fill-box",
                  transformOrigin: "center",
                  opacity: linear(frame, delay, delay + 5),
                  transform: `translateY(${(1 - p) * 28}px) scale(${0.6 + 0.4 * p})`,
                }}
              />
            );
          })}
        </svg>

        <div style={{ marginTop: 56 }}>
          <Words text={film.tagline} color={cl.white} size={52} start={58} step={3} weight={500} />
        </div>

        <div
          style={{
            marginTop: 54,
            padding: "24px 48px",
            borderRadius: 16,
            background: cl.yellow,
            color: cl.night,
            fontSize: 38,
            fontWeight: 600,
            opacity: linear(frame, 80, 86),
            transform: `scale(${0.8 + 0.2 * button})`,
            boxShadow: "0 24px 60px rgba(245, 200, 66, 0.28)",
          }}
        >
          {film.cta}
        </div>

        <div
          style={{
            marginTop: 50,
            fontSize: 28,
            color: cl.white,
            opacity: linear(frame, 96, 110) * 0.85,
            whiteSpace: "pre",
          }}
        >
          {film.pillars}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
