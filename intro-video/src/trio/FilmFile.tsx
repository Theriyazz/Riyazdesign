import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ease, mono, ramp, s, sans, settle } from "../hello/kit";
import { Slam } from "../hello2/kinetic";
import { Cursor, Grain, Line, Riyaz, Shot, Swap, track, WALL } from "./kit";

/* Variation C, "The open file". One unbroken take across one orange canvas. The
   visitor's own cursor is in the poster, labelled "You", inside a design file;
   Riyaz's cursor joins and works. It is the most personal of the three, because
   a product designer's real stage is the file. It ends by flying back to the
   frame it started in, so the loop has no cut at all. */

export const k = { ground: "#ff5a1f", ink: "#111014", cream: "#f3efe3", paper: "#fff8ee", you: "#111014", him: "#aaff00", select: "#111014" };

// Camera stops: [second, x, y, zoom].
const CAM: [number, number, number, number][] = [
  [0, 0, 0, 1],
  [1.9, 0, 0, 1],
  [2.45, 1950, 0, 1],
  [5.2, 1950, 0, 1],
  [5.9, 4000, 200, 1],
  [12.5, 4000, 200, 1],
  [13.2, 4000, 1500, 1],
  [19.6, 4000, 1500, 1],
  [20.5, 1200, 1750, 0.62],
  [27.4, 1200, 1750, 0.62],
  [28.1, -800, 1500, 1],
  [32.2, -800, 1500, 1],
  [33.1, 1700, 850, 0.27],
  [34.0, 1700, 850, 0.27],
  [34.9, 0, 0, 1],
  [38, 0, 0, 1],
];
const camAt = (f: number) => {
  const col = (n: 1 | 2 | 3) => CAM.map((c) => [s(c[0]), c[n]] as [number, number]);
  return { x: track(f, col(1)), y: track(f, col(2)), z: track(f, col(3)) };
};

/** A frame on the canvas: name above, hard edge, optional selection handles. */
export const Frame: React.FC<{ x: number; y: number; w: number; h: number; name: string; selected?: boolean; bg?: string; children?: React.ReactNode }> = ({
  x,
  y,
  w,
  h,
  name,
  selected,
  bg = k.cream,
  children,
}) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
    <div style={{ position: "absolute", left: 0, top: -48, fontFamily: mono, fontSize: 30, fontWeight: 500, color: k.ink, whiteSpace: "nowrap" }}>{name}</div>
    <div style={{ position: "absolute", inset: 0, background: bg, overflow: "hidden" }}>{children}</div>
    {selected ? (
      <>
        <div style={{ position: "absolute", inset: -3, border: `5px solid ${k.select}` }} />
        {[
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ].map(([a, b]) => (
          <div key={`${a}${b}`} style={{ position: "absolute", left: a * w - 11, top: b * h - 11, width: 22, height: 22, background: k.paper, border: `4px solid ${k.select}` }} />
        ))}
      </>
    ) : null}
  </div>
);

/* ---- Frame 0: the poster. */
const PosterFrame: React.FC = () => {
  const f = useCurrentFrame();
  const swapOut = ramp(f, s(36.7), s(37.1), 0, 1, ease.in);
  const swapIn = ramp(f, s(37.15), s(37.7), 0, 1, ease.out);
  const showOutro = f > s(30);
  return (
    <Frame x={-800} y={-420} w={1600} h={850} name="intro_final_v7" selected>
      <Riyaz h={880} x={-10} y={-10} breathe={1 - ramp(f, s(37), s(37.9))} />
      <div style={{ position: "absolute", left: 760, top: 200 }}>
        {showOutro ? (
          <div style={{ opacity: 1 - swapOut, position: "absolute", left: 0, top: -30 }}>
            <Line at={s(34.9)} size={140} color={k.ink} weight={900}>
              Your move.
            </Line>
            <div style={{ height: 34 }} />
            <Line at={s(35.15)} size={58} color={k.ink} weight={700} tracking="-0.025em">
              riyazdesigns.netlify.app
            </Line>
            <div style={{ height: 12 }} />
            <Line at={s(35.3)} size={44} color={k.ink} weight={500} tracking="-0.02em">
              Open to product design roles
            </Line>
          </div>
        ) : null}
        <div style={{ opacity: showOutro ? swapIn : 1, position: "absolute", left: 0, top: 0, transform: `translateY(${showOutro ? (1 - swapIn) * 30 : 0}px)`, whiteSpace: "nowrap" }}>
          <div style={{ fontFamily: sans, fontWeight: 900, fontSize: 230, lineHeight: 0.95, letterSpacing: "-0.055em", color: k.ink }}>
            Come
            <br />
            in.
          </div>
          <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 70, letterSpacing: "-0.03em", color: k.ink, marginTop: 28 }}>The file&rsquo;s open.</div>
        </div>
      </div>
    </Frame>
  );
};

/* ---- The name, as a text layer being set. */
const NameLayer: React.FC = () => {
  const f = useCurrentFrame();
  const box = ramp(f, s(1.95), s(2.45), 0, 1, ease.inOut);
  const chip = settle(f, 60, s(3.1), 170);
  return (
    <div style={{ position: "absolute", left: 1120, top: -330 }}>
      <div style={{ position: "absolute", left: -30, top: -24, width: 1660 * box, height: 680 * box, border: `5px solid ${k.select}` }} />
      <div style={{ padding: "0 0 0 6px" }}>
        <Slam text="Riyaz" at={s(2.35)} size={330} weight={900} color={k.ink} seed="c-r" wobble={0.15} />
        <Slam text="Malek" at={s(2.5)} size={330} weight={900} color={k.ink} seed="c-m" wobble={0.15} />
      </div>
      <div style={{ marginTop: 60, display: "inline-flex", gap: 22, transform: `scale(${chip})`, transformOrigin: "0 50%" }}>
        <div style={{ padding: "18px 34px", background: k.ink, color: k.ground, fontFamily: sans, fontWeight: 700, fontSize: 60, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>Product designer</div>
        <div style={{ padding: "18px 34px", border: `5px solid ${k.ink}`, color: k.ink, fontFamily: sans, fontWeight: 700, fontSize: 60, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>Asks why first</div>
      </div>
    </div>
  );
};

/* ---- PECUC: the layers panel loses 30 rows, the site changes under them. */
const PX = 4000 - 960;
const PY = 200 - 540;
const Pecuc: React.FC = () => {
  const f = useCurrentFrame();
  const mq = ramp(f, s(7.2), s(7.9), 0, 1, ease.inOut);
  const del = s(8.0);
  const swap = ramp(f, s(8.4), s(9.1), 0, 1, ease.inOut);
  const count = Math.round(interpolate(f, [del, del + 40], [37, 7], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  return (
    <div style={{ position: "absolute", left: PX, top: PY, width: 1920, height: 1080 }}>
      <div style={{ position: "absolute", left: 70, top: 70 }}>
        <Line at={s(5.95)} size={78} color={k.ink} weight={800}>
          35 years of impact, hidden by a 2001 website.
        </Line>
      </div>
      {/* layers */}
      <div style={{ position: "absolute", left: 70, top: 200, width: 340, background: k.ink, padding: "18px 0", overflow: "hidden" }}>
        <div style={{ fontFamily: mono, fontSize: 25, color: k.cream, padding: "0 20px 12px", fontWeight: 500 }}>Nav / {count} links</div>
        {Array.from({ length: 37 }, (_, i) => {
          const keep = i < 7;
          const gone = keep ? 0 : ramp(f, del + (i - 7) * 0.6, del + (i - 7) * 0.6 + 8, 0, 1, ease.in);
          const sel = !keep && f > s(7.2) && mq * 37 > i - 7;
          return (
            <div key={i} style={{ height: 19.6 * (1 - gone), overflow: "hidden", opacity: 1 - gone, display: "flex", alignItems: "center", gap: 10, padding: "0 20px", background: sel ? k.ground : "transparent" }}>
              <div style={{ width: 11, height: 11, border: `2px solid ${k.cream}`, flexShrink: 0 }} />
              <div style={{ width: 90 + ((i * 53) % 130), height: 7, background: k.cream, opacity: keep ? 0.95 : 0.5 }} />
            </div>
          );
        })}
      </div>
      {/* canvas frame */}
      <div style={{ position: "absolute", left: 450, top: 240, width: 960, height: 600, overflow: "hidden", boxShadow: "0 24px 60px rgba(17,16,20,0.35)" }}>
        <Img src={staticFile("hello/pecuc-old.webp")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        <div style={{ position: "absolute", inset: 0, clipPath: `inset(${(1 - swap) * 100}% 0 0 0)` }}>
          <Img src={staticFile("hello/pecuc-new.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 450, top: 200, fontFamily: mono, fontSize: 28, fontWeight: 500, color: k.ink, opacity: ramp(f, s(6.1), s(6.4)), whiteSpace: "nowrap" }}>
        {swap > 0.5 ? "pecuc_home_2026" : "pecuc_home_2001"}
      </div>
      <div style={{ position: "absolute", left: 1460, top: 240, display: "flex", flexDirection: "column", gap: 40 }}>
        <Swap at={del} from="37" to="7" label="navigation links" fg={k.ink} dim="rgba(17,16,20,0.42)" hit={k.ink} size={120} labelSize={32} />
        <Swap at={s(8.7)} from="4" to="2" label="clicks to content" fg={k.ink} dim="rgba(17,16,20,0.42)" hit={k.ink} size={120} labelSize={32} />
        <Swap at={s(9.3)} from="9" to="1" label="sub-sites, one hub" fg={k.ink} dim="rgba(17,16,20,0.42)" hit={k.ink} size={120} labelSize={32} />
      </div>
    </div>
  );
};

/* ---- ATRC: a prototype, whose noodles draw themselves, including the way back. */
const AX = 4000 - 960;
const AY = 1500 - 540;
const FLOW = [
  { src: "hello/atrc-landing.webp", name: "Start", x: 80, y: 340 },
  { src: "hello/atrc-question.webp", name: "Question 12 of 25", x: 560, y: 560 },
  { src: "hello/atrc-still.webp", name: "Still there?", x: 1040, y: 340 },
  { src: "hello/atrc-result.webp", name: "3-pathway report", x: 1460, y: 560 },
];
const FW = 400;
const FH = 284;
const Noodle: React.FC<{ d: string; at: number; color: string; width?: number; len?: number }> = ({ d, at, color, width = 6, len = 900 }) => {
  const f = useCurrentFrame();
  const p = ramp(f, at, at + 30, 0, 1, ease.inOut);
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />;
};
const Atrc: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: AX, top: AY, width: 1920, height: 1080 }}>
      <div style={{ position: "absolute", left: 70, top: 66 }}>
        <Line at={s(13.2)} size={84} color={k.ink} weight={800}>
          Fifteen-year-olds quit long tests.
        </Line>
        <Line at={s(16.3)} size={84} color={k.paper} weight={800}>
          So every exit got a way back.
        </Line>
      </div>
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", zIndex: 2 }}>
        <Noodle d={`M${80 + FW} ${340 + FH / 2} C 540 ${340 + FH / 2}, 500 ${560 + FH / 2}, 560 ${560 + FH / 2}`} at={s(14.1)} color={k.ink} />
        <Noodle d={`M${560 + FW} ${560 + FH / 2} C 1010 ${560 + FH / 2}, 980 ${340 + FH / 2}, 1040 ${340 + FH / 2}`} at={s(14.9)} color={k.ink} />
        <Noodle d={`M${1040 + FW} ${340 + FH / 2} C 1490 ${340 + FH / 2}, 1420 ${560 + FH / 2}, 1460 ${560 + FH / 2}`} at={s(15.7)} color={k.ink} />
        {/* the way back: from "Still there?" back to the question */}
        <Noodle d={`M${1040 + FW / 2} ${340} C ${1040 + FW / 2} 210, ${560 + FW / 2} 280, ${560 + FW / 2} 560`} at={s(16.5)} color={k.paper} width={10} len={1100} />
      </svg>
      {FLOW.map((n, i) => {
        const p = settle(f, fps, s(13.4) + i * 22, 170);
        return (
          <div key={n.src} style={{ position: "absolute", left: n.x, top: n.y, width: FW, transform: `scale(${p})`, zIndex: 3 }}>
            <Shot src={n.src} w={FW} h={FH} r={0} shadow="0 22px 50px rgba(17,16,20,0.35)" />
            <div style={{ fontFamily: mono, fontSize: 25, fontWeight: 500, color: k.ink, marginTop: 12, whiteSpace: "nowrap" }}>{n.name}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 80, top: 960, fontFamily: sans, fontWeight: 700, fontSize: 46, letterSpacing: "-0.025em", color: k.ink, opacity: ramp(f, s(17.2), s(17.6)), whiteSpace: "nowrap" }}>
        ATRC, Abu Dhabi. 25 questions, 4 formats, 3 pathways.
      </div>
    </div>
  );
};

/* ---- CareerLogica: zoom out, select all. */
const CX = 1200 - 1500;
const CY = 1750 - 780;
const Career: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: CX, top: CY }}>
      {WALL.map((src, i) => {
        const col = i % 5;
        const row = Math.floor(i / 5);
        const q = settle(f, fps, s(20.1) + ((i * 7) % 20) * 2, 170);
        return (
          <div key={src} style={{ position: "absolute", left: col * 610, top: row * 400, transform: `scale(${q})` }}>
            <Shot src={src} w={570} h={360} r={0} shadow="0 18px 40px rgba(17,16,20,0.3)" />
          </div>
        );
      })}
    </div>
  );
};

/* Screen-space callout for the wall, so it stays a fixed size against the zoom. */
const CareerHud: React.FC = () => {
  const f = useCurrentFrame();
  const v = ramp(f, s(22), s(22.4)) * (1 - ramp(f, s(27.2), s(27.5)));
  if (v <= 0) return null;
  const n = Math.round(interpolate(f, [s(22), s(23.2)], [1, 140], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease.out }));
  return (
    <div style={{ position: "absolute", left: 130, top: 170, right: 130, bottom: 170, background: k.ink, opacity: v, padding: "70px 90px", zIndex: 4000, color: k.cream }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 30, fontFamily: sans, fontWeight: 900, fontSize: 280, lineHeight: 1, letterSpacing: "-0.055em", color: k.ground }}>
        {n}
        {n === 140 ? "+" : ""}
        <span style={{ fontSize: 82, fontWeight: 700, color: k.cream, letterSpacing: "-0.035em" }}>screens selected</span>
      </div>
      <div style={{ height: 40 }} />
      <Line at={s(23.5)} size={84} color={k.cream} weight={700}>
        5 roles. English and Arabic.
      </Line>
      <Line at={s(24)} size={84} color={k.cream} weight={700}>
        One designer.
      </Line>
      <div style={{ height: 30 }} />
      <Line at={s(24.6)} size={40} color={k.cream} weight={500} tracking="-0.02em">
        CareerLogica. Approved with no structural revisions.
      </Line>
    </div>
  );
};

/* ---- Comments on the canvas: his line, then a client's. */
const Bubble: React.FC<{ at: number; x: number; y: number; who: string; initials: string; dark?: boolean; children: React.ReactNode; size?: number }> = ({
  at,
  x,
  y,
  who,
  initials,
  dark,
  children,
  size = 78,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = settle(f, fps, at, 170);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 1500, display: "flex", gap: 28, transform: `scale(${p})`, transformOrigin: "0 0" }}>
      <div style={{ width: 96, height: 96, borderRadius: 96, background: dark ? k.ink : k.paper, color: dark ? k.paper : k.ink, display: "grid", placeItems: "center", fontFamily: sans, fontWeight: 800, fontSize: 36, flexShrink: 0 }}>{initials}</div>
      <div style={{ background: dark ? k.ink : k.paper, color: dark ? k.paper : k.ink, padding: "34px 44px", borderRadius: "0 30px 30px 30px" }}>
        <div style={{ fontFamily: sans, fontWeight: 500, fontSize: 32, letterSpacing: "-0.015em", marginBottom: 10, opacity: 0.74 }}>{who}</div>
        <div style={{ fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: "-0.035em" }}>{children}</div>
      </div>
    </div>
  );
};
const Comments: React.FC = () => (
  <>
    <Bubble at={s(27.9)} x={-1650} y={1110} who="Riyaz" initials="RM">
      I ask a lot of questions before I open Figma.
    </Bubble>
    <Bubble at={s(29.6)} x={-1470} y={1470} who="Ranjan Kumar Mohanty, Secretary-cum-CEO, PECUC" initials="RK" dark size={110}>
      &ldquo;He understood our vision.&rdquo;
    </Bubble>
  </>
);

/* ---- Cursors, in world space. Kept in stops so the path reads as a hand. */
const HIM: [number, number, number][] = [
  [1.0, -1400, -300],
  [1.5, -40, -180],
  [1.95, 1090, -354],
  [2.45, 2640, 360],
  [5.2, 2660, 340],
  [6.6, 3240, 240],
  [7.2, 3240, 240],
  [7.9, 3400, 700],
  [8.5, 3900, 500],
  [13.1, 3900, 500],
  [14.1, 3540, 1400],
  [14.9, 3990, 1620],
  [15.7, 4480, 1400],
  [16.5, 4300, 1250],
  [17.0, 3880, 1500],
  [19.6, 4300, 1700],
  [21.2, 300, 1000],
  [22.0, 2800, 2600],
  [27.6, 2600, 2300],
  [28.4, -380, 1740],
  [33, -100, 1300],
  [34.8, 360, 260],
  [38, 360, 260],
];
const YOU: [number, number, number][] = [
  [0, 380, 150],
  [1.0, 390, 170],
  [2.4, 900, 280],
  [3.0, 2500, 150],
  [5.3, 2500, 150],
  [12.5, 4700, 900],
  [19.6, 4800, 1900],
  [27.6, 2500, 2600],
  [32.5, -100, 1900],
  [35, 300, 330],
  [37.7, 380, 150],
  [38, 380, 150],
];
const pathAt = (f: number, stops: [number, number, number][]) => ({
  x: track(f, stops.map((p) => [s(p[0]), p[1]] as [number, number])),
  y: track(f, stops.map((p) => [s(p[0]), p[2]] as [number, number])),
});

export const FilmFile: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const grid = 44 * cam.z;
  const him = pathAt(f, HIM);
  const you = pathAt(f, YOU);
  const hisVisible = f > s(1.0) && f < s(34.8);
  const counter = 1 / cam.z; // cursors stay one size whatever the zoom
  return (
    <AbsoluteFill style={{ background: k.ground, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(circle, rgba(17,16,20,0.3) ${Math.max(1.2, 2.2 * cam.z)}px, transparent ${Math.max(1.6, 2.6 * cam.z)}px)`,
          backgroundSize: `${grid}px ${grid}px`,
          backgroundPosition: `${960 - cam.x * cam.z}px ${540 - cam.y * cam.z}px`,
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${960 - cam.x * cam.z}px, ${540 - cam.y * cam.z}px) scale(${cam.z})`, transformOrigin: "0 0" }}>
        <PosterFrame />
        <NameLayer />
        <Pecuc />
        <Atrc />
        <Career />
        <Comments />
        {hisVisible ? <Cursor x={him.x} y={him.y} name="Riyaz" color={k.him} text={k.ink} scale={counter} /> : null}
        <Cursor x={you.x} y={you.y} name="You" color={k.you} text={k.paper} scale={counter} />
      </div>
      <CareerHud />
      <Grain opacity={0.08} />
    </AbsoluteFill>
  );
};
