# Riyaz Malek: portfolio intro film

**Format:** 1920 x 1080, 60 fps, 23.6 s (1416 frames), silent-first (it autoplays muted on the site), seamless loop.
**Where it lives:** directly under the hero on riyazdesigns.netlify.app, so it plays the moment someone scrolls.
**Composition:** `intro-video/src/hello/` → Remotion id `Hello-16x9`.

---

## 1. Planning rubric

| Question | Answer |
|---|---|
| Who is this about? | Riyaz Malek, self-taught UX designer in Vadodara, 3+ years, graphic designer at CareerNaksha in 2023, UX within six months, freelance since 2025. |
| Who watches it? | Hiring managers and founders who just read the hero and scrolled once. They give it ten seconds. |
| What must they remember? | His name, that he designs whole products end to end, and three pieces of real work. |
| What is the proof? | CareerLogica (140+ screens, 5 roles, EN/AR with RTL), PECUC (nav 37 → 7, clicks 4 → 2), ATRC (25 questions, 4 formats, a 3-pathway report). 20+ non-profit websites at Thatha. |
| What is the voice? | His own lines: "Think, Design, Ship", "I care less about how a screen looks than why it works", "I ask a lot of questions before I open Figma." |
| What is the brand? | `styles/tokens.css`: ink #08080a, paper #f4f3f0, one lime signal #aaff00. Geist for everything, Geist Mono for micro labels, Instrument Serif italic for one word per line at most. |
| The brand's hardest rule | Lime is a signal, never a fill. It marks the cursor dot, availability, and "the thing you're pointing at". |
| What's the hook? | The site's own cursor dot. It appears alone on black, clicks, and lands as the dot on the i in "Riyaz". |
| What's the payoff? | The same dot becomes the full stop in "Riyazdesigns." and shrinks back to nothing, so the film loops into its own first frame. |

**Design read:** a solo designer's portfolio film for hiring managers, in the site's dark editorial language, built on kinetic type and real screens in drawn device frames.
**Dials:** variance 7, motion 7, density 3.

### Where I followed your brand over the generic rules
The taste skill flags "near-black + one acid-green accent" and Instrument Serif as AI defaults. Here they're **your existing, documented brand**, so the brand wins. What I kept from the skill: zero em dashes on screen, one accent colour only, one corner-radius family (pills for chips, 22 px for devices), every number pulled straight from your case studies, no fake UI. Every screen is a real export.

### Signature
**The lime dot is the protagonist.** It's accent #1 on your site (the cursor), so in the film it moves the way a cursor moves. It clicks, it becomes the dot on the i, it grows into the portrait, it drives the before/after wipe, and it ends as the full stop. That's one idea doing all the work, and lime never shows up anywhere it hasn't earned.

### The one risk
At 3 s the dot swells until it fills the frame with lime, then pulls back into a circle holding your lime-lit portrait (*Riyaz Image 2*, which is shot in almost exactly #aaff00). That's the only time lime is a fill, and it's what carries the cut from your name to your face.

---

## 2. Storyboard

Times are in seconds, frames at 60 fps in brackets. Each scene overlaps the next by 14 frames for the hand-off.

| # | Time | Scene | On screen | Motion | Assets |
|---|---|---|---|---|---|
| 1 | 0.0 – 2.8 (0–168) | **Name** | *Hi, I'm* (serif italic) / **Riyaz** / Malek (ink-600) / `UX DESIGNER · VADODARA, INDIA` | Black frame. The dot fades in, overshoots, and pulses with a click ring. It arcs up and lands on a dotless ı with a squash. Letters rise through a mask, 3 frames apart. "Malek" slides in a step behind. | type only |
| 2 | 2.8 – 6.2 (168–372) | **Face + thesis** | Portrait in a circle inside a turning ring: `RESEARCH · STRATEGY · UI DESIGN · PROTOTYPING · DESIGN SYSTEMS ·`. On the right: "I care less about how a screen looks than why it *works*." | The dot swells into a full lime frame, then the circle closes in on the portrait. The ring turns slowly. Lines rise one by one, and a lime rule draws under *works*. | `hello/portrait.webp` |
| 3 | 6.0 – 8.7 (358–520) | **Numbers** | **3+** years designing for humans · **20+** websites for US non-profits · **140+** screens in one bilingual platform | Odometer digits (a nod to your preloader). Three columns roll up 0.3 s apart over a dot field that ripples out from the dot. | type only |
| 4 | 8.4 – 11.8 (506–710) | **001 CareerLogica** | Title, "Psychometric-first career guidance", chips `140+ screens` `5 roles` `EN / AR, RTL` | A laptop slides in from the right. Inside it, the screen scrolls through student → counsellor → school → admin dashboards. A phone with the mobile dashboard tilts in over its corner. | `cl-*.webp` |
| 5 | 11.6 – 15.0 (696–900) | **002 PECUC** | "35 years of impact. A website that hid it." Odometer **37 → 7** navigation destinations, **4 → 2** clicks to content | Laptop on the left, mirrored. The 2001 site is on screen, then the dot drags a lime vertical rule across and reveals the 2026 redesign. The numbers count down. | `pecuc-old/new.webp` |
| 6 | 14.8 – 18.1 (886–1084) | **003 ATRC** | "A STEM test students actually *finish*." chips `25 questions` `4 formats` `3 pathways` | A horizontal strip pans left through the real flow: landing → question → "Still there?" → Future Builder result. A phone rides along in front. | `atrc-*.webp` |
| 7 | 17.8 – 20.3 (1070–1220) | **How he works** | "I ask a lot of questions before I open *Figma*." Tool marks for Figma, FigJam/Miro, Claude, ChatGPT, Framer, Relume, GitHub, Antigravity, Mobbin | The line types in word by word, and tool marks spring into a row underneath. | `public/tools/*.webp` |
| 8 | 20.1 – 23.6 (1206–1416) | **Sign-off** | Avatar + **Riyazdesigns.** (lime full stop) / `UX Designer · open to full-time UX roles` + pulsing availability dot / chips: site, email, LinkedIn | The wordmark rises and a rule draws under it. The chips stagger in. Hold for 1.6 s. Everything else fades, the full stop drifts to the centre and shrinks to nothing, which is frame 0. | `portrait.webp` |

**Transitions:** scenes leave with a short directional push and motion blur (scaleX smear plus a CSS blur, applied only during travel), as in reference 3. Scene 1→2 uses the dot swell. Scene 8 loops back to scene 1.

**Readability check:** each label holds at least 0.8 s after it settles. The longest line (scene 2, 13 words) holds about 2.2 s.

**Audio:** none in the master. On the site it plays muted, and a soundtrack can be laid in later without touching the edit.

### What I left out on purpose
- The bridal-fashion screens in `public/screens/18–20`: they aren't in your portfolio, and the portfolio is the source of truth.
- Testimonials: they're too long to read in a 24-second film, and cutting them down would put words in your clients' mouths.
- Any number your case studies don't state.
