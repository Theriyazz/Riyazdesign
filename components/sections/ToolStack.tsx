import { MicroLabel } from "@/components/primitives/MicroLabel";
import { SectionChrome } from "@/components/motion/SectionChrome";

/** Display size of a single mark. Exported at ICON_EXPORT_SCALE * this, in
 *  scripts/optimize-images.mjs — keep the two in sync if this changes. */
const ICON_PX = 84;

/**
 * The tool wall, as a continuous ticker.
 *
 * These marks arrive as one uniform set — same tile, same dark ground, same
 * optical weight — which is the only reason a logo row belongs on a page
 * whose argument is restraint. Six mismatched vendor lockups would shout; nine
 * identical tiles read as a single texture, and the drift is what makes them a
 * texture rather than a list.
 *
 * The motion is CSS, not GSAP. It has to survive with no JS and it never needs
 * to sync to anything, so a keyframe costs nothing and starts at first paint.
 * Hover parks it (see globals.css) — the row is only useful if you can stop it
 * and actually read a mark.
 *
 * Ordered by where each one sits in the work: draw, then reference, then the
 * assistants, then ship. Not alphabetical — the sequence is the workflow.
 */
const TOOLS = [
  { name: "Figma", src: "/tools/figma.webp" },
  { name: "Framer", src: "/tools/framer.webp" },
  { name: "Miro", src: "/tools/miro.webp" },
  { name: "Relume", src: "/tools/relume.webp" },
  { name: "Mobbin", src: "/tools/mobin.webp" },
  { name: "Claude", src: "/tools/claude.webp" },
  { name: "ChatGPT", src: "/tools/chatgpt.webp" },
  { name: "Antigravity", src: "/tools/antigravity.webp" },
  { name: "GitHub", src: "/tools/github.webp" },
];

/**
 * How many times the nine marks repeat inside each half of the track.
 *
 * One run measures ~1620px at the current icon size and gap. A half narrower
 * than the viewport would scroll a hole into view before the wrap point, so
 * the half has to out-measure the widest screen we care about: two runs
 * clears 1440 outright, and the `min-width: 100vw` in the stylesheet absorbs
 * anything wider than that.
 */
const RUNS = 2;

function Run() {
  return (
    <div className="ticker-run">
      {TOOLS.map((t) => (
        <img
          key={t.name}
          src={t.src}
          // Plain <img>, not next/image: the source is a resampled-up-front
          // WebP already sized for this exact spot (see optimize-images.mjs),
          // so there's no per-request resize or blur placeholder for
          // next/image to add value with.
          width={ICON_PX}
          height={ICON_PX}
          alt=""
          loading="lazy"
          decoding="async"
          className="ticker-mark"
          style={{ height: ICON_PX, width: ICON_PX }}
        />
      ))}
    </div>
  );
}

/** Half the track. Two of these, travelling -50%, is the whole loop. */
function Half() {
  return (
    <div className="ticker-set">
      {Array.from({ length: RUNS }, (_, i) => (
        <Run key={i} />
      ))}
    </div>
  );
}

export function ToolStack() {
  return (
    <section className="pt-[var(--section-y)]">
      {/* Through `SectionChrome` rather than a bare rule + label. This section
          builds its own header instead of going through `<Section>` (the
          ticker needs to escape the shell), which is why it was the one
          section on the page whose rule never drew and whose eyebrow never
          lifted. The attribute hooks are what the chrome animates. */}
      <SectionChrome>
        <hr data-sec-rule className="rule" />
        <div data-sec-eyebrow className="pt-5">
          <MicroLabel>Tools I can&rsquo;t live without</MicroLabel>
        </div>
      </SectionChrome>

      {/*
        The names, once, for anyone not reading this with their eyes. The strip
        below repeats each mark four times over — a screen reader working
        through that would hear the same nine words on a loop, so the ticker is
        hidden outright and this carries the actual content.
      */}
      <ul className="sr-only">
        {TOOLS.map((t) => (
          <li key={t.name}>{t.name}</li>
        ))}
      </ul>

      {/* Held inside the shell, not full-bleed: the marks stop where every
          other element on the page stops, so the strip reads as part of the
          column rather than something escaping it. The frame carries the
          blurred fade on each edge (see globals.css) — a hard clip at the
          container edge would look like a cropping accident. */}
      <div className="shell">
        <div className="ticker-frame mt-10">
          <div className="ticker" aria-hidden>
            <div className="ticker-track">
              <Half />
              <Half />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
