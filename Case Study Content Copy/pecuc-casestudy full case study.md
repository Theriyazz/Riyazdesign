# PECUC — Case Study

**UX Case Study · PECUC · Non-Profit · Odisha, India · 2026**

## 35 Years of Real Impact. A Website That Made It Invisible.
## I Redesigned It to Show What They'd Actually Done.

PECUC has protected children's rights in Odisha since 1990 — with UNICEF and the European Union among its partners, and three decades of photographs to prove the work. Their website was built in 2001 and treated all of it as furniture. I redesigned the full 15-page site around the one thing they had that no design trend can fake: evidence.

### My Role, Delivery, Tools

| My Role | What I Delivered | Tools Used |
|---|---|---|
| UX Designer | Figma Designs, Component Library, Mobile Responsive UI | Figma, FigJam, Perplexity |

| Platform | Industry | Timeline |
|---|---|---|
| Web — Desktop + Mobile, Responsive | Non Profit Organisation | 2 Months |

### Deliverables

Homepage · About Us · Programs · Donation Flow · Volunteer Flow · Careers · Blog · News · Impact Reports · Gallery · Contact · Resources Hub · 404 · Privacy & Terms · Visual Design Guide · Component Library

### About the organisation

PECUC — People's Cultural Centre — is a non-profit development organisation based in Odisha, India, working since 1990 for the rights of children, women, older people, indigenous communities and the rural and urban poor. It began with a children's festival attended by 5,000 children, and has since run more than 178 projects across 30 districts of Odisha and 4 districts of Delhi.

It holds UN ECOSOC Special Consultative Status, is FCRA compliant and ISO certified, and counts UNICEF and the European Union among its partners. The Government of Odisha has adopted some of its community models into state policy.

Thirty-five years of that work — and a website built in 2001 that showed almost none of it.

### Note before you continue

I didn't document this project while I built it, so this isn't a reconstructed process diary. It's an account of what I found and what I decided. Everything I describe about the old site is verifiable at pecuc.org today.

---

## The Problem

An organisation with UNICEF's logo, 178 projects and thirty-five years of photographs was presenting itself online in a way that made a first-time visitor doubt all of it.

The old site opened with a banner slider running eleven messages on 2000s-era cube transitions. Content sat in bordered boxes packed edge to edge. Seventeen links appeared above the fold before a single sentence explaining what PECUC does. Photographs of the children whose lives this organisation changed were shrunk to thumbnails beside links labelled `homedetails.aspx?id=H1`.

No hierarchy, no breathing room, no type system. Every element shouting at the same volume, which reads as silence.

**And the two links that matter most were broken.** Donation pointed to an empty anchor — clicking it did nothing. Volunteering downloaded a PDF to print and fill by hand.

For a non-profit, those two links *are* the product. An organisation this credible, presenting itself this badly, doesn't just look dated — it loses donations it will never know it lost.

---

## Stage 01 — The Audit

I didn't run user research on this project. I didn't need to. I needed to open the site and count.

**37 navigation destinations.** Nine main items, eight utility links above them (Tenders, Site Map, FCRA Compliance, Internship, Get Involve, Donation, Career, Visitor Feedback, HR), and twenty more inside the dropdowns — "Who we are" held 5, "Theme" held 9. Everything equally important, so nothing was.

**Nine disconnected properties.** A separate Blogspot blog. An online resource centre. A photo gallery and a video gallery on different templates. Press and publications. Annual reports. Board documents served as raw Word files. Each a different visual language, each a dead end.

**A site that had stopped keeping time.** The footer read "All rights Reserved 2001-2023." The news section had entries from March 2025. The homepage said thirty-six years of service. Three accounts of what year it was, on one page.

> **The content was never the problem.** PECUC's writing is better than most NGO copy I've read — Gauri, who joined a self-help group and changed her family's circumstances; Mamata, who returned to school after losing her mother to COVID-19; a clean water project for 132 households in Baidabaja. Specific, human, unsentimental. It was buried behind links labelled `id=H1`.
>
> None of this was neglect. PECUC were still publishing to this site in 2025. It was a site structurally unable to hold what the organisation had become.

---

## Stage 02 — Restructuring

Before any visual work, I rebuilt the map. A visitor arrives doing one of four things: understanding the work, verifying the organisation, giving money, or offering time. The old navigation served none of those — it served the org chart.

Thirty-seven destinations became seven, and the nine scattered properties were consolidated into a single filterable Resources hub with one visual language and a path from any piece of content to any other.

**Navigation: 37 → 7. Clicks to content: 4 → 2.**

---

## Stage 03 — Building the Visual Language

With the structure settled, the design's job became a single argument: *this organisation is real, and the work is real.*

**Photography first.** PECUC's team gave me access to their programme archive — children in classrooms, women from the self-help groups, community gatherings. Around 90% of the site's imagery is theirs, from the field. Faces lead every section: the hero is a child's photograph before any text; the stories section is portraits; even the donation page opens with the people the money reaches.

> **UX Principle — Picture Superiority Effect**
> People remember and trust images far more reliably than text alone. Leading every section with a real photograph instead of a paragraph isn't a style preference here — it's the fastest way to make "this is real" land before a single word is read.

**Colour from their own history.** Blue from their logo as primary, carrying the structural weight. Yellow added as accent, used sparingly.

**Type that makes long headings land.** Anton for display, Inter for everything else.

**A system that survives non-designers.** One reusable card pattern carrying every content type — programme, news item, story, report, gallery album — plus PECUC's first documented design guide covering colour, typography and spacing.

*Reasoning for each of these is in the decision log below.*

---

## Stage 04 — Designing the Two Broken Journeys

There was no funnel to improve here. Donation and volunteering both had to be designed from a blank page.

**Donation** became a tiered calculator — frequency first, then named tiers tied to real programmes: Sradha Supporter, Grandparent Guardian, AADI Champion, Community Builder, Transformation Partner. Trust signals (FCRA, ISO, financial transparency) sit at the moment of commitment.

> **UX Principle — Hick's Law**
> The more choices someone faces — or the less bounded a choice is — the longer it takes to decide, and the more likely they abandon it. An open amount field is technically one field but an infinite decision. Five named tiers turn that into a fast pick.

**Volunteering** became a staged signup — who you are, what you're drawn to, availability — replacing a printable PDF.

---

## Stage 05 — Iteration

My first layout didn't survive client review, and it's still in the file because it earned its place in this story.

The client liked the type. Liked the colour. Didn't like the layout. So the visual language I'd built was right and the arrangement wasn't — a far better failure than the reverse, because a system that survives its first layout being thrown out is a system, not a lucky composition.

I redesigned the structure, kept the identity, and version two was approved. A round of small fixes followed, and the file went to development.

**Show both versions side by side here.** Almost nobody puts a rejected version in a portfolio. It's the fastest way to prove the process was real.

---

## The Decision Log

*Every significant call, what drove it, and what it cost.*

**01 · Make their photo archive the design, not the decoration**
Their own field photography leads every section at full bleed; roughly 10% is AI-generated where the archive couldn't supply an image, and none of it stands in for programme evidence.
*Why:* A SaaS product earns trust through polish. An NGO earns it through proof. Stock photography signals an organisation describing work rather than showing it. PECUC had 35 years of receipts.
*Trade-off:* The design is dependent on image quality. A weak photo now breaks a whole section, where the old boxed layout hid everything equally.

**02 · Keep their blue, add yellow**
Logo blue as primary, carrying hero, section breaks and footer. Yellow as a sparing accent for highlights and emphasis.
*Why:* After 35 years, that blue *is* the organisation — replacing it would have thrown away recognition I didn't create. Yellow signals youth and warmth for an organisation working with children, and prosperity, which is the outcome every programme reaches for. Institutional trust plus hope, in the first screen.
*Trade-off:* Inherited blue constrained the palette. A free choice might have given a fresher result — it would also have made the site look like someone else's.

**03 · Anton for headings, Inter for everything else**
Condensed heavy display type; neutral body type.
*Why:* NGO headings run long — "Reviving Nutritional Wealth: Millet's Resurgence in Keonjhar District" is real. Condensation holds a sentence like that together as one visual unit instead of letting it wrap into mush, and the weight makes it land as a statement rather than a label. Inter does the opposite job: readable at small sizes, scales across breakpoints, never competes with the photography.
*Trade-off:* Anton has one weight and no italic. Every display-level nuance has to come from size and colour.

**04 · Cut 37 navigation destinations to 7**
Top level rebuilt around visitor intent, not organisational structure.
*Why:* Preserving everything preserves nothing. A visitor has one question, not thirty-seven.
*Trade-off:* Compliance content — FCRA, tenders, ISO, board documents — left the top level for About. A serious donor still finds it in one click, but it no longer greets every first-time visitor. That was a real cost I accepted deliberately.

**05 · Consolidate nine properties into one Resources hub**
Blog, news, impact reports, press, two galleries and the resource centre merged into a single filterable section.
*Why:* The old site's real failure wasn't that content was hard to find — it was that finding one thing led nowhere. One system means a path from any piece of content to any other.
*Trade-off:* PECUC lose the ability to run each property independently. Everything now depends on one publishing model being maintained.

**06 · Tier the donation, and name the tiers after programmes**
Frequency selection, then named tiers rather than an open amount field.
*Why:* A single button asking for an open-ended amount is the hardest possible ask — the visitor has to invent an appropriate number alone, and most resolve that uncertainty by leaving. Naming tiers after programmes changes what's being decided: not a figure, but which part of the work to belong to.
*Trade-off:* Fixed tiers can anchor a large donor lower than they'd have given. Needs a custom-amount option alongside.

**07 · Replace the volunteer PDF with a staged signup**
Who you are, then interests, then availability.
*Why:* Every step between intent and action loses people, and the old flow had six — download, print, fill by hand, find an address, email, wait. Staging looks like it adds steps but removes them, because the visitor never faces a wall of fields.
*Trade-off:* Multi-step forms can raise abandonment if the stages feel arbitrary. Ordering them by what a volunteer can answer immediately is what makes it work.

**08 · Build one card component, not many templates**
A single reusable card pattern carrying every content type on the site.
*Why:* PECUC publish constantly, and they publish without a designer. Any system I handed over had to survive years of unsupervised content entry. A reusable card means new content inherits the design instead of degrading it — precisely how the old site got into the state I found it in.
*Trade-off:* Uniformity. Every content type now looks structurally similar, which costs some editorial variety in exchange for durability.

---

## Before & After

*Old-site capture on the left, new design on the right. Reasoning for each is in the decision log above.*

**01 · The hero** — eleven banners on cube transitions → one child's photograph, one heading, one paragraph. *A slider is what you build when you can't decide what matters most.*

**02 · Nine themes** — hidden inside a "Theme" dropdown → *Where We Walk Together*, a full section visible without interaction. *Anything that constitutes proof belongs on the page, not in a menu.*

**03 · Credibility** — partner links in a side table, one pointing to a Word document → a UNICEF/EU logo strip under the hero plus *Why Community Trust Us?* consolidating ECOSOC status, government policy adoption, 225 Gram Panchayats, 1,553 villages.

**04 · The stories** — truncated grey text ending in `id=H2` → *Stories That Will Move You*, full portraits of the people in the stories. **This pair is the thesis of the entire case study: identical content, one design burying it, one design making it the argument.**

**05 · Donation** — a dead `#` anchor → tiered giving with programme-named tiers.

**06 · Volunteering** — `pecucvolunteerform.pdf` → staged signup.

**07 · The footer** — "All rights Reserved 2001-2023" → a stat strip carrying PECUC's own reported figures. *The last thing a visitor sees should reinforce the first thing they read.*

---

## Outcome

**Scope:** 15 pages — homepage through 404, privacy and terms

**Identity:** Visual design guide — Anton/Inter type system, blue-yellow palette from their logo, photography-first layout rules

**Structure:** Navigation 37 → 7 · clicks to content 4 → 2 · nine sub-sites → one filterable hub

**Journeys:** Tiered donation calculator and staged volunteer signup, designed from scratch

**System:** Card-based component library that survives non-designers adding content

**Status:** Approved, handed off, in development

### From the client

> "Riyaz has a remarkable ability to balance aesthetic appeal with seamless user functionality… Thanks to Riyaz's expertise, we now have a powerful, visually compelling web presence that resonates with our community."
> **Ranjan Kumar Mohanty** — Secretary-cum-CEO, PECUC

### What I'd do differently

**Document as I go.** I reconstructed this reasoning afterwards. The reasoning held; the record didn't.

**Test the tiers with a real donor.** I set the amounts and programme mappings without talking to anyone who'd given to PECUC before.

**Design for the content editor.** The card system works when filled correctly. I didn't fully solve for a staff member pasting a headline twice as long as the template expects — which is exactly how the old site decayed.

### What it taught me

**Visual design is an argument, not a coat of paint.** Every choice here exists to make one claim: this organisation is real, and the work is real. Once I knew that was the argument, every decision got easier.

**The best material is usually already there.** I didn't create PECUC's credibility — 35 years of photographs and UNICEF's logo did. My job was to stop the design from hiding it.

---

## Screen list — 24 visuals

| Where | Count | What |
|---|---|---|
| Hero | 1 | New homepage hero |
| The Problem | 1 | Full old-site screenshot |
| Stage 01 — Audit | 1 | Old nav expanded, annotated — all 37 destinations |
| Stage 02 — Restructure | 2 | 37-vs-7 sitemap comparison · Resources hub with filters |
| Stage 03 — Visual language | 3 | Palette sheet · Anton/Inter type sheet with one real long heading in both systems · photography treatment detail |
| Stage 04 — Journeys | 1 | Donation page full scroll |
| Stage 05 — Iteration | 2 | First layout vs approved layout, side by side |
| Before & After | 12 | Six pairs (skip pair 03, which the credibility strip already shows elsewhere) |
| Outcome | 1 | Homepage full scroll |
| **Total** | **24** | |

### Capturing the "before" images — time-sensitive, do this first

> ⚠ Take these from pecuc.org **before the redesign ships.** The moment it does, this evidence is gone for good — there's no re-shooting it later.

1. Homepage hero with the banner slider mid-transition
2. The "Theme" dropdown expanded, all nine items
3. The side table with the partner links and the Word-document link
4. Story blocks showing truncated text and `homedetails.aspx?id=` links
5. The Donation link — plus the inspector showing `href="#"`
6. The Get Involve link and the PDF it downloads
7. The footer reading "All rights Reserved 2001-2023"

All seven at the same browser width so they align cleanly against your 1440px designs.

### Rules

- **The 37-vs-7 sitemap comparison is your signature asset.** One image, the whole story, two seconds. Give it the most space on the page.
- **Pair 04 is the emotional centre.** One story, shown as the old site treated it and as you treated it.
- **Don't show all 15 pages.** Careers, Contact, 404, Privacy and Terms prove diligence but carry no argument. Link the prototype instead.

---

## Fix list

1. The client testimonial contains a "pPECUC" typo in the source text — correct before publishing anywhere.
