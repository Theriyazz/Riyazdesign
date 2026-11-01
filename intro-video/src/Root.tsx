import React from "react";
import { Composition } from "remotion";
import { Launch, LAUNCH_FRAMES } from "./careerlogica/Launch";
import { Cut, framesFor, Intro } from "./Intro";
import { Board } from "./hello/board/Board";
import { Hello, HELLO_FRAMES } from "./hello/Hello";
import { Film, FILM_FRAMES } from "./hello2/Film";
import { Story, STORY_FRAMES } from "./story/Story";
import { PositioningBoard } from "./trio/board/PositioningBoard";
import { FilmCut } from "./trio/FilmCut";
import { FilmFile } from "./trio/FilmFile";
import { FilmPositioning, POSITIONING_DUR } from "./trio/FilmPositioning";
import { FilmWhy } from "./trio/FilmWhy";
import { FILM_DUR } from "./trio/kit";

const FORMATS: { id: string; cut: Cut; width: number; height: number }[] = [
  { id: "Intro-16x9", cut: "portfolio", width: 1920, height: 1080 },
  { id: "Intro-9x16", cut: "portfolio", width: 1080, height: 1920 },
  { id: "Insta-Reel", cut: "instagram", width: 1080, height: 1920 },
  { id: "Insta-Square", cut: "instagram", width: 1080, height: 1080 },
];

export const Root: React.FC = () => (
  <>
    {FORMATS.map(({ id, cut, width, height }) => (
      <Composition
        key={id}
        id={id}
        component={Intro}
        defaultProps={{ cut }}
        durationInFrames={framesFor(cut)}
        fps={30}
        width={width}
        height={height}
      />
    ))}
    {/* The portfolio first-fold film: 1080p60, loops into its own first frame. */}
    <Composition id="Hello-16x9" component={Hello} durationInFrames={HELLO_FRAMES} fps={60} width={1920} height={1080} />
    {/* The kinetic cut picked from storyboard v2. */}
    <Composition id="Hello2-16x9" component={Film} durationInFrames={FILM_FRAMES} fps={60} width={1920} height={1080} />
    {/* Three hero film variations: 38 s, 1080p60, frame 0 is the poster. */}
    <Composition id="Trio-Why" component={FilmWhy} durationInFrames={FILM_DUR} fps={60} width={1920} height={1080} />
    <Composition id="Trio-Cut" component={FilmCut} durationInFrames={FILM_DUR} fps={60} width={1920} height={1080} />
    <Composition id="Trio-File" component={FilmFile} durationInFrames={FILM_DUR} fps={60} width={1920} height={1080} />
    {/* The positioning cut: 35.2 s, Lime dark, frame 0 is the poster. */}
    <Composition id="Positioning" component={FilmPositioning} durationInFrames={POSITIONING_DUR} fps={60} width={1920} height={1080} />
    {/* Positioning cut storyboard: one key pose per beat option. */}
    <Composition id="PositioningBoard" component={PositioningBoard} defaultProps={{ id: "1C", theme: "lime-dark" }} durationInFrames={1} fps={60} width={1920} height={1080} />
    {/* Storyboard v2 keyframes: one still per variation, picked by `id`. */}
    <Composition id="Board" component={Board} defaultProps={{ id: "1A" }} durationInFrames={1} fps={60} width={1920} height={1080} />
    <Composition id="Story-Reel" component={Story} durationInFrames={STORY_FRAMES} fps={30} width={1080} height={1920} />
    <Composition
      id="CareerLogica-Launch"
      component={Launch}
      durationInFrames={LAUNCH_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
