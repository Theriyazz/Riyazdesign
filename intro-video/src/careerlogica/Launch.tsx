import React from "react";
import { AbsoluteFill, Series } from "remotion";
import { OVERLAP, SceneProps } from "../lib";
import {
  Booking,
  Close,
  Confusion,
  Dashboard,
  Explore,
  Hello,
  LogIn,
  Logo,
  Promise,
  Proof,
  SignUp,
  Test,
  Tour,
} from "./scenes";
import { Sfx } from "./sfx";
import { cl, outfit } from "./theme";
import { Voiceover } from "./vo";

// Durations include the OVERLAP frames each scene shares with its neighbour.
const SCENES: { Component: React.FC<SceneProps>; dur: number }[] = [
  { Component: Confusion, dur: 104 },
  { Component: Promise, dur: 72 },
  { Component: Hello, dur: 136 },
  { Component: Tour, dur: 56 },
  { Component: SignUp, dur: 236 },
  { Component: LogIn, dur: 150 },
  { Component: Dashboard, dur: 150 },
  { Component: Test, dur: 290 },
  { Component: Booking, dur: 244 },
  { Component: Explore, dur: 124 },
  { Component: Proof, dur: 116 },
  { Component: Close, dur: 60 },
  { Component: Logo, dur: 150 },
];

export const LAUNCH_FRAMES =
  SCENES.reduce((sum, scene) => sum + scene.dur, 0) - OVERLAP * (SCENES.length - 1);

/** The frame each scene after the first cuts in on. */
const CUTS = SCENES.slice(1).map((_, i) =>
  SCENES.slice(0, i + 1).reduce((sum, scene) => sum + scene.dur - OVERLAP, 0),
);

export const Launch: React.FC = () => (
  <AbsoluteFill style={{ background: cl.night, fontFamily: outfit }}>
    {CUTS.map((cut) => (
      <Sfx key={cut} name="whoosh" at={cut - 2} volume={0.3} />
    ))}
    <Voiceover fps={30} />
    <Series>
      {SCENES.map(({ Component, dur }, i) => (
        <Series.Sequence key={i} durationInFrames={dur} offset={i === 0 ? 0 : -OVERLAP}>
          <Component dur={dur} />
        </Series.Sequence>
      ))}
    </Series>
  </AbsoluteFill>
);
