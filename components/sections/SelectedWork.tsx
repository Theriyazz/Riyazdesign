import { WorkCard, type WorkCardData } from "@/components/primitives/WorkCard";
import { Section } from "./Section";

/**
 * The whole portfolio. Nothing above it is allowed to delay it — on a 1080p
 * screen the first card must already be starting as the hero leaves.
 */
export function SelectedWork({ projects }: { projects: WorkCardData[] }) {
  return (
    <Section
      id="work"
      eyebrow="Selected work"
      heading={
        <>
          Case studies worth <span className="serif-em">every second</span>
        </>
      }
    >
      <div className="flex flex-col gap-[var(--space-24)]">
        {projects.map((p, i) => (
          // Only the first cover is priority — the rest are below the fold and
          // would compete with the LCP for bandwidth.
          <WorkCard key={p.slug} data={p} priority={i === 0} />
        ))}
      </div>
    </Section>
  );
}
