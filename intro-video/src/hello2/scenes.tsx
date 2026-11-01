import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Backdrop, c, Chip, ease, Label, Laptop, ramp, Rise, s, sans, serif, settle, Stage } from "../hello/kit";
import { ImageRing, ringPose, Rows, Slam, Stack, TextRing } from "./kinetic";

const L = 160;
export const CENTER = { x: 960, y: 540 };
export const DOT = 34;

const Dot: React.FC<{ x: number; y: number; scale?: number; size?: number; style?: React.CSSProperties }> = ({ x, y, scale = 1, size = DOT, style }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: 999,
      background: c.signal,
      transform: `scale(${scale})`,
      zIndex: 5000,
      ...style,
    }}
  />
);

/** Serif-italic word with the lime rule drawn under it at `at`. */
const MarkWord: React.FC<{ children: string; at: number; size: number }> = ({ children, at, size }) => {
  const f = useCurrentFrame();
  const inAt = at - 14;
  const p = ramp(f, inAt, inAt + 14, 0, 1, ease.out);
  return (
    <span
      style={{
        position: "relative",
        display: "inline-block",
        fontFamily: serif,
        fontWeight: 400,
        letterSpacing: "-0.01em",
        color: c.paper,
        opacity: p,
        transform: `translateY(${(1 - p) * 0.4}em)`,
      }}
    >
      {children}
      <span
        style={{
          position: "absolute",
          left: 0,
          right: "0.1em",
          bottom: "0.02em",
          height: Math.max(4, size * 0.065),
          borderRadius: 99,
          background: c.signal,
          transformOrigin: "left",
          transform: `scaleX(${ramp(f, at, at + s(0.4), 0, 1, ease.inOut)})`,
        }}
      />
    </span>
  );
};

/* ================================================================ 1 HOOK */
export const HOOK_DUR = s(3.2);

export const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  // the intro hands over a full-size dot at the centre
  const born = 1;
  const dotOut = ramp(f, 16, 30, 0, 1, ease.in);
  const cursorOn = f >= 62 && Math.floor((f - 62) / 18) % 2 === 0;
  const wipe = ramp(f, HOOK_DUR - 40, HOOK_DUR, 0, 1, ease.in);
  const base = interpolate(wipe, [0, 1], [1700, -40]);
  return (
    <AbsoluteFill>
      <Backdrop />
      <Dot x={CENTER.x} y={CENTER.y} scale={born * (1 - dotOut)} />
      <div style={{ position: "absolute", left: L, top: 270 }}>
        <Slam text="Hiring a product" at={18} size={172} stagger={1.5} seed="hook1" />
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 10 }}>
          <Slam text="designer?" at={36} size={172} stagger={2} seed="hook2" />
          <div style={{ width: 26, height: 132, borderRadius: 6, background: c.signal, marginTop: 14, opacity: cursorOn ? 1 : 0 }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: L + 6, top: 720 }}>
        <Rise at={88} size={54} weight={400} color={c.paper300} tracking="-0.015em" step={3}>
          Give me twenty seconds.
        </Rise>
      </div>
      {/* the diagonal lime wipe that carries the cut */}
      <AbsoluteFill style={{ background: c.signal, clipPath: `polygon(0 1080px, 0 ${base}px, 1920px ${base - 620}px, 1920px 1080px)` }} />
    </AbsoluteFill>
  );
};

/* ============================================================== 2 SKILLS */
export const SKILLS_DUR = s(4.2);

const FLASH = 22;
const flashes = [
  { word: "RESEARCHER", bg: c.signal, fg: c.ink, chroma: undefined },
  { word: "STRATEGIST", bg: c.ink, fg: c.paper, chroma: [c.signal, c.ink600] as [string, string] },
  { word: "UI DESIGNER", bg: c.paper, fg: c.ink, chroma: [c.signal, "#c9c8c2"] as [string, string] },
  { word: "PROTOTYPER", bg: c.ink, fg: c.paper, chroma: [c.ink600, c.signal] as [string, string] },
];

const Flash: React.FC<{ word: string; bg: string; fg: string; chroma?: [string, string]; i: number }> = ({ word, bg, fg, chroma, i }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: bg, alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${1 + f * 0.004}) translateX(${(i % 2 ? -1 : 1) * f * 1.5}px)` }}>
        <Slam text={word} at={0} size={232} weight={900} color={fg} stagger={1} seed={`flash-${i}`} chroma={chroma} />
      </div>
    </AbsoluteFill>
  );
};

const P = { x: 520, y: 540, r: 215 };

const SkillsCard: React.FC = () => {
  const f = useCurrentFrame();
  const iris = ramp(f, 0, 26, 0, 1, ease.out);
  const spin = -f * 0.012 - 0.8;
  return (
    <AbsoluteFill>
      <Backdrop />
      {/* the ring passes behind the portrait at the back and in front of it at the front */}
      <TextRing text="RESEARCHER · STRATEGIST · UI DESIGNER · PROTOTYPER · " cx={P.x} cy={P.y} size={58} spin={spin} tilt={20} opacity={ramp(f, 6, 26)} color={c.paper} />
      <div
        style={{
          position: "absolute",
          left: P.x - P.r,
          top: P.y - P.r,
          width: P.r * 2,
          height: P.r * 2,
          borderRadius: 999,
          overflow: "hidden",
          zIndex: 2000,
          clipPath: `circle(${iris * 100}% at 50% 50%)`,
          background: c.signal,
        }}
      >
        <Img src={staticFile("hello/portrait.webp")} style={{ width: "100%", height: "100%", opacity: ramp(f, 8, 24) }} />
      </div>
      <div style={{ position: "absolute", left: 960, top: 340 }}>
        <Rise at={10} size={124} weight={700} color={c.paper500} tracking="-0.05em">
          Four jobs.
        </Rise>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 124, letterSpacing: "-0.05em", lineHeight: 1.04, color: c.paper, display: "flex", gap: 30 }}>
          <Slam text="One" at={22} size={124} weight={700} stagger={2} seed="one" wobble={0.4} />
          <span style={{ position: "relative" }}>
            <Slam text="designer." at={28} size={124} weight={700} stagger={2} seed="designer" wobble={0.4} />
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 10,
                bottom: -14,
                height: 8,
                borderRadius: 99,
                background: c.signal,
                transformOrigin: "left",
                transform: `scaleX(${ramp(f, 52, 76, 0, 1, ease.inOut)})`,
              }}
            />
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const Skills: React.FC = () => (
  <Stage dur={SKILLS_DUR} enter="none">
    {flashes.map((fl, i) => (
      <Sequence key={fl.word} from={i * FLASH} durationInFrames={FLASH}>
        <Flash {...fl} i={i} />
      </Sequence>
    ))}
    <Sequence from={FLASH * 4} durationInFrames={62}>
      <AbsoluteFill style={{ background: c.ink, alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", width: 1480, height: 210 }}>
          <Stack text="FOUR JOBS." at={0} size={228} count={9} />
        </div>
      </AbsoluteFill>
    </Sequence>
    <Sequence from={FLASH * 4 + 62}>
      <SkillsCard />
    </Sequence>
  </Stage>
);

/* ========================================================= 3 SUBTRACTION */
export const CUT_DUR = s(3.2);

const Cut: React.FC<{ from: string; to: string; label: string; at: number; x: number }> = ({ from, to, label, at, x }) => {
  const f = useCurrentFrame();
  const strike = ramp(f, at + 10, at + 22, 0, 1, ease.inOut);
  return (
    <div style={{ position: "absolute", left: x, top: 560, width: 520 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 18, fontFamily: sans, fontWeight: 800, fontSize: 168, lineHeight: 1, letterSpacing: "-0.05em" }}>
        <span style={{ position: "relative", color: c.paper500, opacity: ramp(f, at, at + 8) }}>
          {from}
          <span style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 8, background: c.paper500, transformOrigin: "left", transform: `scaleX(${strike})` }} />
        </span>
        <span style={{ color: c.paper500, fontWeight: 400, fontSize: 100, opacity: ramp(f, at + 16, at + 24) }}>{"→"}</span>
        <Slam text={to} at={at + 20} size={168} weight={800} seed={`cut-${from}`} />
      </div>
      <div style={{ height: 22 }} />
      <Rise at={at + 26} size={34} weight={400} color={c.paper300} tracking="-0.01em" step={2}>
        {label}
      </Rise>
    </div>
  );
};

export const Subtraction: React.FC = () => (
  <Stage dur={CUT_DUR}>
    <Backdrop />
    <div style={{ position: "absolute", left: L, top: 170 }}>
      <Rise at={8} size={100} weight={600} tracking="-0.045em">
        My best work is
      </Rise>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 100, letterSpacing: "-0.045em", lineHeight: 1.08, display: "flex", gap: 26 }}>
        <Rise at={16} size={100} weight={600} tracking="-0.045em">
          what I
        </Rise>
        <span style={{ fontSize: 100, lineHeight: 1.08 }}>
          <MarkWord at={56} size={100}>
            took out.
          </MarkWord>
        </span>
      </div>
    </div>
    <Cut from="37" to="7" label="navigation links" at={44} x={L} />
    <Cut from="4" to="2" label="clicks to content" at={60} x={L + 560} />
    <Cut from="9" to="1" label="websites, merged into one hub" at={76} x={L + 1080} />
  </Stage>
);

/* ============================================================ 4 WORK RING */
export const RING_DUR = s(2.8);

export const RING_SCREENS = [
  "hello/cl-student.webp",
  "hello/cl-counsellor.webp",
  "hello/pecuc-new.webp",
  "hello/atrc-landing.webp",
  "hello/cl-school.webp",
  "hello/pecuc-ba-02-new.webp",
  "hello/atrc-question.webp",
  "hello/cl-admin.webp",
  "hello/pecuc-ba-03-new.webp",
  "hello/atrc-result.webp",
  "hello/wall-counsellor-04-appointments.webp",
  "hello/pecuc-ba-04-new.webp",
];
const TARGET = 1; // the CareerLogica counsellor dashboard comes to the front and lands in the laptop
const RC = { x: 960, y: 560 };
const CARD = { w: 380, h: 238 };
const RADIUS = 700;
const LAND = 108;

/* Where the next scene's laptop screen sits; the hand-off lands exactly here. */
const LAPTOP = { x: 830, y: 230, w: 920 };
const bezel = LAPTOP.w * 0.024;
export const SCREEN = {
  x: LAPTOP.x + LAPTOP.w * 0.07 + bezel,
  y: LAPTOP.y + bezel,
  w: LAPTOP.w - bezel * 2,
  h: (LAPTOP.w - bezel * 2) / 1.6,
};

const ringSpin = (f: number) => {
  const target = -(TARGET / RING_SCREENS.length) * Math.PI * 2;
  return target - Math.PI * 2 * 1.6 * (1 - ease.out(Math.min(1, f / LAND))) + Math.max(0, f - LAND) * 0.006;
};

export const WorkRing: React.FC = () => {
  const f = useCurrentFrame();
  const spin = ringSpin(f);
  const detach = ramp(f, LAND, RING_DUR - 12, 0, 1, ease.inOut);
  const rest = 1 - ramp(f, LAND, LAND + 30);
  const lead = ringPose(TARGET, RING_SCREENS.length, ringSpin(LAND), RADIUS, 12);
  const from = { cx: RC.x + lead.x, cy: RC.y + lead.y, w: CARD.w * lead.scale };
  const to = { cx: SCREEN.x + SCREEN.w / 2, cy: SCREEN.y + SCREEN.h / 2, w: SCREEN.w };
  const w = interpolate(detach, [0, 1], [from.w, to.w]);
  const cx = interpolate(detach, [0, 1], [from.cx, to.cx]);
  const cy = interpolate(detach, [0, 1], [from.cy, to.cy]);
  const blurIn = Math.max(0, 1 - f / 24) * 14;

  return (
    <Stage dur={RING_DUR} exit="none">
      <Backdrop />
      <AbsoluteFill style={{ filter: blurIn > 0.3 ? `blur(${blurIn}px)` : undefined }}>
        <ImageRing srcs={RING_SCREENS} cx={RC.x} cy={RC.y} w={CARD.w} h={CARD.h} radius={RADIUS} spin={spin} tilt={12} opacity={rest} skip={f >= LAND ? TARGET : -1} />
        <Dot x={RC.x} y={RC.y} size={26} style={{ zIndex: 2000, opacity: rest }} />
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 70, width: 1920, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: rest, zIndex: 5000 }}>
        <Slam text="SELECTED WORK" at={6} size={120} weight={900} stagger={1.5} seed="selected" chroma={[c.signal, c.ink600]} wobble={0.5} />
        <Label at={20} size={22}>CareerLogica · PECUC · ATRC · 2025 to 2026</Label>
      </div>
      {f >= LAND && (
        <Img
          src={staticFile(RING_SCREENS[TARGET])}
          style={{ position: "absolute", left: cx - w / 2, top: cy - w / 1.6 / 2, width: w, height: w / 1.6, borderRadius: interpolate(detach, [0, 1], [14, 5]), zIndex: 6000, boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}
        />
      )}
    </Stage>
  );
};

/* ========================================================= 5 CAREERLOGICA */
export const CL_DUR = s(3.4);

const CL_SCREENS = ["hello/cl-counsellor.webp", "hello/cl-student.webp", "hello/cl-school.webp", "hello/cl-admin.webp"];
const CL_ROLES = ["Counsellor", "Student", "School", "Admin"];
const CL_CHANGES = [70, 112, 154];

export const CareerLogica: React.FC = () => {
  const f = useCurrentFrame();
  const frame = ramp(f, 0, 16);
  const scroll = CL_CHANGES.reduce((acc, at) => acc + ramp(f, at, at + 20, 0, 1, ease.inOut), 0);
  const active = CL_CHANGES.filter((at) => f >= at + 10).length;
  return (
    <Stage dur={CL_DUR} enter="none">
      <Backdrop />
      <div style={{ position: "absolute", left: LAPTOP.x, top: LAPTOP.y, opacity: frame }}>
        <Laptop width={LAPTOP.w}>
          <div style={{ transform: `translateY(${-scroll * SCREEN.h}px)` }}>
            {CL_SCREENS.map((src) => (
              <Img key={src} src={staticFile(src)} style={{ display: "block", width: SCREEN.w, height: SCREEN.h }} />
            ))}
          </div>
        </Laptop>
      </div>
      <div style={{ position: "absolute", left: L, top: 250, width: 640 }}>
        <Label at={4} size={22}>001 · CareerLogica</Label>
        <div style={{ height: 26 }} />
        <Rise at={8} size={68} weight={500} tracking="-0.035em" step={3}>
          Four users who want different things.
        </Rise>
        <Rise at={20} size={68} weight={500} color={c.paper500} tracking="-0.035em" step={3}>
          One system for all of them.
        </Rise>
        <div style={{ height: 44 }} />
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {CL_ROLES.map((r, i) => (
            <Chip key={r} at={34 + i * 4} filled={i === active}>
              {r}
            </Chip>
          ))}
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================ 6 PECUC */
export const PECUC_DUR = s(3.4);

export const Pecuc: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lap = 900;
  const w = lap - lap * 0.024 * 2;
  const h = w / 1.6;
  const enter = settle(f, fps, 2, 120);
  const handle = settle(f, fps, 36, 220);
  const wipe = ramp(f, 46, 112, 0, 1, ease.inOut);
  const x = wipe * w;
  const gone = ramp(f, 116, 132);
  return (
    <Stage dur={PECUC_DUR}>
      <Backdrop />
      <div style={{ position: "absolute", left: 70, top: 230, transform: `translateX(${(1 - enter) * -200}px)` }}>
        <Laptop width={lap}>
          <Img src={staticFile("hello/pecuc-old.webp")} style={{ position: "absolute", width: w, height: h }} />
          <Img src={staticFile("hello/pecuc-new.webp")} style={{ position: "absolute", width: w, height: h, clipPath: `inset(0 ${w - x}px 0 0)` }} />
          <div style={{ position: "absolute", left: x - 2, top: 0, width: 4, height: h, background: c.signal, opacity: handle * (1 - gone) }} />
          <div style={{ position: "absolute", left: x - 22, top: h / 2 - 22, width: 44, height: 44, borderRadius: 99, background: c.signal, boxShadow: "0 0 0 6px rgba(8,8,10,0.55)", transform: `scale(${handle * (1 - gone)})` }} />
        </Laptop>
      </div>
      <div style={{ position: "absolute", left: 1180, top: 270, width: 660 }}>
        <Label at={6} size={22}>002 · PECUC</Label>
        <div style={{ height: 26 }} />
        <Rise at={10} size={76} weight={500} tracking="-0.035em" step={3}>
          UNICEF trusted their work.
        </Rise>
        <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
          <Rise at={24} size={76} weight={500} color={c.paper500} tracking="-0.035em" step={3}>
            Their website
          </Rise>
          <div style={{ fontFamily: serif, fontSize: 76 }}>
            <Slam text={"didn’t."} at={108} size={76} weight={400} tracking="-0.01em" seed="didnt" chroma={[c.signal, c.ink600]} wobble={0.3} style={{ fontFamily: serif, fontStyle: "italic" }} />
          </div>
        </div>
        <div style={{ height: 34 }} />
        <Rise at={124} size={32} weight={400} color={c.paper300} tracking="-0.01em" step={2}>
          So I rebuilt it around 35 years of proof.
        </Rise>
      </div>
    </Stage>
  );
};

/* ================================================================= 7 ATRC */
export const ATRC_DUR = s(3.2);

export const Atrc: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lap = 880;
  const w = lap - lap * 0.024 * 2;
  const h = w / 1.6;
  const enter = settle(f, fps, 2, 120);
  const swap = ramp(f, 66, 92, 0, 1, ease.out);
  return (
    <Stage dur={ATRC_DUR}>
      <Backdrop />
      <AbsoluteFill style={{ background: "radial-gradient(50% 50% at 72% 60%, rgba(98,40,255,0.2) 0%, rgba(98,40,255,0) 70%)" }} />
      <div style={{ position: "absolute", left: 880, top: 240, transform: `translateX(${(1 - enter) * 200}px)` }}>
        <Laptop width={lap}>
          <Img src={staticFile("hello/atrc-question.webp")} style={{ position: "absolute", width: w, height: h, objectFit: "cover", filter: `brightness(${1 - swap * 0.5})` }} />
          <Img src={staticFile("hello/atrc-still.webp")} style={{ position: "absolute", width: w, height: h, objectFit: "cover", opacity: swap, transform: `translateY(${(1 - swap) * 60}px)` }} />
        </Laptop>
      </div>
      <div style={{ position: "absolute", left: L, top: 270, width: 700 }}>
        <Label at={6} size={22}>003 · ATRC, Abu Dhabi</Label>
        <div style={{ height: 26 }} />
        <Rise at={10} size={80} weight={500} tracking="-0.035em" step={3}>
          Fifteen-year-olds leave mid-test.
        </Rise>
        <div style={{ fontFamily: sans, fontSize: 80, fontWeight: 500, letterSpacing: "-0.035em", lineHeight: 1.08, color: c.paper500 }}>
          <Rise at={70} size={80} weight={500} color={c.paper500} tracking="-0.035em" step={3}>
            So every exit got a
          </Rise>
          <span style={{ color: c.paper, display: "inline-block", opacity: f >= 96 ? 1 : 0, transform: `translateY(${ramp(f, 96, 112, 30, 0)}px)` }}>
            <MarkWord at={110} size={80}>
              way back.
            </MarkWord>
          </span>
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================ 8 TOOLS */
export const TOOLS_DUR = s(3.2);
const TOOL_SRCS = ["figma", "claude", "chatgpt", "miro", "framer", "relume", "mobin", "github", "antigravity"].map((t) => `tools/${t}.webp`);

export const Tools: React.FC = () => {
  const f = useCurrentFrame();
  const spin = -Math.PI * 2 * 1.2 * (1 - ease.out(Math.min(1, f / 90))) - f * 0.008;
  const open = ramp(f, 0, 30, 0.4, 1, ease.out);
  return (
    <Stage dur={TOOLS_DUR}>
      <Backdrop />
      <ImageRing srcs={TOOL_SRCS} cx={960} cy={300} w={168} h={168} radius={600 * open} spin={spin} tilt={15} radiusPx={38} contain shade tile billboard />
      <Dot x={960} y={300} size={56} style={{ zIndex: 2000 }} />
      <div style={{ position: "absolute", left: 0, top: 680, width: 1920, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Rise at={30} size={104} weight={600} tracking="-0.045em" style={{ justifyContent: "center" }}>
          AI writes the first draft.
        </Rise>
        <div style={{ display: "flex", gap: 26, alignItems: "baseline", fontFamily: sans, fontWeight: 600, fontSize: 104, letterSpacing: "-0.045em", lineHeight: 1.08 }}>
          <Rise at={50} size={104} weight={600} tracking="-0.045em">
            I make the
          </Rise>
          <span style={{ display: "inline-block", opacity: f >= 66 ? 1 : 0, transform: `scale(${ramp(f, 66, 80, 1.4, 1, ease.out)})`, transformOrigin: "left bottom" }}>
            <MarkWord at={82} size={104}>
              calls.
            </MarkWord>
          </span>
        </div>
      </div>
    </Stage>
  );
};

/* ================================================================ 9 OUTRO */
export const OUTRO_DUR = s(4);
/* Measured from a still: the wordmark's full stop at rest. */
export const STOP = { x: 1681, y: 440 };

export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const rows = 1 - ramp(f, 56, 96);
  const leave = ramp(f, OUTRO_DUR - 52, OUTRO_DUR - 28, 0, 1, ease.in);
  const home = ramp(f, OUTRO_DUR - 44, OUTRO_DUR - 12, 0, 1, ease.inOut);
  const vanish = ramp(f, OUTRO_DUR - 14, OUTRO_DUR, 0, 1, ease.in);
  const stopIn = settle(f, fps, 70, 220);
  const dotX = interpolate(home, [0, 1], [STOP.x, CENTER.x]);
  const dotY = interpolate(home, [0, 1], [STOP.y, CENTER.y]) - Math.sin(Math.PI * home) * 120;
  const avatar = settle(f, fps, 40, 120);
  const rule = ramp(f, 84, 120, 0, 1, ease.inOut);
  const pulse = (Math.sin(f / 9) + 1) / 2;
  return (
    <Stage dur={OUTRO_DUR} exit="none">
      <Backdrop />
      <AbsoluteFill style={{ opacity: rows, filter: rows < 0.98 ? `blur(${(1 - rows) * 8}px)` : undefined }}>
        <Rows text="Riyazdesigns" size={212} rows={5} top={-150} gap={225} speed={6} skipRow={2} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 1 - leave, filter: leave > 0.02 ? `blur(${leave * 10}px)` : undefined }}>
        <div style={{ position: "absolute", left: L, top: 300, width: 176, height: 176, borderRadius: 999, overflow: "hidden", boxShadow: `0 0 0 2px ${c.ink700}`, transform: `scale(${avatar})` }}>
          <Img src={staticFile("hello/portrait.webp")} style={{ width: "100%", height: "100%" }} />
        </div>
        <div style={{ position: "absolute", left: 380, top: 285 }}>
          <Slam text="Riyazdesigns" at={4} size={212} weight={700} stagger={2} seed="mark" wobble={0.25} tracking="-0.055em" />
        </div>
        <div style={{ position: "absolute", left: L, top: 560, width: 1600, height: 2, background: c.ink700, transformOrigin: "left", transform: `scaleX(${rule})` }} />
        <div style={{ position: "absolute", left: L, top: 604, display: "flex", alignItems: "baseline", gap: 18, fontFamily: sans, fontSize: 56, fontWeight: 500, letterSpacing: "-0.03em" }}>
          <Rise at={96} size={56} weight={500} tracking="-0.03em" step={3}>
            Hiring a product designer?
          </Rise>
          <Rise at={112} size={56} weight={500} color={c.paper500} tracking="-0.03em" step={3}>
            Let&rsquo;s talk.
          </Rise>
        </div>
        <div style={{ position: "absolute", left: L, top: 712, display: "flex", gap: 14, alignItems: "center" }}>
          {["riyazdesigns.netlify.app", "malekriyaz606@gmail.com", "linkedin.com/in/riyaz-malek"].map((t, i) => (
            <Chip key={t} at={120 + i * 6} filled={i === 0} size={24}>
              {t}
            </Chip>
          ))}
        </div>
        <div style={{ position: "absolute", left: L, top: 812, display: "flex", alignItems: "center", gap: 16, opacity: ramp(f, 136, 156) }}>
          <div style={{ position: "relative", width: 16, height: 16 }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 99, background: c.signal }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 99, border: `2px solid ${c.signal}`, opacity: 1 - pulse, transform: `scale(${1 + pulse * 1.4})` }} />
          </div>
          <div style={{ fontFamily: sans, fontSize: 30, color: c.paper200, letterSpacing: "-0.01em" }}>Open to product design roles</div>
        </div>
      </AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: dotX - DOT / 2,
          top: dotY - DOT / 2,
          width: DOT,
          height: DOT,
          borderRadius: 999,
          background: c.signal,
          opacity: f < 70 ? 0 : 1,
          transform: `translateY(${(1 - stopIn) * -140}px) scale(${Math.min(1, stopIn * 1.2) * (1 - vanish)})`,
        }}
      />
    </Stage>
  );
};
