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
import { CaseHero } from "@/components/case-study/CaseHero";
import { NextProject } from "@/components/case-study/NextProject";
import { SummaryCard } from "@/components/case-study/SummaryCard";
import { TalkBlock } from "@/components/case-study/TalkBlock";
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
    // No per-case accent override. `--case-accent` stays pointed at `--accent`
    // (see tokens.css), so the signal colour is the same on every page of the
    // site. Tinting each case study with its client's brand colour sounded
    // right and read as three unrelated sites — the accent is this portfolio's
    // voice, not the client's.
    // `data-page` is what dials the backdrop field down on these pages (see
    // `--backdrop-strength` in globals.css). A marker rather than a route
    // check, so the rule holds wherever a case study is rendered from.
    <article data-page="case-study">
      <header className="shell pt-[calc(var(--space-32)+40px)]">
        <TransitionLink
          href="/#work"
          className="mono inline-flex items-center gap-2 text-fg-muted transition-colors duration-200 hover:text-fg"
        >
          ← Back to work
        </TransitionLink>

        <div className="mt-12 grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <div>
            <MicroLabel>Case study · {meta.index}</MicroLabel>
            {/* Same fix as Section.tsx's h2: a two-word-plus title
                ("ATRC STEM Career Test") wraps below `md`, and the base
                `0.92` line-height crowds the wrapped lines. */}
            <h1 className="mt-6 text-[length:var(--text-2xl)] max-md:leading-[1.125]">{meta.title}</h1>
            <p className="mt-5 max-w-[52ch] text-[length:var(--text-lg)] leading-snug text-fg-muted">
              {meta.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 lg:justify-end">
            {meta.role.map((r) => (
              <Tag key={r}>{r}</Tag>
            ))}
          </div>
        </div>

        <CaseHero slug={meta.slug} cover={meta.cover} title={meta.title} />

        {/* The hook, verbatim from the source. It leads because it is the one
            line that makes a reader want the next one — a scope summary here
            answers a question nobody has asked yet.

            The summary card under it carries the facts (role, timeline,
            outcomes); the old facts table and Deliverables chips repeated
            them and were removed.

            `mx-auto max-w-[820px]` rather than the old `max-w-[24ch]`: a
            character cap doesn't know about the page's actual column, so at
            this font size it ran wider than the 820px the body text below it
            is locked to and sat on a different left edge. Matching the two
            numbers directly makes the headline read as the top of the same
            column, not a wider block stacked over a narrower one. */}
        <p className="mx-auto mt-16 max-w-[820px] text-[length:var(--text-xl)] leading-[1.25] tracking-[-0.02em] text-fg">
          {meta.headline}
        </p>

        {/* The 30-second version: problem, role, timeline, the key decision
            and outcomes, so a reader who stops here still has the case. */}
        <SummaryCard meta={meta} />
      </header>

      {/* Single column. The sticky section rail that used to sit at 200px on
          the left is gone — it was 12px uppercase mono in the faintest grey on
          the site, which is exactly the kind of thing these pages are being
          rebuilt to stop doing. */}
      <div className="shell mt-14">
        <div id={BODY_ID} className="mx-auto max-w-[820px]">
          <MDXRemote
            source={study.body}
            components={mdxComponents}
          />
        </div>
      </div>

      <TalkBlock />

      {next ? <NextProject meta={next} /> : null}
    </article>
  );
}
