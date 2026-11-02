/**
 * The voiceover is the clock. Every shot starts where its line starts in
 * public/story/Vo.mp3, and anything inside a shot that should land on a word
 * asks `within()` for that word's frame. Re-record the voice, re-measure the
 * times below (ffmpeg silencedetect), and the whole film follows.
 */
export const FPS = 30;
export const VOICE_FILE = "story/Vo.mp3";

/** Frames a shot is on screen before its line is spoken. */
const LEAD = 6;
/** Seconds into the file: the pause before "I had to figure...". */
const SPLIT = 29.52;
/** Frames of silence opened at SPLIT so the collage can finish landing. */
const HOLD = 57;
/** Frames the last shot holds after the final word. */
const TAIL = 54;
const LAST_WORD = 55.8;

/** Seconds into the file where each shot's line begins. Order is running order. */
export const SPEAKS = {
  never: 0,
  commerce: 2.05,
  hi: 4.09,
  became: 5.62,
  jump: 8.89,
  edge: 11.33,
  look: 13.33,
  costing: 16.8,
  years: 19.33,
  fields: 21.84,
  show: 25.63,
  collage: 27.76,
  figure: 29.74,
  daily: 32.08,
  week: 35.86,
  audiences: 44.62,
  you: 52.23,
  follow: 53.29,
} as const;

export type ShotName = keyof typeof SPEAKS;
export const RUNNING_ORDER = Object.keys(SPEAKS) as ShotName[];

/** The film frame on which second `seconds` of the voice file is heard. */
export const voiceFrame = (seconds: number) =>
  LEAD + Math.round(seconds * FPS) + (seconds >= SPLIT ? HOLD : 0);

export const shotStart = (shot: ShotName) => voiceFrame(SPEAKS[shot]) - LEAD;

/** Frame, local to `shot`, on which second `seconds` of the voice is heard. */
export const within = (shot: ShotName, seconds: number) => voiceFrame(seconds) - shotStart(shot);

export const STORY_FRAMES = voiceFrame(LAST_WORD) + TAIL;

/** The two stretches of the file, and where each one plays. */
export const VOICE_PARTS = [
  { from: LEAD, trimBefore: 0, frames: Math.round(SPLIT * FPS) },
  { from: voiceFrame(SPLIT), trimBefore: Math.round(SPLIT * FPS), frames: undefined },
];

// Words inside a line that something on screen is cut to.
export const HEARD = {
  fields: [22.2, 23.0, 23.8, 24.6],
  onePost: { from: 34.08, to: 35.46 },
  week: [35.86, 37.23, 39.52, 41.57],
  audiences: [
    { ask: 44.62, answer: 46.12 },
    { ask: 48.07, answer: 49.49 },
  ],
  follow: { land: 53.29, tail: 54.34, done: LAST_WORD },
} as const;
