import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { Tools, TOOLS_DUR, Outro, OUTRO_DUR } from "./close";
import { c, HANDOFF } from "./kit";
import { Face, FACE_DUR, Name, NAME_DUR } from "./open";
import { Atrc, ATRC_DUR, CareerLogica, CL_DUR, Numbers, NUMBERS_DUR, Pecuc, PECUC_DUR } from "./work";

/* Name cuts to Face on a full lime frame, so those two meet edge to edge.
   Every other pair overlaps by HANDOFF frames for the push. */
const SCENES: { C: React.FC; dur: number; overlap: number }[] = [
  { C: Name, dur: NAME_DUR, overlap: 0 },
  { C: Face, dur: FACE_DUR, overlap: 0 },
  { C: Numbers, dur: NUMBERS_DUR, overlap: HANDOFF },
  { C: CareerLogica, dur: CL_DUR, overlap: HANDOFF },
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

export const HELLO_FRAMES = starts[starts.length - 1] + SCENES[SCENES.length - 1].dur;

export const Hello: React.FC = () => (
  <AbsoluteFill style={{ background: c.ink }}>
    {SCENES.map(({ C, dur }, i) => (
      <Sequence key={i} from={starts[i]} durationInFrames={dur}>
        <C />
      </Sequence>
    ))}
  </AbsoluteFill>
);
