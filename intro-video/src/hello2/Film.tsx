import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { c, HANDOFF } from "../hello/kit";
import { Intro, INTRO_DUR } from "./intro";
import {
  Atrc,
  ATRC_DUR,
  CareerLogica,
  CL_DUR,
  CUT_DUR,
  Outro,
  OUTRO_DUR,
  Pecuc,
  PECUC_DUR,
  RING_DUR,
  Skills,
  SKILLS_DUR,
  Subtraction,
  Tools,
  TOOLS_DUR,
  WorkRing,
} from "./scenes";

/* Opens on Riyaz's illustration and his own introduction, then the cut the user picked from storyboard v2 (1A 2C 3C 4A 5A 6A 7A 8A),
   pushed toward skills and work, in the kinetic style of the references.
   The hook (1A) was cut at the user's request. Intro -> Skills cuts on a full lime iris and Ring -> CareerLogica hands a
   screen into the laptop, so those pairs meet edge to edge. */
const SCENES: { C: React.FC; dur: number; overlap: number }[] = [
  { C: Intro, dur: INTRO_DUR, overlap: 0 },
  { C: Skills, dur: SKILLS_DUR, overlap: 0 },
  { C: Subtraction, dur: CUT_DUR, overlap: HANDOFF },
  { C: WorkRing, dur: RING_DUR, overlap: HANDOFF },
  { C: CareerLogica, dur: CL_DUR, overlap: 0 },
  { C: Pecuc, dur: PECUC_DUR, overlap: HANDOFF },
  { C: Atrc, dur: ATRC_DUR, overlap: HANDOFF },
  { C: Tools, dur: TOOLS_DUR, overlap: HANDOFF },
  { C: Outro, dur: OUTRO_DUR, overlap: HANDOFF },
];

const starts: number[] = [];
SCENES.reduce((at, { dur, overlap }) => {
  const from = at - overlap;
  starts.push(from);
  return from + dur;
}, 0);

export const FILM_STARTS = starts;
export const FILM_FRAMES = starts[starts.length - 1] + SCENES[SCENES.length - 1].dur;

export const Film: React.FC = () => (
  <AbsoluteFill style={{ background: c.ink }}>
    {SCENES.map(({ C, dur }, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={dur}>
        <C />
      </Sequence>
    ))}
  </AbsoluteFill>
);
