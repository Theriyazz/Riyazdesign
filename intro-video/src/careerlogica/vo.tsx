import React from "react";
import { Audio, Sequence, staticFile } from "remotion";

/**
 * The narration: when each clip in public/cl/vo starts, in seconds of film,
 * and the line it speaks. Swap the files for another voice (same names) and
 * the timing holds, as long as each clip ends before the next one starts.
 */
export const VOICE: [start: number, line: string][] = [
  [0.3, "Choosing a career is confusing."],
  [3.4, "We just made it clear."],
  [5.5, "Welcome to Career Logica. Two steps to career clarity."],
  [10.0, "Here's how it works."],
  [11.5, "Sign up as a student."],
  [14.6, "Tell us who you are."],
  [19.2, "Log in, and pick up where you left off."],
  [24.1, "Your whole journey, on one dashboard."],
  [28.5, "Step one: the psychometric test."],
  [31.2, "Answer honestly. No wrong answers."],
  [35.0, "You get one clear direction."],
  [37.9, "Step two: book a certified counsellor."],
  [41.0, "Pick a time that works."],
  [43.5, "Session booked. That simple."],
  [46.3, "Explore careers, and find your university."],
  [49.9, "Over two thousand students guided."],
  [53.3, "Find your direction."],
  [55.2, "Career clarity, backed by science. Take the test today."],
];

export const Voiceover: React.FC<{ fps: number; ext?: "wav" | "mp3" }> = ({ fps, ext = "wav" }) => (
  <>
    {VOICE.map(([start], i) => (
      <Sequence key={i} from={Math.round(start * fps)} layout="none">
        <Audio src={staticFile(`cl/vo/${String(i + 1).padStart(2, "0")}.${ext}`)} />
      </Sequence>
    ))}
  </>
);
