import React from "react";
import { Sfx, Sound, Taps } from "../careerlogica/sfx";
import { HEARD, ShotName, within } from "./voice";

/**
 * The effects track, one list of cues per shot. Frames are local to the shot
 * and mirror the timings in who.tsx and get.tsx; cues that land on a spoken word
 * take their frame from the voice, the same way the pictures do.
 *
 * The signature is the bell on every lime payoff word. It climbs a step each
 * time (BELL), and the follow click resolves it with the rising fifth.
 */
type Cue =
  | { sound: Sound; at: number; volume?: number; rate?: number; frames?: number }
  | { words: number; at: number; step: 3 | 4; volume?: number };

const BELL = [0.84, 0.94, 1.06, 1.19];
const bell = (step: number, at: number): Cue => ({ sound: "select", at, rate: BELL[step], volume: 0.34 });
const say = (words: number, at = 4, step: 3 | 4 = 3): Cue => ({ words, at, step, volume: 0.2 });

/** Effects sit under the voice: everything here is turned down by this much. */
const UNDER_VOICE = 0.55;

const tiles = HEARD.week.map((t) => within("week", t));
const sides = HEARD.audiences.map((line) => ({ ask: within("audiences", line.ask), answer: within("audiences", line.answer) }));
const typeFrom = within("daily", HEARD.onePost.from) - 2;
const typeTo = within("daily", HEARD.onePost.to) - 4;
const said = within("follow", HEARD.follow.land);
const CLICK = within("follow", HEARD.follow.done) + 4;

export const SCORE = {
  never: [say(6)],
  commerce: [say(3, 4, 4), bell(0, 14)],
  hi: [{ sound: "pop", at: 2, rate: 0.85 }, say(2, 10, 4), bell(1, 18), { sound: "pop", at: 24, rate: 1.5, volume: 0.14 }],
  became: [say(8), { sound: "swipe", at: 30, volume: 0.3 }, say(2, 22, 4)],
  jump: [say(8)],
  edge: [
    { sound: "whoosh", at: 0, rate: 1.35, volume: 0.32 },
    bell(2, 22),
    { sound: "pop", at: 32, rate: 1.5, volume: 0.14 },
  ],
  look: [
    { sound: "swipe", at: 6, rate: 0.8, volume: 0.22 },
    { sound: "typingA", at: 4, frames: 40, volume: 0.24 },
  ],
  costing: [{ sound: "pop", at: 0, rate: 0.7, volume: 0.34 }, say(4, 10), bell(3, 22), say(2, 32)],
  years: [
    { sound: "count", at: 4, frames: 23, volume: 0.28 },
    { sound: "pop", at: 27, rate: 1.2 },
    { sound: "swipe", at: 36, volume: 0.22 },
    say(8, 40),
  ],
  fields: [
    { sound: "pop", at: 4 },
    ...HEARD.fields.map((t, i): Cue => ({ sound: "pop", at: within("fields", t) - 2, rate: 0.9 + i * 0.1, volume: 0.24 })),
  ],
  show: [say(9)],
  // Twenty cards land four frames apart; each taps4 take is ten knocks at that pace.
  collage: [
    { sound: "pop", at: 2, rate: 0.8 },
    { sound: "taps4a", at: 12, rate: 1, volume: 0.34 },
    { sound: "taps4b", at: 52, rate: 1, volume: 0.34 },
  ],
  figure: [say(10, 2), { sound: "swipe", at: 38, volume: 0.3 }, { sound: "pop", at: 46, rate: 1.2 }],
  daily: [say(6), { sound: "typingB", at: typeFrom, frames: typeTo - typeFrom, volume: 0.3 }],
  week: tiles.flatMap((at, i): Cue[] => [
    { sound: "swipe", at: at - 4, volume: 0.26 },
    { sound: "pop", at: at + 2, rate: 0.9 + i * 0.08, volume: 0.24 },
  ]),
  audiences: [
    { sound: "swipe", at: 0, volume: 0.24 },
    say(7, sides[0].answer - 2),
    { sound: "swipe", at: sides[1].ask - 6, volume: 0.24 },
    say(8, sides[1].answer - 2),
  ],
  you: [say(4)],
  follow: [
    { sound: "pop", at: 2, rate: 0.85 },
    say(2, said - 2, 4),
    { sound: "pop", at: said + 10 },
    { sound: "hover", at: CLICK - 9, volume: 0.14 },
    { sound: "click", at: CLICK, volume: 0.58 },
    { sound: "success", at: CLICK + 2, volume: 0.42 },
  ],
} satisfies Record<ShotName, Cue[]>;

export const Cues: React.FC<{ shot: ShotName }> = ({ shot }) => (
  <>
    {(SCORE[shot] as Cue[]).map((cue, i) =>
      "words" in cue ? (
        <Taps key={i} at={cue.at} words={cue.words} step={cue.step} volume={(cue.volume ?? 0.2) * UNDER_VOICE} />
      ) : (
        <Sfx key={i} name={cue.sound} at={cue.at} volume={(cue.volume ?? 0.3) * UNDER_VOICE} rate={cue.rate} frames={cue.frames} />
      ),
    )}
  </>
);
