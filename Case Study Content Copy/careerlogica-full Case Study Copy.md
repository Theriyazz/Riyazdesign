# CareerLogica — Case Study

## New Structure (Spine)

| # | Section | Subtitle | Job it does |
|---|---------|----------|--------------|
| — | Hero | — | Stop the scroll, state the problem |
| — | Deliverables + disclaimer | — | Prove scope, set expectations honestly |
| 01 | The Problem Worth Solving | Why does this need to exist? | Establish stakes |
| 02 | What I Learned Before I Designed Anything | The research that changed my assumptions | Prove rigour |
| 03 | The Decision That Shaped the Product | Free until the value is proven | Signature section — product thinking |
| 04 | The Marketing Website | The first thing anyone sees | Prove visual craft, the approved-first work |
| 05 | One System, Four Products | One visual language, four mental models | Prove craft at scale |
| 06 | Building It in Both Directions | RTL was never a translation job | Differentiator |
| 07 | What Shipped | Scope, timeline, and what I'd change | Close honestly |

---

# CareerLogica

**UX Case Study · EdTech · UAE/India · 2026**

## When a Grade 11 Student in Dubai Asks "What Career Should I Choose?" The Answer Shouldn't Be a Guess.

I designed a psychometric-first career guidance platform for the UAE and South Asian markets — from blank canvas to a full marketing website and multi-role dashboards, bilingual in English and Arabic.

### My Role, Delivery, Tools

| My Role | What I Delivered | Tools Used |
|---|---|---|
| UX Designer — Research, Strategy, UI Design, Prototyping | UX/UI design, product strategy, dashboard design | Figma, FigJam, Figma Make, Claude AI, Antigravity |

| Platform | Industry | Timeline |
|---|---|---|
| Web — Desktop + Mobile, Responsive + RTL/LTR, Bilingual | EdTech | 3 Months |

### Deliverables

Marketing Website · 3 Login Flows · RTL/LTR Design System · Figma Prototype · Student Dashboard · Counsellor Dashboard · School Dashboard · Admin Dashboard · Component Library

### About the client

CareerLogica is an early-stage career guidance venture built for the UAE and South Asian education markets. It exists because of one observation: students across the region pick their career stream under pressure from family, peers and assumption — with almost no data about themselves in the decision.

When I came on, CareerLogica was a founder, a vision and a detailed brief. No product, no prior design, no validated flows. Every screen in this case study is the first version of that screen that has ever existed.

### A note before you continue

This isn't a polished retrospective written after a product launch. It's a working record of a live project — one that's currently in development. Where I have proof, I've shown it. Where I made a judgement call without data, I've said so.

---

## 01 — The Problem Worth Solving

### Why does this need to exist?

When I got this brief, one question kept me up: why does this need to exist at all?

Every year, thousands of UAE students choose their career stream under pressure from parents, peers and assumptions — not from data, not from science, not from any real understanding of who they are.

### For Students

No credible, personalised digital tool to connect interests to actual careers — before they make a decision they'll live with for years.

### For Counsellors

Managing an entire practice across WhatsApp, email, Google Drive, a calendar and a spreadsheet. Five tools doing the work of one that actually does the job.

### For Schools

Zero visibility into what's happening between a counsellor and their students. No tracking, no reporting, no oversight — all of it manual.

The challenge wasn't designing three separate tools. It was designing one coherent system that served four completely different mental models at the same time.

### Scope & approach

No existing platform. The founder came to me with a vision and a detailed brief — but no product, no prior design, no validated flows. Every screen I designed was the first version of that screen that had ever existed.

I was brought on as the sole freelance UX/UI designer. Research, information architecture, wireframing, UI design, the design system, and handoff. No junior support. Every decision in this document traces back to me.

---

## 02 — What I Learned Before I Designed Anything

### The research that changed my assumptions

I'd never designed for the UAE. I didn't know how the education system worked, how families made these decisions, or what a Grade 11 student in Dubai actually worries about. So before anything else, I went and found out.

### What the competitive audit told me

**ISMOJO**
Psychometric testing buried behind a confusing flow.

**Unifrog / IDP**
Study-abroad focused — not a direct competitor, but it set the bar for what students already expect from a guidance tool.

**GemsForLife / UniHawk**
Surface-level marketing pages. No real product depth underneath.

### Three findings that changed the design

**01 — The paywall was in the wrong place.** Almost every competitor let users sign up, complete onboarding, then hit a payment wall at the final step before the dashboard. Users invested effort, then got blocked. That's not a monetisation strategy — it's a trust problem disguised as one.

**02 — Onboarding was exhausting people before they started.** Long forms, dozens of small fields crammed onto a single page. Users were mentally spent before completing the first section. High cognitive load at exactly the moment you're asking someone to be honest about their future.

**03 — Nobody was designing for the other three roles.** Every competitor optimised for the student. Counsellors, schools and administrators were an afterthought — which is why counsellors were running practices out of five disconnected tools.

*[Personas and sitemap live here — see screen plan]*

---

## 03 — The Decision That Shaped the Product

### Free until the value is proven

Every competitor gated the product behind a paywall. I argued for the opposite: let people in, let them see what the platform actually knows about them, and ask for money only after that value is undeniable.

This wasn't a guess. I'd implemented a freemium model at CareerNaksha and watched it work — users who experienced the assessment first converted better and complained less than users asked to pay upfront.

### Three reasons this works

**01 — Payment at the last step destroys trust.** When someone completes a 15-minute assessment and then hits a paywall, the emotional read isn't "this is valuable." It's "I've been tricked." I moved the ask to after the first meaningful result — so the user is deciding whether to buy more of something good, not whether to gamble on something unknown.

**02 — Demonstrated value converts better than promised value.** A locked dashboard is a promise. A partial result is proof. The free tier gives the student a real psychometric snapshot; the paid tier gives depth, counsellor access and the full career mapping.

**03 — It protects the counsellor and school products too.** Schools won't buy a platform their students haven't used. Free student access is the acquisition channel for the institutional product — the business model and the user experience pointing the same direction.

### 4-Step Onboarding — reducing friction and drop-off

The competitor research showed me what not to do: everything on one page, dozens of fields, no sense of progress. I split onboarding into four steps, each with a name that tells the student what they're doing and why — not "Step 2 of 4," but a stage in understanding themselves.

**Identity → Scholar → Explorer → Achiever**

| Step | Name | What it captures |
|------|------|-------------------|
| 01 | Identity | Personal details — who you are |
| 02 | Scholar | Educational details — where you are academically |
| 03 | Explorer | Career preferences — what you're drawn to |
| 04 | Achiever | Final goal and purpose — what you're actually trying to reach |

Naming the steps did two things. It reduced the perceived length of the form, because four named stages read as shorter than one long page. And it reframed the task — the student isn't filling in a form, they're building a profile of themselves.

> **UX Principle — Chunking (Miller's Law)**
> One long form asks the brain to hold too much at once. Four named steps break the same task into pieces the brain can process one at a time — each with its own small sense of completion.

**Caption — progress bar:** Journey opens at 2/4, not 0/4. A blank progress bar reads as a big ask; a head start reads as momentum already in motion. Untested, but grounded in known progress-effect research.

> **UX Principle — Endowed Progress Effect**
> People are more likely to finish a task when they believe they've already made headway on it — even a fake head start increases completion. Starting the journey bar at 2/4 instead of 0/4 borrows this directly.

---

## 04 — The Marketing Website

### The first thing anyone sees

A 9–10 page marketing website. This was the first piece approved, and it set the visual language everything else inherited.

*[Screens: homepage full-page scroll · key inner pages · responsive/mobile view — see screen plan]*

### Three separate signup flows, not one with branches

**Student**
Academic details, interests, and what they're actually looking for. Conversational, low-pressure.

**Counsellor**
Experience, expertise, credentials. Professional register — this person is applying, not signing up.

**School**
Institutional details and the structure of who they oversee.

---

## 05 — One System, Four Products

### One visual language, four completely different mental models

A student, a counsellor, a school administrator and a platform admin want opposite things from the same product. The student wants clarity and encouragement. The counsellor wants throughput. The school wants oversight. The admin wants control.

One component library. One set of tokens. Density and tone do the differentiating — the student dashboard spacious and encouraging, the counsellor dashboard dense and built for volume. Same parts, different rhythm.

**Caption — upgrade card, student dashboard:** Plan status stays visible year-round ("Free Plan"), and the upsell names exactly what's locked — counselling, full report, 20,000+ careers — instead of a generic "go premium."

**Caption — counsellor list, pre-booking:** Recommended counsellors show before the student has booked anyone — ratings, specialty, review count all visible. An empty state invites nothing; a populated one invites a decision.

*[Screens: design system sheet · Student dashboard ×3 · Counsellor dashboard ×2 · School dashboard ×1 · Admin dashboard ×1]*

---

## 06 — Building It in Both Directions

### RTL was never a translation job

I'd never designed a bilingual product. I assumed Arabic support meant swapping text and mirroring layout. That lasted about a day.

Every element had to be reconsidered from the perspective of someone who reads right to left — nav bar, section order, button placement, icon direction, where the eye lands first, how a photo reads when its subject now faces the wrong way.

It forced me to stop designing from habit. English had a thousand prior instincts to lean on; Arabic had none, so every call had to be reasoned from scratch — which made the English version sharper too.

Bilingual isn't a feature bolted on at the end. It's a constraint that belongs in the design system from component one, or you build everything twice.

*[Screens: EN/AR homepage side by side · EN/AR dashboard side by side · RTL component detail]*

---

## 07 — What Shipped

### The product isn't live — so no conversion numbers, no retention data. Here's what's real.

**Scope**
140+ screens across 5 platform roles. Solo — a scope that typically needs a team of 2–3.

**System**
Complete bilingual EN/AR design system. RTL/LTR built in from day one, not retrofitted.

**Approval**
Client approved the final direction after the first major presentation. No structural revisions — for a 0-to-1 product this complex, that's a real signal.

**Timeline**
3 months, solo. Not faster work — fewer wrong turns. Owning the problem end to end meant fewer reversals later.

### Targets I designed against

| Target | Number | What it means |
|--------|--------|-----------------|
| Conversion | 8–12% | Free-to-paid target, against the 2–5% typical of fully gated platforms |
| Onboarding completion | 70%+ | Target for the 4-step flow, vs 40–60% typical for single-page forms |
| Assessment volume | 2,00,000+ | Founder's 3-year goal for completed assessments — the scale this is built for |

### Working with a non-technical founder

The client knew exactly what he wanted the business to do, and very little about how products get built. That turned out to help — I had to argue every real decision in business terms, not design terms. Why the paywall moved. Why onboarding split into four. Why RTL couldn't wait.

Once the reasoning landed, he stopped reviewing pixels and started trusting direction. That's when the project moved fast.

### What I'd do differently

*[Draft — confirm or replace before publishing]*

**01 — Test with real students.** Every call was validated with the founder, not the people who'd use it. He knew the market and was usually right, but agreement isn't validation. Next time: five student sessions before locking onboarding.

**02 — Build RTL into the system on day one.** Designed English-first, adapted Arabic after. Cost rework on components that should've been direction-agnostic from the start.

**03 — Push back harder on scope, month one.** The extra month wasn't slow work — it was scope growing without renegotiation. Should've flagged it week three, not absorbed it.

### What this project taught me

**01 — Ownership means the failures too.** Solo, no team, no senior to check against. Stuck meant reasoning it out alone and living with the answer.

**02 — Strategy beats surface.** The best work happened before Figma opened — the freemium argument, the onboarding structure, understanding how UAE families actually decide. Interfaces were the easy part.

**03 — An unfamiliar market is a research problem first.** Had to learn the UAE education system and how families weigh options before a single screen made sense. Domain understanding wasn't prep — it was the work.

---

© 2026 Riyaz Malek

---

## Appendix — Screen Plan (20 visuals total)

| Section | Count | What to show |
|---------|-------|---------------|
| Hero | 1 | The existing composite mockup — keep it |
| 01 Problem | 0 | Text and the three cards only. Resist adding imagery here. |
| 02 Research | 2 | One persona (student), one sitemap |
| 03 Decision | 5 | Onboarding flow diagram + four step screens (Identity, Scholar, Explorer, Achiever) — annotate the 2/4 progress head-start on the flow diagram |
| 04 Marketing Website | 4 | Homepage full scroll (1) · key inner pages (2) · signup flow comparison (1) |
| 05 System | 5 | Design system sheet (1) · Student dashboard (2, annotate the pre-filled counsellor list) · Counsellor dashboard (1) · School + Admin combined (1) |
| 06 RTL | 3 | EN/AR homepage side by side (1) · EN/AR dashboard side by side (1) · RTL component detail (1) |
| 07 Shipped | 0 | Text + target cards only |
| **Total** | **20** | |

### Rules for the screens

- Every screen needs a one-line caption explaining what decision it shows. A screen without a caption is decoration.
- Two UX-principle callouts (Chunking, Endowed Progress Effect) marked in the copy above — carry these into the image annotations, don't leave them text-only.
- The RTL side-by-sides are your highest-value visuals. Give them the most space. If someone looks at one thing, make it those.
- Cut the five large component instances from the old section 04 (nodes 47:1322–47:1404, ~4,700px). Quarter of your page height, no argument attached.

---

## Fix List

- Rename all section H2s. Multiple currently read "The Problem Worth Solving."
- Delete every instance of the placeholder string "When I first got this brief, I had one question th…" outside section 01.
- Delete the duplicated "Psychometric testing buried behind a confusing flow…" text in downstream containers.
- Remove the duplicate opening paragraphs at the top of section 02.
- Footer: © 2024 → © 2026.
- Remove the "More work coming soon" block entirely.
- Check that "2,000+ students guided / 50+ career experts / 20k+ career options" appear only inside product mockups, never as case-study metrics.
- **Open: confirm or replace the 3 "what I'd do differently" items in section 07 — still draft.**
