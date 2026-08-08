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

export default async function HomePage() {
  const studies = await getAllCaseStudies();

  const projects: WorkCardData[] = studies.map(({ meta }) => ({
    slug: meta.slug,
    title: meta.title,
    industry: meta.industry,
    year: meta.year,
    cover: meta.cover,
  }));

  return (
    <>
      <HashScroller />
      <Hero />
      <FirstFold />
      <SelectedWork projects={projects} />
      <About />
      <Capabilities />
      <ToolStack />
      <Testimonials />
      <Experience />
      <ContactCTA />
    </>
  );
}
