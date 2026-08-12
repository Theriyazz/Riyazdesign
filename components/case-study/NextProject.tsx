import Image from "next/image";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MicroLabel } from "@/components/primitives/MicroLabel";
import { MissingImage } from "@/components/primitives/MissingImage";
import { imageMeta, imageProps } from "@/lib/images";
import type { CaseStudyMeta } from "@/lib/content";

/** Edge-to-edge handoff to the next case study — the end of a page should never be a dead end. */
export function NextProject({ meta }: { meta: CaseStudyMeta }) {
  return (
    <section className="mt-[var(--section-y)] border-t border-[var(--border)]">
      <TransitionLink href={`/work/${meta.slug}`} className="group block py-14">
        <div className="shell">
          <MicroLabel>Next case study</MicroLabel>

          <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
            <div>
              <span className="mono block text-fg-muted transition-colors duration-300 group-hover:text-[var(--accent)]">
                ({meta.index})
              </span>
              {/* Same fix as the case-study h1 and Section.tsx's h2. */}
              <h2 className="mt-4 text-[length:var(--text-2xl)] max-md:leading-[1.125]">{meta.title}</h2>
              <p className="mt-4 max-w-[52ch] text-[length:var(--text-base)] leading-relaxed text-fg-muted">
                {meta.subtitle}
              </p>
            </div>

            {/*
              The card image, not the hero cover.

              `cover` is a 2.22:1 letterbox cut for the full-bleed hero, and
              this box is 4:3 — dropping it in here cropped 28% off both sides
              and sliced the edges off the very mockup the card is selling.
              `thumbnail` is the 1.33:1 crop the homepage work card already
              uses, so it lands here at its native ratio with nothing lost.
              Falls back to `cover` because `thumbnail` is optional in the
              frontmatter schema.
            */}
            <div
              data-cursor="view"
              className="aspect-[4/3] overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised"
            >
              {imageMeta(meta.thumbnail ?? meta.cover) ? (
                <Image
                  {...imageProps(meta.thumbnail ?? meta.cover)}
                  alt=""
                  sizes="(max-width: 1024px) 100vw, 520px"
                  className="h-full w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
                />
              ) : (
                <MissingImage src={meta.thumbnail ?? meta.cover} />
              )}
            </div>
          </div>
        </div>
      </TransitionLink>
    </section>
  );
}
