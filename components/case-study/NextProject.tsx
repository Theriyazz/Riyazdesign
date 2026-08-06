import Image from "next/image";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { MicroLabel } from "@/components/primitives/MicroLabel";
import { imageProps } from "@/lib/images";
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
              <h2 className="mt-4 text-[length:var(--text-2xl)]">{meta.title}</h2>
              <p className="mt-4 max-w-[52ch] text-[length:var(--text-base)] leading-relaxed text-fg-muted">
                {meta.subtitle}
              </p>
            </div>

            <div
              data-cursor="view"
              className="overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)]"
            >
              <Image
                {...imageProps(meta.cover)}
                alt=""
                sizes="(max-width: 1024px) 100vw, 520px"
                className="aspect-[16/10] w-full object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
              />
            </div>
          </div>
        </div>
      </TransitionLink>
    </section>
  );
}
