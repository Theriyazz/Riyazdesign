import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, mono, ramp, sans, settle } from "../hello/kit";
import { THEMES } from "./board/PositioningBoard";
import { Frame, k } from "./FilmFile";
import { Cursor, Grain, Line, Riyaz, track } from "./kit";

/* The positioning cut: one take across a design canvas in Lime dark. What he does
   comes first, then who it's for, then his name, then the work at full speed.
   Frame 0 is the poster and the camera flies back to it, so the loop has no cut.

   Clients stay apart: each carousel in the work section shows one client only. */

/** Every time below is written at 1x; this runs the whole timeline faster. */
const SPEED = 1.25;
const s = (seconds: number) => Math.round((seconds * 60) / SPEED);

export const POSITIONING_DUR = s(44);

const p = THEMES["lime-dark"];
const c = { ground: p.ground, ink: p.ink, surface: p.paper, lime: p.him, onLime: p.onHim, dots: p.dots, halo: p.halo };

/* ---- world layout: scene centres on the canvas, and when the camera holds on each */
const POS = { s1: [0, 0], s2: [2200, 0], s3: [4400, 0], s4: [4400, 1500], s5: [2200, 1500], s7: [0, 1500], s8: [0, 3000], s9: [2200, 3000] } as const;
type SceneId = keyof typeof POS;
const W = (id: SceneId, x: number, y: number): [number, number] => [POS[id][0] + x - 960, POS[id][1] + y - 540];

const HOLD: [SceneId, number, number][] = [
  ["s1", 0, 4.4],
  ["s2", 5, 8.4],
  ["s3", 9, 13.4],
  ["s4", 14, 17.4],
  ["s5", 18, 20.7],
  ["s7", 29.4, 31.8],
  ["s8", 32.4, 39],
  ["s9", 39.6, 43.1],
];
const camStops = () => {
  const x: [number, number][] = [];
  const y: [number, number][] = [];
  const z: [number, number][] = [];
  HOLD.forEach(([id, a, b], i) => {
    x.push([s(a), POS[id][0]], [s(b), POS[id][0]]);
    y.push([s(a), POS[id][1]], [s(b), POS[id][1]]);
    z.push([s(a), 1], [s(b), 1]);
    const next = HOLD[i + 1];
    if (next && next[1] - b < 2) z.push([s((b + next[1]) / 2), 0.74]);
  });
  // Home to the poster for the loop.
  x.push([s(43.85), 0], [s(44), 0]);
  y.push([s(43.85), 0], [s(44), 0]);
  z.push([s(43.5), 0.7], [s(43.85), 1], [s(44), 1]);
  return { x, y, z };
};
const CAM = camStops();

const him: [number, number, number][] = [
  [1.0, ...W("s1", 2150, 180)],
  [1.8, ...W("s1", 1380, 640)],
  [4.4, ...W("s1", 1380, 640)],
  [5, ...W("s2", 760, 520)],
  [6.2, ...W("s2", 1000, 560)],
  [7.2, ...W("s2", 1560, 560)],
  [8.4, ...W("s2", 1560, 560)],
  [9, ...W("s3", 1700, 560)],
  [11, ...W("s3", 1660, 345)],
  [13.4, ...W("s3", 1660, 345)],
  [14, ...W("s4", 1050, 330)],
  [17.4, ...W("s4", 1050, 330)],
  [18, ...W("s5", 830, 260)],
  [29.4, ...W("s7", 1640, 830)],
  [31.8, ...W("s7", 1640, 830)],
  [32.4, ...W("s8", 1720, 980)],
  [39, ...W("s8", 1720, 980)],
  [39.6, ...W("s9", 1000, 520)],
  [43.1, ...W("s9", 1000, 520)],
  [43.85, ...W("s1", 2150, 180)],
];
const you: [number, number, number][] = [
  [0, ...W("s1", 120, 800)],
  [4.4, ...W("s1", 120, 800)],
  [5, ...W("s2", 300, 980)],
  [8.4, ...W("s2", 300, 980)],
  [9, ...W("s3", 1400, 800)],
  [13.4, ...W("s3", 1400, 800)],
  [14, ...W("s4", 980, 800)],
  [17.4, ...W("s4", 980, 800)],
  [18, ...W("s5", 1500, 900)],
  [29.4, ...W("s7", 180, 1010)],
  [31.8, ...W("s7", 180, 1010)],
  [32.4, ...W("s8", 180, 1000)],
  [39, ...W("s8", 180, 1000)],
  [39.6, ...W("s9", 1320, 300)],
  [41.4, ...W("s9", 1320, 300)],
  [42.2, ...W("s9", 1130, 905)],
  [43.1, ...W("s9", 1130, 905)],
  [43.85, ...W("s1", 120, 800)],
];
const pathAt = (f: number, path: [number, number, number][]) => ({
  x: track(f, path.map((q) => [s(q[0]), q[1]] as [number, number])),
  y: track(f, path.map((q) => [s(q[0]), q[2]] as [number, number])),
});

/* ---- small parts */
const Scene: React.FC<{ id: SceneId; children: React.ReactNode }> = ({ id, children }) => (
  <div style={{ position: "absolute", left: POS[id][0] - 960, top: POS[id][1] - 540, width: 1920, height: 1080 }}>{children}</div>
);
const T: React.FC<{ size: number; w?: number; color?: string; x?: number; y?: number; lh?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ size, w = 900, color = c.ink, x, y, lh = 0.98, children, style }) => (
  <div style={{ ...(x === undefined ? {} : { position: "absolute" as const, left: x, top: y }), fontFamily: sans, fontSize: size, fontWeight: w, color, lineHeight: lh, letterSpacing: size > 60 ? "-0.05em" : "-0.025em", whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Pop: React.FC<{ at: number; stiffness?: number; origin?: string; children: React.ReactNode; style?: React.CSSProperties }> = ({ at, stiffness = 170, origin = "50% 50%", children, style }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = f < at ? 0 : settle(f, fps, at, stiffness);
  return <div style={{ transform: `scale(${q})`, transformOrigin: origin, ...style }}>{children}</div>;
};
const Chip: React.FC<{ dark?: boolean; size?: number; children: React.ReactNode }> = ({ dark, size = 42, children }) => (
  <div style={{ padding: `${size * 0.36}px ${size * 0.66}px`, background: dark ? c.ink : "transparent", border: `4px solid ${c.ink}`, color: dark ? c.ground : c.ink, fontFamily: sans, fontWeight: 700, fontSize: size, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{children}</div>
);
const Halo: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: c.halo }} />;

/* ---- 1: the statement, also the poster. Everything is at rest on frame 0. */
const S1: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const home = ramp(f, s(43.7), s(43.95));
  const notes: [string, string, string, number, number, number][] = [
    ["Strategy", c.surface, c.ink, 1400, 70, -3],
    ["Planning", c.lime, c.onLime, 1480, 390, 2],
    ["Execution", c.ink, c.surface, 1380, 710, -2],
  ];
  return (
    <Scene id="s1">
      <T x={90} y={80} size={158} lh={0.96}>
        I solve
        <br />
        business
        <br />
        problems
        <br />
        with UX.
      </T>
      <Halo x={1070} y={760} r={315} />
      <Riyaz h={640} x={820} y={420} breathe={f > s(40) ? 1 - home : 1} />
      {notes.map(([t, bg, fg, x, y, r], i) => {
        const at = s(0.95) + i * 16;
        const bump = f < at || f > at + 50 ? 0 : (1 - spring({ frame: f - at, fps, config: { damping: 9, stiffness: 240 } })) * 0.16;
        return (
          <div key={t} style={{ position: "absolute", left: x, top: y, width: 400, height: 290, background: bg, transform: `rotate(${r + bump * 20}deg) scale(${1 + bump})`, boxShadow: `0 18px 36px rgba(0,0,0,0.3), inset 0 0 0 2px ${c.dots}`, display: "flex", alignItems: i === 2 ? "flex-start" : "flex-end", padding: 30, boxSizing: "border-box" }}>
            <T size={72} color={fg}>
              {t}
            </T>
          </div>
        );
      })}
    </Scene>
  );
};

/* ---- 2: who it's for */
const S2: React.FC = () => {
  const f = useCurrentFrame();
  const sel = f < s(5.8) ? -1 : f < s(6.8) ? 0 : f < s(7.6) ? 1 : 2;
  const items: [string, string, string, string][] = [
    ["Small and medium businesses", "small_medium_biz", c.surface, c.ink],
    ["Early-stage startups", "early_stage", c.ink, c.surface],
    ["Non-profits", "non_profit", c.lime, c.onLime],
  ];
  return (
    <Scene id="s2">
      <div style={{ position: "absolute", left: 100, top: 70 }}>
        <Line at={s(4.95)} size={110} color={c.ink} weight={900} tracking="-0.05em">
          Built for three kinds of team.
        </Line>
      </div>
      {items.map(([t, name, bg, fg], i) => (
        <Pop key={name} at={s(5.15) + i * 9} stiffness={140} style={{ position: "absolute", left: 0, top: 0 }}>
          <Frame x={100 + i * 590} y={330} w={540} h={600} name={name} bg={bg} selected={sel === i}>
            <div style={{ position: "absolute", left: 36, right: 36, bottom: 36, fontFamily: sans, fontWeight: 900, fontSize: 84, lineHeight: 0.98, letterSpacing: "-0.05em", color: fg }}>{t}</div>
          </Frame>
        </Pop>
      ))}
    </Scene>
  );
};

/* ---- 3: the word swap */
const S3: React.FC = () => {
  const f = useCurrentFrame();
  const swap = ramp(f, s(11.1), s(11.55), 0, 1, ease.inOut);
  const box = interpolate(swap, [0, 1], [1150, 830]);
  const menu = ramp(f, s(9.9), s(10.3));
  const donors = swap > 0.5;
  return (
    <Scene id="s3">
      <div style={{ position: "absolute", left: 100, top: 130 }}>
        <Line at={s(8.95)} size={210} color={c.ink} weight={900} tracking="-0.05em">
          Reach more
        </Line>
      </div>
      <div style={{ position: "absolute", left: 100, top: 366, height: 216, width: 1200, overflow: "hidden", opacity: ramp(f, s(9.1), s(9.3)) }}>
        <T x={0} y={-6 - swap * 216} size={210}>
          customers.
        </T>
        <T x={0} y={-6 + (1 - swap) * 216} size={210}>
          donors.
        </T>
      </div>
      <div style={{ position: "absolute", left: 88, top: 366, width: box, height: 216, border: `5px solid ${c.ink}`, opacity: ramp(f, s(9.5), s(9.8)) }} />
      <div style={{ position: "absolute", left: 1320, top: 150, width: 500, background: c.ink, padding: "28px 0", opacity: menu, transform: `translateY(${(1 - menu) * 30}px)` }}>
        <div style={{ fontFamily: mono, fontSize: 30, color: c.surface, padding: "0 32px 22px" }}>Property / audience</div>
        {["customers", "donors"].map((t, i) => {
          const on = (i === 1) === donors;
          return (
            <div key={t} style={{ padding: "22px 32px", background: on ? c.lime : "transparent" }}>
              <T size={64} w={700} color={on ? c.onLime : c.surface}>
                {t}
              </T>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 104, top: 690 }}>
        <Line at={s(11.8)} size={86} color={c.ink} weight={700}>
          With CRO landing pages
        </Line>
        <Line at={s(12)} size={86} color={c.ink} weight={700}>
          and websites.
        </Line>
      </div>
    </Scene>
  );
};

/* ---- 4: 0 to 1 */
const S4: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arrow = ramp(f, s(14.5), s(14.95), 0, 1, ease.inOut);
  const one = f < s(14.9) ? 0 : spring({ frame: f - s(14.9), fps, config: { damping: 10, stiffness: 220, mass: 0.7 } });
  return (
    <Scene id="s4">
      <div style={{ position: "absolute", left: 90, top: 60, display: "flex", fontFamily: sans, fontWeight: 900, fontSize: 400, lineHeight: 1, letterSpacing: "-0.05em", color: c.ink }}>
        <span>0</span>
        <span style={{ clipPath: `inset(0 ${(1 - arrow) * 100}% 0 0)` }}>&rarr;</span>
        <span style={{ display: "inline-block", transform: `scale(${one})`, transformOrigin: "50% 80%" }}>1</span>
      </div>
      <div style={{ position: "absolute", left: 96, top: 510 }}>
        <Line at={s(15.2)} size={100} color={c.ink} weight={900} tracking="-0.05em">
          From idea to live product.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 96, top: 680, display: "flex", gap: 16 }}>
        <Pop at={s(15.6)}>
          <Chip size={48}>Landing page</Chip>
        </Pop>
        <Pop at={s(15.75)}>
          <Chip size={48}>Website</Chip>
        </Pop>
        <Pop at={s(15.9)}>
          <Chip size={48} dark>
            Dashboards
          </Chip>
        </Pop>
      </div>
      <div style={{ position: "absolute", left: 96, top: 850 }}>
        <Line at={s(16.1)} size={56} color={c.ink} weight={700}>
          For startups, at any stage.
        </Line>
      </div>
      <Halo x={1580} y={520} r={300} />
      <Riyaz h={560} x={1370} y={250} />
    </Scene>
  );
};

/* ---- 5: the cursor's little tag swells into the name */
const S5: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const tag = f < s(18) ? 0 : spring({ frame: f - s(18), fps, config: { damping: 13, stiffness: 120, mass: 0.9 } });
  const small = 0.17;
  const scale = small + (1 - small) * tag;
  const inner = ramp(f, s(18.25), s(18.55));
  return (
    <Scene id="s5">
      <Halo x={390} y={610} r={385} />
      <Riyaz h={980} x={40} y={80} />
      <div style={{ position: "absolute", left: 800, top: 230 }}>
        <svg width="120" height="130" viewBox="0 0 22 24" style={{ display: "block", marginLeft: -20, transform: `scale(${0.35 + 0.65 * tag})`, transformOrigin: "0 0", opacity: f < s(17.97) ? 0 : 1 }}>
          <path d="M2 2 L20 10 L11.5 12.5 L8 21 Z" fill={c.lime} stroke={c.surface} strokeWidth="1" strokeLinejoin="round" />
        </svg>
        <div style={{ marginTop: -14, padding: "28px 44px 36px", background: c.lime, transform: `scale(${scale})`, transformOrigin: "0 0", opacity: f < s(17.97) ? 0 : 1 }}>
          <T size={60} w={700} color={c.onLime} style={{ opacity: inner }}>
            Hi, I&rsquo;m
          </T>
          <T size={156} color={c.onLime} style={{ marginTop: 8, opacity: inner }}>
            Riyaz Malek
          </T>
        </div>
        <div style={{ marginTop: 36 }}>
          <Line at={s(18.75)} size={60} color={c.ink} weight={700}>
            Product designer, based in Vadodara.
          </Line>
        </div>
      </div>
    </Scene>
  );
};

/* ---- 7: skills */
const SKILLS = ["UX strategy", "Research", "Information architecture", "UI design", "Prototyping", "Design systems", "CRO landing pages", "AI-assisted workflow"];
const S7: React.FC = () => (
  <Scene id="s7">
    <div style={{ position: "absolute", left: 90, top: 60 }}>
      <Line at={s(29.4)} size={120} color={c.ink} weight={900} tracking="-0.05em">
        One person, the whole job.
      </Line>
    </div>
    <div style={{ position: "absolute", left: 90, top: 222, fontFamily: mono, fontSize: 30, color: c.ink }}>skills / 8 variants</div>
    <div style={{ position: "absolute", left: 90, top: 270, width: 1740, height: 700, border: `5px dashed ${c.ink}`, padding: 44, boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: 26, alignContent: "flex-start" }}>
      {SKILLS.map((t, i) => (
        <Pop key={t} at={s(29.55) + i * 7} stiffness={210}>
          <Chip size={68} dark={i % 3 === 0}>
            {t}
          </Chip>
        </Pop>
      ))}
    </div>
  </Scene>
);

/* ---- 8: both clients, each named against their own product */
const Bubble: React.FC<{ at: number; x: number; y: number; who: string; role: string; initials: string; dark?: boolean; children: React.ReactNode }> = ({ at, x, y, who, role, initials, dark, children }) => (
  <Pop at={at} origin="0 0" style={{ position: "absolute", left: x, top: y }}>
    <div style={{ display: "flex", gap: 22, width: 1500 }}>
      <div style={{ width: 84, height: 84, borderRadius: 84, background: dark ? c.ink : c.surface, color: dark ? c.surface : c.ink, display: "grid", placeItems: "center", fontFamily: sans, fontWeight: 800, fontSize: 32, flexShrink: 0 }}>{initials}</div>
      <div style={{ background: dark ? c.ink : c.surface, color: dark ? c.surface : c.ink, padding: "28px 36px", borderRadius: "0 28px 28px 28px" }}>
        <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: "-0.015em", marginBottom: 12, opacity: 0.85 }}>
          {who}, <span style={{ fontWeight: 400 }}>{role}</span>
        </div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: 68, lineHeight: 1.1, letterSpacing: "-0.03em" }}>{children}</div>
      </div>
    </div>
  </Pop>
);
const S8: React.FC = () => (
  <Scene id="s8">
    <div style={{ position: "absolute", left: 90, top: 50 }}>
      <Line at={s(32.3)} size={100} color={c.ink} weight={900} tracking="-0.05em">
        Don&rsquo;t take my word for it.
      </Line>
    </div>
    <Bubble at={s(32.8)} x={90} y={230} who="Ranjan Kumar Mohanty" role="Secretary-cum-CEO, PECUC" initials="RK">
      &ldquo;He understood our vision and translated it into a clean, modern, and highly accessible platform.&rdquo;
    </Bubble>
    <Bubble at={s(35.8)} x={330} y={610} who="Himanshu Parmar" role="IT Manager, EdLogica (CareerLogica)" initials="HP" dark>
      &ldquo;His creativity, technical expertise, and attention to detail helped bring our vision to life.&rdquo;
    </Bubble>
  </Scene>
);

/* ---- 9: the close */
const S9: React.FC = () => {
  const f = useCurrentFrame();
  const press = f > s(42.2) && f < s(42.5) ? 0.96 : 1;
  return (
    <Scene id="s9">
      <div style={{ position: "absolute", left: 90, top: 70 }}>
        <Line at={s(39.5)} size={196} color={c.ink} weight={900} tracking="-0.05em">
          Your next site
        </Line>
        <Line at={s(39.7)} size={196} color={c.ink} weight={900} tracking="-0.05em">
          shouldn&rsquo;t be
        </Line>
        <Line at={s(39.9)} size={196} color={c.lime} weight={900} tracking="-0.05em">
          AI slop.
        </Line>
      </div>
      <div style={{ position: "absolute", left: 94, top: 700 }}>
        <Line at={s(40.6)} size={62} color={c.ink} weight={700}>
          Let&rsquo;s build one that makes you money.
        </Line>
      </div>
      <Pop at={s(41.2)} origin="0 50%" style={{ position: "absolute", left: 94, top: 820 }}>
        <div style={{ padding: "38px 66px", background: c.ink, color: c.ground, fontFamily: sans, fontWeight: 800, fontSize: 76, letterSpacing: "-0.04em", whiteSpace: "nowrap", transform: `scale(${press})` }}>riyazdesigns.netlify.app</div>
      </Pop>
      <Halo x={1590} y={720} r={330} />
      <Riyaz h={720} x={1320} y={340} />
    </Scene>
  );
};

/* ---------------------------------------------------------- the work --- */
const WORK_AT = s(20.9);
const WORK_LEN = s(8.5);

/** A lane starts fast and settles to cruise, so each carousel arrives with force. */
const laneDist = (t: number, speed: number, burst: number) => t * speed * SPEED + burst * (1 - Math.exp(-t / 16));

type Item = { src: string; ratio: number };
const lane = (dir: "careerlogica" | "pecuc" | "atrc", list: [string, number][]): Item[] => list.map(([n, ratio]) => ({ src: `film/${dir}/${n}.webp`, ratio }));

/* CareerLogica: vertical. Long pages climb and fall in tilted columns. */
const CL_COLS: Item[][] = [
  lane("careerlogica", [["site-home", 5400 / 646], ["psych-test", 1300 / 1056]]),
  lane("careerlogica", [["counselling", 1400 / 1034], ["dash-home", 1100 / 1032], ["profile", 1800 / 966]]),
  lane("careerlogica", [["mobile-long", 2200 / 358]]),
  lane("careerlogica", [["site-students", 3700 / 642], ["counselling", 1400 / 1034]]),
  lane("careerlogica", [["profile", 1800 / 966], ["psych-test", 1300 / 1056], ["dash-home", 1100 / 1032]]),
];
const Column: React.FC<{ items: Item[]; w: number; x: number; t: number; up: boolean; speed: number; burst?: number }> = ({ items, w, x, t, up, speed, burst = 900 }) => {
  const gap = 22;
  const heights = items.map((i) => w * i.ratio + gap);
  const total = heights.reduce((a, b) => a + b, 0);
  const d = laneDist(t, speed, burst) % total;
  const y = up ? -d : d - total;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, display: "flex", flexDirection: "column", gap }}>
      {[0, 1, 2].flatMap((n) => items.map((i, k2) => <Img key={`${n}-${k2}`} src={staticFile(i.src)} style={{ width: w, height: w * i.ratio, display: "block", borderRadius: 10 }} />))}
    </div>
  );
};

/* PECUC: horizontal. Sections of its real pages run across in rows. */
const tiles = (names: string[]): Item[] => names.map((n) => ({ src: `film/pecuc/${n}.webp`, ratio: 1 }));
const PE_ROWS: Item[][] = [
  tiles(["home-01", "home-02", "home-03", "home-04", "home-05", "home-06"]),
  tiles(["donation-00", "donation-03", "donation-08", "programs-00", "programs-01", "volunteer-00"]),
  tiles(["volunteer-02", "volunteer-04", "donation-10", "programs-05", "home-07", "volunteer-05"]),
];
const Row: React.FC<{ items: Item[]; h: number; y: number; t: number; left: boolean; speed: number }> = ({ items, h, y, t, left, speed }) => {
  const iw = h * 1.6;
  const gap = 22;
  const total = items.length * (iw + gap);
  const d = laneDist(t, speed, 1000) % total;
  const x = left ? -d : d - total;
  return (
    <div style={{ position: "absolute", left: x, top: y, height: h, display: "flex", gap }}>
      {[0, 1, 2].flatMap((n) => items.map((i, k2) => <Img key={`${n}-${k2}`} src={staticFile(i.src)} style={{ width: iw, height: h, objectFit: "cover", objectPosition: "top", display: "block", borderRadius: 10, flexShrink: 0 }} />))}
    </div>
  );
};

/* ATRC: the quiet one. Straight columns drift up and down, with no burst and no tilt. */
const ATRC_R = 640 / 900;
const ATRC_COLS: { w: number; x: number; items: Item[] }[] = [
  { w: 470, x: 2, items: lane("atrc", [["start", ATRC_R], ["question", ATRC_R], ["picture", ATRC_R], ["pause", ATRC_R]]) },
  { w: 250, x: 496, items: lane("atrc", [["m-start", 874 / 402], ["m-q1", 874 / 402]]) },
  { w: 380, x: 770, items: lane("atrc", [["report", 2200 / 872]]) },
  { w: 250, x: 1174, items: lane("atrc", [["m-q1", 874 / 402], ["m-start", 874 / 402]]) },
  { w: 470, x: 1448, items: lane("atrc", [["milestone", ATRC_R], ["pause", ATRC_R], ["question", ATRC_R], ["start", ATRC_R]]) },
];

/** A big bold nameplate that hits and holds. */
const Plate: React.FC<{ at: number; name: string; lines: string[]; x: number; y: number; rotate?: number; size?: number; lime?: boolean }> = ({ at, name, lines, x, y, rotate = 0, size = 190, lime = true }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const q = f < at ? 0 : spring({ frame: f - at, fps, config: { damping: 13, stiffness: 170, mass: 0.8 } });
  const bg = lime ? c.lime : c.ground;
  const fg = lime ? c.onLime : c.ink;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `rotate(${rotate}deg) translateX(${(1 - q) * -1400}px)`, transformOrigin: "0 50%", background: bg, padding: "22px 54px 30px", boxShadow: "0 30px 70px rgba(0,0,0,0.5)", zIndex: 50 }}>
      <T size={size} color={fg} lh={1}>
        {name}
      </T>
      {lines.map((l, i) => (
        <T key={l} size={58} w={700} color={fg} lh={1.15} style={{ marginTop: i === 0 ? 12 : 0, opacity: ramp(f, at + 14 + i * 7, at + 24 + i * 7) }}>
          {l}
        </T>
      ))}
    </div>
  );
};

/** Lime blade that cuts from one carousel to the next. */
const Blade: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const q = ramp(f, at - 10, at + 10, 0, 1, ease.inOut);
  if (q <= 0 || q >= 1) return null;
  const a = interpolate(q, [0, 0.5, 1], [-30, 0, 130]);
  const b = interpolate(q, [0, 0.5, 1], [-30, 130, 130]);
  return <AbsoluteFill style={{ background: c.lime, clipPath: `polygon(${a}% 0, ${b}% 0, ${b - 22}% 100%, ${a - 22}% 100%)`, zIndex: 100 }} />;
};

const PHASE_B = s(2.8);
const PHASE_C = s(5.6);

const Work: React.FC = () => {
  const frame = useCurrentFrame();
  const f = frame - WORK_AT;
  if (f < -12 || f > WORK_LEN + 12) return null;
  const inn = ramp(f, -12, 10, 0, 1, ease.inOut);
  const out = ramp(f, WORK_LEN - 12, WORK_LEN + 8, 0, 1, ease.inOut);
  return (
    <AbsoluteFill style={{ zIndex: 3000, background: c.ground, clipPath: `circle(${inn * 1300}px at 1040px 400px)`, opacity: 1 - out, overflow: "hidden" }}>
      {f < PHASE_B + 12 ? (
        <AbsoluteFill style={{ isolation: "isolate" }}>
          <div style={{ position: "absolute", left: -160, top: -420, width: 2300, height: 1950, transform: "rotate(-7deg)", overflow: "hidden" }}>
            {CL_COLS.map((items, i) => (
              <Column key={i} items={items} w={i === 2 ? 300 : 430} x={i === 0 ? 40 : i === 1 ? 500 : i === 2 ? 960 : i === 3 ? 1290 : 1750} t={f} up={i % 2 === 0} speed={i === 2 ? 480 / 60 : 320 / 60} />
            ))}
          </div>
          <Plate at={WORK_AT + 8} name="CareerLogica" lines={["140+ screens. 5 roles. English and Arabic."]} x={70} y={690} rotate={-2} size={170} />
        </AbsoluteFill>
      ) : null}
      {f >= PHASE_B - 12 && f < PHASE_C + 12 ? (
        <AbsoluteFill style={{ background: c.ground, isolation: "isolate" }}>
          <Row items={PE_ROWS[0]} h={310} y={34} t={f - PHASE_B} left speed={340 / 60} />
          <Row items={PE_ROWS[1]} h={310} y={366} t={f - PHASE_B} left={false} speed={420 / 60} />
          <Row items={PE_ROWS[2]} h={310} y={698} t={f - PHASE_B} left speed={300 / 60} />
          <Plate at={WORK_AT + PHASE_B + 8} name="PECUC" lines={["37 links to 7.", "4 clicks to 2."]} x={1020} y={300} size={230} />
        </AbsoluteFill>
      ) : null}
      {f >= PHASE_C - 12 ? (
        <AbsoluteFill style={{ background: c.ground, isolation: "isolate" }}>
          {ATRC_COLS.map(({ w, x, items }, i) => (
            <Column key={x} items={items} w={w} x={x} t={f - PHASE_C + 60} up={i % 2 === 0} speed={110 / 60} burst={0} />
          ))}
          <Plate at={WORK_AT + PHASE_C + 8} name="ATRC" lines={["25 questions. Every exit a way back."]} x={70} y={730} rotate={-2} size={170} />
        </AbsoluteFill>
      ) : null}
      <Blade at={WORK_AT + PHASE_B} />
      <Blade at={WORK_AT + PHASE_C} />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------- film --- */
const visible = (f: number, id: SceneId) => {
  const h = HOLD.find((x) => x[0] === id);
  if (!h) return false;
  const near = f > s(h[1]) - s(1.3) && f < s(h[2]) + s(1.3);
  return near || (id === "s1" && f > s(42.6));
};

export const FilmPositioning: React.FC = () => {
  Object.assign(k, p);
  const f = useCurrentFrame();
  const x = track(f, CAM.x);
  const y = track(f, CAM.y);
  const z = track(f, CAM.z);
  const grid = 44 * z;
  const h = pathAt(f, him);
  const u = pathAt(f, you);
  const showHim = f > s(1) && f < s(43.84) && !(f > s(18) && f < s(29.4));
  const counter = 1 / z;
  return (
    <AbsoluteFill style={{ background: c.ground, overflow: "hidden" }}>
      <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${c.dots} ${Math.max(1.2, 2.2 * z)}px, transparent ${Math.max(1.6, 2.6 * z)}px)`, backgroundSize: `${grid}px ${grid}px`, backgroundPosition: `${960 - x * z}px ${540 - y * z}px` }} />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${960 - x * z}px, ${540 - y * z}px) scale(${z})`, transformOrigin: "0 0" }}>
        {visible(f, "s1") ? <S1 /> : null}
        {visible(f, "s2") ? <S2 /> : null}
        {visible(f, "s3") ? <S3 /> : null}
        {visible(f, "s4") ? <S4 /> : null}
        {visible(f, "s5") ? <S5 /> : null}
        {visible(f, "s7") ? <S7 /> : null}
        {visible(f, "s8") ? <S8 /> : null}
        {visible(f, "s9") ? <S9 /> : null}
        {showHim ? <Cursor x={h.x} y={h.y} name="Riyaz" color={c.lime} text={c.onLime} scale={counter} /> : null}
        <Cursor x={u.x} y={u.y} name="You" color={c.ink} text={c.ground} scale={counter} />
      </div>
      <Work />
      <Grain opacity={0.05} />
    </AbsoluteFill>
  );
};

