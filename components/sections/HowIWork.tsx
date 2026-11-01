import { RevealGroup } from "@/components/motion/RevealText";
import { Section } from "./Section";

/**
 * A real process, so the numbers are earned: each step depends on the one
 * before it. Tools get one line underneath, as a footnote to the judgment,
 * not a column of their own.
 */
const STEPS = [
  {
    name: "Understand",
    body: "I start with questions: who it's for, what's broken, and what success looks like. Most of the design happens there.",
  },
  {
    name: "Decide",
    body: "I agree the product decisions that matter, like where to ask for payment or what to cut, before any pixels.",
  },
  {
    name: "Design",
    body: "Wireframes, then UI, then a system the whole team can reuse.",
  },
  {
    name: "Hand off",
    body: "Specs, a component library and a walkthrough for developers. I stay close until it's built right.",
  },
];

export function HowIWork() {
  return (
    <Section
      eyebrow="How I work"
      heading={
        <>
          From the first question to <span className="serif-em">handoff</span>
        </>
      }
    >
      <RevealGroup as="ol" className="grid grid-cols-1 border-l border-t border-[var(--border)] md:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <li key={s.name} className="hover-row border-b border-r border-[var(--border)] p-7">
            <span className="mono text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="mt-6 text-[length:var(--text-lg)] leading-tight text-fg">{s.name}</h3>
            <p className="mt-4 text-[length:var(--text-sm)] leading-relaxed text-fg-muted">{s.body}</p>
          </li>
        ))}
      </RevealGroup>
      <p className="mono mt-8 text-fg-subtle">Figma, FigJam, Framer and Miro, with AI for faster exploration.</p>
    </Section>
  );
}
