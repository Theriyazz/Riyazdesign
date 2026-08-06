import { RevealGroup } from "@/components/motion/RevealText";
import { Section } from "./Section";

const QUOTES = [
  {
    name: "Ranjan Kumar Mohanty",
    title: "Secretary-cum-CEO, PECUC",
    quote:
      "Riyaz has a remarkable ability to balance aesthetic appeal with seamless user functionality. He transformed our ideas into an intuitive, engaging digital experience while remaining attentive to every detail throughout the process. Thanks to Riyaz's expertise, we now have a powerful, visually compelling web presence that resonates with our community.",
  },
  {
    name: "Sarah Ahmed",
    title: "Head of Product, Careernet",
    quote:
      "Riyaz quickly understood our product vision and translated complex workflows into a clean, intuitive experience. His structured UX process, attention to detail, and ability to create scalable design systems significantly improved both usability and visual consistency. Working with him felt like having a true product partner rather than just a designer.",
  },
  {
    name: "David Wilson",
    title: "Program Director, ARCK",
    quote:
      "From research to final UI, Riyaz approached every challenge with clarity and precision. He simplified complicated user journeys into experiences that felt effortless while maintaining a polished, modern interface. His communication, responsiveness, and commitment to quality made the entire collaboration smooth and highly productive.",
  },
];

export function Testimonials() {
  return (
    <Section
      eyebrow="What clients say"
      heading={
        <>
          Results, in their <span className="serif-em">own words</span>
        </>
      }
    >
      <RevealGroup className="grid gap-px border border-[var(--border)] bg-[var(--border)] lg:grid-cols-3">
        {QUOTES.map((q) => (
          <figure
            key={q.name}
            className="hover-row flex flex-col justify-between gap-8 bg-bg p-7"
          >
            <blockquote className="text-[length:var(--text-sm)] leading-relaxed text-fg-muted">
              {/* Curly quotes in the copy itself, so the mark is typographic
                  rather than a decorative glyph floating beside the text. */}
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <figcaption>
              <span className="block text-[length:var(--text-base)] text-fg">
                {q.name}
              </span>
              <span className="mono mt-1.5 block text-fg-subtle">{q.title}</span>
            </figcaption>
          </figure>
        ))}
      </RevealGroup>
    </Section>
  );
}
