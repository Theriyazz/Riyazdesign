import { TransitionLink } from "@/components/motion/TransitionLink";
import { RevealGroup } from "@/components/motion/RevealText";
import { cn } from "@/lib/cn";
import { Section } from "./Section";

/**
 * Real client words only, each tied to the case study it is about. Quotes are
 * added verbatim as clients send them; the grid widens to fit however many
 * there are, up to three.
 */
const QUOTES = [
  {
    name: "Ranjan Kumar Mohanty",
    title: "Secretary-cum-CEO, PECUC",
    project: "PECUC",
    href: "/work/pecuc",
    quote:
      "Working with Riyaz on PECUC's UI/UX was an exceptional experience — he understood our vision and translated it into a clean, modern, and highly accessible platform. He balances aesthetic appeal with seamless user functionality, backed by attention to detail, responsiveness to feedback, and deep UI/UX knowledge. The result: a powerful, visually compelling web presence that resonates with our community. Highly recommend him for his creativity and strategic execution.",
  },
  {
    name: "Himanshu Parmar",
    title: "IT Manager, EdLogica (CareerLogica)",
    project: "CareerLogica",
    href: "/work/careerlogica",
    quote:
      "Riyaz did an excellent job designing our website. His creativity, technical expertise, and attention to detail helped bring our vision to life. He was professional, responsive, and delivered a modern, user-friendly website. I highly recommend Riyaz for professional website design and development.",
  },
];

export function Testimonials() {
  const cols = Math.min(3, QUOTES.length);
  return (
    <Section
      eyebrow="What clients say"
      heading={
        <>
          Results, in their <span className="serif-em">own words</span>
        </>
      }
    >
      <RevealGroup
        className={cn(
          "grid gap-px border border-[var(--border)] bg-[var(--border)]",
          cols === 2 && "lg:grid-cols-2",
          cols === 3 && "lg:grid-cols-3"
        )}
      >
        {QUOTES.map((q) => (
          <figure key={q.name} className="hover-row flex flex-col justify-between gap-8 bg-bg p-7 md:p-9">
            <blockquote
              className={cn(
                "leading-relaxed text-fg-muted",
                cols === 1 ? "max-w-[68ch] text-[length:var(--text-base)]" : "text-[length:var(--text-sm)]"
              )}
            >
              {/* Curly quotes in the copy itself, so the mark is typographic
                  rather than a decorative glyph floating beside the text. */}
              &ldquo;{q.quote}&rdquo;
            </blockquote>
            <figcaption className="flex flex-wrap items-end justify-between gap-4">
              <span>
                <span className="block text-[length:var(--text-base)] text-fg">{q.name}</span>
                <span className="mono mt-1.5 block text-fg-subtle">{q.title}</span>
              </span>
              <TransitionLink href={q.href} className="link-sweep mono inline-flex min-h-11 items-center text-fg">
                {q.project} case study
              </TransitionLink>
            </figcaption>
          </figure>
        ))}
      </RevealGroup>
    </Section>
  );
}
