# Filling in the content

Everything below is a slot waiting for something you already know. Nothing here
requires touching a component.

**The site is four pages:** the homepage, and one route per case study. Work,
About and Contact are anchors that scroll the homepage — they are not separate
pages, and adding one means adding a section, not a route.

---

## 1. Your details — `lib/site.ts`

One file holds every fact about you. Fix these first, they appear everywhere:

| Field | Currently | Needs |
|---|---|---|
| `url` | `https://riyazdesigns.com` | Your real domain — this drives OG cards and the sitemap |
| `resume` | `/riyaz-malek-resume.pdf` | **Drop the PDF at `public/riyaz-malek-resume.pdf`.** Four buttons point at it; until it exists they all 404 |
| `socials` | LinkedIn + Instagram placeholders | Real URLs. **Delete any you don't have** rather than leaving a dead link |
| `available`, `availableLabel` | `true` | Set `false` when you're not looking — the pulsing dot is a promise |
| `rotating` | 4 disciplines | The hero cycles these. The layout auto-sizes to the longest one, so adding a much longer entry widens that line |

---

## 2. Case studies — `content/work/*.mdx`

Three files: `careerlogica.mdx` (001), `pecuc.mdx` (002), `atrc.mdx` (003).
Each has frontmatter (the facts) and a body (the story). `order` controls the
sequence on the homepage.

### Frontmatter

`subtitle` is the line always visible on the work card. `detail` is the
paragraph the card reveals on hover — both are already filled in from your
copy.

Validated at build time. **A malformed field fails `npm run build` with a
message naming the file and the field** — that's deliberate, so a broken case
study can never ship silently.

```yaml
outcome: "Cut assessment drop-off from 41% to 12%."   # one sentence, past tense
metrics:                                              # 2–4 entries, or omit
  - { value: "5,000+", label: "students assessed" }
  - { value: "−29pt",  label: "drop-off reduction" }
```

> **On metrics.** The band is the single highest-leverage element for a
> ten-second read — and the easiest to discredit yourself with. If you don't
> have a real number, **delete the whole `metrics:` block.** The section
> disappears cleanly. An honest gap costs you nothing; a number you can't defend
> in an interview costs you the interview.

`accent` is that client's real brand color. It tints the case study's internals
(decision bars, metric figures, section rail) without the site shell changing.

### Body

Keep the section order — it's the order recruiters scan. The load-bearing part:

```mdx
<Decision
  decision="Replaced the 25-question form with a 5-step branching flow"
  why="12 of 14 students in testing stalled at question 12; the flat list gave no sense of progress"
  tradeoff="Branching doubled the QA surface and made the results algorithm harder to explain to the client"
/>
```

`tradeoff` is a required prop. You cannot render a decision without admitting
what it cost — that's the point. **Recruiters read tradeoffs as seniority.**
Three honest decisions beat eight padded ones.

Other components available in the body: `<ImageBlock>` (one image), `<Compare>`
(exactly two, side by side), `<Callout>`, `<CardGrid>` / `<Card>`,
`<Findings>` / `<Finding>`, `<Steps>` / `<Step>`, `<StatRow>` / `<Stat>`,
`<SpecList>` / `<Spec>`, `<Takeaways>` / `<Takeaway>`, `<Principle>`, `<Quote>`,
`<Deliverables>`.

### Showing more than two screens — `<ScreenCarousel>`

```mdx
<ScreenCarousel label="Student dashboard">
  <Screen src="/work/careerlogica/student-01-dashboard.avif" name="Dashboard home" alt="…" />
  <Screen src="/work/careerlogica/student-02-counselling.avif" name="Career counselling" alt="…" />
</ScreenCarousel>
```

One screen at a time at **705px**, with the next peeking at the edge. Arrows,
dots, a live counter, keyboard `←`/`→`, and swipe on touch. Nothing moves on its
own — there is no autoplay, deliberately.

**Use it for shipped screens and for sets of tall artifacts.** Not for a single
image (`<ImageBlock>`) and not for a genuine before/after pair (`<Compare>` —
the side-by-side *is* the argument there, and a swipe hides it).

The reason it exists: nine screens composed onto one board render each screen
near 260px in the 820px column — enough to see a layout, not enough to read one.
One at a time spends the same pixels on one screen. That means **one image file
per screen**, not a composed board.

> **`name` is optional but nearly always wanted** — it captions the slide. Keep
> it short; it sits under the frame.

### Tables don't render

`remark-gfm` isn't configured, so a markdown table renders as raw pipes and
dashes on the page. Use `<SpecList>`, `<StatRow>` or `<CardGrid>` instead —
they all say "a set of label/value pairs" and they're responsive, which a table
at this width isn't.

`<MetaBar />` takes no props — it reads Role, Delivered, Tools, Platform,
Industry and Timeline straight from the frontmatter. It is a body tag rather
than something the page places automatically, so the facts land where the
writing wants them. All three studies put it at the end of Context, so the
reader gets the hook and then what the project is before six fields of
metadata. Include it once per case study.

---

## 3. Images

Drop sources anywhere, then register them in `scripts/optimize-images.mjs`:

```js
["Case Study Section Images/ATRC flow diagram.png", "work/atrc/01"],
```

Then:

```bash
npm run images
```

This emits AVIF + WebP + a blur placeholder and records the real dimensions, so
there's no layout shift. The existing seven assets went from **13.6MB to 362KB
(−97%)**.

Until an image is registered, `<ImageBlock>` renders a dashed placeholder naming
the exact missing file — so a half-finished case study looks unfinished on
purpose, not broken.

Alt text: describe **what the work shows**, not the filename. "Results screen
with the top three career matches expanded" — not "screenshot 4".

---

## 4. Homepage copy that lives in components

Your copy is already in place. These are the files if you want to edit it:

| Section | File |
|---|---|
| Hero | `components/sections/Hero.tsx` |
| First fold statement | `components/sections/FirstFold.tsx` |
| About | `components/sections/About.tsx` |
| Capabilities | `components/sections/Capabilities.tsx` |
| Tool stack | `components/sections/ToolStack.tsx` |
| Testimonials | `components/sections/Testimonials.tsx` |
| Experience | `components/sections/Experience.tsx` |
| Contact | `components/sections/ContactCTA.tsx` |

Two notes on choices made in there:

- **Tools are typeset, not logos.** Six vendor logos in six different weights
  and lockups would be the loudest thing on a page whose whole argument is
  restraint — and Claude Code and Antigravity have no clean mark anyway. Say
  the word if you'd rather have the logos and I'll swap them in.
- **The CareerNaksha row keeps "Graphic Designer → UX Designer" on one line.**
  Split across two rows it reads as two jobs; together it reads as a promotion.

## 5. Everything marked `TODO`

```bash
grep -rn "TODO" app components lib content
```

Mostly the case study bodies, plus the résumé PDF path in `lib/site.ts`.

---

## Running it

```bash
npm run dev      # http://localhost:3000
npm run build    # also validates every case study's frontmatter
npm run images   # after adding any new image
```
