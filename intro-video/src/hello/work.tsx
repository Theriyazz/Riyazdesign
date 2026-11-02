import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { copy } from "./copy";
import { Backdrop, c, Card, Chip, ease, glide, Label, Laptop, mono, Odometer, Phone, ramp, Rise, s, sans, settle, Stage } from "./kit";

const LEFT = 160;

/* --------------------------------------------------------------- numbers ---
   A dot field that ripples out from where the lime pen starts drawing. */
const DotField: React.FC<{ ox: number; oy: number; at: number }> = ({ ox, oy, at }) => {
  const f = useCurrentFrame();
  const gap = 40;
  const wave = (f - at) * 26;
  const dots: React.ReactNode[] = [];
  for (let y = gap / 2; y < 1080; y += gap) {
    for (let x = gap / 2; x < 1920; x += gap) {
      const d = Math.hypot(x - ox, y - oy);
      const crest = Math.exp(-((d - wave) ** 2) / (2 * 70 ** 2));
      const settled = d < wave ? 0.3 : 0;
      const a = Math.max(settled, crest * 0.9);
      if (a < 0.02) continue;
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={1.6 + crest * 1.4} fill={c.paper500} opacity={a} />);
    }
  }
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
      {dots}
    </svg>
  );
};

export const NUMBERS_DUR = s(2.7);

/** 3. Three facts, rolled in on odometer digits. */
export const Numbers: React.FC = () => {
  const f = useCurrentFrame();
  const colW = 520;
  const top = 360;
  const pen = ramp(f, s(0.15), s(1.15), 0, 1, ease.inOut);
  return (
    <Stage dur={NUMBERS_DUR}>
      <Backdrop />
      <DotField ox={LEFT} oy={top} at={s(0.1)} />
      {/* the rule the lime dot draws across all three columns */}
      <div style={{ position: "absolute", left: LEFT, top, width: colW * 3 - 40, height: 2, background: c.ink700, transformOrigin: "left", transform: `scaleX(${pen})` }} />
      <div
        style={{
          position: "absolute",
          left: LEFT + pen * (colW * 3 - 40) - 9,
          top: top - 8,
          width: 18,
          height: 18,
          borderRadius: 99,
          background: c.signal,
          opacity: ramp(f, s(0.1), s(0.25)) * (1 - ramp(f, s(1.2), s(1.45))),
        }}
      />
      {copy.stats.map((st, i) => {
        const at = s(0.3) + i * s(0.28);
        return (
          <div key={i} style={{ position: "absolute", left: LEFT + i * colW, top: top + 44, width: colW - 80 }}>
            <Odometer value={st.value} at={at} size={210} />
            <div style={{ height: 26 }} />
            <Rise at={at + s(0.35)} size={34} weight={400} color={c.paper300} tracking="-0.01em" step={2}>
              {st.label}
            </Rise>
          </div>
        );
      })}
    </Stage>
  );
};

/* ------------------------------------------------------------ case head --- */
const Head: React.FC<{ index: string; title: string; size?: number; at?: number }> = ({ index, title, size = 108, at = s(0.15) }) => (
  <>
    <Label at={at} size={24} color={c.paper500}>
      {index}
    </Label>
    <div style={{ height: 18 }} />
    <Rise at={at + s(0.08)} size={size} weight={600} tracking="-0.045em" step={5}>
      {title}
    </Rise>
  </>
);

/* --------------------------------------------------------- careerlogica --- */
export const CL_DUR = s(3.4);

export const CareerLogica: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cl = copy.careerlogica;
  const lap = 940;
  const screenW = lap - lap * 0.024 * 2;
  const screenH = screenW / 1.6;

  const enter = glide(f, fps, s(0.05));
  const changes = [s(1.15), s(1.8), s(2.45)];
  const scroll = changes.reduce((acc, at) => acc + ramp(f, at, at + s(0.38), 0, 1, ease.inOut), 0);

  const phone = settle(f, fps, s(0.75), 90);

  return (
    <Stage dur={CL_DUR}>
      <Backdrop />
      <div style={{ position: "absolute", left: LEFT, top: 300, width: 680 }}>
        <Head index={cl.index} title={cl.title} />
        <div style={{ height: 26 }} />
        <Rise at={s(0.45)} size={34} weight={400} color={c.paper300} tracking="-0.01em" step={2}>
          {cl.sub}
        </Rise>
        <div style={{ height: 44 }} />
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {cl.chips.map((t, i) => (
            <Chip key={t} at={s(0.8) + i * s(0.09)}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 790,
          top: 214,
          transform: `translateX(${(1 - enter) * 260}px) rotateY(${(1 - enter) * -12}deg)`,
          opacity: Math.min(1, enter * 1.5),
        }}
      >
        <Laptop width={lap}>
          <div style={{ transform: `translateY(${-scroll * screenH}px)` }}>
            {cl.screens.map((src) => (
              <Img key={src} src={staticFile(src)} style={{ display: "block", width: screenW, height: screenH }} />
            ))}
          </div>
        </Laptop>
      </div>

      <Phone
        width={232}
        src={cl.phone}
        aspect={0.526}
        style={{
          position: "absolute",
          left: 800,
          top: 548,
          opacity: Math.min(1, phone * 2),
          transform: `translateY(${(1 - phone) * 160}px) rotate(${-7 + phone * 3}deg)`,
        }}
      />
    </Stage>
  );
};

/* ---------------------------------------------------------------- pecuc --- */
export const PECUC_DUR = s(3.4);

/** Counts down from `from` to `to`, a number per frame at the start, slowing into place. */
const Countdown: React.FC<{ from: number; to: number; at: number; size: number }> = ({ from, to, at, size }) => {
  const f = useCurrentFrame();
  const v = Math.round(interpolate(ramp(f, at, at + s(1.1), 0, 1, ease.out), [0, 1], [from, to]));
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: size * 0.22, fontFamily: sans, fontWeight: 600, fontSize: size, letterSpacing: "-0.05em", lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
      <span style={{ color: c.paper500 }}>{from}</span>
      <span style={{ color: c.paper500, fontWeight: 400, fontSize: size * 0.7 }}>{"→"}</span>
      <span style={{ color: c.paper, minWidth: "1.2em" }}>{v}</span>
    </div>
  );
};

export const Pecuc: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = copy.pecuc;
  const lap = 940;
  const screenW = lap - lap * 0.024 * 2;
  const screenH = screenW / 1.6;

  const enter = glide(f, fps, s(0.05));
  const handle = settle(f, fps, s(0.7), 200);
  const wipe = ramp(f, s(0.95), s(1.95), 0, 1, ease.inOut);
  const x = wipe * screenW;

  return (
    <Stage dur={PECUC_DUR}>
      <Backdrop />
      <div
        style={{
          position: "absolute",
          left: 64,
          top: 214,
          transform: `translateX(${(1 - enter) * -260}px)`,
          opacity: Math.min(1, enter * 1.5),
        }}
      >
        <Laptop width={lap}>
          <Img src={staticFile("hello/pecuc-old.webp")} style={{ position: "absolute", width: screenW, height: screenH }} />
          <Img
            src={staticFile("hello/pecuc-new.webp")}
            style={{ position: "absolute", width: screenW, height: screenH, clipPath: `inset(0 ${screenW - x}px 0 0)` }}
          />
          {/* the wipe: a lime rule, with the dot as its handle */}
          <div style={{ position: "absolute", left: x - 2, top: 0, width: 4, height: screenH, background: c.signal, opacity: handle * (1 - ramp(f, s(2.0), s(2.3))) }} />
          <div
            style={{
              position: "absolute",
              left: x - 22,
              top: screenH / 2 - 22,
              width: 44,
              height: 44,
              borderRadius: 99,
              background: c.signal,
              boxShadow: `0 0 0 6px rgba(8,8,10,0.55)`,
              transform: `scale(${handle})`,
              opacity: 1 - ramp(f, s(2.0), s(2.3)),
            }}
          />
        </Laptop>
        <div style={{ display: "flex", justifyContent: "space-between", width: lap, margin: "34px 0 0 66px" }}>
          <Label at={s(0.5)} size={20} color={wipe < 0.5 ? c.paper200 : c.paper500}>
            {p.before}
          </Label>
          <Label at={s(0.5)} size={20} color={wipe >= 0.5 ? c.paper200 : c.paper500}>
            {p.after}
          </Label>
        </div>
      </div>

      <div style={{ position: "absolute", left: 1220, top: 214, width: 600 }}>
        <Head index={p.index} title={p.title} />
        <div style={{ height: 22 }} />
        {p.sub.map((line, i) => (
          <Rise key={line} at={s(0.4) + i * s(0.12)} size={36} weight={400} color={c.paper300} tracking="-0.01em" step={2}>
            {line}
          </Rise>
        ))}
        <div style={{ height: 54 }} />
        {p.stats.map((st, i) => {
          const at = s(1.0) + i * s(0.35);
          const o = ramp(f, at - s(0.1), at + s(0.2));
          return (
            <div key={st.label} style={{ marginBottom: 34, opacity: o, transform: `translateY(${(1 - o) * 24}px)` }}>
              <Countdown from={st.from} to={st.to} at={at} size={100} />
              <div style={{ height: 10 }} />
              <div style={{ fontFamily: sans, fontSize: 28, color: c.paper300, letterSpacing: "-0.01em" }}>{st.label}</div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/* ----------------------------------------------------------------- atrc --- */
export const ATRC_DUR = s(3.3);

export const Atrc: React.FC = () => {
  const f = useCurrentFrame();
  const a = copy.atrc;
  const h = 400;
  const gap = 40;
  const widths = a.flow.map((it) => (it.phone ? 214 : h * it.aspect));
  const total = widths.reduce((x, w) => x + w, 0) + gap * (widths.length - 1);
  const pan = ramp(f, s(0.1), ATRC_DUR - s(0.2), 0, 1, ease.inOut);
  const startX = LEFT + 320;
  const endX = 1920 - LEFT - total;
  const x = interpolate(pan, [0, 1], [startX, endX]);

  let cursor = 0;
  return (
    <Stage dur={ATRC_DUR}>
      <Backdrop />
      {/* ATRC's own violet, as light falling on the floor, not as a fill */}
      <AbsoluteFill style={{ background: "radial-gradient(60% 50% at 60% 92%, rgba(98,40,255,0.22) 0%, rgba(98,40,255,0) 70%)" }} />
      <div style={{ position: "absolute", left: LEFT, top: 130, width: 1600 }}>
        <Head index={a.index} title={a.title} size={92} />
        <div style={{ height: 20 }} />
        <Rise at={s(0.4)} size={36} weight={400} color={c.paper300} tracking="-0.01em" step={2} em={[10]}>
          {a.sub}
        </Rise>
        <div style={{ height: 32 }} />
        <div style={{ display: "flex", gap: 14 }}>
          {a.chips.map((t, i) => (
            <Chip key={t} at={s(0.75) + i * s(0.08)} size={21}>
              {t}
            </Chip>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", top: 548, left: x, display: "flex", gap, alignItems: "flex-start" }}>
        {a.flow.map((it, i) => {
          const w = widths[i];
          const left = x + cursor;
          cursor += w + gap;
          // each card lifts a little as it passes through the middle of the frame
          const mid = left + w / 2;
          const near = Math.max(0, 1 - Math.abs(mid - 960) / 900);
          return (
            <div key={it.src} style={{ display: "flex", flexDirection: "column", gap: 22, transform: `translateY(${-near * 14}px)` }}>
              {it.phone ? <Phone width={w} src={it.src} aspect={it.aspect} /> : <Card src={it.src} width={w} aspect={it.aspect} />}
              <div style={{ fontFamily: mono, fontSize: 19, letterSpacing: "0.12em", textTransform: "uppercase", color: near > 0.6 ? c.paper200 : c.paper500 }}>
                {it.label}
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};
