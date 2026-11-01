import { getAllCaseStudies } from "@/lib/content";
import type { WorkCardData } from "@/components/primitives/WorkCard";

import { HashScroller } from "@/components/layout/AnchorLink";
import { Hero } from "@/components/sections/Hero";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { About } from "@/components/sections/About";
import { HowIWork } from "@/components/sections/HowIWork";
import { Testimonials } from "@/components/sections/Testimonials";
import { Experience } from "@/components/sections/Experience";
import { ContactCTA } from "@/components/sections/ContactCTA";

/**
 * Real client quotes only (components/sections/Testimonials.tsx). On with the
 * PECUC quote; the EdLogica and ATRC quotes join it as they arrive.
 */
const SHOW_TESTIMONIALS = true;

export default async function HomePage() {
  const studies = await getAllCaseStudies();

  const projects: WorkCardData[] = studies.map(({ meta }) => ({
    slug: meta.slug,
    title: meta.title,
    industry: meta.industry,
    year: meta.year,
    cover: meta.cover,
    coverPhone: meta.coverPhone,
    outcome: meta.outcome,
    color: meta.cardColor,
    theme: meta.cardTheme,
  }));

  return (
    <>
      <HashScroller />
      {/* The hero carries the intro film: it starts as a card beside the
          statement and grows into the full-width film as the visitor scrolls,
          so there is no separate film section underneath it. */}
      <Hero />
      <SelectedWork projects={projects} />
      <HowIWork />
      {SHOW_TESTIMONIALS ? <Testimonials /> : null}
      <About />
      <Experience />
      <ContactCTA />
    </>
  );
}
