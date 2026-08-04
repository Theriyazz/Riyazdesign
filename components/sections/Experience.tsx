import { Section } from "./Section";
import { SplitButton } from "@/components/primitives/SplitButton";
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
    from: "Freelance UX Designer",
    to: null,
    org: null,
    period: "2025 – Present",
    body: "SaaS, EdTech and non-profit clients across India and the UAE.",
  },
  {
    from: "UX Designer",
    to: null,
    org: "Thatha Business Development LLP, Bengaluru",
    period: "2024 – 2025",
    body: "20+ websites and landing pages for US non-profits. Built style guides that held consistency across client projects.",
  },
  {
    from: "Graphic Designer",
    to: "UX Designer",
    org: "CareerNaksha, Vadodara",
    period: "2023 – 2024",
    body: "Started in graphics, moved to UX within six months. Redesigned the company website and designed multi-role dashboards for students, professionals, counsellors and admins.",
  },
];

export function Experience() {
  return (
    <Section
      eyebrow="Where I've worked"
      heading={
        <>
          From graphics to <span className="serif-em">growth</span>
        </>
      }
    >
      <ol className="border-t border-[var(--border)]">
        {ROLES.map((r) => (
          <li
            key={r.from + r.period}
            className="grid gap-x-8 gap-y-3 border-b border-[var(--border)] py-8 md:grid-cols-[1fr_1.1fr] md:items-start"
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
      </ol>

      <SplitButton href={site.resume} download emphasis className="mt-10">
        Get my resume
      </SplitButton>
    </Section>
  );
}
