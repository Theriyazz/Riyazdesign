import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { Backdrop, c, Card, Laptop, mono, Phone, sans, serif } from "../kit";

/* Storyboard v2: one keyframe per variation, 8 scenes x 3. These are static
   frames for choosing a direction; the chosen ones get animated after. */

const L = 160;

const H: React.FC<{ size: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; weight?: number }> = ({
  size,
  color = c.paper,
  children,
  style,
  weight = 600,
}) => (
  <div style={{ fontFamily: sans, fontWeight: weight, fontSize: size, lineHeight: 1.04, letterSpacing: "-0.045em", color, ...style }}>{children}</div>
);

const Em: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ fontFamily: serif, fontWeight: 400, letterSpacing: "-0.01em" }}>{children}</span>
);

/** The lime rule under the thing the film is pointing at. */
const Mark: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span style={{ position: "relative", display: "inline-block" }}>
    {children}
    <span style={{ position: "absolute", left: 0, right: "0.08em", bottom: "0.02em", height: "0.065em", minHeight: 4, borderRadius: 99, background: c.signal }} />
  </span>
);

const Mono: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 22, color = c.paper500, style }) => (
  <div style={{ fontFamily: mono, fontSize: size, letterSpacing: "0.14em", textTransform: "uppercase", color, whiteSpace: "nowrap", ...style }}>{children}</div>
);

const Body: React.FC<{ children: React.ReactNode; size?: number; color?: string; style?: React.CSSProperties }> = ({ children, size = 32, color = c.paper300, style }) => (
  <div style={{ fontFamily: sans, fontSize: size, lineHeight: 1.3, letterSpacing: "-0.01em", color, ...style }}>{children}</div>
);

const Dot: React.FC<{ x: number; y: number; size?: number; ring?: boolean }> = ({ x, y, size = 34, ring }) => (
  <div
    style={{
      position: "absolute",
      left: x - size / 2,
      top: y - size / 2,
      width: size,
      height: size,
      borderRadius: 99,
      background: ring ? "transparent" : c.signal,
      border: ring ? `2px dashed ${c.signal}` : undefined,
    }}
  />
);

const Pill: React.FC<{ children: React.ReactNode; filled?: boolean; size?: number; style?: React.CSSProperties }> = ({ children, filled, size = 22, style }) => (
  <div
    style={{
      fontFamily: mono,
      fontSize: size,
      padding: `${size * 0.5}px ${size * 0.95}px`,
      borderRadius: 999,
      border: `1.5px solid ${filled ? c.paper : c.ink700}`,
      background: filled ? c.paper : c.ink850,
      color: filled ? c.ink : c.paper200,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

const Abs: React.FC<{ x: number; y: number; w?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ x, y, w, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, ...style }}>{children}</div>
);

const Portrait: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <>
    <div style={{ position: "absolute", left: x - r - 10, top: y - r - 10, width: r * 2 + 20, height: r * 2 + 20, borderRadius: 999, border: `1.5px solid ${c.ink700}` }} />
    <Img src={staticFile("hello/portrait.webp")} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: 999 }} />
  </>
);

const Contacts: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 24 }) => (
  <Abs x={x} y={y} style={{ display: "flex", gap: 14 }}>
    <Pill filled size={size}>riyazdesigns.netlify.app</Pill>
    <Pill size={size}>malekriyaz606@gmail.com</Pill>
    <Pill size={size}>linkedin.com/in/riyaz-malek</Pill>
  </Abs>
);

const Available: React.FC<{ x: number; y: number; size?: number }> = ({ x, y, size = 32 }) => (
  <Abs x={x} y={y} style={{ display: "flex", alignItems: "center", gap: 16 }}>
    <div style={{ width: 16, height: 16, borderRadius: 99, background: c.signal, boxShadow: `0 0 0 6px rgba(170,255,0,0.15)` }} />
    <Body size={size} color={c.paper200}>Open to full-time UX roles</Body>
  </Abs>
);

const shot = (n: string) => `hello/${n}.webp`;

/* ================================================================ 01 HOOK */
const V1A = () => (
  <>
    <Abs x={L} y={300}>
      <H size={160}>Hiring a product</H>
      <H size={160} style={{ display: "flex", alignItems: "center", gap: 18 }}>
        designer?<span style={{ display: "inline-block", width: 26, height: 128, borderRadius: 6, background: c.signal, marginTop: 12 }} />
      </H>
    </Abs>
    <Abs x={L + 6} y={720}>
      <Body size={48} color={c.paper300}>Give me twenty seconds.</Body>
    </Abs>
  </>
);

const V1B = () => (
  <Abs x={L} y={330}>
    <H size={92} color={c.paper500} weight={500}>
      Most designers hand off{" "}
      <span style={{ position: "relative" }}>
        screens.
        <span style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 6, background: c.paper500 }} />
      </span>
    </H>
    <div style={{ height: 40 }} />
    <H size={170}>
      I hand off <Mark><Em>products.</Em></Mark>
    </H>
  </Abs>
);

const V1C = () => (
  <>
    <Abs x={L + 6} y={150}>
      <Mono size={24}>UX designer · Vadodara, India</Mono>
    </Abs>
    <Abs x={L} y={222} style={{ fontFamily: sans, fontWeight: 700, fontSize: 290, lineHeight: 0.86, letterSpacing: "-0.055em" }}>
      <div style={{ color: c.paper, padding: "0.02em 0 0.16em" }}>R{"ı"}yaz</div>
      <div style={{ color: c.paper500, padding: "0.02em 0 0.16em" }}>Malek</div>
    </Abs>
    <Dot x={390} y={258} />
    <Abs x={L + 6} y={830}>
      <Body size={52} color={c.paper200}>
        One designer. <span style={{ color: c.paper }}>Whole products.</span>
      </Body>
    </Abs>
  </>
);

/* ================================================================= 02 WHO */
const V2A = () => (
  <>
    <Portrait x={560} y={540} r={250} />
    <Abs x={1000} y={330} w={800}>
      <Mono>Self-taught · since 2023</Mono>
      <div style={{ height: 30 }} />
      <H size={74} weight={500} style={{ letterSpacing: "-0.035em" }}>
        I started as a graphic designer. Six months later, I was designing <Mark><Em>the product.</Em></Mark>
      </H>
    </Abs>
  </>
);

const V2B = () => {
  const nodes = [
    { x: 160, year: "2023", role: "Graphic Designer", org: "CareerNaksha" },
    { x: 520, year: "2023", role: "UX Designer", org: "Six months in" },
    { x: 880, year: "2024", role: "UX Designer", org: "Thatha, 20+ sites" },
    { x: 1240, year: "2025", role: "Freelance", org: "SaaS, EdTech, NGOs" },
    { x: 1600, year: "Next", role: "Your team", org: "Full-time", next: true },
  ];
  return (
    <>
      <Abs x={L} y={190}>
        <H size={96}>Three years. Four chapters.</H>
        <H size={96} color={c.paper500}>
          The next one is <Mark><Em>yours.</Em></Mark>
        </H>
      </Abs>
      <div style={{ position: "absolute", left: 160, top: 640, width: 1440, height: 2, background: c.ink700 }} />
      <div style={{ position: "absolute", left: 1240, top: 640, width: 360, height: 2, background: `repeating-linear-gradient(90deg, ${c.signal} 0 10px, transparent 10px 20px)` }} />
      {nodes.map((n) => (
        <React.Fragment key={n.x}>
          {n.next ? <Dot x={n.x} y={641} size={40} ring /> : <div style={{ position: "absolute", left: n.x - 9, top: 632, width: 18, height: 18, borderRadius: 99, background: c.paper300 }} />}
          <Abs x={n.x - 2} y={690} w={330}>
            <Mono color={n.next ? c.signal : c.paper500}>{n.year}</Mono>
            <div style={{ height: 14 }} />
            <Body size={34} color={c.paper}>{n.role}</Body>
            <Body size={24} color={c.paper500}>{n.org}</Body>
          </Abs>
        </React.Fragment>
      ))}
    </>
  );
};

const V2C = () => {
  const roles = [
    { t: "Researcher", x: 300, y: 260, ax: 820, ay: 380 },
    { t: "Strategist", x: 1360, y: 260, ax: 1100, ay: 380 },
    { t: "UI designer", x: 300, y: 600, ax: 790, ay: 560 },
    { t: "Prototyper", x: 1360, y: 600, ax: 1130, ay: 560 },
  ];
  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {roles.map((r) => (
          <line key={r.t} x1={r.x < 960 ? r.x + 260 : r.x - 20} y1={r.y + 26} x2={r.ax} y2={r.ay} stroke={c.ink600} strokeWidth={2} />
        ))}
      </svg>
      <Portrait x={960} y={470} r={200} />
      {roles.map((r) => (
        <Abs key={r.t} x={r.x} y={r.y}>
          <Body size={44} color={c.paper200}>{r.t}</Body>
        </Abs>
      ))}
      <Abs x={0} y={760} w={1920} style={{ textAlign: "center" }}>
        <H size={96}>
          Four jobs. <Mark>One designer.</Mark>
        </H>
        <div style={{ height: 22 }} />
        <Body size={34}>No design team behind me. That&rsquo;s how I&rsquo;ve shipped since day one.</Body>
      </Abs>
    </>
  );
};

/* ============================================================== 03 PROOF */
const Stat: React.FC<{ x: number; y: number; v: React.ReactNode; label: string; size?: number }> = ({ x, y, v, label, size = 200 }) => (
  <Abs x={x} y={y} w={460}>
    <H size={size} style={{ letterSpacing: "-0.05em", lineHeight: 1 }}>{v}</H>
    <div style={{ height: 26 }} />
    <Body size={34}>{label}</Body>
  </Abs>
);

const V3A = () => (
  <>
    <Abs x={L} y={290}>
      <Mono>What one designer carried</Mono>
    </Abs>
    <div style={{ position: "absolute", left: L, top: 350, width: 1560, height: 2, background: c.ink700 }} />
    <Dot x={L} y={351} size={18} />
    <Stat x={L} y={400} size={180} v="140+" label="screens, designed solo" />
    <Stat x={L + 600} y={400} size={180} v="5" label="user roles on one platform" />
    <Stat x={L + 1120} y={400} size={180} v="2" label="languages, both reading directions" />
  </>
);

const V3B = () => {
  const rows = [
    { m: "1 month", what: "ATRC", d: "Blank page to developer handoff", w: 420 },
    { m: "2 months", what: "PECUC", d: "A 15-page redesign", w: 840 },
    { m: "3 months", what: "CareerLogica", d: "A 140-screen platform", w: 1260 },
  ];
  return (
    <>
      <Abs x={L} y={170}>
        <H size={84}>I move fast because</H>
        <H size={84} color={c.paper500}>nothing gets lost between people.</H>
      </Abs>
      {rows.map((r, i) => (
        <Abs key={r.m} x={L} y={480 + i * 170} w={1600}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 28 }}>
            <H size={56} style={{ width: 280 }}>{r.m}</H>
            <Body size={32} color={c.paper200}>
              {r.what} <span style={{ color: c.paper500 }}>· {r.d}</span>
            </Body>
          </div>
          <div style={{ position: "relative", marginTop: 22, width: r.w, height: 10, borderRadius: 99, background: c.ink600 }}>
            <div style={{ position: "absolute", right: -11, top: -6, width: 22, height: 22, borderRadius: 99, background: c.signal }} />
          </div>
        </Abs>
      ))}
    </>
  );
};

const Cut: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <span>
    <span style={{ color: c.paper500 }}>{from}</span>
    <span style={{ color: c.paper500, fontWeight: 400, fontSize: "0.6em", margin: "0 0.15em" }}>{"→"}</span>
    {to}
  </span>
);

const V3C = () => (
  <>
    <Abs x={L} y={180}>
      <H size={96}>My best work is</H>
      <H size={96}>
        what I <Mark><Em>took out.</Em></Mark>
      </H>
    </Abs>
    <Stat x={L} y={540} size={150} v={<Cut from="37" to="7" />} label="navigation links" />
    <Stat x={L + 540} y={540} size={150} v={<Cut from="4" to="2" />} label="clicks to content" />
    <Stat x={L + 1080} y={540} size={150} v={<Cut from="9" to="1" />} label="websites, merged into one hub" />
  </>
);

/* ======================================================= 04 CAREERLOGICA */
const V4A = () => (
  <>
    <Abs x={L} y={250} w={680}>
      <Mono>001 · CareerLogica</Mono>
      <div style={{ height: 26 }} />
      <H size={68} weight={500} style={{ letterSpacing: "-0.035em" }}>
        Four users who want different things.
      </H>
      <H size={68} weight={500} color={c.paper500} style={{ letterSpacing: "-0.035em" }}>
        One system for all of them.
      </H>
      <div style={{ height: 44 }} />
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Pill>Student</Pill>
        <Pill filled>Counsellor</Pill>
        <Pill>School</Pill>
        <Pill>Admin</Pill>
      </div>
    </Abs>
    <Abs x={830} y={230}>
      <Laptop width={920}>
        <Img src={staticFile(shot("cl-counsellor"))} style={{ width: "100%", display: "block" }} />
      </Laptop>
    </Abs>
  </>
);

const V4B = () => (
  <>
    <Abs x={L} y={150}>
      <Mono>001 · CareerLogica</Mono>
      <div style={{ height: 24 }} />
      <H size={84}>Designed in English.</H>
      <H size={84} color={c.paper500}>
        Rebuilt for Arabic, <Mark><Em>right to left.</Em></Mark>
      </H>
    </Abs>
    <Abs x={L + 40} y={470}>
      <Card src={shot("cl-english")} width={700} aspect={1.427} />
      <Mono style={{ marginTop: 22 }}>English · left to right</Mono>
    </Abs>
    <Abs x={1020} y={470}>
      <Card src={shot("cl-arabic")} width={700} aspect={1.427} />
      <Mono style={{ marginTop: 22, textAlign: "right" }}>Arabic · right to left</Mono>
    </Abs>
    <div style={{ position: "absolute", left: 959, top: 470, width: 2, height: 490, background: c.ink700 }} />
    <Dot x={960} y={715} size={26} />
  </>
);

const WALL = [
  "cl-student", "wall-student-02-counselling", "wall-student-03-sessions", "wall-student-04-profile", "wall-student-05-admissions",
  "wall-student-06-library", "cl-counsellor", "wall-counsellor-02-test-codes", "wall-counsellor-03-student-connect", "wall-counsellor-04-appointments",
  "cl-school", "wall-school-02-students", "cl-admin", "wall-admin-02-users", "wall-admin-04-payments",
];

const V4C = () => (
  <>
    <AbsoluteFill style={{ perspective: 2200, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: 700,
          top: -120,
          display: "grid",
          gridTemplateColumns: "repeat(5, 420px)",
          gap: 26,
          transform: "rotateX(28deg) rotateZ(-14deg) rotateY(-10deg)",
          transformOrigin: "top left",
        }}
      >
        {[...WALL, ...WALL].slice(0, 25).map((n, i) => (
          <Img key={i} src={staticFile(shot(n))} style={{ width: 420, height: 262, borderRadius: 12, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }} />
        ))}
      </div>
      <AbsoluteFill style={{ background: `linear-gradient(90deg, ${c.ink} 30%, rgba(8,8,10,0.75) 55%, rgba(8,8,10,0) 85%)` }} />
    </AbsoluteFill>
    <Abs x={L} y={270} w={820}>
      <Mono>001 · CareerLogica</Mono>
      <div style={{ height: 26 }} />
      <H size={110}>140+ screens.</H>
      <div style={{ height: 18 }} />
      <H size={60} weight={500} color={c.paper500} style={{ letterSpacing: "-0.03em" }}>
        Work usually split across two or three designers.
      </H>
      <div style={{ height: 18 }} />
      <H size={60} weight={500} style={{ letterSpacing: "-0.03em" }}>
        I did it <Mark><Em>alone.</Em></Mark>
      </H>
    </Abs>
  </>
);

/* ============================================================== 05 PECUC */
const V5A = () => {
  const w = 900 - 900 * 0.024 * 2;
  const x = w * 0.56;
  return (
    <>
      <Abs x={70} y={230}>
        <Laptop width={900}>
          <div style={{ position: "relative", width: w, height: w / 1.6 }}>
            <Img src={staticFile(shot("pecuc-old"))} style={{ position: "absolute", width: w, height: w / 1.6 }} />
            <Img src={staticFile(shot("pecuc-new"))} style={{ position: "absolute", width: w, height: w / 1.6, clipPath: `inset(0 ${w - x}px 0 0)` }} />
            <div style={{ position: "absolute", left: x - 2, top: 0, width: 4, height: w / 1.6, background: c.signal }} />
            <div style={{ position: "absolute", left: x - 22, top: w / 3.2 - 22, width: 44, height: 44, borderRadius: 99, background: c.signal, boxShadow: "0 0 0 6px rgba(8,8,10,0.55)" }} />
          </div>
        </Laptop>
      </Abs>
      <Abs x={1180} y={260} w={640}>
        <Mono>002 · PECUC</Mono>
        <div style={{ height: 26 }} />
        <H size={76} weight={500} style={{ letterSpacing: "-0.035em" }}>
          UNICEF trusted their work.
        </H>
        <H size={76} weight={500} color={c.paper500} style={{ letterSpacing: "-0.035em" }}>
          Their website <Mark><Em>didn&rsquo;t.</Em></Mark>
        </H>
        <div style={{ height: 34 }} />
        <Body>So I rebuilt it around 35 years of proof.</Body>
      </Abs>
    </>
  );
};

const V5B = () => (
  <>
    <Abs x={L} y={270} w={700}>
      <Mono>002 · PECUC</Mono>
      <div style={{ height: 26 }} />
      <H size={84}>Their Donate link</H>
      <H size={84}>
        went <Mark><Em>nowhere.</Em></Mark>
      </H>
      <div style={{ height: 40 }} />
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <Pill style={{ textDecoration: "line-through", color: c.paper500 }}>href=&quot;#&quot;</Pill>
        <span style={{ fontFamily: sans, fontSize: 36, color: c.paper500 }}>{"→"}</span>
        <Pill filled>a real journey</Pill>
      </div>
      <div style={{ height: 34 }} />
      <Body>For a non-profit, that one link is the product. I rebuilt everything around it.</Body>
    </Abs>
    <Abs x={890} y={230}>
      <Laptop width={880}>
        <Img src={staticFile(shot("pecuc-donate"))} style={{ width: "100%", display: "block" }} />
      </Laptop>
    </Abs>
  </>
);

const V5C = () => {
  const tiles = ["Main site", "Blog", "Resource centre", "Photo gallery", "Video gallery", "Press", "Publications", "Annual reports", "Board files"];
  return (
    <>
      <Abs x={L} y={150}>
        <Mono>002 · PECUC</Mono>
        <div style={{ height: 24 }} />
        <H size={92}>
          Nine scattered sites. <Mark><Em>One home.</Em></Mark>
        </H>
      </Abs>
      <Abs x={L} y={420} style={{ display: "grid", gridTemplateColumns: "repeat(3, 200px)", gap: 18 }}>
        {tiles.map((t, i) => (
          <div
            key={t}
            style={{
              height: 120,
              borderRadius: 16,
              background: c.ink850,
              border: `1.5px solid ${c.ink700}`,
              padding: 18,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transform: `rotate(${((i * 37) % 9) - 4}deg)`,
            }}
          >
            <div style={{ height: 8, width: 60 + ((i * 23) % 70), borderRadius: 99, background: ["#a3122a", "#e3762b", "#3f7d20", "#2a5bd7"][i % 4], opacity: 0.8 }} />
            <Body size={22} color={c.paper200}>{t}</Body>
          </div>
        ))}
      </Abs>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        {[480, 620, 760].map((y) => (
          <path key={y} d={`M 830 ${y} C 900 ${y}, 900 640, 960 640`} stroke={c.ink600} strokeWidth={2} fill="none" />
        ))}
        <circle cx={960} cy={640} r={11} fill={c.signal} />
      </svg>
      <Abs x={990} y={380}>
        <Laptop width={760}>
          <Img src={staticFile(shot("pecuc-ba-04-new"))} style={{ width: "100%", display: "block" }} />
        </Laptop>
      </Abs>
    </>
  );
};

/* =============================================================== 06 ATRC */
const V6A = () => (
  <>
    <Abs x={L} y={270} w={700}>
      <Mono>003 · ATRC, Abu Dhabi</Mono>
      <div style={{ height: 26 }} />
      <H size={80} weight={500} style={{ letterSpacing: "-0.035em" }}>
        Fifteen-year-olds leave mid-test.
      </H>
      <H size={80} weight={500} color={c.paper500} style={{ letterSpacing: "-0.035em" }}>
        So every exit got a <Mark><Em>way back.</Em></Mark>
      </H>
    </Abs>
    <AbsoluteFill style={{ background: "radial-gradient(50% 50% at 72% 60%, rgba(98,40,255,0.2) 0%, rgba(98,40,255,0) 70%)" }} />
    <Abs x={880} y={240}>
      <Laptop width={880}>
        <Img src={staticFile(shot("atrc-still"))} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", aspectRatio: "1.6" }} />
      </Laptop>
    </Abs>
  </>
);

const V6B = () => (
  <>
    <Abs x={L} y={150}>
      <Mono>003 · ATRC, Abu Dhabi</Mono>
      <div style={{ height: 24 }} />
      <H size={84}>Two working prototypes</H>
      <H size={84} color={c.paper500}>
        before a single <Mark><Em>wireframe.</Em></Mark>
      </H>
    </Abs>
    <Abs x={L} y={450} style={{ transform: "rotate(-2deg)" }}>
      <Card src={shot("atrc-proto-a")} width={760} aspect={1.974} />
      <Mono style={{ marginTop: 22 }}>A · Consumer tone</Mono>
    </Abs>
    <Abs x={1000} y={470} style={{ transform: "rotate(2deg)" }}>
      <Card src={shot("atrc-proto-b")} width={760} aspect={1.974} />
      <Mono style={{ marginTop: 22 }}>B · Institutional tone</Mono>
    </Abs>
    <Abs x={L} y={965}>
      <Body size={30}>Built in Lovable, so the flow could be taken, not imagined.</Body>
    </Abs>
  </>
);

const V6C = () => {
  const steps = [
    { v: "Start.", src: "atrc-landing", a: 1.406 },
    { v: "Pause.", src: "atrc-pause", a: 1.4 },
    { v: "Come back.", src: "atrc-still", a: 1.4 },
    { v: "Finish.", src: "atrc-result", a: 1.406 },
  ];
  return (
    <>
      <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 50% 95%, rgba(98,40,255,0.22) 0%, rgba(98,40,255,0) 70%)" }} />
      <Abs x={L} y={170}>
        <Mono>003 · ATRC, Abu Dhabi</Mono>
        <div style={{ height: 24 }} />
        <H size={84}>A 25-question test, designed</H>
        <H size={84} color={c.paper500}>
          for the moment students <Mark><Em>drift.</Em></Mark>
        </H>
      </Abs>
      <div style={{ position: "absolute", left: L, top: 836, width: 1600, height: 2, background: c.ink700 }} />
      {steps.map((st, i) => (
        <React.Fragment key={st.v}>
          <Abs x={L + i * 410} y={520}>
            <Card src={shot(st.src)} width={380} aspect={st.a} />
          </Abs>
          <div style={{ position: "absolute", left: L + i * 410 - 9, top: 828, width: 18, height: 18, borderRadius: 99, background: i === 2 ? c.signal : c.paper300 }} />
          <Abs x={L + i * 410} y={870}>
            <Body size={38} color={i === 2 ? c.paper : c.paper300}>{st.v}</Body>
          </Abs>
        </React.Fragment>
      ))}
    </>
  );
};

/* ================================================================ 07 HOW */
const TOOLS = ["figma", "claude", "chatgpt", "miro", "framer", "relume", "mobin", "github", "antigravity"];

const V7A = () => (
  <>
    {TOOLS.map((t, i) => {
      const a = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
      return (
        <Img
          key={t}
          src={staticFile(`tools/${t}.webp`)}
          style={{ position: "absolute", left: 960 + Math.cos(a) * 330 - 44, top: 390 + Math.sin(a) * 150 - 44, width: 88, height: 88, opacity: Math.sin(a) < 0 ? 0.7 : 1 }}
        />
      );
    })}
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      <ellipse cx={960} cy={390} rx={330} ry={150} stroke={c.ink700} strokeWidth={1.5} fill="none" />
    </svg>
    <Dot x={960} y={390} size={56} />
    <Abs x={0} y={680} w={1920} style={{ textAlign: "center" }}>
      <H size={96}>AI writes the first draft.</H>
      <H size={96}>
        I make the <Mark><Em>calls.</Em></Mark>
      </H>
    </Abs>
  </>
);

const V7B = () => (
  <>
    <Abs x={L} y={150}>
      <H size={84}>Every call I make comes</H>
      <H size={84} color={c.paper500}>
        with its <Mark><Em>cost</Em></Mark> written down.
      </H>
    </Abs>
    <Abs x={L} y={460} w={1600} style={{ borderRadius: 22, background: c.ink850, border: `1.5px solid ${c.ink700}`, padding: "48px 56px 48px 64px", boxSizing: "border-box" }}>
      <div style={{ position: "absolute", left: 0, top: 40, bottom: 40, width: 6, borderRadius: 99, background: c.signal }} />
      {[
        ["Decision", "Cut 37 navigation links to 7.", c.paper, 48],
        ["Why", "Visitors arrive with one question. The old menu answered thirty-seven.", c.paper200, 34],
        ["Trade-off", "Compliance pages moved one click deeper. I accepted that on purpose.", c.paper200, 34],
      ].map(([k, v, col, size], i) => (
        <div key={k as string} style={{ display: "flex", gap: 40, alignItems: "baseline", marginTop: i ? 34 : 0 }}>
          <Mono style={{ width: 200 }}>{k as string}</Mono>
          <Body size={size as number} color={col as string}>{v as string}</Body>
        </div>
      ))}
    </Abs>
    <Abs x={L} y={920}>
      <Mono>PECUC redesign · one of the calls behind it</Mono>
    </Abs>
  </>
);

const V7C = () => {
  const w = 1000;
  return (
    <>
      <Abs x={L} y={300} w={560}>
        <H size={84}>Developers get answers</H>
        <H size={84} color={c.paper500}>
          before they <Mark><Em>ask.</Em></Mark>
        </H>
        <div style={{ height: 34 }} />
        <Body>Specs, states and edge cases, handed off with the screen.</Body>
      </Abs>
      <Abs x={780} y={230}>
        <div style={{ position: "relative", width: w, height: w / 1.6, borderRadius: 18, overflow: "hidden", boxShadow: "0 40px 80px rgba(0,0,0,0.5)" }}>
          <Img src={staticFile(shot("cl-student"))} style={{ width: w, height: w / 1.6 }} />
          <AbsoluteFill style={{ background: "rgba(8,8,10,0.35)" }} />
        </div>
        {/* illustrative annotations: what a handoff layer looks like, not real spec values */}
        <svg width={w + 200} height={w / 1.6 + 120} style={{ position: "absolute", left: -60, top: -40, overflow: "visible" }}>
          <rect x={60 + 253} y={40 + 95} width={720} height={150} fill="none" stroke={c.signal} strokeWidth={2} strokeDasharray="8 6" rx={12} />
          <line x1={60 + 253} y1={40 + 270} x2={60 + 973} y2={40 + 270} stroke={c.signal} strokeWidth={2} />
          <line x1={60 + 253} y1={40 + 262} x2={60 + 253} y2={40 + 278} stroke={c.signal} strokeWidth={2} />
          <line x1={60 + 973} y1={40 + 262} x2={60 + 973} y2={40 + 278} stroke={c.signal} strokeWidth={2} />
        </svg>
        <div style={{ position: "absolute", left: 560, top: 238 }}>
          <Pill size={20} style={{ background: c.signal, color: c.ink, borderColor: c.signal }}>Fill · 720</Pill>
        </div>
        <div style={{ position: "absolute", left: 700, top: 40 }}>
          <Pill size={20}>Hero card · 3 states</Pill>
        </div>
      </Abs>
    </>
  );
};

/* ================================================================ 08 ASK */
const V8A = () => (
  <>
    <Abs x={L} y={290} style={{ display: "flex", alignItems: "center", gap: 44 }}>
      <Img src={staticFile("hello/portrait.webp")} style={{ width: 176, height: 176, borderRadius: 999 }} />
      <H size={212} weight={700} style={{ letterSpacing: "-0.055em" }}>Riyazdesigns</H>
    </Abs>
    <Dot x={1650} y={472} />
    <div style={{ position: "absolute", left: L, top: 560, width: 1600, height: 2, background: c.ink700 }} />
    <Abs x={L} y={600}>
      <H size={56} weight={500} style={{ letterSpacing: "-0.03em" }}>
        Hiring a product designer? <span style={{ color: c.paper500 }}>Let&rsquo;s talk.</span>
      </H>
    </Abs>
    <Contacts x={L} y={720} />
  </>
);

const V8B = () => (
  <>
    <Abs x={0} y={250} w={1920} style={{ textAlign: "center" }}>
      <H size={110}>Your next designer is</H>
      <H size={110}>
        one <Mark><Em>email</Em></Mark> away.
      </H>
    </Abs>
    <Abs x={0} y={600} w={1920} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 14 }}>
      <div style={{ fontFamily: mono, fontSize: 64, color: c.paper200, letterSpacing: "-0.01em" }}>malekriyaz606@gmail.com</div>
      <span style={{ display: "inline-block", width: 18, height: 64, borderRadius: 4, background: c.signal }} />
    </Abs>
    <Abs x={0} y={780} w={1920} style={{ display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 16, height: 16, borderRadius: 99, background: c.signal, boxShadow: `0 0 0 6px rgba(170,255,0,0.15)` }} />
        <Body size={32} color={c.paper200}>Open to full-time UX roles · riyazdesigns.netlify.app</Body>
      </div>
    </Abs>
  </>
);

const V8C = () => (
  <>
    <Portrait x={440} y={520} r={250} />
    <Abs x={840} y={300} w={920}>
      <H size={128}>If you&rsquo;re hiring,</H>
      <H size={128}>
        I&rsquo;m <Mark><Em>ready.</Em></Mark>
      </H>
      <div style={{ height: 40 }} />
      <Body size={36} color={c.paper200}>Riyaz Malek · UX Designer · Vadodara, India</Body>
    </Abs>
    <Available x={840} y={720} />
    <Contacts x={840} y={800} size={20} />
  </>
);

export const VARIANTS: Record<string, React.FC> = {
  "1A": V1A, "1B": V1B, "1C": V1C,
  "2A": V2A, "2B": V2B, "2C": V2C,
  "3A": V3A, "3B": V3B, "3C": V3C,
  "4A": V4A, "4B": V4B, "4C": V4C,
  "5A": V5A, "5B": V5B, "5C": V5C,
  "6A": V6A, "6B": V6B, "6C": V6C,
  "7A": V7A, "7B": V7B, "7C": V7C,
  "8A": V8A, "8B": V8B, "8C": V8C,
};

export const Board: React.FC<{ id: string }> = ({ id }) => {
  const V = VARIANTS[id] ?? V1A;
  return (
    <AbsoluteFill style={{ background: c.ink }}>
      <Backdrop />
      <V />
    </AbsoluteFill>
  );
};
