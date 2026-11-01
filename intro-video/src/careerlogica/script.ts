/**
 * Every word the launch film shows. Edit here; no scene needs touching.
 * Numbers are the ones the product's own screens state (login, psychometric
 * test and marketing pages), so nothing here is invented.
 */

/** A bottom caption; `accent` lists the words that take the yellow marker. */
type Cap = { text: string; accent: readonly number[] };
const cap = (text: string, ...accent: number[]): Cap => ({ text, accent });

export const film = {
  doubts: [
    "Engineering?",
    "Medicine?",
    "Design?",
    "Which university?",
    "What if I choose wrong?",
    "Everyone has an opinion",
    "20k+ career options",
    "Which exam?",
  ],
  problem: "Choosing a career is confusing.",
  promise: { text: "We just made it clear.", accent: 4 },
  welcome: "Welcome to CareerLogica.",
  pillarsLine: "Two steps to career clarity.",
  pillarCards: [
    { n: "01", title: "Psychometric Test", note: "Discover what you're built for" },
    { n: "02", title: "Career Counselling", note: "Plan it with a certified expert" },
  ],
  tour: "Here's how it works.",

  account: { first: "Amir", last: "Shaikh", email: "amirshaikh2000@gmail.com", password: "••••••••••" },

  signup: cap("Sign up as a student.", 4),
  identity: cap("Tell us who you are.", 2, 3, 4),
  login: cap("Log in. Pick up where you left off.", 0, 1),
  home: cap("Your whole journey, one dashboard.", 3, 4),

  steps: ["STEP 1 · PSYCHOMETRIC TEST", "STEP 2 · CAREER COUNSELLING"],
  testIntro: cap("45 minutes. 5 dimensions.", 0, 2),
  testAnswer: cap("Answer honestly. No wrong answers.", 2, 3),
  testResult: cap("One clear direction.", 1, 2),
  book: cap("Book a certified counsellor.", 2, 3),
  slot: cap("Pick a time that works.", 2),
  booked: cap("Session booked. That simple.", 1),
  toast: "Session booked with Priya Kapoor",
  library: cap("Explore every career.", 2),
  finder: cap("Find your university.", 2),

  // The test itself has no screens in the Figma file, so these two sample
  // statements are written for the film. The dimension names are the product's.
  questions: [
    { dimension: "Interests & Passions", text: "I enjoy solving problems with logic and numbers.", pick: 3 },
    { dimension: "Work Style Preferences", text: "I do my best work as part of a team.", pick: 4 },
  ],
  scale: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
  // The sample profile shown on the product's own psychometric page.
  profile: {
    title: "Your Psychometric Profile",
    match: "94% Match",
    dimensions: [
      { name: "Interests", value: 88 },
      { name: "Personality", value: 76 },
      { name: "Aptitude", value: 92 },
      { name: "Skills", value: 70 },
      { name: "Work Style", value: 84 },
    ],
  },

  stat: { value: 2000, suffix: "+", label: "students guided" },
  proof: ["50+ career experts", "20k+ career options", "Built on O*NET"],

  close: { text: "Find your direction.", accent: 2 },
  tagline: "Career clarity, backed by science.",
  cta: "Take the test at careerlogica.com",
  pillars: "Psychometric Test  ·  Career Counselling  ·  Admission Guidance",
} as const;
