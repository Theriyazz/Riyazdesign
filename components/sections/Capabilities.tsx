import { RevealGroup } from "@/components/motion/RevealText";
import { Section } from "./Section";

/**
 * Three columns, not a six-cell grid: the content is genuinely grouped by
 * phase — think, make, ship — and a flat grid would throw that grouping away.
 */
const GROUPS = [
  {
    title: "UX",
    items: [
      "User research",
      "Competitive analysis",
      "Information architecture",
      "User flows",
      "Wireframing",
      "Prototyping",
      "Usability testing",
    ],
  },
  {
    title: "Design",
    items: [
      "Product design",
      "Interaction design",
      "Visual design",
      "Design systems",
      "Responsive design",
      "Accessibility",
    ],
  },
  {
    title: "Shipping",
    items: [
      "Framer",
      "Claude Code",
      "Antigravity",
      "AI-assisted workflows",
      "Developer handoff",
    ],
  },
];

export function Capabilities() {
  return (
    <Section
      eyebrow="How I work"
      heading={
        <>
          Skills and tools I&rsquo;m using to{" "}
          <span className="serif-em">build experiences</span>
        </>
      }
    >
      <RevealGroup className="grid grid-cols-1 border-l border-t border-[var(--border)] md:grid-cols-3">
        {GROUPS.map((g) => (
          <div key={g.title} className="border-b border-r border-[var(--border)] p-7">
            <h3 className="text-[length:var(--text-lg)] leading-tight">{g.title}</h3>
            {/* No dash rule. It bought nothing a list does not already say,
                and its 10px + gap indented every item away from the heading —
                so a wrapped entry hung further right still. Items now start on
                the same left edge as the group title. */}
            <ul className="mt-5 flex flex-col gap-2.5">
              {g.items.map((item) => (
                <li key={item} className="text-[length:var(--text-sm)] text-fg-muted">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </RevealGroup>
    </Section>
  );
}
