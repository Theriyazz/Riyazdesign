# ATRC STEM Career Test — Case Study

**UX Case Study · ATRC STEM Career Test · EdTech / GovTech · UAE · 2025**

## STEM Assessments Are Long. Teenagers Quit in the Middle.
## I Didn't Shorten the Test. I Designed the Reasons to Finish It.

For the Advanced Technology Research Council, UAE, I designed a STEM career assessment for school students — solo, from working prototype through wireframes to the approved product, live at careertest.atrc.ae. The test stays long, because the psychometrics need it to be. The design's job was to carry a student all the way through it.

### My Role, Delivery, Tools

| My Role | What I Delivered | Tools Used |
|---|---|---|
| UX Designer — Research, Strategy, UI Design, Prototyping | Assessment Flow Design, UX Decision, Figma prototype, Component Library | Figma, FigJam, Lovable, Claude AI, Perplexity |

| Platform | Industry | Timeline |
|---|---|---|
| Web — Desktop + Mobile, Responsive | EdTech, STEM | 1 Month |

### Deliverables

Interactive Prototypes (2 directions) · Sketch Wireframes · Landing Page · Onboarding · 4 Question Types · Gamified Progress System · Pause & Resume · Inactivity Recovery · Error & Analysing States · 3-Pathway Report · Retake Flow

### About the client

The Advanced Technology Research Council (ATRC) is the Abu Dhabi government body that oversees research and development for the emirate — established in 2020, it drives strategic research priorities and the commercialisation of advanced technology through its subsidiaries, including the Technology Innovation Institute. Alongside the deep-tech work, ATRC runs youth and STEM initiatives — among them Future-Focused Career Pathways — that shape how Emirati students find their way into science and technology careers.

That's where this project sits: the career test is part of the talent pipeline. A research council can fund labs and attract global scientists, but the long-term supply of Emirati engineers starts with a fifteen-year-old deciding what to study. This test is the front door of that decision.

### Note before you continue

This case study shows three stages of the same product — the throwaway prototypes, the wireframes, and the shipped screens — including decisions from the prototypes that I deliberately reversed. The gaps between the stages are the point.

---

## The Problem

Serious STEM assessments in this market run 60–70 questions. There's no way around the length — a credible psychometric result needs enough signal, and a five-question quiz can't map a student to a career pathway.

But the test-taker is fifteen. Long assessments lose teenagers in the middle: attention drifts, a notification lands, the tab closes, and twenty minutes of honest answers disappear.

**So the brief was a contradiction: a test long enough to be credible, experienced as something a student wants to finish.**

I was the sole freelance product designer — prototype, wireframes, UI, every state.

---

## Stage 01 — Prototype First

I started by building, not sketching: two working prototypes in Lovable, with 8 placeholder questions — enough to make the flow real without writing a full question bank. The point was never the question count. It was that a test flow can't be judged from static screens; I needed to *take it* to feel where it breaks.

I built it twice deliberately — one consumer-toned, one institutional — to force a comparison instead of a default.

### Three findings came out of clicking through them

**1. State the cost before asking for the effort.** The version that told students the time, the question count, and "no registration required" *before* the start button made starting feel safe. The version that only promised benefits didn't. This became the landing page principle.

**2. A selected answer should still look like an answer.** One prototype flooded the chosen option solid and dropped its letter badge — the item you picked stopped resembling the list around it. The fix (keep the badge, mark selection with fill and border) carried into the final system.

**3. A verdict closes doors; a ranking opens them.** One prototype ended with a single career. The other ranked every path with a percentage. For a teenager who'll be a different person next year, ranked is more honest — this finding became the three-pathway report.

---

## Stage 02 — Wireframes: Designing the Full System

With the findings listed, I sketched every screen and state on paper — and this is where the product became much bigger than the prototypes.

The wireframes added everything the prototypes never had:

- **Two-step onboarding** — an intro video with three highlights about the test, so a student knows what they're walking into
- **A per-question layout** with timer, progress bar showing how many questions remain, and a question-related image beside every question
- **Four question formats** — five-option choice, picture selection, drag-to-arrange, and connect/match — sketched as separate templates
- **Pause as a first-class flow** — "Pause this test" on every screen, with a reminder scheduler (1 hour / tomorrow / this week) drawn right into the wireframe
- **Inactivity recovery** — a "Still there?" state triggered after minutes of no activity, progress already saved
- **Loading and analysing states** — the moment between finishing and results, treated as its own screen
- **The report skeleton** — avatar, About, Skills, Subjects, Careers, Quick Tip, download and retake

> The pause and inactivity screens are the wireframes I'm proudest of. They exist because the test is long *on purpose* — the design accepts the length and builds safety nets around it, instead of pretending students never leave mid-test.

---

## Stage 03 — The Final Design

### Keeping engagement high across 25 questions

The shipped test runs 25 questions — and the count can grow, because the design doesn't depend on it staying small. Length is handled by design, not denial.

**Gamified progress.** A progress bar tracks questions remaining, next to a per-question timer — answering "how much is left?" before it's asked. At milestones, the test celebrates: 25% lands with a confetti moment and an encouraging message — *"Awesome! You're already 25% done. Every answer brings you closer to your perfect career match"* — and again at 50% and beyond. Long tests die in the middle; the milestones put small finish lines inside the big one.

> **UX Principle — Goal Gradient Effect**
> Motivation rises the closer someone gets to a goal — not steadily, but sharply near the end. Splitting one long test into milestone finish lines (25%, 50%…) means the student feels that acceleration four times instead of once.

**A guide, not an invigilator.** An illustrated Emirati character stands beside every question — a doctor for the health-science questions, a builder in a VR headset for the technology ones. Culturally, students see a test made *for* them (kandura, ghutrah, hijab — their own community). Emotionally, a companion turns exam pressure into conversation.

*Tooling note: the character set was AI-generated to my direction — an AI-assisted workflow doing the work of an illustration budget a solo freelance project doesn't have.*

**Four question types in rotation.** Standard choice, picture choice, drag-to-rank, and build-a-sentence blocks. The variety serves the psychometrics — different formats surface different signals — and breaks the rhythm so question 19 doesn't feel like question 4 again.

**Friendly failure.** Skip without answering and the error matches the product's voice — *"Ohh no… something missing"* — no red scolding on a test that promised there are no wrong answers.

### The safety nets

**Pause, with a promise.** Pausing saves progress for 7 days and offers a reminder email — in 1 hour, tomorrow, or this week. The student picks when they'll return; the product gently holds them to it.

> **UX Principle — Zeigarnik Effect**
> An unfinished task occupies memory more persistently than a finished one — people feel a pull to close the loop. The pause reminder isn't just a courtesy notification; it's riding that pull back to completion.

**Inactivity recovery.** Ten minutes idle triggers "Still There?" — one tap to break or continue, nothing lost to a closed tab.

### The report — three pathways, not one answer

The results give every student a Primary, Secondary and Tertiary pathway, each a full identity rather than a job title: **Future Builder — The Maker**, **Future Analyst — The Decoder**, **Future Leader — The Guide**.

Each pathway carries who you are, skills to build, subjects to focus on, career clusters to explore, and a **"Try This"** — one concrete activity for this month: build a prototype in CAD or LEGO, model predictions in Excel, run a school initiative. A result you can only read is a label; a result you can act on this week is guidance.

And at the bottom: *"Not sure? Hit rewind and see where your curiosity takes you."* Retake framed as exploration, never as failure.

---

## Outcome

**Shipped:** Landing, video onboarding, 25-question test in four formats, gamified progress with milestone celebrations, pause/resume with reminders, inactivity recovery, analysing state, 3-pathway report, retake.

**Status:** Live at careertest.atrc.ae

**Role:** Solo freelance Product Designer · September 2025

### What I'd do differently

**Watch five students take it.** Every finding came from testing my own prototypes — better than nothing, but I was a designer simulating a fifteen-year-old.

**Prototype the final interactions too.** Drag-to-rank and build-a-sentence went to development from Figma; they deserved the same working-prototype test the early flow got.

### What it taught me

**Prototype-first is a research method.** The findings that shaped this product are invisible in static screens; a rough working build cost two days and bought the strategy.

**Length is a design material.** The most valuable screens are the ones for *not* taking the test — pausing, returning, recovering. I designed the gaps, and the gaps are why students finish.

---

## Screen list — 14 visuals

| Where | Count | What |
|---|---|---|
| Hero | 1 | Final landing page |
| Stage 01 | 3 | Both prototype landings side by side · selected-state comparison · one-result vs ranked comparison |
| Stage 02 | 2 | Two wireframe spreads — the pause/reminder sketch and the question-type sketches. Hand-drawn process is rare and instantly credible. |
| Stage 03 — engagement | 3 | Milestone/confetti moment · guide-character composite (2–3 pairings) · one picture-choice or build-a-sentence screen |
| Stage 03 — safety nets | 2 | Pause screen with reminder options · "Still There?" screen |
| Stage 03 — report | 2 | Future Builder report full scroll · pathway tab switcher detail |
| Outcome | 1 | Final question screen at full quality |
| **Total** | **14** | |

**Signature asset:** the prototype comparison spread. Nobody at three years shows two working prototypes and the decisions reversed between them.

---

## Fix list — copy errors in the approved screens

Flag to the client now; the product is live and these are ten-minute fixes. Fix them in Figma **before exporting any case study image** — a case study about a polished test experience can't be illustrated with screens containing grammar errors.

1. "We have **pause** this test" → "We have **paused** this test."
2. "Your Progress **and** automatically saved" → "Your progress **is** automatically saved."
3. "**Arrangr** these statements" → "**Arrange**."
4. "Ohh no…. Something Missing" — four dots; consider "Something's missing."
5. The report CTA reads "See full **Future Builder** report" on all three pathway tabs — it should match the pathway shown.
