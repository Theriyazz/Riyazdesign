import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { mono, sans } from "../../hello/kit";
import { Frame, k } from "../FilmFile";
import { Cursor, Grain, Riyaz, Shot, WALL } from "../kit";

/* Storyboard key poses for the positioning cut, in six palettes. Clients never
   share a flow: PECUC and CareerLogica are separate products for separate clients,
   so a prototype line only ever connects screens of the same project. */

type Palette = { ground: string; ink: string; cream: string; paper: string; you: string; him: string; select: string; onHim: string; dots: string; halo: string };

const palette = (ground: string, ink: string, surface: string, accent: string, onHim: string, dots: string, halo: string): Palette => ({
  ground,
  ink,
  cream: surface,
  paper: surface,
  you: ink,
  him: accent,
  select: ink,
  onHim,
  dots,
  halo,
});

export const THEMES: Record<string, Palette> = {
  "lime-dark": palette("#121613", "#f1f3ec", "#1e2420", "#b9ef4a", "#121613", "rgba(241,243,236,0.14)", "#39443b"),
  "lime-light": palette("#e9eddf", "#161b15", "#f9faf4", "#a4e02c", "#161b15", "rgba(22,27,21,0.17)", "transparent"),
  "cobalt-dark": palette("#10162a", "#eef1fa", "#1b2340", "#8fa8ff", "#10162a", "rgba(238,241,250,0.14)", "#2c3a68"),
  "cobalt-light": palette("#e6ebf8", "#121a38", "#fbfcff", "#2f55d4", "#ffffff", "rgba(18,26,56,0.16)", "transparent"),
  "clay-dark": palette("#1b1412", "#f6efe9", "#2a1f1b", "#f09470", "#1b1412", "rgba(246,239,233,0.13)", "#4b342b"),
  "clay-light": palette("#f3e4da", "#26150f", "#fffaf6", "#c9502a", "#ffffff", "rgba(38,21,15,0.16)", "transparent"),
};

const Cv: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AbsoluteFill style={{ background: k.ground, overflow: "hidden" }}>
    <AbsoluteFill style={{ backgroundImage: `radial-gradient(circle, ${(k as unknown as Palette).dots} 2.2px, transparent 2.6px)`, backgroundSize: "44px 44px" }} />
    {children}
    <Grain opacity={0.05} />
  </AbsoluteFill>
);

const T: React.FC<{ x?: number; y?: number; size: number; w?: number; color?: string; children: React.ReactNode; style?: React.CSSProperties; lh?: number }> = ({ x, y, size, w = 900, color, children, style, lh = 0.98 }) => (
  <div
    style={{
      ...(x === undefined ? {} : { position: "absolute" as const, left: x, top: y }),
      fontFamily: sans,
      fontSize: size,
      fontWeight: w,
      color: color ?? k.ink,
      lineHeight: lh,
      letterSpacing: size > 60 ? "-0.05em" : "-0.025em",
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {children}
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; dark?: boolean; size?: number; bg?: string; color?: string }> = ({ children, dark, size = 42, bg, color }) => (
  <div style={{ padding: `${size * 0.36}px ${size * 0.66}px`, background: bg ?? (dark ? k.ink : "transparent"), border: `4px solid ${k.ink}`, color: color ?? (dark ? k.ground : k.ink), fontFamily: sans, fontWeight: 700, fontSize: size, letterSpacing: "-0.03em", whiteSpace: "nowrap" }}>{children}</div>
);

const pal = () => k as unknown as Palette;
const You: React.FC<{ x: number; y: number }> = ({ x, y }) => <Cursor x={x} y={y} name="You" color={k.you} text={k.paper} />;
const Him: React.FC<{ x: number; y: number }> = ({ x, y }) => <Cursor x={x} y={y} name="Riyaz" color={k.him} text={pal().onHim} />;
const Noodle: React.FC<{ d: string; width?: number }> = ({ d, width = 7 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <path d={d} fill="none" stroke={k.ink} strokeWidth={width} strokeLinecap="round" />
  </svg>
);
const At: React.FC<{ x: number; y: number; children: React.ReactNode }> = ({ x, y, children }) => <div style={{ position: "absolute", left: x, top: y }}>{children}</div>;

/** Keeps the dark chair and laptop readable on a dark canvas; absent in light palettes. */
const Halo: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", background: pal().halo }} />;

const Comment: React.FC<{ who: string; role: string; initials: string; dark?: boolean; size?: number; width?: number; children: React.ReactNode }> = ({ who, role, initials, dark, size = 68, width = 1500, children }) => (
  <div style={{ display: "flex", gap: 22, width }}>
    <div style={{ width: 84, height: 84, borderRadius: 84, background: dark ? k.ink : k.paper, color: dark ? k.paper : k.ink, display: "grid", placeItems: "center", fontFamily: sans, fontWeight: 800, fontSize: 32, flexShrink: 0 }}>{initials}</div>
    <div style={{ background: dark ? k.ink : k.paper, color: dark ? k.paper : k.ink, padding: "28px 36px", borderRadius: "0 28px 28px 28px" }}>
      <div style={{ fontFamily: sans, fontWeight: 600, fontSize: 30, letterSpacing: "-0.015em", marginBottom: 12, opacity: 0.85 }}>
        {who}, <span style={{ fontWeight: 400 }}>{role}</span>
      </div>
      <div style={{ fontFamily: sans, fontWeight: 700, fontSize: size, lineHeight: 1.1, letterSpacing: "-0.03em" }}>{children}</div>
    </div>
  </div>
);

/* One project's own scene: problem, decision, result, wired to that project's screen. */
const Case: React.FC<{ title: string; problem: string; decision: string; result: string; src: string; name: string }> = ({ title, problem, decision, result, src, name }) => (
  <Cv>
    <T x={80} y={46} size={84}>
      {title}: problem, decision, result.
    </T>
    {[
      ["Problem", problem, 240, k.ink, k.paper],
      ["Decision", decision, 490, k.paper, k.ink],
      ["Result", result, 740, k.him, pal().onHim],
    ].map(([a, b, y, bg, fg]) => (
      <div key={a as string} style={{ position: "absolute", left: 80, top: y as number, width: 640, height: 210, background: bg as string, color: fg as string, padding: "22px 30px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: mono, fontSize: 28, marginBottom: 12 }}>{a}</div>
        <div style={{ fontFamily: sans, fontWeight: 800, fontSize: 52, lineHeight: 1.04, letterSpacing: "-0.035em", whiteSpace: "pre-line" }}>{b}</div>
      </div>
    ))}
    <Noodle d="M720 345 C 800 345, 760 400, 820 400" />
    <Noodle d="M720 845 C 800 845, 760 700, 820 700" />
    <Frame x={820} y={250} w={1020} h={638} name={name}>
      <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
    </Frame>
    <Him x={1660} y={800} />
  </Cv>
);

const BOARD: Record<string, React.FC> = {
  /* ---- kept: 1C */
  "1C": () => (
    <Cv>
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
      <Riyaz h={640} x={820} y={420} breathe={0} />
      {[
        ["Strategy", k.paper, k.ink, 1400, 70, -3],
        ["Planning", k.him, pal().onHim, 1480, 390, 2],
        ["Execution", k.ink, k.paper, 1380, 710, -2],
      ].map(([t, bg, fg, x, y, r]) => (
        <div key={t as string} style={{ position: "absolute", left: x as number, top: y as number, width: 400, height: 290, background: bg as string, transform: `rotate(${r}deg)`, boxShadow: "0 18px 36px rgba(0,0,0,0.22)", display: "flex", alignItems: "flex-end", padding: 30, boxSizing: "border-box" }}>
          <T size={72} color={fg as string}>
            {t}
          </T>
        </div>
      ))}
      <You x={120} y={800} />
    </Cv>
  ),

  /* ---- kept: 2A */
  "2A": () => (
    <Cv>
      <T x={100} y={70} size={110}>
        Built for three kinds of team.
      </T>
      {[
        ["Small and medium businesses", "small_medium_biz", k.cream, k.ink],
        ["Early-stage startups", "early_stage", k.ink, k.paper],
        ["Non-profits", "non_profit", k.him, pal().onHim],
      ].map(([t, name, bg, fg], i) => (
        <Frame key={name} x={100 + i * 590} y={330} w={540} h={600} name={name} bg={bg} selected={i === 1}>
          <div style={{ position: "absolute", left: 36, right: 36, bottom: 36, fontFamily: sans, fontWeight: 900, fontSize: 84, lineHeight: 0.98, letterSpacing: "-0.05em", color: fg }}>{t}</div>
        </Frame>
      ))}
      <Him x={1000} y={560} />
    </Cv>
  ),

  /* ---- remade: frame 3. Each client's page stands alone. */
  "3D": () => (
    <Cv>
      <T x={90} y={50} size={112}>
        Find the people who say yes.
      </T>
      <Frame x={90} y={270} w={830} h={470} name="careerlogica_site">
        <Img src={staticFile("hello/cl-english.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </Frame>
      <Frame x={1000} y={270} w={830} h={470} name="pecuc_donate">
        <Img src={staticFile("hello/pecuc-donate.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </Frame>
      <T x={90} y={765} size={118}>
        Customers
      </T>
      <T x={1000} y={765} size={118}>
        Donors
      </T>
      <T x={90} y={925} size={56} w={700}>
        CRO landing pages and websites.
      </T>
      <Him x={1660} y={640} />
    </Cv>
  ),
  "3E": () => (
    <Cv>
      <T x={90} y={40} size={100} lh={1.02}>
        Built to turn visitors into
        <br />
        customers and donors.
      </T>
      <Frame x={90} y={330} w={960} h={600} name="pecuc_home_2026">
        <Img src={staticFile("hello/pecuc-new.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </Frame>
      {[
        [130, 430, "1"],
        [560, 620, "2"],
        [170, 845, "3"],
      ].map(([x, y, n]) => (
        <div key={n as string} style={{ position: "absolute", left: x as number, top: y as number, width: 72, height: 72, borderRadius: "50% 50% 50% 0", background: k.him, color: pal().onHim, display: "grid", placeItems: "center", fontFamily: sans, fontWeight: 800, fontSize: 36 }}>{n}</div>
      ))}
      <div style={{ position: "absolute", left: 1120, top: 340, display: "flex", flexDirection: "column", gap: 40 }}>
        {[
          ["1", "A clear promise"],
          ["2", "Proof people trust"],
          ["3", "One next step"],
        ].map(([n, t]) => (
          <div key={n} style={{ display: "flex", gap: 24, alignItems: "baseline" }}>
            <T size={60} w={500}>
              {n}
            </T>
            <T size={76}>{t}</T>
          </div>
        ))}
      </div>
      <T x={1120} y={760} size={60} w={700} lh={1.12}>
        CRO landing pages
        <br />
        and websites.
      </T>
      <Him x={850} y={700} />
    </Cv>
  ),
  "3F": () => (
    <Cv>
      <T x={100} y={140} size={210}>
        Reach more
      </T>
      <T x={100} y={360} size={210}>
        customers.
      </T>
      <div style={{ position: "absolute", left: 88, top: 368, width: 1150, height: 210, border: `5px solid ${k.ink}` }} />
      <div style={{ position: "absolute", left: 1320, top: 150, width: 500, background: k.ink, padding: "28px 0" }}>
        <div style={{ fontFamily: mono, fontSize: 30, color: k.paper, padding: "0 32px 22px" }}>Property / audience</div>
        {["customers", "donors"].map((t, i) => (
          <div key={t} style={{ padding: "22px 32px", background: i === 0 ? k.him : "transparent" }}>
            <T size={64} w={700} color={i === 0 ? pal().onHim : k.paper}>
              {t}
            </T>
          </div>
        ))}
      </div>
      <T x={104} y={690} size={86} w={700} lh={1.1}>
        With CRO landing pages
        <br />
        and websites.
      </T>
      <Him x={1700} y={420} />
      <You x={1400} y={800} />
    </Cv>
  ),

  /* ---- remade: frame 4. One client's whole product, or no client at all. */
  "4D": () => (
    <Cv>
      <T x={90} y={50} size={200}>
        0 to 1.
      </T>
      <T x={760} y={70} size={66} w={700} lh={1.14}>
        Just a landing page, or a full
        <br />
        dashboard-powered product.
      </T>
      <Frame x={90} y={380} w={500} h={312} name="careerlogica_site">
        <Img src={staticFile("hello/cl-english.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </Frame>
      <Noodle d="M590 536 C 640 536, 620 560, 670 560" />
      <Frame x={670} y={380} w={560} h={350} name="careerlogica_student">
        <Img src={staticFile("hello/cl-student.webp")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
      </Frame>
      <Noodle d="M1230 560 C 1280 560, 1260 540, 1310 540" />
      <div style={{ position: "absolute", left: 1310, top: 332, fontFamily: mono, fontSize: 30, color: k.ink, fontWeight: 500 }}>careerlogica_dashboards</div>
      <div style={{ position: "absolute", left: 1310, top: 380, display: "grid", gridTemplateColumns: "repeat(2, 256px)", gap: 14 }}>
        {[WALL[3], WALL[6], WALL[10], WALL[7]].map((s) => (
          <Shot key={s} src={s} w={256} h={160} r={0} shadow="0 10px 22px rgba(0,0,0,0.25)" />
        ))}
      </div>
      <T x={90} y={840} size={84}>
        One product, built end to end.
      </T>
      <Him x={1210} y={660} />
    </Cv>
  ),
  "4E": () => (
    <Cv>
      <T x={90} y={56} size={112}>
        Startup? Start at any size.
      </T>
      <div style={{ position: "absolute", left: 90, top: 270, display: "flex", flexDirection: "column", gap: 18, alignItems: "flex-start" }}>
        <Chip size={54}>Landing page</Chip>
        <Chip size={54}>Website</Chip>
        <Chip size={54} dark>
          Product
        </Chip>
        <Chip size={54}>Dashboards</Chip>
      </div>
      <T x={90} y={860} size={52} w={700} lh={1.14}>
        From 0 to 1,
        <br />
        whatever you need.
      </T>
      <Frame x={620} y={270} w={1210} h={730} name="your_product">
        <div style={{ position: "absolute", inset: 0, display: "grid", gridTemplateColumns: "220px 1fr", gap: 22, padding: 26, boxSizing: "border-box" }}>
          <div style={{ background: k.ink, opacity: 0.12 }} />
          <div style={{ display: "grid", gridTemplateRows: "150px 1fr", gap: 22 }}>
            <div style={{ background: k.him }} />
            <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }}>
              <div style={{ background: k.ink, opacity: 0.2 }} />
              <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 22 }}>
                <div style={{ background: k.ink, opacity: 0.12 }} />
                <div style={{ background: k.ink, opacity: 0.12 }} />
              </div>
            </div>
          </div>
        </div>
      </Frame>
      <Him x={560} y={480} />
    </Cv>
  ),
  "4F": () => (
    <Cv>
      <T x={90} y={60} size={400} lh={1}>
        0&rarr;1
      </T>
      <T x={96} y={510} size={100}>
        From idea to live product.
      </T>
      <div style={{ position: "absolute", left: 96, top: 680, display: "flex", gap: 16 }}>
        <Chip size={48}>Landing page</Chip>
        <Chip size={48}>Website</Chip>
        <Chip size={48} dark>
          Dashboards
        </Chip>
      </div>
      <T x={96} y={850} size={56} w={700}>
        For startups, at any stage.
      </T>
      <Halo x={1580} y={520} r={300} />
      <Riyaz h={560} x={1370} y={250} breathe={0} />
      <You x={980} y={800} />
    </Cv>
  ),

  /* ---- kept: 5A */
  "5A": () => (
    <Cv>
      <Halo x={390} y={610} r={385} />
      <Riyaz h={980} x={40} y={80} breathe={0} />
      <div style={{ position: "absolute", left: 800, top: 230 }}>
        <svg width="120" height="130" viewBox="0 0 22 24" style={{ display: "block", marginLeft: -20 }}>
          <path d="M2 2 L20 10 L11.5 12.5 L8 21 Z" fill={k.him} stroke={k.paper} strokeWidth="1" strokeLinejoin="round" />
        </svg>
        <div style={{ marginTop: -14, padding: "28px 44px 36px", background: k.him }}>
          <T size={60} w={700} color={pal().onHim}>
            Hi, I&rsquo;m
          </T>
          <T size={156} color={pal().onHim} style={{ marginTop: 8 }}>
            Riyaz Malek
          </T>
        </div>
        <T size={60} w={700} style={{ marginTop: 36 }}>
          Product designer, based in Vadodara.
        </T>
      </div>
    </Cv>
  ),

  /* ---- kept: 6C, now one scene per client */
  "6C-pecuc": () => <Case title="PECUC" problem={"A 2001 website hid\n35 years of work"} decision={"Organise around what\nvisitors want"} result={"37 links to 7.\n4 clicks to 2."} src="hello/pecuc-new.webp" name="pecuc_home_2026" />,
  "6C-careerlogica": () => <Case title="CareerLogica" problem={"Students pick careers\nwith no credible tool"} decision={"Free until the first\nreal result"} result={"140+ screens, 5 roles,\nEnglish and Arabic."} src="hello/cl-student.webp" name="careerlogica_student_dashboard" />,
  "6C-atrc": () => <Case title="ATRC" problem={"Fifteen-year-olds quit\nlong tests midway"} decision={"Keep it long. Design\nreasons to finish."} result={"25 questions.\nEvery exit a way back."} src="hello/atrc-result.webp" name="atrc_stem_test" />,

  /* ---- kept: 7A */
  "7A": () => (
    <Cv>
      <T x={90} y={60} size={120}>
        One person, the whole job.
      </T>
      <div style={{ position: "absolute", left: 90, top: 222, fontFamily: mono, fontSize: 30, color: k.ink }}>skills / 8 variants</div>
      <div style={{ position: "absolute", left: 90, top: 270, width: 1740, height: 700, border: `5px dashed ${k.ink}`, padding: 44, boxSizing: "border-box", display: "flex", flexWrap: "wrap", gap: 26, alignContent: "flex-start" }}>
        {["UX strategy", "Research", "Information architecture", "UI design", "Prototyping", "Design systems", "CRO landing pages", "AI-assisted workflow"].map((t, i) => (
          <Chip key={t} size={68} dark={i % 3 === 0}>
            {t}
          </Chip>
        ))}
      </div>
      <Him x={1640} y={830} />
    </Cv>
  ),

  /* ---- kept: 8A, with each client named against their own product */
  "8A": () => (
    <Cv>
      <T x={90} y={50} size={100}>
        Don&rsquo;t take my word for it.
      </T>
      <At x={90} y={230}>
        <Comment who="Ranjan Kumar Mohanty" role="Secretary-cum-CEO, PECUC" initials="RK">
          &ldquo;He understood our vision and translated it into a clean, modern, and highly accessible platform.&rdquo;
        </Comment>
      </At>
      <At x={330} y={610}>
        <Comment who="Himanshu Parmar" role="IT Manager, EdLogica (CareerLogica)" initials="HP" dark>
          &ldquo;His creativity, technical expertise, and attention to detail helped bring our vision to life.&rdquo;
        </Comment>
      </At>
      <Him x={1720} y={960} />
    </Cv>
  ),

  /* ---- kept: 9C */
  "9C": () => (
    <Cv>
      <T x={90} y={70} size={196} lh={0.98}>
        Your next site
        <br />
        shouldn&rsquo;t be
        <br />
        AI slop.
      </T>
      <T x={94} y={700} size={62} w={700}>
        Let&rsquo;s build one that makes you money.
      </T>
      <div style={{ position: "absolute", left: 94, top: 820, padding: "38px 66px", background: k.ink, color: k.ground, fontFamily: sans, fontWeight: 800, fontSize: 76, letterSpacing: "-0.04em", whiteSpace: "nowrap" }}>riyazdesigns.netlify.app</div>
      <Halo x={1590} y={720} r={330} />
      <Riyaz h={720} x={1320} y={340} breathe={0} />
      <You x={1190} y={900} />
    </Cv>
  ),
};

export const PositioningBoard: React.FC<{ id: string; theme: string }> = ({ id, theme }) => {
  // The kept file-film parts read this shared token object, so the palette is set before they render.
  Object.assign(k, THEMES[theme]);
  const C = BOARD[id];
  return <C />;
};
