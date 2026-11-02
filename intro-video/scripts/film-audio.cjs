/* Scores the positioning film from code: no samples, no vocals, nothing licensed.
   Writes sfx.wav and music.wav, both exactly as long as the picture.
   usage: node scripts/film-audio.cjs <output dir>

   Cue times are written at 1x, the same numbers as FilmPositioning.tsx, and
   divided by SPEED here, so the sound stays locked to the picture. */
const fs = require("fs");
const path = require("path");

const SR = 48000;
const SPEED = 1.25;
const DUR = 44 / SPEED;
const LEN = Math.round(DUR * SR);
const out = process.argv[2];
const at = (t) => t / SPEED;

/* ---- deterministic noise, so a re-render sounds identical */
let seed = 20261101;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const noise = () => rnd() * 2 - 1;

const stereo = (n = LEN) => [new Float32Array(n), new Float32Array(n)];

/** Adds a mono voice into a bus at a time, level and pan (-1 to 1). */
const put = (bus, t, voice, gain = 1, pan = 0) => {
  const start = Math.round(t * SR);
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
  for (let i = 0; i < voice.length; i++) {
    const j = start + i;
    if (j < 0 || j >= bus[0].length) continue;
    bus[0][j] += voice[i] * gl;
    bus[1][j] += voice[i] * gr;
  }
};

/** State-variable filter with a per-sample cutoff. kind: lp, hp or bp. */
const svf = (x, cutoff, q, kind) => {
  const y = new Float32Array(x.length);
  let lo = 0;
  let band = 0;
  const damp = 1 / q;
  for (let i = 0; i < x.length; i++) {
    const hz = typeof cutoff === "function" ? cutoff(i / SR) : cutoff;
    const g = 2 * Math.sin((Math.PI * Math.min(hz, SR / 6.5)) / SR);
    lo += g * band;
    const hi = x[i] - lo - damp * band;
    band += g * hi;
    y[i] = kind === "lp" ? lo : kind === "hp" ? hi : band;
  }
  return y;
};

const make = (dur, fn) => {
  const v = new Float32Array(Math.round(dur * SR));
  for (let i = 0; i < v.length; i++) v[i] = fn(i / SR, i / v.length);
  return v;
};
const clip = (x) => Math.tanh(x);
const fadeEnds = (v, ms = 3) => {
  const n = Math.round((ms / 1000) * SR);
  for (let i = 0; i < n && i < v.length; i++) {
    v[i] *= i / n;
    v[v.length - 1 - i] *= i / n;
  }
  return v;
};

/** Band-limited saw, so the high notes do not alias. */
const saw = (phase, dt) => {
  const p = phase % 1;
  let v = 2 * p - 1;
  if (p < dt) {
    const a = p / dt;
    v -= a + a - a * a - 1;
  } else if (p > 1 - dt) {
    const a = (p - 1) / dt;
    v -= a * a + a + a + 1;
  }
  return v;
};
const hz = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

/* ------------------------------------------------------------- the SFX --- */
const click = () => fadeEnds(make(0.05, (t) => (Math.sin(2 * Math.PI * 2600 * t) * 0.6 + noise() * 0.5) * Math.exp(-t * 170)), 0.4);
const tick = (f = 3200) => fadeEnds(make(0.03, (t) => Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 240)), 0.3);

/** Soft rounded pop: a fast upward pitch blip. */
const pop = (base = 420, rise = 2.1) =>
  fadeEnds(
    (() => {
      let ph = 0;
      return make(0.13, (t) => {
        ph += (base * (1 + (rise - 1) * (1 - Math.exp(-t * 55)))) / SR;
        return (Math.sin(2 * Math.PI * ph) + 0.25 * Math.sin(4 * Math.PI * ph)) * Math.exp(-t * 36) * Math.min(1, t * 900);
      });
    })(),
    1,
  );

/** Air moving past the camera. Filtered noise that peaks in the middle. */
const whoosh = (dur = 0.5, lo = 350, hi = 3400, up = true) => {
  const raw = make(dur, () => noise());
  const f = svf(raw, (t) => {
    const u = Math.sin((Math.PI * t) / dur);
    return up ? lo + (hi - lo) * u * u : hi - (hi - lo) * (t / dur);
  }, 1.6, "bp");
  return fadeEnds(f.map((x, i) => x * Math.pow(Math.sin((Math.PI * i) / f.length), 1.4) * 1.5), 2);
};

/** Low body plus a transient: the weight behind a landing. */
const impact = (dur = 0.7, base = 62, snap = 0.55) => {
  let ph = 0;
  return fadeEnds(
    make(dur, (t) => {
      ph += (base * (1 + 2.6 * Math.exp(-t * 42))) / SR;
      const body = Math.sin(2 * Math.PI * ph) * Math.exp(-t * (5.5 / dur));
      const crack = noise() * Math.exp(-t * 110) * snap;
      return clip(body * 1.5 + crack);
    }),
    0.5,
  );
};

/** Rising tone into a hit. */
const riser = (dur = 0.8, from = 180, to = 1500) => {
  const raw = make(dur, () => noise());
  const f = svf(raw, (t) => from * Math.pow(to / from, t / dur), 5, "bp");
  let ph = 0;
  return fadeEnds(
    make(dur, (t, u) => {
      ph += (from * Math.pow(to / from, u)) / SR;
      return (f[Math.round(t * SR)] * 1.1 + Math.sin(2 * Math.PI * ph) * 0.22) * u * u;
    }),
    2,
  );
};

/** Chat bubble arriving: two quick rising notes. */
const bloop = () => {
  const n = (f, a, d) => make(d, (t) => Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 26) * a * Math.min(1, t * 800));
  const a = n(740, 0.8, 0.14);
  const b = n(1110, 0.9, 0.24);
  const v = new Float32Array(Math.round(0.34 * SR));
  a.forEach((x, i) => (v[i] += x));
  b.forEach((x, i) => (v[i + Math.round(0.075 * SR)] += x));
  return fadeEnds(v, 1);
};

/** Slicing through the frame for the lime blades. */
const blade = () => {
  const raw = make(0.34, () => noise());
  const f = svf(raw, (t) => 900 + 8500 * Math.pow(t / 0.34, 1.6), 2.4, "hp");
  return fadeEnds(f.map((x, i) => x * Math.pow(i / f.length, 2) * Math.exp(-(i / SR) * 3)), 1);
};

/** Film-strip rattle while the carousels run. */
const rattle = (dur, rate, level, f = 2100) => {
  const v = new Float32Array(Math.round(dur * SR));
  const t0 = tick(f);
  for (let t = 0; t < dur - 0.04; t += 1 / rate(t / dur)) {
    const j = Math.round(t * SR);
    t0.forEach((x, i) => (v[j + i] += x * level * (0.7 + rnd() * 0.3)));
  }
  return v;
};

const buildSfx = () => {
  const bus = stereo();

  // 1 the statement: the three sticky notes bounce in.
  [0, 1, 2].forEach((i) => put(bus, at(0.95) + (i * 16) / 60, pop(300 + i * 90, 2.2), 0.42, -0.1 + i * 0.25));

  // Every camera flight between scenes.
  [[4.4, 5], [8.4, 9], [13.4, 14], [17.4, 18], [31.8, 32.4], [39, 39.6]].forEach(([a, b], i) => {
    put(bus, at(a) - 0.02, whoosh((b - a) / SPEED + 0.1, 320, 3000), 0.4, i % 2 ? 0.25 : -0.25);
  });

  // 2 who it's for: frames land, then the cursor selects each one.
  [0, 1, 2].forEach((i) => put(bus, at(5.15) + (i * 9) / 60, pop(340 + i * 70, 1.9), 0.36, -0.4 + i * 0.4));
  [5.8, 6.8, 7.6].forEach((t, i) => put(bus, at(t), click(), 0.42, -0.4 + i * 0.4));

  // 3 the word swap: menu opens, click, the word rolls over.
  put(bus, at(9.9), tick(2400), 0.32, 0.5);
  put(bus, at(11.05), click(), 0.45, 0.5);
  put(bus, at(11.1), whoosh(0.32, 700, 4200), 0.32, 0);
  put(bus, at(11.55), pop(520, 1.6), 0.26, 0);

  // 4 0 to 1: the arrow shoots, the 1 slams, the chips snap on.
  put(bus, at(14.5), riser(0.36, 260, 2400), 0.3, 0);
  put(bus, at(14.9), impact(0.8, 58, 0.7), 0.85, 0);
  [15.6, 15.75, 15.9].forEach((t, i) => put(bus, at(t), pop(380 + i * 110, 1.9), 0.34, -0.3 + i * 0.3));

  // 5 the name: the tag swells and lands.
  put(bus, at(17.5), riser(at(18.25) - at(17.5), 200, 1800), 0.34, 0);
  put(bus, at(18.25), impact(1.0, 52, 0.45), 0.8, 0);
  put(bus, at(18.25), pop(560, 1.5), 0.3, 0);

  // Work: iris open, three carousels, two blades, three nameplates.
  const WORK = 20.9;
  const LEN_B = 2.8;
  const LEN_C = 5.6;
  put(bus, at(WORK) - 0.3, riser(0.34, 300, 3000), 0.3, 0);
  put(bus, at(WORK), impact(0.55, 70, 0.6), 0.62, 0);
  // CareerLogica and PECUC rattle fast and slow down, as their lanes do. ATRC stays quiet.
  const rate = (u) => 34 - 22 * Math.min(1, u * 2.2);
  put(bus, at(WORK), rattle((LEN_B * 1) / SPEED, rate, 0.26, 2300), 0.42, -0.3);
  put(bus, at(WORK + LEN_B), rattle((LEN_C - LEN_B) / SPEED, rate, 0.26, 1800), 0.42, 0.3);
  put(bus, at(WORK + LEN_C), rattle((8.5 - LEN_C) / SPEED, () => 6, 0.14, 1500), 0.3, 0);
  [LEN_B, LEN_C].forEach((t) => put(bus, at(WORK + t) - 0.2, blade(), 0.5, 0));
  [[0, 0.62], [LEN_B, 0.62], [LEN_C, 0.42]].forEach(([t, g]) => {
    const when = at(WORK + t) + 8 / 60 + 0.08;
    put(bus, when - 0.14, whoosh(0.2, 800, 3400), g * 0.6, -0.3);
    put(bus, when, impact(0.42, 86, 0.5), g, 0);
  });
  put(bus, at(WORK + 8.5) - 0.12, whoosh(0.4, 400, 2200), 0.3, 0);

  // 7 skills: each chip snaps on, climbing a scale.
  const scale = [57, 60, 62, 64, 67, 69, 72, 74];
  scale.forEach((n, i) => put(bus, at(29.55) + (i * 7) / 60, pop(hz(n) * 0.75, 1.5), 0.3, -0.5 + (i % 4) * 0.33));

  // 8 the testimonials arrive as messages.
  put(bus, at(32.8), bloop(), 0.38, -0.2);
  put(bus, at(35.8), bloop(), 0.38, 0.2);

  // 9 the close: three lines land harder and harder.
  [[39.5, 0.42, 92], [39.7, 0.5, 78], [39.9, 0.9, 54]].forEach(([t, g, f]) => put(bus, at(t), impact(t === 39.9 ? 1.1 : 0.32, f, 0.6), g, 0));
  put(bus, at(41.2), pop(460, 1.8), 0.36, -0.2);
  put(bus, at(42.2), click(), 0.5, -0.1);
  put(bus, at(42.2) + 0.02, pop(700, 1.3), 0.22, -0.1);

  // Home to the poster.
  put(bus, at(43.1), whoosh(0.72, 300, 2600), 0.42, 0);
  return bus;
};

/* ----------------------------------------------------------- the music --- */
/* 63 beats fit the film exactly, so the track is on the grid at both ends of the
   loop. Beat 30 meets the work section; each four-beat bar then meets a blade. */
const BEATS = 63;
const BEAT = DUR / BEATS;
const b2t = (b) => b * BEAT;

const CHORDS = [
  [57, 60, 64, 71], // Am9-ish
  [53, 57, 60, 64], // Fmaj7
  [48, 55, 60, 64], // C
  [55, 59, 62, 69], // G6/9
];
const chordAt = (beat) => CHORDS[Math.floor(((beat + 2) % 16) / 4) % 4];

const kick = make(0.34, (t) => {
  const f = 46 + 118 * Math.exp(-t * 34);
  return clip(Math.sin(2 * Math.PI * f * t) * Math.exp(-t * 11) * 1.7 + noise() * Math.exp(-t * 320) * 0.25);
});
const clap = (() => {
  const raw = make(0.22, (t) => noise() * (Math.exp(-t * 24) + (t < 0.024 ? 0.7 * Math.exp(-((t % 0.008) * 500)) : 0)));
  return fadeEnds(svf(raw, 1700, 1.2, "bp"), 0.5);
})();
const hat = (open) => {
  const raw = make(open ? 0.17 : 0.05, (t) => noise() * Math.exp(-t * (open ? 22 : 90)));
  return fadeEnds(svf(raw, 8200, 1, "hp"), 0.4);
};
const HAT_C = hat(false);
const HAT_O = hat(true);

const pluck = (note, dur, cutoff) => {
  const f = hz(note);
  const dt = f / SR;
  let a = rnd();
  let b = rnd();
  const raw = make(dur, (t) => {
    a += dt;
    b += dt * 1.006;
    return (saw(a, dt) + saw(b, dt * 1.006)) * 0.5 * Math.exp(-t * 7);
  });
  return fadeEnds(svf(raw, (t) => cutoff * (0.35 + 1.5 * Math.exp(-t * 14)), 1.4, "lp"), 2);
};

const bassNote = (note, dur) => {
  const f = hz(note);
  const dt = f / SR;
  let a = 0;
  const raw = make(dur, (t) => {
    a += dt;
    return (Math.sin(2 * Math.PI * a) * 0.85 + saw(a, dt) * 0.3) * Math.min(1, t * 200) * Math.exp(-t * 1.4);
  });
  return fadeEnds(svf(raw, 620, 1, "lp"), 4);
};

/** Slow detuned chord. Width comes from opposite pans on the two sides. */
const pad = (bus, beat, beats, chord, gain, cutoff) => {
  const dur = b2t(beats) + 0.5;
  chord.forEach((n, i) => {
    [-1, 1].forEach((side) => {
      const f = hz(n + 12) * (1 + side * 0.0035);
      const dt = f / SR;
      let a = rnd();
      const raw = make(dur, (t) => {
        a += dt;
        return saw(a, dt) * Math.min(1, t / 0.25) * Math.min(1, (dur - t) / 0.4);
      });
      put(bus, b2t(beat), svf(raw, cutoff, 0.8, "lp"), gain * 0.085, side * (0.45 + i * 0.12));
    });
  });
};

/** Feedback delay plus a small diffuse room for the plucks and pads. */
const room = (bus, mix = 0.2) => {
  const combs = [1557, 1617, 1491, 1422].map((n) => ({ n: Math.round((n * SR) / 44100), g: 0.78 }));
  [0, 1].forEach((ch) => {
    const dry = bus[ch];
    const wet = new Float32Array(dry.length);
    combs.forEach(({ n, g }, ci) => {
      const d = n + (ch ? 23 : 0) + ci * 3;
      const buf = new Float32Array(d);
      let w = 0;
      let lp = 0;
      for (let i = 0; i < dry.length; i++) {
        const o = buf[w];
        lp = o * 0.7 + lp * 0.3;
        buf[w] = dry[i] + lp * g;
        w = (w + 1) % d;
        wet[i] += o * 0.25;
      }
    });
    for (let i = 0; i < dry.length; i++) dry[i] += wet[i] * mix;
  });
};

const buildMusic = () => {
  const drums = stereo();
  const bass = stereo();
  const keys = stereo();
  const lead = stereo();

  /* Sections in beats. Intro 0-2, build 2-26, name break 26-30, work 30-42,
     skills 42-46, testimonials 46-56 (pulled back for reading), close 56-62. */
  const in_ = (b, a, z) => b >= a && b < z;

  // Pads carry the harmony the whole way, opening up with the energy.
  for (let b = -2; b < BEATS; b += 4) {
    const beat = Math.max(0, b);
    const cutoff = in_(beat, 30, 46) ? 3400 : in_(beat, 46, 56) ? 1100 : in_(beat, 56, 63) ? 3800 : 900 + (beat / 26) * 1600;
    pad(keys, beat, b < 0 ? 2 : 4, chordAt(beat), in_(beat, 46, 56) ? 0.85 : 1, cutoff);
  }

  // Arp in sixteenths: sparse in the build, full in the work.
  const pattern = [0, 2, 1, 3, 2, 1, 3, 2];
  for (let sx = 0; sx < BEATS * 4; sx++) {
    const beat = sx / 4;
    const on = sx % 2 === 0 || in_(beat, 10, 26) || in_(beat, 30, 46) || in_(beat, 56, 62);
    if (!on || in_(beat, 26, 30) || beat >= 61.5) continue;
    if (beat < 2 && sx % 4 !== 0) continue;
    const chord = chordAt(beat);
    const note = chord[pattern[sx % 8] % chord.length] + 12 + (in_(beat, 30, 42) && sx % 8 === 6 ? 12 : 0);
    const cutoff = in_(beat, 30, 46) || in_(beat, 56, 62) ? 5200 : in_(beat, 46, 56) ? 1300 : 900 + (beat / 26) * 2600;
    const gain = in_(beat, 46, 56) ? 0.075 : in_(beat, 30, 46) || in_(beat, 56, 62) ? 0.13 : 0.1;
    put(keys, b2t(beat), pluck(note, 0.26, cutoff), gain, sx % 4 < 2 ? -0.35 : 0.35);
  }

  // Kick: four on the floor once the build locks in. It leaves for the name
  // break and turns half-time under the testimonials.
  const kickTimes = [];
  for (let b = 0; b < BEATS; b++) {
    const on = in_(b, 10, 26) || in_(b, 30, 46) || in_(b, 56, 62) || (in_(b, 46, 56) && (b - 46) % 4 === 0);
    if (!on) continue;
    put(drums, b2t(b), kick, in_(b, 46, 56) ? 0.34 : 0.48);
    kickTimes.push(b2t(b));
  }
  // Clap, then hats.
  for (let b = 0; b < BEATS; b++) {
    const beatInBar = (b + 2) % 4;
    if ((beatInBar === 1 || beatInBar === 3) && (in_(b, 18, 26) || in_(b, 30, 46) || in_(b, 56, 62))) put(drums, b2t(b), clap, 0.28, 0.05);
  }
  for (let sx = 0; sx < BEATS * 4; sx++) {
    const beat = sx / 4;
    if (!(in_(beat, 14, 26) || in_(beat, 30, 46) || in_(beat, 46, 56) || in_(beat, 56, 62))) continue;
    const off = sx % 4 === 2;
    if (in_(beat, 46, 56) && !off) continue;
    const g = off ? 0.15 : 0.065;
    put(drums, b2t(beat), off ? HAT_O : HAT_C, in_(beat, 46, 56) ? g * 0.55 : g, sx % 8 < 4 ? 0.2 : -0.2);
  }

  // Bass: pushes on the offbeats.
  for (let sx = 0; sx < BEATS * 4; sx++) {
    const beat = sx / 4;
    if (beat < 6 || in_(beat, 26, 30) || beat >= 62) continue;
    const pos = sx % 8;
    const busy = in_(beat, 30, 46) || in_(beat, 56, 62);
    if (!(pos === 2 || pos === 6 || (busy && (pos === 3 || pos === 7)))) continue;
    if (in_(beat, 46, 56) && sx % 16 !== 2 && sx % 16 !== 10) continue;
    const root = chordAt(beat)[0];
    put(bass, b2t(beat), bassNote(root < 52 ? root : root - 12, BEAT * 0.45), in_(beat, 46, 56) ? 0.2 : 0.28);
  }

  // A short rising hook over the work and the close, doubled an octave up.
  const hook = [[0, 76], [0.75, 79], [1.5, 81], [2.5, 84], [3.25, 83]];
  [30, 34, 38, 56].forEach((start) => {
    hook.forEach(([o, n]) => {
      put(lead, b2t(start + o), pluck(n, 0.5, 4800), 0.17, -0.12);
      put(lead, b2t(start + o) + 0.012, pluck(n + 12, 0.32, 5200), 0.06, 0.25);
    });
  });

  // A last held chord under the home flight, which rings into the poster.
  pad(keys, 62, 1, CHORDS[0], 1.1, 2200);
  // A filtered lift out of the name break and into the work.
  put(keys, b2t(28), riser(b2t(2), 240, 3600), 0.13, 0);

  room(keys, 0.3);
  room(lead, 0.34);

  // Everything but the kick ducks on each kick, which gives the pump.
  const duck = new Float32Array(LEN).fill(1);
  kickTimes.forEach((t) => {
    const j = Math.round(t * SR);
    const n = Math.round(0.24 * SR);
    for (let i = 0; i < n && j + i < LEN; i++) {
      const v = 1 - 0.46 * Math.pow(1 - i / n, 1.6);
      duck[j + i] = Math.min(duck[j + i], v);
    }
  });

  const mix = stereo();
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < LEN; i++) {
      mix[ch][i] = drums[ch][i] + (bass[ch][i] + keys[ch][i] + lead[ch][i]) * duck[i];
    }
  }
  // Short fades so neither end of the loop clicks.
  const edge = Math.round(0.02 * SR);
  for (let ch = 0; ch < 2; ch++) {
    for (let i = 0; i < edge; i++) {
      mix[ch][i] *= i / edge;
      mix[ch][LEN - 1 - i] *= i / edge;
    }
  }
  return mix;
};

/* ---------------------------------------------------------------- output --- */
const writeWav = (file, bus) => {
  const n = bus[0].length;
  const data = Buffer.alloc(n * 4);
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, bus[0][i])) * 32767), i * 4);
    data.writeInt16LE(Math.round(Math.max(-1, Math.min(1, bus[1][i])) * 32767), i * 4 + 2);
  }
  const h = Buffer.alloc(44);
  h.write("RIFF", 0);
  h.writeUInt32LE(36 + data.length, 4);
  h.write("WAVEfmt ", 8);
  h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20);
  h.writeUInt16LE(2, 22);
  h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28);
  h.writeUInt16LE(4, 32);
  h.writeUInt16LE(16, 34);
  h.write("data", 36);
  h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
};

/** Scales a bus so its peak lands at the given level. */
const peakTo = (bus, level) => {
  let peak = 0;
  for (const ch of bus) for (const x of ch) peak = Math.max(peak, Math.abs(x));
  for (const ch of bus) for (let i = 0; i < ch.length; i++) ch[i] *= level / peak;
  return peak;
};

fs.mkdirSync(out, { recursive: true });
const sfx = buildSfx();
const music = buildMusic();
console.log("raw peaks  sfx", peakTo(sfx, 0.89).toFixed(2), " music", peakTo(music, 0.89).toFixed(2));
writeWav(path.join(out, "sfx.wav"), sfx);
writeWav(path.join(out, "music.wav"), music);
console.log("written", LEN / SR, "s");
