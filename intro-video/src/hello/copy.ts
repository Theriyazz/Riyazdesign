/**
 * Every word and number the film shows. Each one comes from the portfolio:
 * lib/site.ts, components/sections/*, and the frontmatter and body of
 * content/work/*.mdx. Change a fact there, change it here.
 */
export const copy = {
  hello: "Hi, I’m",
  first: "Rıyaz", // dotless ı: the lime dot is its tittle
  last: "Malek",
  role: "UX Designer · Vadodara, India",

  since: "Designing for humans since 2023",
  ring: "RESEARCH · STRATEGY · UI DESIGN · PROTOTYPING · DESIGN SYSTEMS · DEV HANDOFF · ",
  // About.tsx: "I care less about how a screen looks than about why it works"
  thesis: [
    { text: "I care less about how" },
    { text: "a screen looks than" },
    { text: "why it works.", em: [2] },
  ] as { text: string; em?: number[] }[],

  stats: [
    { value: "3+", label: "years designing products, end to end" },
    { value: "20+", label: "websites for US non-profits" },
    { value: "140+", label: "screens in one bilingual platform" },
  ],

  careerlogica: {
    index: "001",
    title: "CareerLogica",
    sub: "Psychometric-first career guidance",
    chips: ["140+ screens", "5 roles", "EN / AR, RTL"],
    screens: ["hello/cl-student.webp", "hello/cl-counsellor.webp", "hello/cl-school.webp", "hello/cl-admin.webp"],
    phone: "hello/cl-mobile.webp",
  },

  pecuc: {
    index: "002",
    title: "PECUC",
    sub: ["35 years of impact.", "A website that hid it."],
    stats: [
      { from: 37, to: 7, label: "navigation destinations" },
      { from: 4, to: 2, label: "clicks to content" },
    ],
    before: "Before · 2001",
    after: "After · 2026",
  },

  atrc: {
    index: "003",
    title: "ATRC STEM Career Test",
    // atrc.mdx headline
    sub: "I didn’t shorten the test. I designed the reasons to finish it.",
    chips: ["25 questions", "4 formats", "Pause & resume", "3-pathway report"],
    flow: [
      { src: "hello/atrc-mobile.webp", aspect: 0.526, label: "Mobile landing", phone: true },
      { src: "hello/atrc-question.webp", aspect: 1.406, label: "Question flow" },
      { src: "hello/atrc-pause.webp", aspect: 1.4, label: "Pause and resume" },
      { src: "hello/atrc-still.webp", aspect: 1.4, label: "Inactivity recovery" },
      { src: "hello/atrc-result.webp", aspect: 1.406, label: "Pathway report" },
    ],
  },

  // About.tsx pull quote
  quote: [{ text: "I ask a lot of questions" }, { text: "before I open Figma.", em: [3] }] as { text: string; em?: number[] }[],
  tools: ["figma", "miro", "claude", "chatgpt", "framer", "relume", "mobin", "github", "antigravity"],

  wordmark: "Riyazdesigns",
  available: "Open to full-time UX roles",
  roleLine: "UX Designer · Vadodara, India",
  contact: ["riyazdesigns.netlify.app", "malekriyaz606@gmail.com", "linkedin.com/in/riyaz-malek"],
};
