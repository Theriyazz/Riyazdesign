import { MicroLabel } from "@/components/primitives/MicroLabel";
import { SectionChrome } from "@/components/motion/SectionChrome";
import { cn } from "@/lib/cn";

/**
 * Shared section chrome: hairline rule, eyebrow, heading.
 *
 * The eyebrow is the label; the heading is the section's real <h2>. Borders
 * rather than shadows throughout — on a near-black canvas, elevation does
 * nothing.
 *
 * `scroll-mt` keeps anchored sections clear of the fixed nav.
 */
export function Section({
  eyebrow,
  heading,
  id,
  children,
  className,
  bleed,
}: {
  eyebrow: string;
  /**
   * ReactNode, not string: the headings mix faces, setting the closing phrase
   * in `.serif-em` while the rest stays in the sans.
   */
  heading?: React.ReactNode;
  id?: string;
  children: React.ReactNode;
  className?: string;
  /** Skip the inner shell when the content needs the full viewport width. */
  bleed?: boolean;
}) {
  return (
    <section
      id={id}
      className={cn("scroll-mt-24 pt-[var(--section-y)]", className)}
    >
      <SectionChrome>
        <hr data-sec-rule className="rule" />
        <div data-sec-eyebrow className="pt-5">
          <MicroLabel>{eyebrow}</MicroLabel>
        </div>
        {heading ? (
          /* No `max-w`, and `text-wrap: wrap` overriding the base `balance`.
             Both were holding the line short: the 22ch cap ended the measure
             around 760px regardless of the shell, and `balance` then evened
             whatever was left across two lines rather than filling the first.
             Together they broke "Skills And Tools I'm Using To Build
             Experiences" early and left half the row empty. Greedy wrapping
             fills to the container, which is what the short headings were
             already doing by virtue of fitting. */
          <h2
            data-sec-heading
            className="mt-6 text-[length:var(--text-2xl)] [text-wrap:wrap]"
          >
            {heading}
          </h2>
        ) : null}
      </SectionChrome>
      {bleed ? children : <div className="shell mt-14">{children}</div>}
    </section>
  );
}
