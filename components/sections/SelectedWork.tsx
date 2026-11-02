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
      {/* One card per row, full column width: each cover is wide enough to show
          the laptop and the phones together, which the three-up crop could not. */}
      <div className="grid grid-cols-1 gap-6">
        {projects.map((p) => (
          <WorkCard key={p.slug} data={p} />
        ))}
      </div>
    </Section>
  );
}
