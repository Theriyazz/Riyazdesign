import { RevealSheen } from "@/components/motion/RevealText";

/**
 * The positioning statement, set large and resolved out of a blur on scroll.
 *
 * It is the only place on the page where type is both this big and this long,
 * which is what makes the scrub read as emphasis rather than as an effect.
 *
 * Both paragraphs run at the same display size, the same colour, and edge to
 * edge in the shell: the block is one statement, so any step between its
 * halves — size or colour — would split it into a headline plus a caption.
 * Hierarchy is carried by the fill itself, which travels the whole block in a
 * single pass and so needs the two halves to look identical at rest.
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
        {/* One wrapper, not one per paragraph: `RevealSheen` puts every word
            inside it on a single timeline, so the second paragraph cannot
            start filling until the first has finished. */}
        <RevealSheen>
          <p data-sheen-line className={statement}>
            I&rsquo;m Riyaz — a UX designer with 3+ years across SaaS platforms,
            EdTech, career assessment tools, and non-profit websites.
          </p>

          <p data-sheen-line className={`mt-10 ${statement}`}>
            Most recently a 140+ screen bilingual career-guidance platform,
            designed solo from research through handoff. Teams bring me the
            problem. I own it end to end.
          </p>
        </RevealSheen>
      </div>
    </section>
  );
}
