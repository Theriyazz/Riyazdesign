import { RevealText } from "@/components/motion/RevealText";

/**
 * The positioning statement, set large and filled word-by-word on scroll.
 *
 * It is the only place on the page where type is both this big and this long,
 * which is what makes the scrub read as emphasis rather than as an effect.
 *
 * Both paragraphs run at the same display size and edge to edge in the shell:
 * the block is read as one statement, so a size step between its halves would
 * split it into a headline plus a caption. Hierarchy is carried by color
 * (--fg then --fg-muted) instead, which keeps the scrub reading as a single
 * continuous fill down the whole block.
 */

/* No max-width and `text-wrap: wrap` — the base `p` rule sets `pretty`, which
   pulls the last lines short to avoid orphans. That is right for body copy and
   wrong here: it leaves gaps against the container edge the annotation asks us
   to fill. */
const statement =
  "text-[length:var(--text-2xl)] font-medium leading-[1.08] tracking-[-0.035em] [text-wrap:wrap]";

export function FirstFold() {
  return (
    <section className="border-y border-[var(--border)] py-[var(--section-y)]">
      <div className="shell">
        <RevealText as="p" className={statement}>
          I&rsquo;m Riyaz — a UX designer with 3+ years across SaaS platforms,
          EdTech, career assessment tools, and non-profit websites.
        </RevealText>

        <RevealText as="p" className={`mt-10 ${statement} text-fg-muted`}>
          Most recently a 140+ screen bilingual career-guidance platform,
          designed solo from research through handoff. Teams bring me the
          problem. I own it end to end.
        </RevealText>
      </div>
    </section>
  );
}
