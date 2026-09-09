import { RevealGroup } from "@/components/motion/RevealText";
import { Section } from "./Section";

const QUOTES = [
  {
    name: "Ranjan Kumar Mohanty",
    title: "Secretary-cum-CEO, PECUC",
    quote:
      "Working with Riyaz on PECUC's UI/UX was an exceptional experience — he understood our vision and translated it into a clean, modern, and highly accessible platform. He balances aesthetic appeal with seamless user functionality, backed by attention to detail, responsiveness to feedback, and deep UI/UX knowledge. The result: a powerful, visually compelling web presence that resonates with our community. Highly recommend him for his creativity and strategic execution.",
  },
  {
    name: "Himanshu Parmar",
    title: "IT Manager, EdLogica (CareerLogica)",
    quote:
      "Riyaz did an excellent job designing our website. His creativity, technical expertise, and attention to detail helped bring our vision to life. He was professional, responsive, and delivered a modern, user-friendly website. I highly recommend Riyaz for professional website design and development.",
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
      <RevealGroup className="grid gap-px border border-[var(--border)] bg-[var(--border)] lg:grid-cols-2">
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
