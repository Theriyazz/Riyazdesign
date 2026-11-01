/**
 * Every word and fact the video shows. Edit here; no scene needs touching.
 * Facts mirror lib/site.ts and the case study frontmatter in content/work.
 */
export const script = {
  hello: "Hey I'm a product designer.",
  name: "my name is Riyaz",
  pill: "solving real problems",
  tools: ["figma", "framer", "miro", "claude", "chatgpt", "github", "relume", "mobin"],

  // PECUC: navigation cut from 37 destinations to 7.
  metric: { label: "nav destinations", from: 37, to: 7, source: "PECUC redesign" },

  typed: "For the last 3+ years",
  prompt: "I've been turning messy problems into simple flows",
  menuLabel: "Process",
  menu: ["Research", "Wireframe", "Ship"],
  segments: ["No guesswork", "No dark patterns", "Just users"],
  bubbles: ["Just an obsession with", "making things make sense"],

  workTitle: "Here's what I shipped",
  work: [
    { index: "001", title: "CareerLogica", image: "work/careerlogica.webp" },
    { index: "002", title: "PECUC", image: "work/pecuc.webp" },
    { index: "003", title: "ATRC STEM Career Test", image: "work/atrc.webp" },
  ],

  // Instagram cut: the screens in src/screens.ts replace the carousel.
  // Change the seed to deal the screens in a different order.
  shuffleSeed: "riyaz-01",
  designLine: { text: "And I design", accent: 2, dark: false },
  collageWord: "Products.",
  follow: {
    handle: "@riyazdesigns",
    text: "Follow us for the most interesting content on AI and design",
    accents: [8, 10],
  },

  // `accent` is the index of the word that takes the highlight.
  beats: [
    { text: "I'll keep testing", accent: 2, dark: false },
    { text: "keep iterating", accent: 1, dark: true },
    { text: "until it works", accent: 2, dark: true },
  ],
  slam: ["land", "next", "role"],

  open: { text: "and I'm open to work", accentFrom: 2 },
  wordmark: "Riyazdesigns.",
  url: "riyazdesigns.com",
} as const;
