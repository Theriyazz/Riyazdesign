import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { c, ease, mono, Odometer, ramp, s, sans, settle } from "../hello/kit";
import { Slam } from "../hello2/kinetic";
import { FILM_DUR, Grain, Line, Riyaz, Shot, Swap, WALL } from "./kit";

/* Variation A, "The first question". Ink and lime, the site's own language.
   Riyaz's real habit is the spine: the first thing he asks of any brief is why.
   The poster poses it; the lime disc behind him floods the frame and his name
   lands where the question was. Each project is then one question and its answer. */

const DISC = { x: 470, y: 590, r: 440 };
const TEXT_X = 930;

/** Poster composition. Text is passed in so the outro can resolve back to it. */
const WhyText: React.FC<{ opacity?: number; y?: number; bounce?: number }> = ({ opacity = 1, y = 0, bounce = 1 }) => {
  const f = useCurrentFrame();
  const hop = Math.abs(Math.sin((f / 60) * 2.2)) * 16 * bounce;
  return (
    <div style={{ position: "absolute", left: TEXT_X, top: 270, opacity, transform: `translateY(${y}px)` }}>
      <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 340, lineHeight: 0.95, letterSpacing: "-0.06em", color: c.paper, display: "flex" }}>
        Why<span style={{ color: c.signal, display: "inline-block", transform: `translateY(${-hop}px)` }}>?</span>
      </div>
      <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 62, lineHeight: 1.14, letterSpacing: "-0.03em", color: c.paper200, marginTop: 34 }}>
        The first thing I ask.
        <br />
        Before I open Figma.
      </div>
    </div>
  );
};

/* ---- 0 to 5 s: the question, then the name in its place. */
const OPEN_DUR = s(5);
const Open: React.FC = () => {
  const f = useCurrentFrame();
  const flood = ramp(f, s(1.15), s(1.85), 0, 1, ease.inOut);
  const r = interpolate(flood, [0, 1], [DISC.r, 2000]) + Math.sin((f / 60) * 1.5) * 8;
  const exit = ramp(f, OPEN_DUR - s(0.45), OPEN_DUR, 0, 1, ease.inOut);
  const iris = interpolate(exit, [0, 1], [2100, 20]);
  return (
    <AbsoluteFill style={{ background: c.ink }}>
      <AbsoluteFill style={{ background: c.ink, clipPath: exit > 0 ? `circle(${iris}px at 960px 540px)` : undefined }}>
        <WhyText y={-flood * 60} />
        <div style={{ position: "absolute", left: DISC.x - r, top: DISC.y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: c.signal }} />
        <Riyaz h={1020} x={64} y={46} />
        <div style={{ position: "absolute", left: TEXT_X, top: 190 }}>
          <Slam text="Riyaz" at={s(1.8)} size={300} weight={900} color={c.ink} seed="a-r" wobble={0.2} />
          <Slam text="Malek" at={s(2)} size={300} weight={900} color={c.ink} seed="a-m" wobble={0.2} />
          <div style={{ height: 40 }} />
          <Line at={s(2.55)} size={70} color={c.ink} weight={700}>
            Product designer.
          </Line>
          <Line at={s(2.8)} size={70} color={c.ink} weight={500}>
            Asker of annoying questions.
          </Line>
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 960 - 20, top: 540 - 20, width: 40, height: 40, borderRadius: 40, background: c.signal, opacity: exit > 0.9 ? 1 : 0 }} />
    </AbsoluteFill>
  );
};

/* The question each project opens on. It lands huge, then steps aside. */
const Question: React.FC<{ a: string; b: string; hit?: string; at?: number; out: number; size?: number }> = ({ a, b, hit, at = 6, out, size = 128 }) => {
  const f = useCurrentFrame();
  const o = ramp(f, out, out + 18, 0, 1, ease.in);
  return (
    <div style={{ position: "absolute", left: 90, top: 340, opacity: 1 - o, transform: `translateY(${-o * 120}px)`, zIndex: 20 }}>
      <Slam text={a} at={at} size={size} weight={800} stagger={1} seed={a} wobble={0.2} color={c.paper} />
      <div style={{ height: 14 }} />
      <div style={{ display: "flex", gap: size * 0.26 }}>
        <Slam text={b} at={at + 20} size={size} weight={800} stagger={1} seed={b} wobble={0.2} color={c.paper} />
        {hit ? <Slam text={hit} at={at + 20 + b.length} size={size} weight={800} stagger={2} seed={hit} wobble={0.5} color={c.signal} /> : null}
      </div>
    </div>
  );
};

/* ---- PECUC: the old site, dragged across by the dot into the new one. */
const PECUC_DUR = s(7.6);
const Pecuc: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const bgIn = settle(f, fps, 0, 90);
  const move = ramp(f, s(2.3), s(2.9), 0, 1, ease.inOut);
  const wipe = ramp(f, s(3.1), s(4.1), 0, 1, ease.inOut);
  const W = interpolate(move, [0, 1], [1920, 1010]);
  const H = W / 1.6;
  const L = interpolate(move, [0, 1], [0, 840]);
  const T = interpolate(move, [0, 1], [-60, 225]);
  return (
    <AbsoluteFill style={{ background: c.ink }}>
      <div style={{ position: "absolute", left: L, top: T, width: W, height: H, borderRadius: 18 * move, overflow: "hidden", opacity: interpolate(move, [0, 1], [0.17, 1]) * Math.min(1, bgIn * 1.4) }}>
        <Img src={staticFile("hello/pecuc-old.webp")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
          <Img src={staticFile("hello/pecuc-new.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
        {wipe > 0 && wipe < 1 ? <div style={{ position: "absolute", top: 0, bottom: 0, left: `${wipe * 100}%`, width: 8, marginLeft: -4, background: c.signal }} /> : null}
      </div>
      <Question a="Why does 35 years of impact" b="look like" hit="2001?" size={112} out={s(2.15)} />
      <div style={{ position: "absolute", left: 90, top: 150, display: "flex", flexDirection: "column", gap: 46 }}>
        <Line at={s(2.6)} size={38} color={c.paper300} weight={500} tracking="-0.02em">
          PECUC. UNICEF among its partners.
        </Line>
        <Swap at={s(3.1)} from="37" to="7" label="navigation links" fg={c.paper200} dim={c.ink600} hit={c.signal} />
        <Swap at={s(3.75)} from="4" to="2" label="clicks to content" fg={c.paper200} dim={c.ink600} hit={c.signal} />
        <Swap at={s(4.4)} from="9" to="1" label="sub-sites, merged into one hub" fg={c.paper200} dim={c.ink600} hit={c.signal} />
      </div>
    </AbsoluteFill>
  );
};

/* ---- ATRC: the flow pans past, with its way back. */
const ATRC_DUR = s(7);
const ATRC_FLOW = ["hello/atrc-landing.webp", "hello/atrc-question.webp", "hello/atrc-pause.webp", "hello/atrc-still.webp", "hello/atrc-result.webp"];
const Atrc: React.FC = () => {
  const f = useCurrentFrame();
  const rise = ramp(f, s(2.2), s(2.9), 0, 1, ease.out);
  const pan = interpolate(f, [s(2.2), ATRC_DUR], [120, -1560]);
  return (
    <AbsoluteFill style={{ background: c.ink }}>
      <Question a="Why do fifteen-year-olds" b="quit" hit="mid-test?" out={s(2.05)} />
      <div style={{ position: "absolute", left: 90, top: 90 }}>
        <Line at={s(2.35)} size={92} color={c.paper} weight={700}>
          I kept all 25 questions.
        </Line>
        <Line at={s(2.65)} size={92} color={c.signal} weight={700}>
          Then gave every exit a way back.
        </Line>
      </div>
      <div style={{ position: "absolute", left: pan, top: 400 + (1 - rise) * 500, display: "flex", gap: 44, opacity: rise }}>
        {ATRC_FLOW.map((src) => (
          <Shot key={src} src={src} w={760} h={540} r={22} />
        ))}
      </div>
      <div style={{ position: "absolute", left: 90, bottom: 44, fontFamily: mono, fontSize: 26, letterSpacing: "0.04em", color: c.paper300, opacity: ramp(f, s(3.1), s(3.5)) }}>
        ATRC, Abu Dhabi. 25 questions, 4 formats, 3 pathways.
      </div>
    </AbsoluteFill>
  );
};

/* ---- CareerLogica: five apps collapse to a point and open as one wall of screens. */
const CL_DUR = s(7.6);
const APPS = ["WhatsApp", "Email", "Google Drive", "Calendar", "Spreadsheet"];
const Career: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const collapse = ramp(f, s(2.15), s(2.55), 0, 1, ease.in);
  const dim = ramp(f, s(3.0), s(3.8), 1, 0.26, ease.inOut);
  return (
    <AbsoluteFill style={{ background: c.ink }}>
      <AbsoluteFill style={{ opacity: dim }}>
        <div style={{ position: "absolute", left: -90, top: -40, width: 2100, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 20, transform: `translateY(${interpolate(f, [s(2.5), CL_DUR], [0, -130])}px)` }}>
          {WALL.map((src, i) => {
            const p = settle(f, fps, s(2.55) + ((i * 7) % 20) * 1.2, 150);
            return (
              <div key={src} style={{ opacity: f < s(2.55) ? 0 : Math.min(1, p * 1.5), transform: `scale(${0.4 + 0.6 * p})` }}>
                <Shot src={src} w={404} h={258} r={10} shadow="none" />
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Question a="Why run a counselling practice" b="across" hit="five apps?" size={106} out={s(2.1)} />
      {APPS.map((a, i) => {
        const p = settle(f, fps, 42 + i * 7, 180);
        const ang = (i / APPS.length) * Math.PI * 2 + f / 240;
        const x = 960 + Math.cos(ang) * 660 * (1 - collapse);
        const y = 780 + Math.sin(ang) * 120 * (1 - collapse);
        return (
          <div key={a} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${p * (1 - collapse)})`, padding: "14px 30px", borderRadius: 99, border: `2px solid ${c.ink600}`, background: c.ink850, fontFamily: sans, fontWeight: 600, fontSize: 36, letterSpacing: "-0.02em", color: c.paper200, whiteSpace: "nowrap", opacity: f > s(2.55) ? 0 : 1 }}>
            {a}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 90, top: 150, opacity: f < s(3.1) ? 0 : 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
          <Odometer value="140+" at={s(3.1)} size={300} weight={800} color={c.signal} dur={s(1)} />
          <Line at={s(3.5)} size={92} color={c.paper} weight={700}>
            screens.
          </Line>
        </div>
        <div style={{ height: 34 }} />
        <Line at={s(3.9)} size={92} color={c.paper} weight={700}>
          5 roles. English and Arabic.
        </Line>
        <Line at={s(4.3)} size={92} color={c.paper} weight={700}>
          One designer.
        </Line>
        <div style={{ height: 40 }} />
        <Line at={s(4.9)} size={44} color={c.paper200} weight={500} tracking="-0.02em">
          CareerLogica. Approved with no structural revisions.
        </Line>
      </div>
    </AbsoluteFill>
  );
};

/* ---- "Why me?" answers itself in his line, then a client's. */
const ME_DUR = s(6);
const WhyMe: React.FC = () => {
  const f = useCurrentFrame();
  const beat = s(1.3);
  const big = ramp(f, beat, beat + 16, 1, 0, ease.in);
  const out2 = s(3.5);
  return (
    <AbsoluteFill style={{ background: c.signal }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, display: "flex", justifyContent: "center", opacity: big, transform: `scale(${1 + (1 - big) * 0.5})` }}>
        <Slam text="Why me?" at={4} size={350} weight={900} color={c.ink} stagger={3} seed="me" wobble={0.5} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 340 }}>
        <Line at={beat + 8} size={124} color={c.ink} weight={800} out={out2}>
          I ask a lot of questions
        </Line>
        <Line at={beat + 18} size={124} color={c.ink} weight={800} out={out2}>
          before I open Figma.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 130, top: 300 }}>
        <Line at={out2 + 12} size={150} color={c.ink} weight={800}>
          &ldquo;He understood
        </Line>
        <Line at={out2 + 20} size={150} color={c.ink} weight={800}>
          our vision.&rdquo;
        </Line>
        <div style={{ height: 40 }} />
        <Line at={out2 + 38} size={42} color={c.ink} weight={500} tracking="-0.02em">
          Ranjan Kumar Mohanty, Secretary-cum-CEO, PECUC
        </Line>
      </div>
    </AbsoluteFill>
  );
};

/* ---- The sign-off, which resolves back to the poster for the loop. */
const OUTRO_DUR = s(38) - (OPEN_DUR + PECUC_DUR + ATRC_DUR + CL_DUR + ME_DUR);
const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const inn = settle(f, fps, 0, 110);
  const swapOut = ramp(f, OUTRO_DUR - s(1.15), OUTRO_DUR - s(0.75), 0, 1, ease.in);
  const swapIn = ramp(f, OUTRO_DUR - s(0.7), OUTRO_DUR - s(0.2), 0, 1, ease.out);
  const r = DISC.r + Math.sin(((f + (FILM_DUR - OUTRO_DUR)) / 60) * 1.5) * 0;
  return (
    <AbsoluteFill style={{ background: c.ink }}>
      <div style={{ position: "absolute", left: DISC.x - r, top: DISC.y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: c.signal, transform: `scale(${inn})` }} />
      <Riyaz h={1020} x={64} y={46 + (1 - inn) * 900} breathe={1 - swapIn} />
      <div style={{ position: "absolute", left: TEXT_X, top: 240, opacity: 1 - swapOut }}>
        <Line at={10} size={150} color={c.paper} weight={800}>
          So. What&rsquo;s
        </Line>
        <div style={{ display: "flex", gap: 34 }}>
          <Line at={18} size={150} color={c.paper} weight={800}>
            your
          </Line>
          <Line at={22} size={150} color={c.signal} weight={800}>
            why?
          </Line>
        </div>
        <div style={{ height: 44 }} />
        <Line at={40} size={54} color={c.paper} weight={600} tracking="-0.025em">
          riyazdesigns.netlify.app
        </Line>
        <div style={{ height: 14 }} />
        <Line at={48} size={42} color={c.paper300} weight={500} tracking="-0.02em">
          Open to product design roles
        </Line>
      </div>
      <WhyText opacity={swapIn} y={(1 - swapIn) * 40} bounce={0} />
    </AbsoluteFill>
  );
};

const SCENES: [React.FC, number][] = [
  [Open, OPEN_DUR],
  [Pecuc, PECUC_DUR],
  [Atrc, ATRC_DUR],
  [Career, CL_DUR],
  [WhyMe, ME_DUR],
  [Outro, OUTRO_DUR],
];

export const FilmWhy: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: c.ink, fontFamily: sans }}>
      {SCENES.map(([C, dur], i) => {
        const from = at;
        at += dur;
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <C />
          </Sequence>
        );
      })}
      <Grain opacity={0.06} />
    </AbsoluteFill>
  );
};

