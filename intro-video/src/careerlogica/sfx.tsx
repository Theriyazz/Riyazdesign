import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

/** The effects scripts/make-sfx.mjs writes to public/cl/sfx. */
export type Sound =
  | "click"
  | "hover"
  | "pop"
  | "select"
  | "success"
  | "whoosh"
  | "swipe"
  | "count"
  | "logo"
  | `taps${3 | 4}${"a" | "b" | "c"}`
  | `typing${"A" | "B"}`;

/** One knob for the whole effects track, so it can sit under music and voice later. */
const MASTER = 1.0;

/** Plays one effect at frame `at` of the scene; `frames` cuts it short. */
export const Sfx: React.FC<{
  name: Sound;
  at: number;
  volume?: number;
  rate?: number;
  frames?: number;
}> = ({ name, at, volume = 0.3, rate = 1, frames }) => (
  <Sequence from={Math.max(0, Math.round(at))} durationInFrames={frames} layout="none">
    <Audio
      src={staticFile(`cl/sfx/${name}.wav`)}
      volume={Math.min(1, volume * MASTER)}
      playbackRate={rate}
    />
  </Sequence>
);

const TAKES = ["a", "b", "c"] as const;

/** One soft knock per word, for copy that arrives a word every `step` frames. */
export const Taps: React.FC<{ at: number; words: number; step: 3 | 4; volume?: number }> = ({
  at,
  words,
  step,
  volume = 0.2,
}) => (
  <Sfx
    name={`taps${step}${TAKES[Math.abs(at) % TAKES.length]}`}
    at={at}
    frames={(words - 1) * step + 2}
    volume={volume}
  />
);
