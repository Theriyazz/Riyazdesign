import { loadFont } from "@remotion/google-fonts/Outfit";

// Sampled from the CareerLogica Figma file, which sets everything in Outfit.
export const cl = {
  night: "#050f45",
  navy: "#0a1b6b",
  ink: "#0e1d66",
  blue: "#1f6bff",
  sky: "#5cb8ff",
  yellow: "#f5c842",
  paper: "#f4faff",
  white: "#ffffff",
} as const;

export const outfit = loadFont("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
}).fontFamily;

export const gradientText = (from: string, to: string) =>
  ({
    backgroundImage: `linear-gradient(90deg, ${from}, ${to})`,
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
    color: "transparent",
  }) as const;
