import { getAllCaseStudies } from "@/lib/content";
import type { WorkCardData } from "@/components/primitives/WorkCard";

import { HashScroller } from "@/components/layout/AnchorLink";
import { Hero } from "@/components/sections/Hero";
import { FirstFold } from "@/components/sections/FirstFold";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { About } from "@/components/sections/About";
import { Capabilities } from "@/components/sections/Capabilities";
import { ToolStack } from "@/components/sections/ToolStack";
import { Testimonials } from "@/components/sections/Testimonials";
import { Experience } from "@/components/sections/Experience";
import { ContactCTA } from "@/components/sections/ContactCTA";

/**
 * Testimonials still has real client quotes in it — this isn't a content
 * decision, just a "not yet" for the page. Flip back on rather than deleting
 * the section or its render call.
 */
const SHOW_TESTIMONIALS = true;

export default async function HomePage() {
  const studies = await getAllCaseStudies();

  const projects: WorkCardData[] = studies.map(({ meta }) => ({
    slug: meta.slug,
    title: meta.title,
    industry: meta.industry,
    year: meta.year,
    // The card's own image where one exists, the shared cover otherwise.
    cover: meta.thumbnail ?? meta.cover,
  }));

  return (
    <>
      <HashScroller />
      <Hero />
      {/* Ahead of the statement paragraphs on purpose: the tool row is a
          credibility strip, and it reads better as something a visitor
          passes on the way into the pitch than as a coda after it. */}
      <ToolStack />
      <FirstFold />
      <SelectedWork projects={projects} />
      <About />
      <Capabilities />
      {SHOW_TESTIMONIALS ? <Testimonials /> : null}
      <Experience />
      <ContactCTA />
    </>
  );
}
