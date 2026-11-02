import { Section } from "./Section";
import { RevealGroup } from "@/components/motion/RevealText";
import { site } from "@/lib/site";

/**
 * Reverse-chronological, so the newest chapter reads first.
 *
 * The CareerNaksha row deliberately keeps "Graphic Designer → UX Designer" on
 * one line. Split across two rows it would read as two jobs; kept together it
 * reads as a promotion, which is the more accurate and more useful signal.
 */
const ROLES = [
  {
    from: "Freelance Product Designer",
    to: null,
    org: null,
    period: "2025 – Present",
    body: "Sole designer for ATRC, CareerLogica (140+ screens) and PECUC (navigation 37 → 7). Clients in India and the UAE.",
  },
  {
    from: "UX Designer",
    to: null,
    org: "Thatha Business Development LLP, Bengaluru",
    period: "2024 – 2025",
    body: "Designed 20+ websites and landing pages for US non-profits, with style guides that kept them consistent across clients.",
  },
  {
    from: "Graphic Designer",
    to: "UX Designer",
    org: "CareerNaksha, Vadodara",
    period: "2023 – 2024",
    body: "Moved into UX within six months. Designed multi-role dashboards for students, counsellors and admins, and the freemium model that later shaped CareerLogica.",
  },
];

export function Experience() {
  return (
    <Section
      id="experience"
      eyebrow="Where I've worked"
      heading={
        <>
          From graphics to <span className="serif-em">products</span>
        </>
      }
    >
      <RevealGroup as="ol" className="border-t border-[var(--border)]" y={20}>
        {ROLES.map((r) => (
          <li
            key={r.from + r.period}
            // Padded inline as well as vertically: the hover tint needs to
            // reach past the text, or it reads as a highlight on the words
            // rather than as the row responding. Negative margin keeps the
            // text on the same left edge it sat on before.
            className="hover-row -mx-5 grid gap-x-8 gap-y-3 border-b border-[var(--border)] px-5 py-8 md:grid-cols-[1fr_1.1fr] md:items-start"
          >
            <div>
              <h3 className="text-[length:var(--text-lg)] leading-tight">
                {r.from}
                {r.to ? (
                  <>
                    <span aria-hidden style={{ color: "var(--accent)" }}>
                      {" → "}
                    </span>
                    <span className="sr-only"> promoted to </span>
                    {r.to}
                  </>
                ) : null}
              </h3>
              {r.org ? (
                <p className="mt-2 text-[length:var(--text-sm)] text-fg-muted">
                  {r.org}
                </p>
              ) : null}
              <p className="mono mt-2 text-fg-subtle">{r.period}</p>
            </div>

            <p className="text-[length:var(--text-sm)] leading-relaxed text-fg-muted">
              {r.body}
            </p>
          </li>
        ))}
      </RevealGroup>

      {/* A plain link, not a button: the resume backs the story up, it does
          not lead it. */}
      <a
        href={site.resume}
        download
        data-track="resume"
        className="link-sweep mono mt-10 inline-flex min-h-11 items-center text-fg"
      >
        Download resume (PDF)
      </a>
    </Section>
  );
}
