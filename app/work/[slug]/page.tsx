import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";

import {
  getAllCaseStudies,
  getCaseStudy,
  getNextCaseStudy,
} from "@/lib/content";
import { site } from "@/lib/site";
import { mdxComponents } from "@/components/case-study/mdx";
import { MetaBar, MetricsBand } from "@/components/case-study/MetaBar";
import { CaseHero } from "@/components/case-study/CaseHero";
import { SectionRail } from "@/components/case-study/SectionRail";
import { NextProject } from "@/components/case-study/NextProject";
import { MicroLabel, Tag } from "@/components/primitives/MicroLabel";
import { TransitionLink } from "@/components/motion/TransitionLink";

const BODY_ID = "case-body";

export async function generateStaticParams() {
  const all = await getAllCaseStudies();
  return all.map((c) => ({ slug: c.meta.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};

  return {
    title: study.meta.title,
    description: study.meta.subtitle,
    openGraph: {
      title: `${study.meta.title} — ${site.name}`,
      description: study.meta.subtitle,
      url: `${site.url}/work/${slug}`,
      type: "article",
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  const next = await getNextCaseStudy(slug);
  const { meta } = study;

  return (
    // --case-accent is scoped here: the client's real brand color lives inside
    // the page without the site shell ever losing its own identity.
    <article style={{ "--case-accent": meta.accent } as React.CSSProperties}>
      <header className="shell pt-[calc(var(--space-32)+40px)]">
        <TransitionLink
          href="/#work"
          className="mono inline-flex items-center gap-2 text-fg-subtle transition-colors duration-200 hover:text-fg"
        >
          ← Back to work
        </TransitionLink>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <div>
            <MicroLabel>Case study · {meta.index}</MicroLabel>
            <h1 className="mt-6 text-[length:var(--text-2xl)]">{meta.title}</h1>
            <p className="mt-5 max-w-[52ch] text-[length:var(--text-lg)] leading-snug text-fg-muted">
              {meta.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 lg:justify-end">
            {meta.role.map((r) => (
              <Tag key={r}>{r}</Tag>
            ))}
          </div>
        </div>

        <CaseHero slug={meta.slug} cover={meta.cover} title={meta.title} />

        <div className="mt-14">
          <MetaBar meta={meta} />
        </div>

        <p className="mt-14 max-w-[34ch] text-[length:var(--text-2xl)] leading-[1.06] tracking-[-0.03em]">
          {meta.outcome}
        </p>

        <MetricsBand meta={meta} />
      </header>

      <div className="shell mt-[var(--section-y)] grid gap-16 lg:grid-cols-[200px_1fr]">
        <SectionRail containerId={BODY_ID} />

        <div id={BODY_ID}>
          <MDXRemote source={study.body} components={mdxComponents} />
        </div>
      </div>

      {next ? <NextProject meta={next} /> : null}
    </article>
  );
}
