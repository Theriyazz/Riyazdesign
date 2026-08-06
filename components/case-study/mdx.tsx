import Image from "next/image";
import type { MDXComponents } from "mdx/types";
import { imageMeta, imageProps } from "@/lib/images";
import { Tag } from "@/components/primitives/MicroLabel";

/*
 * Case study building blocks.
 *
 * The rule this file is built on: a component exists because a piece of the
 * source content genuinely has that shape, not because a long page needs
 * variety. Three parallel audience problems are three cards because they are
 * three parallel things; a sequence of named onboarding steps is a sequence.
 * Anything that is actually prose stays prose.
 *
 * Two constraints run through every component here, and both come from the
 * one job these pages have — being read end to end by a recruiter:
 *
 *  - **Nothing a reader reads is below 16px.** Labels, captions and cites use
 *    `.label` (Geist 16px); mono is now only chips and the back button.
 *  - **Nothing a reader reads uses `--fg-subtle`.** At 4.68:1 it is the AA
 *    floor, which is the wrong target for a page of continuous reading.
 *    `--fg-muted` is 8.4:1 and is the quietest tone used here.
 */

/** Shared measure. Long enough to avoid ragged lines, short enough to scan. */
const MEASURE = "max-w-[68ch]";

/**
 * The block that makes a case study read as senior work.
 *
 * Recruiters read tradeoffs as evidence of judgement. A portfolio that only
 * shows what was chosen reads as a student's, so the tradeoff is a required
 * prop — you cannot render this component without admitting a cost.
 */
export function Decision({
  decision,
  why,
  tradeoff,
}: {
  decision: string;
  why: string;
  tradeoff: string;
}) {
  return (
    <div
      className="my-14 border-l-2 pl-7"
      style={{ borderColor: "var(--case-accent)" }}
    >
      <p className="text-[length:var(--text-lg)] leading-snug text-fg">{decision}</p>

      <dl className="mt-7 grid gap-7 sm:grid-cols-2">
        <div>
          <dt className="label">Why</dt>
          <dd className="mt-2 text-[length:var(--text-sm)] leading-[1.75] text-fg-muted">
            {why}
          </dd>
        </div>
        <div>
          <dt className="label">Tradeoff</dt>
          <dd className="mt-2 text-[length:var(--text-sm)] leading-[1.75] text-fg-muted">
            {tradeoff}
          </dd>
        </div>
      </dl>
    </div>
  );
}

/**
 * An image if the asset has been optimized, or a labelled placeholder if not.
 *
 * Shared by `ImageBlock` and `Compare` so both fail the same safe way: never a
 * broken `<img>`, and never a `fill` image with no sized parent (which
 * collapses to zero height). Say exactly which file is missing and how to add
 * it, so a stand-in path is a to-do list entry, not a silent gap.
 */
function CaseImage({
  src,
  alt,
  sizes,
  aspect = "aspect-[16/10]",
}: {
  src: string;
  alt: string;
  sizes: string;
  aspect?: string;
}) {
  const meta = imageMeta(src);

  if (!meta) {
    return (
      <div
        className={`flex ${aspect} flex-col items-center justify-center gap-2 border border-dashed border-[var(--border-strong)] p-8 text-center`}
      >
        <span className="label">Image not yet added</span>
        <code className="text-[length:var(--text-label)] text-fg-muted" style={{ fontFamily: "var(--font-mono)" }}>
          {src}
        </code>
      </div>
    );
  }

  return <Image {...imageProps(src)} alt={alt} sizes={sizes} className="h-auto w-full" />;
}

/**
 * A body image. Always the width of the reading column.
 *
 * There used to be a `wide` variant that broke out of the column by 8vw a
 * side. It was removed rather than repaired: the breakout landed on no edge
 * the page has — at 1280px it sat 56px inside the gutter and 103px outside the
 * text — so it read as an image that had escaped rather than one placed
 * deliberately, at every viewport width. One shared edge for every figure and
 * every paragraph is the whole point of a single-column reading layout.
 *
 * The full-page scroll captures are the images this affects, and they lose
 * nothing: they are tall, not wide, and 820px is the same 820px they had.
 */
export function ImageBlock({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure className="my-16">
      <div className="overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised">
        <CaseImage src={src} alt={alt} sizes="(max-width: 900px) 100vw, 820px" />
      </div>
      {caption ? (
        <figcaption className={`label mt-4 ${MEASURE}`}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/**
 * A labelled image pair.
 *
 * Not always literally "before/after" — the labels are props so the same
 * layout can carry two parallel variants (two prototype directions, two
 * languages) without them lying. `caption` holds the one line of reasoning
 * that belongs *to the pair*; without it those lines end up as loose italic
 * paragraphs floating under the images.
 */
export function Compare({
  before,
  after,
  beforeAlt,
  afterAlt,
  beforeLabel = "Before",
  afterLabel = "After",
  caption,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}) {
  return (
    <figure className="my-16">
      <div className="grid gap-6 sm:grid-cols-2">
        {[
          { src: before, alt: beforeAlt, label: beforeLabel },
          { src: after, alt: afterAlt, label: afterLabel },
        ].map((s) => (
          <div key={s.label}>
            <span className="label mb-3 block">{s.label}</span>
            <div className="overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised">
              <CaseImage src={s.src} alt={s.alt} sizes="(max-width: 640px) 100vw, 420px" />
            </div>
          </div>
        ))}
      </div>
      {caption ? (
        <figcaption className={`label mt-4 ${MEASURE}`}>{caption}</figcaption>
      ) : null}
    </figure>
  );
}

/** The chip row of what actually shipped — scope, stated plainly. */
export function Deliverables({ items }: { items: string }) {
  const parts = items
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="my-10 flex flex-wrap gap-2">
      {parts.map((item) => (
        <Tag key={item}>{item}</Tag>
      ))}
    </div>
  );
}

/**
 * A named UX principle backing a decision, rather than an assertion of taste.
 * Accent runs along the top instead of down the side so it cannot be mistaken
 * for a `Decision` when the two appear near each other.
 */
export function Principle({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={`my-14 border-t-2 pt-6 ${MEASURE}`}
      style={{ borderColor: "var(--case-accent)" }}
    >
      <span className="label" style={{ color: "var(--case-accent)" }}>
        UX principle — {name}
      </span>
      {/* A div, not a p: MDX has already wrapped this content in its own
          paragraph, and a nested <p> is invalid HTML that React discards the
          whole subtree over on hydration. */}
      <div className="mt-3 [&_p]:mt-0 [&_p]:text-[length:var(--text-sm)] [&_p]:leading-[1.75] [&_p]:text-fg-muted">
        {children}
      </div>
    </aside>
  );
}

/** A quotation set apart from the case study's own voice. */
export function Quote({
  children,
  cite,
}: {
  children: React.ReactNode;
  cite: string;
}) {
  return (
    <figure
      className="my-16 border-l-2 pl-7"
      style={{ borderColor: "var(--case-accent)" }}
    >
      <blockquote className="text-[length:var(--text-lg)] leading-snug text-fg [&_p]:mt-0">
        {children}
      </blockquote>
      <figcaption className="label mt-5">{cite}</figcaption>
    </figure>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-12 rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised p-7">
      <div className="[&_p]:mt-0 [&_p]:max-w-none [&_p]:text-[length:var(--text-sm)] [&_p]:leading-[1.75] [&_p]:text-fg-muted">
        {children}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ sets ---
   Everything below exists because a specific stretch of source content is a
   set of parallel things, and rendering parallel things as one paragraph is
   what made these pages hard to read. */

/**
 * Two-to-four parallel items, each a short title and a few lines.
 *
 * The workhorse: audience problems, signup flows, competitor findings,
 * question types. `cols` is capped at 3 — four across drops each card under
 * ~20 characters a line on a laptop.
 */
export function CardGrid({
  children,
  cols = 3,
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
}) {
  return (
    <div
      className={`my-12 grid gap-px border border-[var(--border)] bg-[var(--border)] ${
        cols === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {children}
    </div>
  );
}

export function Card({
  title,
  children,
  eyebrow,
}: {
  title: string;
  children: React.ReactNode;
  eyebrow?: string;
}) {
  return (
    <div className="bg-bg p-7">
      {eyebrow ? (
        <span className="label mb-3 block" style={{ color: "var(--case-accent)" }}>
          {eyebrow}
        </span>
      ) : null}
      <h3 className="text-[length:var(--text-base)] font-medium leading-snug text-fg">
        {title}
      </h3>
      <div className="mt-3 [&_p]:mt-0 [&_p]:max-w-none [&_p]:text-[length:var(--text-sm)] [&_p]:leading-[1.75] [&_p]:text-fg-muted">
        {children}
      </div>
    </div>
  );
}

/**
 * A numbered run of findings or arguments.
 *
 * Distinct from `CardGrid` because these are *ordered* — they are numbered in
 * the source and the numbering carries meaning (first finding, second, third).
 * A grid would throw that away.
 */
export function Findings({ children }: { children: React.ReactNode }) {
  return <ol className="my-12 flex list-none flex-col gap-px bg-[var(--border)] p-0">{children}</ol>;
}

export function Finding({
  n,
  title,
  children,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="grid gap-x-7 gap-y-3 bg-bg p-7 sm:grid-cols-[auto_1fr]">
      <span
        className="text-[length:var(--text-lg)] font-medium leading-none tabular-nums"
        style={{ color: "var(--case-accent)" }}
      >
        {n}
      </span>
      <div>
        <h3 className="text-[length:var(--text-base)] font-medium leading-snug text-fg">
          {title}
        </h3>
        <div className="mt-2 [&_p]:mt-0 [&_p]:max-w-none [&_p]:text-[length:var(--text-sm)] [&_p]:leading-[1.75] [&_p]:text-fg-muted">
          {children}
        </div>
      </div>
    </li>
  );
}

/**
 * A named sequence — onboarding stages, form steps.
 *
 * Numbered *and* named, because the whole argument in the source is that
 * naming the steps is what changed how they felt. Rendering them as a plain
 * ordered list would lose the names' prominence, which is the point.
 */
export function Steps({ children }: { children: React.ReactNode }) {
  return (
    <ol className="my-12 grid list-none gap-px bg-[var(--border)] p-0 sm:grid-cols-2 lg:grid-cols-4">
      {children}
    </ol>
  );
}

export function Step({
  n,
  name,
  children,
}: {
  n: string;
  name: string;
  children: React.ReactNode;
}) {
  return (
    <li className="bg-bg p-7">
      <span className="label tabular-nums" style={{ color: "var(--case-accent)" }}>
        {n}
      </span>
      <h3 className="mt-2 text-[length:var(--text-base)] font-medium text-fg">{name}</h3>
      <div className="mt-2 [&_p]:mt-0 [&_p]:max-w-none [&_p]:text-[length:var(--text-sm)] [&_p]:leading-[1.75] [&_p]:text-fg-muted">
        {children}
      </div>
    </li>
  );
}

/** Before → after figures, where the change *is* the result. */
export function StatRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-14 grid gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-3">
      {children}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-bg p-7">
      <span
        className="block font-medium leading-none tracking-[-0.03em]"
        style={{ fontSize: "var(--text-xl)", color: "var(--case-accent)" }}
      >
        {value}
      </span>
      <span className="label mt-3 block">{label}</span>
    </div>
  );
}

/**
 * Label-and-paragraph pairs for the closing "what shipped" sections.
 *
 * A definition list rather than prose: the source writes these as bolded
 * labels with a line each, and that is exactly what a `<dl>` is for.
 */
export function SpecList({ children }: { children: React.ReactNode }) {
  return (
    <dl className="my-12 grid gap-px bg-[var(--border)] sm:grid-cols-2">{children}</dl>
  );
}

export function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg p-7">
      <dt className="label" style={{ color: "var(--case-accent)" }}>
        {label}
      </dt>
      <dd className="mt-2 [&_p]:mt-0 [&_p]:max-w-none [&_p]:text-[length:var(--text-sm)] [&_p]:leading-[1.75] [&_p]:text-fg-muted">
        {children}
      </dd>
    </div>
  );
}

/** Numbered reflections — what I'd do differently, what it taught me. */
export function Takeaways({ children }: { children: React.ReactNode }) {
  return <ol className="my-12 flex list-none flex-col gap-8 p-0">{children}</ol>;
}

export function Takeaway({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className={`border-t border-[var(--border)] pt-6 ${MEASURE}`}>
      <h3 className="text-[length:var(--text-base)] font-medium leading-snug text-fg">
        {title}
      </h3>
      <div className="mt-2 [&_p]:mt-0 [&_p]:max-w-none [&_p]:text-[length:var(--text-sm)] [&_p]:leading-[1.75] [&_p]:text-fg-muted">
        {children}
      </div>
    </li>
  );
}

/**
 * The three-pathway report result. Each pathway is an identity plus four
 * lists, which is too much for a `Card` and too structured for prose.
 */
export function Pathways({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-14 grid gap-px border border-[var(--border)] bg-[var(--border)] lg:grid-cols-3">
      {children}
    </div>
  );
}

export function Pathway({
  name,
  role,
  children,
}: {
  name: string;
  role: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-bg p-7">
      <h3 className="text-[length:var(--text-lg)] leading-tight text-fg">{name}</h3>
      <span className="label mt-1 block" style={{ color: "var(--case-accent)" }}>
        {role}
      </span>
      <div className="mt-4 [&_p]:mt-0 [&_p]:max-w-none [&_p]:text-[length:var(--text-sm)] [&_p]:leading-[1.75] [&_p]:text-fg-muted">
        {children}
      </div>
    </div>
  );
}

/** Typographic defaults for raw markdown inside a case study body. */
export const mdxComponents: MDXComponents = {
  Decision,
  ImageBlock,
  Compare,
  Callout,
  Deliverables,
  Principle,
  Quote,
  CardGrid,
  Card,
  Findings,
  Finding,
  Steps,
  Step,
  StatRow,
  Stat,
  SpecList,
  Spec,
  Takeaways,
  Takeaway,
  Pathways,
  Pathway,

  h2: (props) => (
    <h2
      className="mt-24 scroll-mt-28 text-[length:var(--text-xl)] leading-tight first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mt-14 text-[length:var(--text-lg)] leading-tight" {...props} />
  ),
  /* 1.75 rather than `leading-relaxed` (1.625). At 20px that is a 35px line,
     and it is the single biggest reason the old pages read as congested. */
  p: (props) => (
    <p
      className={`mt-6 ${MEASURE} text-[length:var(--text-base)] leading-[1.75] text-fg-muted`}
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className={`mt-6 ${MEASURE} list-disc space-y-3 pl-5 text-[length:var(--text-base)] leading-[1.75] text-fg-muted marker:text-[var(--case-accent)]`}
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className={`mt-6 ${MEASURE} list-decimal space-y-3 pl-5 text-[length:var(--text-base)] leading-[1.75] text-fg-muted marker:text-fg-muted`}
      {...props}
    />
  ),
  li: (props) => <li className="pl-1.5" {...props} />,
  strong: (props) => <strong className="font-medium text-fg" {...props} />,
  em: (props) => <em className="italic text-fg" {...props} />,
  /* Inline code appears in the prose as evidence — the literal URLs the old
     PECUC site exposed. The UA default shrinks `<code>` to ~13px, which drops
     the one thing being quoted below the floor everything around it clears. */
  code: (props) => (
    <code
      className="rounded bg-bg-raised px-1.5 py-0.5 text-[length:var(--text-sm)] text-fg"
      style={{ fontFamily: "var(--font-mono)" }}
      {...props}
    />
  ),
  a: (props) => (
    <a
      className="text-fg underline decoration-[var(--case-accent)] underline-offset-4"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-14 border-l-2 border-[var(--border-strong)] pl-7 text-[length:var(--text-lg)] leading-snug text-fg"
      {...props}
    />
  ),
  /* Tables scroll rather than shrink. Squeezing a three-column table into
     375px is how a data table ends up below the 16px floor. */
  table: (props) => (
    <div className="my-12 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left" {...props} />
    </div>
  ),
  thead: (props) => <thead className="border-b border-[var(--border-strong)]" {...props} />,
  th: (props) => <th className="label py-3 pr-6 align-top font-medium" {...props} />,
  td: (props) => (
    <td
      className="border-b border-[var(--border)] py-4 pr-6 align-top text-[length:var(--text-sm)] leading-[1.6] text-fg-muted"
      {...props}
    />
  ),
  hr: () => <hr className="rule my-20" />,
};
