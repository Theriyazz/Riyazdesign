# Riyazdesigns — Riyaz Malek's portfolio

Dark editorial portfolio built to be read in ten seconds and hold up under a
second look. Next.js 16 · TypeScript · Tailwind v4 · GSAP · Lenis.

**Start here for content:** [`CONTENT.md`](./CONTENT.md).

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # also validates every case study's frontmatter
npm run images   # regenerate optimized images after adding sources
```

---

## Shape

Four pages. One homepage, three case studies.

```
/                     everything: hero, work, about, capabilities,
                      tools, testimonials, experience, contact
/work/careerlogica
/work/pecuc
/work/atrc
```

Work, About and Contact in the nav are **anchors that scroll the homepage**,
not routes (`components/layout/AnchorLink.tsx`). They render as real
`<a href="/#work">` elements, so copy-link, middle-click and no-JS all behave;
the click handler hands the scroll to Lenis so it doesn't fight smooth scroll.
From a case study the same link routes home and finishes the scroll on arrival
via `HashScroller`.

Adding a section means adding a section — not a route.

---

## Design system

`styles/tokens.css` is the source of truth: primitive → semantic → component.
Components reference semantic tokens only; nothing reaches back to a raw hex.

**The accent is a signal, never a fill.** `--signal-500` is allowed on exactly
five things:

1. the cursor dot
2. the split-button arrow chip
3. the active nav indicator
4. the availability dot
5. **whatever you are currently pointing at** — link underlines, a hovered
   card's index number, and the rule that wipes across a hovered row, cell or
   card

Every other colour on the page comes from the case study covers themselves.
That restraint is what most separates this from a template.

The fifth entry is one rule, not three exceptions: the accent answers "this is
the thing under your cursor", and it does not matter which element is asking.
Adding a *sixth* category — an accent that is not one of the four fixed marks
and is not a hover response — is where this starts going wrong.

`--case-accent` is the one deliberate exception: each case study sets it to the
client's real brand colour, scoped to that page, so the client's identity lives
inside the work without the site shell ever changing.

**Type:** Geist (display + body, 400/500), Geist Mono (micro-labels, tags,
400), Instrument Serif Italic (one emphasised word per headline, maximum). All
three via `next/font/google` with pinned weights and the latin subset — see the
performance note below for why that matters.

---

## Motion

Four systems, each with a hard budget, because motion that costs the reader
time is a net loss however good it looks.

| System | Budget | Guard |
|---|---|---|
| Preloader | 1.4s hard cap, resolves early | First visit only, **desktop only** |
| Custom cursor | — | `(pointer: fine)` only |
| Page transitions | 420ms in / 360ms out | Overlay at layout root, max-wait timeout |
| Scroll reveals | scrubbed | Text stays in the DOM, readable with JS off |

**Rules that are load-bearing:**

- One `prefers-reduced-motion` check at the root (`app/layout.tsx` boot script +
  `lib/useReducedMotion.ts`) disables Lenis, the preloader, the cursor, and all
  scrubs. Not sprinkled per component.
- Only `transform` and `opacity` are animated. Never `width`/`height`/`top`/`left`.
  The two exceptions are both deliberate and both scoped to one element: the
  `filter` on the FirstFold sheen, and the `backdrop-filter` on the nav bar.
- `useGSAP()` scoped to a container ref, so every timeline auto-cleans.
- Reveal text rests at **0.5 opacity, not lower** — that's 4.93:1, the AA floor.
  A visitor can land mid-page or scrub backwards; the text has to be legible
  before the animation fires.
  **The FirstFold sheen is the one exception**, resting at 0.35 behind an 8px
  blur, because blurred text is unreadable at any opacity and the floor buys
  nothing there. It's allowed only because that fill is scrubbed and ends while
  the block is still well inside the viewport, so a reader who stops scrolling
  lands on finished text rather than on blur. Do not copy the exception into a
  reveal that isn't scrubbed.
- No GSAP SplitText (paid Club plugin). `lib/splitText.ts` replaces it and keeps
  the split accessible via a visually-hidden sibling rather than an `aria-label`,
  which would be invalid ARIA on a `<p>`.
- The work card's hover detail collapses with `grid-template-rows: 0fr → 1fr`,
  so it stays in the DOM and the accessibility tree throughout. It opens on
  focus as well as hover, and is open by default on touch and under reduced
  motion. Progressive disclosure must never mean "some people don't get to read
  this."

**One motion per navigation.** Clicking a work card morphs its cover into the
case study hero (`lib/flipHandoff.ts`); every other route change wipes. The two
can't coexist — an opaque curtain makes a shared-element morph invisible.

---

## Performance notes worth keeping

Three regressions found by measuring, each fixed at the source:

1. **The hero entrance was the LCP bottleneck.** GSAP set the hero text to
   `opacity: 0` on mount, so it couldn't paint until hydration finished — 3.0s
   of render delay for an entrance lasting under a second. It's now CSS and
   transform-only (`heroLine` / `heroSub` in `globals.css`), so the text paints
   on the first frame at its offset position.
2. **The canvas line field cost ~7s of mobile main-thread time.** A continuous
   RAF redraw pushed mobile TBT from 110ms to 1130ms, to render something
   mostly hidden behind the hero text at 375px. Now desktop-only, and it pauses
   offscreen and on a hidden tab.
3. **Variable fonts drove LCP.** The `geist` npm package ships full variable
   files (68KB sans + 70KB mono); with `display: swap` the real font arrives
   after first paint and re-paints the hero, which Chrome scores as a new
   largest paint. Pinned static weights via `next/font/google` cut the font
   payload from 154KB to 54KB and mobile LCP from 3.6s to 2.1s.

The common thread: every one of these was an animation or asset that looked
free on a fast desktop and wasn't on a phone.

---

## Content

MDX in `content/work/`, frontmatter validated by Zod at build time. A missing or
malformed field **fails the build** with the file and field named, rather than
rendering an empty section. `metrics` is optional so an absent number stays
absent instead of becoming a plausible invention.

---

## Verified

Production build, Chrome headless, local server:

| | Desktop | Mobile |
|---|---|---|
| Performance | 100 | 78 – 92 |
| Accessibility | 96 | 96 |
| Best practices | 100 | 100 |
| SEO | 100 | 100 |
| LCP | 0.7s | 2.4 – 3.4s |
| CLS | 0 | 0 |
| TBT | 10ms | 260 – 450ms |

Case study route: 99 performance, 96 accessibility (desktop).

**On the mobile range.** Four identical runs scored 78 / 82 / 92 / 85 — the
spread is measurement noise from running Lighthouse, a Next server and Chrome
on the same machine, so treat any single number with suspicion. **Re-measure on
the deployed Vercel URL before acting on it.**

The honest part of that range: mobile LCP is font-bound. Lighthouse's mobile
profile is slow 4G plus 4× CPU throttling, and with `display: swap` the hero
text paints twice — once in the fallback, once when Geist arrives — with the
second paint scoring as LCP. Larger display type makes that second paint more
expensive, so the hero type-scale increase cost roughly half a second here.
The lever if it needs to go further is font bytes, not markup: the three
families are already pinned to five static weights and the latin subset.

Also verified, via `verify-tmp.mjs`: no horizontal overflow at 375/414/768/
1024/1440; all three anchors scroll without routing; the cross-page anchor from
a case study lands on the right section; the work card detail is in the DOM
before hover and reveals on hover; reduced motion disables all four systems and
opens the card detail; the homepage and case study bodies are complete with
JavaScript disabled; every keyboard stop has a visible focus ring; no console
errors.

The one remaining accessibility flag is the giant footer wordmark at 1.17:1.
That is a deliberate, documented exception — WCAG 1.4.3 exempts pure
decoration, and the wordmark already appears in the nav, `<title>`, and contact
block. See the comment in `components/layout/Footer.tsx`.

---

## Structure

```
app/                 / and work/[slug] — that's all four pages
components/
  primitives/        SplitButton · MicroLabel · Tag · WorkCard · Marquee
  motion/            Preloader · Cursor · TransitionOverlay · SmoothScroll · Reveal*
  sections/          the homepage, one file per section
  case-study/        MDX components, meta bar, metrics band, section rail
  layout/            Nav · Footer · AnchorLink · LocalTime
lib/                 content (Zod) · images · splitText · flipHandoff · site
content/work/*.mdx   the case studies
styles/tokens.css    design system source of truth
scripts/             image pipeline
```
