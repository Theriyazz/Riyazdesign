import React from "react";
import { AbsoluteFill, Img, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, ramp, s, sans, settle } from "../hello/kit";
import { Slam } from "../hello2/kinetic";
import { Grain, Line, Riyaz, Shot, Swap, WALL } from "./kit";

/* Variation B, "I cut things". The palette is lifted from the illustration, so
   he belongs to the world: pink, cobalt, leaf green, cream, ink. Subtraction is
   his real method (37 links to 7, 9 sites to 1), so every transition is a paper
   cut: the scene splits on a diagonal and the halves fall away. Shapes move on
   fours, like cut-out animation, while the slices stay smooth. */

const p = { pink: "#ff5fc4", cobalt: "#2348d6", green: "#0d7a56", cream: "#f3efe3", ink: "#0b0b0e" };

const OVERLAP = 26;
/** Stepped time for the handmade shapes. */
const onFours = (f: number) => Math.floor(f / 4) * 4;

/** Wraps a scene: on exit it is drawn twice, split along a diagonal, and the halves part. */
const Slice: React.FC<{ dur: number; bg: string; children: React.ReactNode }> = ({ dur, bg, children }) => {
  const f = useCurrentFrame();
  const o = ramp(f, dur - OVERLAP, dur, 0, 1, ease.in);
  if (o <= 0) return <AbsoluteFill style={{ background: bg }}>{children}</AbsoluteFill>;
  const part = (top: boolean) => (
    <AbsoluteFill
      style={{
        background: bg,
        clipPath: top ? "polygon(0 0, 100% 0, 100% 30%, 0 70%)" : "polygon(0 70%, 100% 30%, 100% 100%, 0 100%)",
        transform: `translate(${(top ? -1 : 1) * o * 500}px, ${(top ? -1 : 1) * o * 1000}px) rotate(${(top ? -1 : 1) * o * 4}deg)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
  return (
    <>
      {part(true)}
      {part(false)}
    </>
  );
};

/** A word with a live slice through it. `gap` opens the cut. */
const SlicedWord: React.FC<{ children: React.ReactNode; gap: number; style?: React.CSSProperties }> = ({ children, gap, style }) => (
  <div style={{ position: "relative", ...style }}>
    <div style={{ clipPath: "polygon(-5% -20%, 105% -20%, 105% 38%, -5% 62%)", transform: `translate(${-gap}px, ${-gap * 0.35}px)` }}>{children}</div>
    <div style={{ position: "absolute", inset: 0, clipPath: "polygon(-5% 62%, 105% 38%, 105% 120%, -5% 120%)", transform: `translate(${gap}px, ${gap * 0.35}px)` }}>{children}</div>
  </div>
);

/* ---- Poster and opening. */
const POSTER_X = 860;
const PosterText: React.FC<{ gap?: number; opacity?: number; y?: number }> = ({ gap = 7, opacity = 1, y = 0 }) => (
  <div style={{ position: "absolute", left: POSTER_X, top: 180, opacity, transform: `translateY(${y}px)` }}>
    <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 250, lineHeight: 0.92, letterSpacing: "-0.055em", color: p.ink }}>I cut</div>
    <SlicedWord gap={gap}>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 250, lineHeight: 0.92, letterSpacing: "-0.055em", color: p.ink }}>things.</div>
    </SlicedWord>
    <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 68, lineHeight: 1.1, letterSpacing: "-0.03em", color: p.ink, marginTop: 44 }}>
      It&rsquo;s most of the job.
    </div>
  </div>
);

const O1 = s(2.5);
const Open: React.FC = () => {
  const f = useCurrentFrame();
  const gap = interpolate(f, [s(0.9), s(1.7)], [7, 60], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.inOut });
  return (
    <Slice dur={O1} bg={p.pink}>
      <Riyaz h={1020} x={30} y={46} />
      <PosterText gap={gap} />
    </Slice>
  );
};

/* ---- The name. */
const O2 = s(3.4);
const Name: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = onFours(f);
  const a = settle(t, fps, 4, 170);
  const b = settle(t, fps, 12, 170);
  const g = settle(t, fps, 20, 170);
  return (
    <Slice dur={O2} bg={p.cream}>
      <div style={{ position: "absolute", right: 90, top: 80, width: 300, height: 300, borderRadius: "50%", background: p.pink, transform: `scale(${a}) translateY(${Math.sin(t / 20) * 10}px)` }} />
      <div style={{ position: "absolute", right: 60, top: 400, width: 0, height: 0, borderLeft: "280px solid transparent", borderBottom: `400px solid ${p.cobalt}`, transform: `scale(${b}) rotate(${t / 30}deg)`, transformOrigin: "70% 70%" }} />
      <div style={{ position: "absolute", right: 70, bottom: 26, width: 170, height: 170, borderRadius: "0 100% 0 100%", background: p.green, transform: `scale(${g}) rotate(${-t / 26}deg)` }} />
      <div style={{ position: "absolute", left: 100, top: 150 }}>
        <Slam text="Riyaz" at={2} size={350} weight={900} color={p.ink} seed="b-r" stagger={2} wobble={0.2} />
        <Slam text="Malek" at={12} size={350} weight={900} color={p.ink} seed="b-m" stagger={2} wobble={0.2} />
        <div style={{ height: 40 }} />
        <Line at={36} size={76} color={p.ink} weight={600}>
          Product designer. Editor of everything.
        </Line>
      </div>
    </Slice>
  );
};

/* ---- PECUC: 37 strips of paper; the cut line goes through; 30 of them fall. */
const O3 = s(8);
const Strip: React.FC<{ i: number; start: number }> = ({ i, start }) => {
  const f = useCurrentFrame();
  const keep = i < 7;
  const col = i % 2;
  const row = Math.floor(i / 2);
  const dropAt = start + (36 - i) * 1.2;
  const d = Math.max(0, onFours(f) - dropAt);
  const fall = keep ? 0 : d * d * 0.09;
  const spin = keep ? 0 : (random(`s-${i}`) - 0.5) * d * 2.2;
  const inn = ramp(f, i * 0.9, i * 0.9 + 10);
  return (
    <div
      style={{
        position: "absolute",
        left: 90 + col * 264,
        top: 225 + row * 39,
        width: 250,
        height: 30,
        borderRadius: 3,
        background: keep ? p.cream : "rgba(243,239,227,0.62)",
        opacity: inn,
        transform: `translateY(${fall}px) rotate(${spin}deg)`,
      }}
    />
  );
};

const Pecuc: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cutAt = s(2.3);
  const lineP = ramp(f, cutAt - 12, cutAt + 6, 0, 1, ease.inOut);
  const count = Math.round(interpolate(f, [cutAt, cutAt + s(1)], [37, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const siteIn = settle(onFours(f), fps, s(3.5), 120);
  const fallAway = ramp(f, s(4.3), s(4.9), 0, 1, ease.in);
  return (
    <Slice dur={O3} bg={p.cobalt}>
      <div style={{ position: "absolute", left: 90, top: 80 }}>
        <Line at={8} size={96} color={p.cream} weight={800}>
          {count} navigation links.
        </Line>
      </div>
      {Array.from({ length: 37 }, (_, i) => (
        <Strip key={i} i={i} start={cutAt} />
      ))}
      {/* the cut line */}
      <div style={{ position: "absolute", left: 60, top: 225 + 4 * 39 - 6, width: 570 * lineP, height: 0, borderTop: `5px dashed ${p.pink}` }} />
      <div style={{ position: "absolute", left: 90, top: 410, display: "flex", flexDirection: "column", gap: 28 }}>
        <Swap at={s(3.5)} from="4" to="2" label="clicks to content" fg={p.cream} dim="rgba(243,239,227,0.45)" hit={p.pink} size={120} labelSize={36} />
        <Swap at={s(4.2)} from="9" to="1" label="sub-sites, one hub" fg={p.cream} dim="rgba(243,239,227,0.45)" hit={p.pink} size={120} labelSize={36} />
      </div>
      <div style={{ position: "absolute", left: 800, top: 870, opacity: ramp(f, s(5.2), s(5.6)), fontFamily: sans, fontWeight: 600, fontSize: 44, letterSpacing: "-0.02em", color: p.cream, whiteSpace: "nowrap" }}>
        PECUC. 35 years of impact, hidden by a 2001 website.
      </div>
      {/* the new site, under the old one, which is cut and dropped */}
      <div style={{ position: "absolute", left: 800, top: 190, width: 1040, height: 650, opacity: Math.min(1, siteIn * 1.4), transform: `translateY(${(1 - siteIn) * 900}px)` }}>
        <Shot src="hello/pecuc-new.webp" w={1040} h={650} r={6} />
        <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 100% 0, 100% 34%, 0 66%)", transform: `translate(${-fallAway * 180}px, ${-fallAway * 900}px) rotate(${-fallAway * 8}deg)` }}>
          <Img src={staticFile("hello/pecuc-old.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
        <div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 66%, 100% 34%, 100% 100%, 0 100%)", transform: `translate(${fallAway * 180}px, ${fallAway * 900}px) rotate(${fallAway * 8}deg)` }}>
          <Img src={staticFile("hello/pecuc-old.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
      </div>
    </Slice>
  );
};

/* ---- ATRC: the twist. The one thing he did not cut. */
const O4 = s(7);
const Atrc: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = onFours(f);
  const fold = ramp(f, s(2.4), s(3), 0, 1, ease.inOut);
  return (
    <Slice dur={O4} bg={p.green}>
      {/* 25 question tiles: all of them stay */}
      <div style={{ position: "absolute", left: 90, top: 330, display: "grid", gridTemplateColumns: "repeat(5, 92px)", gap: 14, transform: `scale(${1 - fold * 0.45})`, transformOrigin: "0 100%", opacity: 1 - fold * 0.25 }}>
        {Array.from({ length: 25 }, (_, i) => {
          const q = settle(t, fps, 12 + i * 2, 200);
          return <div key={i} style={{ width: 92, height: 92, borderRadius: 4, background: p.cream, transform: `scale(${q})` }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 90, top: 90 }}>
        <Line at={6} size={120} color={p.cream} weight={800}>
          25 questions. I cut none.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 90, top: 225 }}>
        <Line at={s(1.25)} size={68} color={p.cream} weight={500} tracking="-0.03em">
          Fifteen-year-olds quit long tests.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 660, top: 340 }}>
        <Line at={s(2.6)} size={104} color={p.ink} weight={800}>
          I cut the reasons to quit.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 660, top: 480, display: "flex", gap: 26 }}>
        {[
          ["hello/atrc-question.webp", "4 formats"],
          ["hello/atrc-pause.webp", "Pause and resume"],
          ["hello/atrc-still.webp", "“Still there?”"],
        ].map(([src, label], i) => {
          const q = settle(t, fps, s(3) + i * 12, 150);
          return (
            <div key={src} style={{ width: 372, opacity: Math.min(1, q * 1.4), transform: `translateY(${(1 - q) * 600}px) rotate(${(i - 1) * 1.6}deg)` }}>
              <Shot src={src} w={372} h={264} r={6} />
              <div style={{ marginTop: 18, fontFamily: sans, fontWeight: 700, fontSize: 40, letterSpacing: "-0.025em", color: p.cream, whiteSpace: "nowrap" }}>{label}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 90, bottom: 50, fontFamily: sans, fontWeight: 600, fontSize: 36, letterSpacing: "-0.02em", color: p.cream, opacity: ramp(f, s(3.6), s(4)) }}>
        ATRC, Abu Dhabi
      </div>
    </Slice>
  );
};

/* ---- CareerLogica: five tags go, and a platform comes in on paper. */
const O5 = s(8);
const TAGS = ["WhatsApp", "Email", "Google Drive", "Calendar", "Spreadsheet"];
const Career: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = onFours(f);
  const gone = s(2.3);
  return (
    <Slice dur={O5} bg={p.cream}>
      <div style={{ position: "absolute", left: 90, top: 80 }}>
        <Line at={6} size={120} color={p.ink} weight={800} out={gone}>
          Five apps for one job.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 90, top: 80 }}>
        <Line at={gone + 12} size={120} color={p.ink} weight={800}>
          So, one platform.
        </Line>
      </div>
      {TAGS.map((tag, i) => {
        const q = settle(t, fps, 24 + i * 8, 190);
        const d = Math.max(0, t - gone - i * 4);
        return (
          <div key={tag} style={{ position: "absolute", left: 90 + i * 340, top: 420 + (i % 2) * 150 + d * d * 0.14, transform: `scale(${q}) rotate(${(i % 2 ? 1 : -1) * (3 + d * 0.3)}deg)`, padding: "30px 44px", background: [p.pink, p.cobalt, p.green, p.ink, p.pink][i], color: i === 0 || i === 4 ? p.ink : p.cream, fontFamily: sans, fontWeight: 800, fontSize: 54, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>
            {tag}
          </div>
        );
      })}
      {/* the collage: real screens slapped down */}
      {WALL.slice(0, 12).map((src, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const q = settle(t, fps, gone + 22 + i * 4, 210);
        const tilt = (random(`t-${i}`) - 0.5) * 5;
        return (
          <div key={src} style={{ position: "absolute", left: 720 + col * 300, top: 250 + row * 260 + (col % 2) * 40, opacity: f < gone + 22 + i * 4 ? 0 : 1, transform: `scale(${1.5 - 0.5 * q}) rotate(${tilt}deg)` }}>
            <Shot src={src} w={340} h={218} r={4} shadow="0 14px 28px rgba(11,11,14,0.3)" />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 90, top: 280, display: "flex", flexDirection: "column", gap: 4 }}>
        <Slam text="140+" at={gone + 32} size={220} weight={900} color={p.cobalt} seed="b-140" wobble={0.2} />
        <Line at={gone + 50} size={68} color={p.ink} weight={700}>
          screens.
        </Line>
        <div style={{ height: 22 }} />
        <Line at={gone + 74} size={68} color={p.ink} weight={700}>
          5 roles.
        </Line>
        <Line at={gone + 88} size={68} color={p.ink} weight={700}>
          2 languages.
        </Line>
        <Line at={gone + 102} size={68} color={p.ink} weight={700}>
          1 designer.
        </Line>
        <div style={{ height: 22 }} />
        <Line at={gone + 136} size={40} color={p.ink} weight={500} tracking="-0.02em">
          CareerLogica
        </Line>
      </div>
    </Slice>
  );
};

/* ---- The point, said plainly, then a client. */
const O6 = s(5);
const Point: React.FC = () => {
  const out = s(2.5);
  return (
    <Slice dur={O6} bg={p.ink}>
      <div style={{ position: "absolute", left: 110, top: 340 }}>
        <Line at={6} size={132} color={p.cream} weight={800} out={out}>
          Anyone can add a screen.
        </Line>
        <Line at={40} size={132} color={p.pink} weight={800} out={out}>
          I ask what can go.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 110, top: 310 }}>
        <Line at={out + 10} size={146} color={p.cream} weight={800}>
          &ldquo;He understood
        </Line>
        <Line at={out + 18} size={146} color={p.cream} weight={800}>
          our vision.&rdquo;
        </Line>
        <div style={{ height: 40 }} />
        <Line at={out + 36} size={42} color={p.cream} weight={500} tracking="-0.02em">
          Ranjan Kumar Mohanty, Secretary-cum-CEO, PECUC
        </Line>
      </div>
    </Slice>
  );
};

/* ---- Sign-off, resolving to the poster. */
const O7 = s(38) - (O1 + O2 + O3 + O4 + O5 + O6) + OVERLAP * 6;
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = settle(onFours(f), fps, OVERLAP - 6, 120);
  const out = ramp(f, O7 - s(1.1), O7 - s(0.7), 0, 1, ease.in);
  const back = ramp(f, O7 - s(0.65), O7 - s(0.15), 0, 1, ease.out);
  return (
    <AbsoluteFill style={{ background: p.pink }}>
      <Riyaz h={1020} x={30} y={46 + (1 - inn) * 900} breathe={1 - back} />
      <div style={{ position: "absolute", left: POSTER_X, top: 240, opacity: 1 - out }}>
        <Line at={OVERLAP + 4} size={150} color={p.ink} weight={900}>
          What should
        </Line>
        <Line at={OVERLAP + 12} size={150} color={p.ink} weight={900}>
          we cut first?
        </Line>
        <div style={{ height: 50 }} />
        <Line at={OVERLAP + 30} size={58} color={p.ink} weight={700} tracking="-0.025em">
          riyazdesigns.netlify.app
        </Line>
        <div style={{ height: 12 }} />
        <Line at={OVERLAP + 38} size={44} color={p.ink} weight={500} tracking="-0.02em">
          Open to product design roles
        </Line>
      </div>
      <PosterText opacity={back} y={(1 - back) * 40} />
    </AbsoluteFill>
  );
};

const SCENES: [React.FC, number][] = [
  [Open, O1],
  [Name, O2],
  [Pecuc, O3],
  [Atrc, O4],
  [Career, O5],
  [Point, O6],
  [Outro, O7],
];

export const FilmCut: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: p.ink }}>
      {SCENES.map(([C, dur], i) => {
        const from = at;
        at += dur - OVERLAP;
        return (
          // Earlier scenes sit on top so their halves part to reveal the next.
          <div key={i} style={{ position: "absolute", inset: 0, zIndex: SCENES.length - i }}>
            <Sequence from={from} durationInFrames={dur} layout="none">
              <C />
            </Sequence>
          </div>
        );
      })}
      <Grain opacity={0.16} />
    </AbsoluteFill>
  );
};
