/**
 * The page's ground: a fixed field of light that the whole site scrolls over.
 *
 * Fixed, not scrolled. Every section, every case study and the footer move
 * across it, which is the point — the glow stays anchored to the top-right of
 * the *viewport* rather than to a position in the document, so it reads as
 * light in the room instead of a graphic pinned to the hero.
 *
 * Sits at `z-index: -1`, which requires `body` to carry no background of its
 * own — a block's background paints after negative-z-index descendants and
 * would bury this. `html` holds the base colour instead (see globals.css), so
 * a no-CSS or failed-paint state is still the right dark, never white.
 *
 * Nothing here animates. It is four static composited layers, painted once.
 */

/**
 * Light grey, from the paper ramp. Was cyan in the source pattern; a second
 * chromatic voice next to the lime signal made the page read as two brands
 * arguing, and the grey lets the accent stay the only colour that means
 * anything.
 */
const STREAK = "207, 207, 202"; /* --paper-200 */

/**
 * The five streaks, each one a vertical fade cut by a different horizontal
 * mask. The masks are what make them read as separate shafts of light rather
 * than one flat wash — the varying stop positions and alphas are the whole
 * effect, so they are kept verbatim rather than tidied into a pattern.
 */
const STREAK_MASKS = [
  "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
  "linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)",
  "linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)",
  "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)",
  "linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 27%, rgb(0, 0, 0) 42%, rgba(0, 0, 0, 0) 48%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 74%, rgb(0, 0, 0) 82%, rgba(0, 0, 0, 0.47) 88%, rgba(0, 0, 0, 0) 97%)",
];

/**
 * Film grain, as an inline SVG turbulence rather than a hosted PNG.
 *
 * The pattern this came from hotlinked Framer's CDN for its noise tile. That
 * is a third-party request on every page load for eight hundred bytes of
 * static noise, and it breaks the moment that URL moves. Generated here
 * instead: no request, no dependency, same job.
 */
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='150' height='150' filter='url(%23n)'/%3E%3C/svg%3E";

export function BackdropField() {
  return (
    <div aria-hidden className="backdrop-field">
      {/*
        Everything directional lives inside this one mirrored wrapper.

        The source pattern threw its light from the top-left. Rather than
        rewrite five mask strings and the skew by hand — five chances to get a
        stop percentage subtly wrong — the whole group is flipped once on the
        x axis. The glow lands top-right and falls away to the left, and the
        skew mirrors with it for free.
      */}
      <div className="backdrop-field__mirror">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(100% 100% at 0% 0%, var(--ink-700) 0%, var(--bg) 100%)",
            WebkitMaskImage:
              "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.224) 88.2883%, rgba(0, 0, 0, 0) 100%)",
            maskImage:
              "radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.224) 88.2883%, rgba(0, 0, 0, 0) 100%)",
          }}
        >
          {STREAK_MASKS.map((mask, i) => (
            <div
              key={i}
              className="absolute inset-0 opacity-20"
              style={{
                background: `linear-gradient(rgb(${STREAK}) 0%, rgba(${STREAK}, 0) 100%)`,
                // Prefixed first. lightningcss keeps declaration order, and a
                // browser that reads the unprefixed form last would otherwise
                // never see it — the same trap the nav's backdrop-filter hit.
                WebkitMaskImage: mask,
                maskImage: mask,
                transform: "skewX(45deg)",
              }}
            />
          ))}
        </div>
      </div>

      <div
        className="absolute inset-0 bg-repeat opacity-5"
        style={{ backgroundImage: `url("${GRAIN}")`, backgroundSize: "149.76px" }}
      />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.5) 1px, transparent 0)",
          backgroundSize: "20px 20px",
        }}
      />
    </div>
  );
}
