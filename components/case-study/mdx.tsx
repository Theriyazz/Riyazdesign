import Image from "next/image";
import type { MDXComponents } from "mdx/types";
import { imageMeta, imageProps } from "@/lib/images";

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
    <div className="my-10 border-l-2 pl-6" style={{ borderColor: "var(--case-accent)" }}>
      <p className="text-[length:var(--text-lg)] leading-snug text-fg">{decision}</p>

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="mono text-fg-subtle">Why</dt>
          <dd className="mt-1.5 text-[length:var(--text-sm)] leading-relaxed text-fg-muted">
            {why}
          </dd>
        </div>
        <div>
          <dt className="mono text-fg-subtle">Tradeoff</dt>
          <dd className="mt-1.5 text-[length:var(--text-sm)] leading-relaxed text-fg-muted">
            {tradeoff}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ImageBlock({
  src,
  alt,
  caption,
  wide,
}: {
  src: string;
  alt: string;
  caption?: string;
  wide?: boolean;
}) {
  const meta = imageMeta(src);

  return (
    <figure className={wide ? "my-14 lg:-mx-[8vw]" : "my-14"}>
      <div className="overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised">
        {meta ? (
          <Image
            {...imageProps(src)}
            alt={alt}
            sizes={wide ? "100vw" : "(max-width: 900px) 100vw, 820px"}
            className="h-auto w-full"
          />
        ) : (
          // The asset isn't in the manifest yet. Rather than render a broken
          // <img> (or a `fill` image with no sized parent, which collapses to
          // zero height), say exactly which file is missing and how to add it.
          <div className="flex aspect-[16/10] flex-col items-center justify-center gap-2 border border-dashed border-[var(--border-strong)] p-8 text-center">
            <span className="mono text-fg-subtle">Image not yet added</span>
            <code className="mono text-fg-muted">{src}</code>
            <span className="mono max-w-[46ch] text-fg-subtle">
              Drop the source into the matching folder, add it to
              scripts/optimize-images.mjs, then run npm run images
            </span>
          </div>
        )}
      </div>
      {caption ? (
        <figcaption className="mono mt-3 text-fg-subtle">{caption}</figcaption>
      ) : null}
    </figure>
  );
}

export function Compare({
  before,
  after,
  beforeAlt,
  afterAlt,
}: {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
}) {
  return (
    <div className="my-14 grid gap-5 sm:grid-cols-2">
      {[
        { src: before, alt: beforeAlt, label: "Before" },
        { src: after, alt: afterAlt, label: "After" },
      ].map((s) => (
        <figure key={s.label}>
          <figcaption className="mono mb-3 text-fg-subtle">{s.label}</figcaption>
          <div className="overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)]">
            <Image
              {...imageProps(s.src)}
              alt={s.alt}
              sizes="(max-width: 640px) 100vw, 420px"
              className="h-auto w-full"
            />
          </div>
        </figure>
      ))}
    </div>
  );
}

export function Callout({ children }: { children: React.ReactNode }) {
  return (
    <aside className="my-10 rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised p-6 text-[length:var(--text-sm)] leading-relaxed text-fg-muted">
      {children}
    </aside>
  );
}

export function SystemGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-10 grid grid-cols-1 border-l border-t border-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
      {children}
    </div>
  );
}

export function SystemItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-r border-[var(--border)] p-5">
      <span className="mono block text-fg-subtle">{label}</span>
      <span className="mt-2 block text-[length:var(--text-base)] text-fg">{value}</span>
    </div>
  );
}

/** Typographic defaults for raw markdown inside a case study body. */
export const mdxComponents: MDXComponents = {
  Decision,
  ImageBlock,
  Compare,
  Callout,
  SystemGrid,
  SystemItem,

  h2: (props) => (
    <h2
      className="mt-20 scroll-mt-28 text-[length:var(--text-xl)] first:mt-0"
      {...props}
    />
  ),
  h3: (props) => (
    <h3 className="mt-12 text-[length:var(--text-lg)]" {...props} />
  ),
  p: (props) => (
    <p
      className="mt-5 max-w-[68ch] text-[length:var(--text-base)] leading-relaxed text-fg-muted"
      {...props}
    />
  ),
  ul: (props) => (
    <ul
      className="mt-5 max-w-[68ch] list-disc space-y-2 pl-5 text-[length:var(--text-base)] leading-relaxed text-fg-muted marker:text-[var(--case-accent)]"
      {...props}
    />
  ),
  ol: (props) => (
    <ol
      className="mt-5 max-w-[68ch] list-decimal space-y-2 pl-5 text-[length:var(--text-base)] leading-relaxed text-fg-muted marker:text-fg-subtle"
      {...props}
    />
  ),
  strong: (props) => <strong className="font-medium text-fg" {...props} />,
  a: (props) => (
    <a
      className="text-fg underline decoration-[var(--case-accent)] underline-offset-4"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="my-10 border-l-2 border-[var(--border-strong)] pl-6 text-[length:var(--text-lg)] leading-snug text-fg"
      {...props}
    />
  ),
  hr: () => <hr className="rule my-16" />,
};
