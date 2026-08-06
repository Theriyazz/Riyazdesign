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
import { MetaBar } from "@/components/case-study/MetaBar";
import { CaseHero } from "@/components/case-study/CaseHero";
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
            <h1 className="mt-6 text-[length:var(--text-2xl)]">{meta.title}</h1>
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
            answers a question nobody has asked yet. */}
        <p className="mt-16 max-w-[24ch] text-[length:var(--text-2xl)] leading-[1.08] tracking-[-0.03em] text-fg">
          {meta.headline}
        </p>

        <div className="mt-16">
          <MetaBar meta={meta} />
        </div>
      </header>

      {/* Single column. The sticky section rail that used to sit at 200px on
          the left is gone — it was 12px uppercase mono in the faintest grey on
          the site, which is exactly the kind of thing these pages are being
          rebuilt to stop doing. */}
      <div className="shell mt-[var(--section-y)]">
        <div id={BODY_ID} className="mx-auto max-w-[820px]">
          <MDXRemote source={study.body} components={mdxComponents} />
        </div>
      </div>

      {next ? <NextProject meta={next} /> : null}
    </article>
  );
}
