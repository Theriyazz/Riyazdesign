import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { OVERLAP, SceneProps } from "./lib";
import { Beat, Calendar, Carousel, End, Open, Slam } from "./scenes/closing";
import { Bubbles, Prompt, Segmented, Typing } from "./scenes/interface";
import { Hello, Name, Pill, Stepper } from "./scenes/opening";
import { Collage, Follow, Wall } from "./scenes/work";
import { script } from "./script";
import { c, sans } from "./theme";

type Timed = { Component: React.FC<SceneProps>; dur: number };
export type Cut = "portfolio" | "instagram";

const beat = (line: { text: string; accent: number; dark: boolean }): Timed => ({
  Component: (props: SceneProps) => <Beat {...props} {...line} />,
  dur: 36,
});

// Durations include the OVERLAP frames each scene shares with its neighbour.
const OPENING: Timed[] = [
  { Component: Hello, dur: 64 },
  { Component: Name, dur: 62 },
  { Component: Pill, dur: 58 },
  { Component: Stepper, dur: 66 },
  { Component: Typing, dur: 62 },
  { Component: Prompt, dur: 136 },
  { Component: Segmented, dur: 66 },
  { Component: Bubbles, dur: 100 },
];

const DRIVE: Timed[] = [
  ...script.beats.map(beat),
  { Component: Slam, dur: 56 },
  { Component: Calendar, dur: 78 },
  { Component: Open, dur: 62 },
];

// The two cuts differ only in how the work is shown and how the video signs off.
const CUTS: Record<Cut, Timed[]> = {
  portfolio: [...OPENING, { Component: Carousel, dur: 112 }, ...DRIVE, { Component: End, dur: 60 }],
  instagram: [
    ...OPENING,
    beat(script.designLine),
    { Component: Collage, dur: 116 },
    { Component: Wall, dur: 92 },
    ...DRIVE,
    { Component: Follow, dur: 136 },
  ],
};

export const framesFor = (cut: Cut) =>
  CUTS[cut].reduce((sum, scene) => sum + scene.dur, 0) - OVERLAP * (CUTS[cut].length - 1);

export const Intro: React.FC<{ cut: Cut }> = ({ cut }) => (
  <AbsoluteFill style={{ background: c.ink, fontFamily: sans }}>
    <Series>
      {CUTS[cut].map(({ Component, dur }, i) => (
        <Series.Sequence key={i} durationInFrames={dur} offset={i === 0 ? 0 : -OVERLAP}>
          <Component dur={dur} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
