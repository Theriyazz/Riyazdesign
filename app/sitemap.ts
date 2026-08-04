import type { MetadataRoute } from "next";
import { getAllCaseStudies } from "@/lib/content";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const studies = await getAllCaseStudies();
  const now = new Date();

  // The site is one page plus three case studies; About/Work/Contact are
  // anchors on the homepage, not routes, so they are not separate entries.
  const staticRoutes = [
    { url: site.url, lastModified: now, priority: 1 },
  ];

  const caseRoutes = studies.map((c) => ({
    url: `${site.url}/work/${c.meta.slug}`,
    lastModified: now,
    priority: 0.9,
  }));

  return [...staticRoutes, ...caseRoutes];
}
