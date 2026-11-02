import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { Sfx } from "../careerlogica/sfx";
import { OVERLAP, SceneProps } from "../lib";
import { Collage } from "../scenes/work";
import { c, sans } from "../theme";
import { Audiences, Daily, Figure, FollowAlong, Week, You } from "./get";
import { Cues } from "./score";
import { RUNNING_ORDER, ShotName, shotStart, STORY_FRAMES, VOICE_FILE, VOICE_PARTS } from "./voice";
import { Became, Commerce, Costing, Edge, Fields, Hi, Jump, Look, Never, Show, Years } from "./who";

export { STORY_FRAMES };

const SHOTS: Record<ShotName, React.FC<SceneProps>> = {
  never: Never,
  commerce: Commerce,
  hi: Hi,
  became: Became,
  jump: Jump,
  edge: Edge,
  look: Look,
  costing: Costing,
  years: Years,
  fields: Fields,
  show: Show,
  collage: Collage,
  figure: Figure,
  daily: Daily,
  week: Week,
  audiences: Audiences,
  you: You,
  follow: FollowAlong,
};

export const Story: React.FC = () => (
  <AbsoluteFill style={{ background: c.ink, fontFamily: sans }}>
    {RUNNING_ORDER.map((name, i) => {
      const Shot = SHOTS[name];
      const from = shotStart(name);
      const next = RUNNING_ORDER[i + 1];
      // Each shot runs until the next line starts, plus the frames the two share.
      const dur = next ? shotStart(next) - from + OVERLAP : STORY_FRAMES - from;
      return (
        <Sequence key={name} from={from} durationInFrames={dur}>
          <Shot dur={dur} />
          {/* Air on every cut but the first; the edge shot brings its own. */}
          {i > 0 && name !== "edge" ? <Sfx name="whoosh" at={0} volume={0.12} /> : null}
          <Cues shot={name} />
        </Sequence>
      );
    })}
    {VOICE_PARTS.map((part) => (
      <Sequence key={part.from} from={part.from} durationInFrames={part.frames} layout="none">
        <Audio src={staticFile(VOICE_FILE)} trimBefore={part.trimBefore} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
