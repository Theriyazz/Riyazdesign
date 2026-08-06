# Image specification

Every image slot on the site, in section order, with the size it is actually
rendered at and the source resolution needed to serve it cleanly.

Measured in a real browser at a 1440px viewport, which is the design ceiling:
`--page-max` is 1440px and the gutter tops out at 80px, so the content column
never exceeds **1280px** no matter how wide the screen gets.

---

## How an image gets onto the site

1. Drop the source PNG in `Case Study Section Images/` (or `Riyaz Images/`).
2. Register it in `scripts/optimize-images.mjs` — add a `[source, output]` pair
   to `JOBS`.
3. Run `npm run images`.

That writes `public/<output>.avif` + `.webp` and records the intrinsic
dimensions and a blur placeholder in `lib/image-manifest.json`. Until an image
is registered, `<ImageBlock>` and `<Compare>` render a dashed placeholder
naming the missing file — nothing breaks, the slot just reads as a to-do.

**Source resolution rule:** export at **2× the display width** in the tables
below. The script never enlarges (`withoutEnlargement: true`), so a source
smaller than 2× ships soft on a retina screen. Ceiling is 2560px wide.

**Format:** PNG source. AVIF + WebP are generated; don't commit those by hand.

---

## Homepage

Section order top to bottom. Sections not listed (Hero, First Fold,
Capabilities, Testimonials, Experience, Contact) carry no images.

| # | Section | File | Display @1440 | Ratio | Source needed | Status |
|---|---------|------|---------------|-------|---------------|--------|
| 0.1–0.6 | Preloader previews | reuses the 3 covers + `riyaz/wide`, `alt-1`, `portrait` | 320×180 | 16:9 crop | — | Live |
| 1.1 | Selected Work — card 001 | `/work/careerlogica/cover.avif` | 1280×800 | 16:10 crop | 2560×1600 | Live (1525×1319) |
| 1.2 | Selected Work — card 002 | `/work/pecuc/cover.avif` | 1280×800 | 16:10 crop | 2560×1600 | Live (1448×1086) |
| 1.3 | Selected Work — card 003 | `/work/atrc/cover.avif` | 1280×800 | 16:10 crop | 2560×1600 | Live (1525×1319) |
| 2.1 | About — portrait | `/riyaz/portrait.avif` | 511×341 | 3:2, uncropped | 1024×683 | Live (1536×1024) |
| 3.1–3.9 | Tool stack — marks | `/tools/*.webp` | 84×84 | 1:1 | 168×168 | Live (168×168) |

Tool marks, in ticker order: figma, framer, miro, relume, mobin, claude,
chatgpt, antigravity, github.

### Notes on the homepage

- **Covers are cropped twice, differently.** The work card crops to 16:10; the
  case study hero crops the same file to roughly 2.2:1. The sources are near
  square (~1.16:1), so both crops take a lot off. Keep the subject centred and
  inside a 16:10 safe zone or the hero will cut it.
- **Covers are under 2× for their largest use.** At 1280px display, a 1525px
  source is 1.19×. Re-export at 2560px wide for a retina-sharp card.
- **`riyaz/alt-2.avif` is generated but unused** — nothing in the codebase
  references it. Either wire it up or drop it from `JOBS`.
- **The About portrait declares `sizes="460px"` but renders at 511px.** Harmless
  today (the browser picks the 640px derivative anyway), but the declaration is
  wrong and should say 520px.

---

## Case study page — shared slots

Every case study page has these three, regardless of body content.

| Slot | Where | Display @1440 | Ratio | Source needed |
|------|-------|---------------|-------|---------------|
| Hero | Under the title block | 1280×580 | ~2.2:1 crop | 2560×1160 |
| Body image, standard | Inside the 820px reading column | 820 wide | any (height free) | 1640 wide |
| Body image, `wide` | Breaks out 8vw each side | 1050 wide @1440, up to 1280 | any | 2560 wide |
| Compare panel (×2) | Two-up grid inside the column | 398 wide each | any | 840 wide |
| Next project cover | Bottom of the page | 550×344 | 16:10 crop | 1100×688 |

Body images use `h-auto w-full` — they keep their own aspect ratio and are never
cropped. Full-page scroll captures are fine here however tall they run. The
dashed placeholder box is 16:10, so an image near that ratio changes the page
rhythm least.

---

## 001 — CareerLogica

Cover live. **7 body images missing.**

| # | Section | File | Kind | Display | Source | Description |
|---|---------|------|------|---------|--------|-------------|
| 1.0 | Hero | `/work/careerlogica/cover.avif` | Hero | 1280×580 | 2560×1160 | Live |
| 1.1 | 02 — What I learned before I designed anything | `/work/careerlogica/01.avif` | Standard | 820 | 1640 | Student persona and the platform sitemap — four roles mapped against a single information architecture |
| 1.2 | 03 — The decision that shaped the product | `/work/careerlogica/02.avif` | Standard | 820 | 1640 | The four-step onboarding flow, progress bar opening at 2 of 4 — Identity → Scholar → Explorer → Achiever |
| 1.3 | 04 — The marketing website | `/work/careerlogica/03.avif` | **Wide** | 1050–1280 | 2560 | Full-page scroll of the CareerLogica marketing homepage — the approved direction the rest of the product inherited |
| 1.4 | 05 — One system, four products | `/work/careerlogica/04.avif` | Standard | 820 | 1640 | Student dashboard showing plan status and the upgrade card |
| 1.5 | 05 — One system, four products | `/work/careerlogica/05.avif` | Standard | 820 | 1640 | Counsellor list in the student dashboard before any booking — ratings, specialty, review count |
| 1.6a | 06 — Building it in both directions | `/work/careerlogica/en.avif` | Compare — "English — LTR" | 398 | 840 | English left-to-right homepage layout |
| 1.6b | 06 — Building it in both directions | `/work/careerlogica/ar.avif` | Compare — "Arabic — RTL" | 398 | 840 | Arabic right-to-left homepage layout, fully mirrored |

---

## 002 — PECUC

Cover live. **23 body images missing** — the largest set, mostly the
before/after wall.

| # | Section | File | Kind | Display | Source | Description |
|---|---------|------|------|---------|--------|-------------|
| 2.0 | Hero | `/work/pecuc/cover.avif` | Hero | 1280×580 | 2560×1160 | Live |
| 2.1 | The problem | `/work/pecuc/01.avif` | Standard | 820 | 1640 | Full-page capture of the 2001-era PECUC homepage — eleven-message slider, seventeen links above the fold |
| 2.2 | Stage 01 — The audit | `/work/pecuc/02.avif` | Standard | 820 | 1640 | The old navigation fully expanded, annotated with all 37 destinations |
| 2.3a | Stage 02 — Restructuring | `/work/pecuc/nav-old.avif` | Compare — "37 destinations" | 398 | 840 | Sitemap of the old 37-destination navigation |
| 2.3b | Stage 02 — Restructuring | `/work/pecuc/nav-new.avif` | Compare — "7 destinations" | 398 | 840 | Sitemap of the new 7-destination navigation |
| 2.4 | Stage 03 — Building the visual language | `/work/pecuc/03.avif` | **Wide** | 1050–1280 | 2560 | The PECUC visual design guide — palette, type sheet, photography treatment |
| 2.5 | Stage 04 — Designing the two broken journeys | `/work/pecuc/04.avif` | Standard | 820 | 1640 | Full scroll of the redesigned tiered donation page |
| 2.6a | Stage 05 — Iteration | `/work/pecuc/layout-v1.avif` | Compare — "Version 1 — rejected" | 398 | 840 | The first homepage layout, rejected at client review |
| 2.6b | Stage 05 — Iteration | `/work/pecuc/layout-v2.avif` | Compare — "Version 2 — approved" | 398 | 840 | The approved homepage layout |
| 2.7a | Before and after | `/work/pecuc/ba-01-old.avif` | Compare — "The hero — before" | 398 | 840 | Old homepage hero: eleven banners on cube transitions |
| 2.7b | Before and after | `/work/pecuc/ba-01-new.avif` | Compare — "The hero — after" | 398 | 840 | New homepage hero: one child's photograph, one heading, one paragraph |
| 2.8a | Before and after | `/work/pecuc/ba-02-old.avif` | Compare — "Programmes — before" | 398 | 840 | Nine programme themes hidden inside a dropdown menu |
| 2.8b | Before and after | `/work/pecuc/ba-02-new.avif` | Compare — "Programmes — after" | 398 | 840 | "Where We Walk Together" as a full section, visible without interaction |
| 2.9a | Before and after | `/work/pecuc/ba-03-old.avif` | Compare — "Credibility — before" | 398 | 840 | Partner links in a side table, one pointing to a Word document |
| 2.9b | Before and after | `/work/pecuc/ba-03-new.avif` | Compare — "Credibility — after" | 398 | 840 | UNICEF and EU logo strip under the hero, consolidated credibility section |
| 2.10a | Before and after | `/work/pecuc/ba-04-old.avif` | Compare — "The stories — before" | 398 | 840 | Truncated grey story text ending in a raw query-string link |
| 2.10b | Before and after | `/work/pecuc/ba-04-new.avif` | Compare — "The stories — after" | 398 | 840 | "Stories That Will Move You", with full portraits of the people in them |
| 2.11a | Before and after | `/work/pecuc/ba-05-old.avif` | Compare — "Donation — before" | 398 | 840 | The old donation link pointing to a dead anchor |
| 2.11b | Before and after | `/work/pecuc/ba-05-new.avif` | Compare — "Donation — after" | 398 | 840 | The tiered giving page with programme-named tiers |
| 2.12a | Before and after | `/work/pecuc/ba-06-old.avif` | Compare — "Volunteering — before" | 398 | 840 | The Get Involved link downloading a printable PDF form |
| 2.12b | Before and after | `/work/pecuc/ba-06-new.avif` | Compare — "Volunteering — after" | 398 | 840 | The staged volunteer signup flow |
| 2.13a | Before and after | `/work/pecuc/ba-07-old.avif` | Compare — "The footer — before" | 398 | 840 | Footer reading "All rights Reserved 2001-2023" |
| 2.13b | Before and after | `/work/pecuc/ba-07-new.avif` | Compare — "The footer — after" | 398 | 840 | Footer stat strip carrying PECUC's own reported figures |
| 2.14 | Outcome | `/work/pecuc/05.avif` | **Wide** | 1050–1280 | 2560 | Full-page scroll of the redesigned PECUC homepage |

The before/after wall is 14 images that must read as pairs. Shoot them at
matched crops — same framing, same scroll depth — or the comparison does the
opposite of what it's there for.

---

## 003 — ATRC STEM Career Test

Cover live. **7 body images missing.**

| # | Section | File | Kind | Display | Source | Description |
|---|---------|------|------|---------|--------|-------------|
| 3.0 | Hero | `/work/atrc/cover.avif` | Hero | 1280×580 | 2560×1160 | Live |
| 3.1a | Stage 01 — Prototype first | `/work/atrc/proto-consumer.avif` | Compare — "Consumer-toned" | 398 | 840 | The consumer-toned prototype landing screen |
| 3.1b | Stage 01 — Prototype first | `/work/atrc/proto-institutional.avif` | Compare — "Institutional-toned" | 398 | 840 | The institutional-toned prototype landing screen |
| 3.2 | Stage 02 — Wireframes | `/work/atrc/01.avif` | Standard | 820 | 1640 | Wireframe spread showing the pause flow and the reminder scheduler |
| 3.3 | Stage 03 — The final design | `/work/atrc/02.avif` | Standard | 820 | 1640 | The milestone celebration screen at 25% completion |
| 3.4a | Stage 03 — The safety nets | `/work/atrc/pause.avif` | Compare — "Pause, with a reminder" | 398 | 840 | The pause screen with reminder scheduling options |
| 3.4b | Stage 03 — The safety nets | `/work/atrc/still-there.avif` | Compare — "Inactivity recovery" | 398 | 840 | The "Still there?" inactivity recovery screen |
| 3.5 | Stage 03 — The report | `/work/atrc/03.avif` | **Wide** | 1050–1280 | 2560 | Full scroll of the Future Builder pathway report |

---

## Totals

| | Live | Missing |
|---|---|---|
| Homepage | 13 files (3 covers, 1 portrait, 9 marks) | 0 |
| CareerLogica body | 0 | 7 |
| PECUC body | 0 | 23 |
| ATRC body | 0 | 7 |
| **Total** | **13 in use** (+3 generated, 1 unused) | **37** |

## Current files on disk

| File | Resolution | AVIF | WebP |
|------|-----------|------|------|
| `/work/careerlogica/cover` | 1525×1319 | 55.2 KB | 71.3 KB |
| `/work/pecuc/cover` | 1448×1086 | 87.5 KB | 111.9 KB |
| `/work/atrc/cover` | 1525×1319 | 50.3 KB | 58.9 KB |
| `/riyaz/portrait` | 1536×1024 | 36.0 KB | 42.7 KB |
| `/riyaz/wide` | 1536×1024 | 47.8 KB | 55.4 KB |
| `/riyaz/alt-1` | 1402×1122 | 44.7 KB | 55.2 KB |
| `/riyaz/alt-2` | 1023×1537 | 41.0 KB | 47.6 KB (unused) |
| `/tools/*` ×9 | 168×168 | — | 2.2–5.1 KB |
