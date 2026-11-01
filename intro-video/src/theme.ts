import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadSerif } from "@remotion/google-fonts/InstrumentSerif";

// Same primitives as styles/tokens.css, so the video reads as the site.
export const c = {
  ink: "#08080a",
  ink850: "#141418",
  ink800: "#1c1c21",
  ink700: "#2a2a31",
  ink600: "#3a3a43",
  paper: "#f4f3f0",
  paper200: "#cfcfca",
  paper300: "#a8a8a4",
  paper500: "#7a7a7e",
  signal: "#aaff00",
  signalDeep: "#6fa800",
  white: "#ffffff",
} as const;

export const sans = loadGeist("normal", {
  weights: ["500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const serif = loadSerif("italic", {
  weights: ["400"],
  subsets: ["latin"],
}).fontFamily;

/** Highlight for an accent word on the light canvas, where lime text fails contrast. */
export const marker = {
  background: c.signal,
  padding: "0 0.2em",
  borderRadius: "0.2em",
} as const;
