/**
 * The approved intro script, one entry per line. Edit words here; shots read from it.
 * Lines 12 to 14 of the original script (wall, 140+ screens, 37 to 7) were cut on review.
 */
export const copy = {
  never: "I never went to design school",
  commerce: "I studied commerce, actually.",
  hi: "Hi, I'm Riyaz.",
  became: { lead: "And somewhere along the way, I became a", land: "UX designer.", image: "story/became.webp" },
  jump: "Which sounds like a strange jump, I know.",
  edge: { lead: "But it turned out to be", land: "my edge." },
  look: { text: "Because when I look at a screen, I don't ask if it looks good.", image: "story/look.webp" },
  costing: { lead: "I ask what it's", land: "costing", tail: "the business." },
  years: { count: 3, text: "I've been asking that for 3+ years now." },
  fields: {
    lead: "Across",
    panels: [
      { label: "SaaS", image: "screens/03.webp" },
      { label: "EdTech", image: "story/edtech.webp" },
      { label: "Non-profits", image: "work/pecuc.webp" },
      { label: "Ecommerce", image: "screens/18.webp" },
    ],
  },
  show: "So let me show you what that looks like",
  figure: "I had to figure most of this out on my own.",
  daily: { lead: "So now I'm sharing all of it.", land: ["One post,", "every day."] },
  week: [
    { day: "TUE", label: "Tool Tuesdays" },
    { day: "WED", label: "Good UX vs bad UX" },
    { day: "FRI", label: "A free resource every Friday" },
    { day: "SUN", label: "AI and UX news on Sundays" },
  ],
  audiences: [
    { ask: "If you're just starting out,", answer: "I'll help you think like a senior.", accentFrom: 4 },
    { ask: "If you're building a product,", answer: "I'll show you UX that pays for itself.", accentFrom: 5 },
  ],
  you: "So if that's you,",
  follow: { handle: "@riyaz.designs", land: "follow along.", tail: "I'm just getting started." },
} as const;
