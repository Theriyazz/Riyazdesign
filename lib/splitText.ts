/**
 * Word/char splitter — our replacement for GSAP SplitText.
 *
 * SplitText is a paid GSAP Club plugin, so we roll our own. Beyond licensing,
 * doing it by hand lets us keep the split accessible: the original string is
 * mirrored into an aria-label and every generated fragment is aria-hidden, so
 * a screen reader hears one clean sentence instead of a stream of letters.
 *
 * Always pair with `revertSplit` on cleanup, or the DOM keeps the fragments.
 */

export type SplitKind = "words" | "chars";

export interface SplitResult {
  /** The animatable fragments, in document order. */
  parts: HTMLElement[];
  /** Restores the element's original markup. */
  revert: () => void;
}

const WORD_CLASS = "reveal-word";
const CHAR_CLASS = "reveal-char";

/**
 * Rebuilds the chain of inline elements a word was nested inside, innermost
 * first, so formatting survives the split.
 *
 * Shallow clones only — the children are the words we just made. Without this
 * the splitter read `textContent` and every heading came back as flat text:
 * `<span class="serif-em">every second</span>` lost its span, and with it the
 * Instrument Serif italic that all five section headings depend on.
 */
function rewrap(word: HTMLElement, ancestors: HTMLElement[]): HTMLElement {
  let out: HTMLElement = word;
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const clone = ancestors[i].cloneNode(false) as HTMLElement;
    // An id copied onto every word would be a duplicate several times over.
    clone.removeAttribute("id");
    clone.appendChild(out);
    out = clone;
  }
  return out;
}

export function splitText(
  el: HTMLElement,
  kind: SplitKind = "words",
  /**
   * Wrap each word in an overflow-hidden box so a `yPercent` rise reads as the
   * word climbing out from behind a mask rather than sliding in from nowhere.
   */
  mask = false
): SplitResult {
  const original = el.innerHTML;
  const text = el.textContent ?? "";

  // The sentence is preserved in a visually-hidden sibling rather than an
  // aria-label. `aria-label` is prohibited on generic elements like <p> and
  // <span> that carry no role, so labelling this way would be invalid ARIA;
  // a hidden text node is valid everywhere and needs no role at all.
  const visual = document.createElement("span");
  visual.setAttribute("aria-hidden", "true");

  const spoken = document.createElement("span");
  spoken.className = "sr-only";
  spoken.textContent = text.trim();

  const frag = document.createDocumentFragment();
  const parts: HTMLElement[] = [];

  /** Walks the real tree rather than a flattened string, carrying the inline
      elements each text node sits inside down to the words it produces. */
  const walk = (node: Node, ancestors: HTMLElement[], into: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child, [...ancestors, child as HTMLElement], into);
        continue;
      }
      if (child.nodeType !== Node.TEXT_NODE) continue;

      // Split on whitespace but keep it, so spacing survives the round trip.
      for (const token of (child.textContent ?? "").split(/(\s+)/)) {
        if (token === "") continue;

        if (/^\s+$/.test(token)) {
          into.appendChild(document.createTextNode(token));
          continue;
        }

        const word = document.createElement("span");
        word.className = WORD_CLASS;
        // inline-block is what makes y/rotate transforms possible at all.
        word.style.display = "inline-block";
        word.style.willChange = "transform, opacity";

        if (kind === "chars") {
          for (const ch of Array.from(token)) {
            const c = document.createElement("span");
            c.className = CHAR_CLASS;
            c.style.display = "inline-block";
            c.textContent = ch;
            word.appendChild(c);
            parts.push(c);
          }
        } else {
          word.textContent = token;
          parts.push(word);
        }

        // The formatting wraps the word; the mask wraps the formatting. That
        // order matters — the mask has to be the outermost box for the clip to
        // apply to the whole rendered word, italic and all.
        const formatted = rewrap(word, ancestors);

        if (mask) {
          const box = document.createElement("span");
          box.style.display = "inline-block";
          box.style.overflow = "hidden";
          box.style.verticalAlign = "bottom";
          // overflow:hidden clips descenders against the line box, so the mask
          // is grown downward and the extra height pulled back out of layout.
          box.style.paddingBottom = "0.14em";
          box.style.marginBottom = "-0.14em";
          box.appendChild(formatted);
          into.appendChild(box);
        } else {
          into.appendChild(formatted);
        }
      }
    }
  };

  walk(el, [], frag);

  visual.appendChild(frag);
  el.replaceChildren(visual, spoken);

  return {
    parts,
    revert: () => {
      el.innerHTML = original;
    },
  };
}
