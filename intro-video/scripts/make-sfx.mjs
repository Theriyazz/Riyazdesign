/**
 * Synthesises every sound effect the CareerLogica launch film uses and writes
 * them to public/cl/sfx as 48 kHz mono WAVs. No samples, no dependencies:
 * run `npm run sfx` after changing a recipe.
 *
 * `taps*` and `typing*` are sequences cut to the film's own rhythm (one hit
 * every 3, 4 or 2 frames at 30 fps), so a whole caption or a whole typed
 * field is one audio clip trimmed to length rather than a clip per word.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SR = 48000;
const FPS = 30;
const OUT = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "cl", "sfx");

const TAU = Math.PI * 2;
const buffer = (seconds) => new Float32Array(Math.ceil(seconds * SR));

/** Deterministic noise, so a rebuild gives the same files. */
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** Adds `src` into `dst` starting at `at` seconds. */
const mix = (dst, src, at = 0, gain = 1) => {
  const offset = Math.round(at * SR);
  for (let i = 0; i < src.length && offset + i < dst.length; i++) dst[offset + i] += src[i] * gain;
  return dst;
};

/** Noise through a band-pass whose centre follows `freq(progress)`. */
const sweptNoise = (seconds, freq, envelope, q, seed) => {
  const out = buffer(seconds);
  const rand = rng(seed);
  let low = 0;
  let band = 0;
  for (let i = 0; i < out.length; i++) {
    const p = i / out.length;
    const f = 2 * Math.sin((Math.PI * Math.min(freq(p), SR / 6)) / SR);
    const high = rand() * 2 - 1 - low - band / q;
    band += f * high;
    low += f * band;
    out[i] = band * envelope(p);
  }
  return out;
};

/** A struck tone: a fundamental and a few faster-fading partials. */
const bell = (freq, seconds, decay) => {
  const out = buffer(seconds);
  const partials = [
    [1, 1, decay],
    [2, 0.32, decay * 0.6],
    [3, 0.14, decay * 0.4],
    [4.2, 0.07, decay * 0.25],
  ];
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    const attack = 1 - Math.exp(-t / 0.003);
    for (const [ratio, amp, tau] of partials) {
      out[i] += Math.sin(TAU * freq * ratio * t) * amp * Math.exp(-t / tau) * attack;
    }
  }
  return out;
};

/** A soft wooden knock; the word and counter ticks are built from it. */
const tap = (freq, seed) => {
  const out = buffer(0.055);
  const rand = rng(seed);
  for (let i = 0; i < out.length; i++) {
    const t = i / SR;
    out[i] =
      Math.sin(TAU * freq * t) * Math.exp(-t / 0.012) +
      Math.sin(TAU * freq * 2 * t) * 0.3 * Math.exp(-t / 0.006) +
      (rand() * 2 - 1) * 0.18 * Math.exp(-t / 0.001);
  }
  return out;
};

/** How long the mouse button stays down, in seconds: three frames of film. */
const RELEASE = 3 / FPS;

/**
 * One snap of a microswitch. `modes` are the shell's resonances as
 * [frequency, level, decay]; the contact bounces once, 1.8 ms later.
 */
const snap = (modes, seed) => {
  const hit = buffer(0.03);
  const rand = rng(seed);
  const phases = modes.map(() => rand() * TAU);
  for (let i = 0; i < hit.length; i++) {
    const t = i / SR;
    hit[i] = (rand() * 2 - 1) * 1.2 * Math.exp(-t / 0.0008);
    modes.forEach(([freq, level, decay], k) => {
      hit[i] += Math.sin(TAU * freq * t + phases[k]) * level * Math.exp(-t / decay);
    });
  }
  const out = buffer(0.035);
  mix(out, hit, 0, 1);
  mix(out, hit, 0.0018, 0.35);
  return out;
};

const recipes = {
  /**
   * A mouse button: the switch snapping down, then a lighter, higher snap as
   * it lets go. Each snap is a burst of noise ringing the plastic shell for a
   * few milliseconds, so it has no pitch of its own.
   */
  click: () => {
    const out = buffer(0.15);
    const down = snap(
      [
        [420, 0.35, 0.005],
        [1300, 0.6, 0.003],
        [2400, 0.9, 0.0026],
        [3600, 0.8, 0.002],
        [5200, 0.6, 0.0014],
        [7400, 0.35, 0.001],
      ],
      1,
    );
    const up = snap(
      [
        [1800, 0.5, 0.0025],
        [3200, 0.8, 0.002],
        [4800, 0.7, 0.0015],
        [6600, 0.5, 0.0011],
        [8800, 0.3, 0.0008],
      ],
      2,
    );
    mix(out, down, 0, 1);
    mix(out, up, RELEASE, 0.55);
    return out;
  },

  /** Pointer arriving on a target: a very light tick. */
  hover: () => {
    const out = buffer(0.04);
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      out[i] = Math.sin(TAU * 2600 * t) * Math.exp(-t / 0.006) * (1 - Math.exp(-t / 0.0005));
    }
    return out;
  },

  /** Something arriving on screen: a short upward bloop. */
  pop: () => {
    const out = buffer(0.14);
    let phase = 0;
    for (let i = 0; i < out.length; i++) {
      const t = i / SR;
      phase += (TAU * (260 + 520 * (1 - Math.exp(-t / 0.02)))) / SR;
      const amp = Math.exp(-t / 0.035) * (1 - Math.exp(-t / 0.002));
      out[i] = (Math.sin(phase) + Math.sin(phase * 2) * 0.2) * amp;
    }
    return out;
  },

  /** A choice locking in: one small bell. */
  select: () => bell(880, 0.32, 0.11),

  /** Booking confirmed, profile ready: a rising fifth. */
  success: () => {
    const out = buffer(0.95);
    mix(out, bell(783.99, 0.8, 0.22), 0, 0.85);
    mix(out, bell(1174.66, 0.8, 0.26), 0.11, 1);
    return out;
  },

  /** Scene change: air moving past. */
  whoosh: () =>
    sweptNoise(
      0.5,
      (p) => 200 + 2000 * Math.sin(Math.PI * Math.min(1, p * 1.15)) ** 2,
      (p) => Math.sin(Math.PI * p ** 0.8) ** 2,
      1.3,
      11,
    ),

  /** A page or card sliding in: shorter and brighter than the whoosh. */
  swipe: () =>
    sweptNoise(
      0.24,
      (p) => 500 + 2500 * p,
      (p) => Math.sin(Math.PI * p ** 0.7) ** 2,
      1.6,
      12,
    ),

  /** The stat counting up: ticks that climb in pitch, one every two frames. */
  count: () => {
    const ticks = 28;
    const out = buffer((ticks * 2) / FPS + 0.1);
    for (let i = 0; i < ticks; i++) {
      mix(out, tap(520 * 2 ** (i / ticks), 300 + i), (i * 2) / FPS, 0.5 + (0.5 * i) / ticks);
    }
    return out;
  },

  /** The logo assembling: air rising into a soft low hit with a little sparkle. */
  logo: () => {
    const land = 1.2;
    const out = buffer(2.3);
    const rise = sweptNoise(
      land + 0.08,
      (p) => 400 * 12 ** p,
      (p) => (p < 0.94 ? p ** 2 : ((1 - p) / 0.06) * 0.88),
      1.8,
      21,
    );
    mix(out, rise, 0, 0.5);

    const thump = buffer(0.6);
    let phase = 0;
    for (let i = 0; i < thump.length; i++) {
      const t = i / SR;
      phase += (TAU * (46 + 40 * Math.exp(-t / 0.05))) / SR;
      thump[i] = Math.sin(phase) * Math.exp(-t / 0.16);
    }
    mix(out, thump, land, 1);
    mix(out, bell(1046.5, 1, 0.3), land, 0.28);

    const rand = rng(22);
    for (let i = 0; i < 9; i++) {
      mix(out, bell(3000 + rand() * 4000, 0.3, 0.07), land + 0.03 + rand() * 0.5, 0.05 + rand() * 0.05);
    }
    return out;
  },
};

/** `hits` knocks, one every `step` frames, each a touch different from the last. */
const taps = (step, hits, seed) => {
  const out = buffer((hits * step) / FPS + 0.06);
  const rand = rng(seed);
  for (let i = 0; i < hits; i++) {
    mix(out, tap(700 * (0.94 + rand() * 0.12), seed * 100 + i), (i * step) / FPS, 0.75 + rand() * 0.25);
  }
  return out;
};

/** `keys` keystrokes, one every two frames: a bright tick over a low thock. */
const typing = (keys, seed) => {
  const out = buffer((keys * 2) / FPS + 0.06);
  const rand = rng(seed);
  for (let k = 0; k < keys; k++) {
    const centre = 2600 + rand() * 2200;
    const tick = sweptNoise(
      0.04,
      () => centre,
      (p) => Math.exp((-p * 0.04) / 0.006),
      2.2,
      seed * 1000 + k,
    );
    const key = buffer(0.045);
    const low = 140 + rand() * 40;
    for (let i = 0; i < key.length; i++) {
      const t = i / SR;
      key[i] = Math.sin(TAU * low * t) * 0.55 * Math.exp(-t / 0.012);
    }
    mix(key, tick, 0, 1);
    mix(out, key, (k * 2) / FPS, 0.6 + rand() * 0.4);
  }
  return out;
};

const sequences = {
  taps3a: () => taps(3, 14, 31),
  taps3b: () => taps(3, 14, 32),
  taps3c: () => taps(3, 14, 33),
  taps4a: () => taps(4, 10, 41),
  taps4b: () => taps(4, 10, 42),
  taps4c: () => taps(4, 10, 43),
  typingA: () => typing(30, 51),
  typingB: () => typing(30, 52),
};

const write = (name, samples) => {
  const peak = samples.reduce((m, v) => Math.max(m, Math.abs(v)), 0) || 1;
  // A near-instant fade in keeps the attack of the clicks; the tail gets longer.
  const fadeIn = Math.round(0.0003 * SR);
  const fadeOut = Math.round(0.002 * SR);
  const data = Buffer.alloc(44 + samples.length * 2);
  data.write("RIFF", 0);
  data.writeUInt32LE(36 + samples.length * 2, 4);
  data.write("WAVEfmt ", 8);
  data.writeUInt32LE(16, 16);
  data.writeUInt16LE(1, 20);
  data.writeUInt16LE(1, 22);
  data.writeUInt32LE(SR, 24);
  data.writeUInt32LE(SR * 2, 28);
  data.writeUInt16LE(2, 32);
  data.writeUInt16LE(16, 34);
  data.write("data", 36);
  data.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) {
    // Normalised to a common peak; the film sets each sound's level itself.
    const edge = Math.min(1, i / fadeIn, (samples.length - 1 - i) / fadeOut);
    data.writeInt16LE(Math.round((samples[i] / peak) * 0.8 * edge * 32767), 44 + i * 2);
  }
  writeFileSync(join(OUT, `${name}.wav`), data);
  console.log(`${name.padEnd(9)} ${(samples.length / SR).toFixed(2)}s`);
};

mkdirSync(OUT, { recursive: true });
for (const [name, make] of Object.entries({ ...recipes, ...sequences })) write(name, make());
