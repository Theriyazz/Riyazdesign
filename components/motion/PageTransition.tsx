"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "./SmoothScroll";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * What a navigation should look like.
 *
 * `zoom` — the page falls away from the centre of the viewport, the tree swaps
 *          while it is invisible, and the next one blooms forward. Default.
 * `flip` — no page motion at all, because the work card's cover is morphing
 *          into the case study hero instead (`lib/flipHandoff.ts`). The two
 *          are mutually exclusive: a page-wide scale would move the cover away
 *          from the rect the handoff just recorded, and the morph would start
 *          from a box the reader never saw.
 */
type Mode = "zoom" | "flip";

interface TransitionApi {
  navigate: (href: string, mode?: Mode) => void;
}

const Ctx = createContext<TransitionApi>({ navigate: () => {} });
export const useTransition = () => useContext(Ctx);

/**
 * Ported from sanjaya.framer.ai, whose page transition is `scale 1 → 0.7` out
 * and `1.3 → 1` in, both 700ms on cubic-bezier(0.7, 0.01, 0.31, 1).
 *
 * Two deliberate departures from it.
 *
 * The amplitude is pulled well in. On a three-case-study portfolio the reader
 * meets this often, and 0.7/1.3 is a set piece that wears thin by the third
 * viewing.
 *
 * And the halves run in sequence rather than together. Framer keeps both page
 * trees mounted, so its exit and enter overlap inside one 700ms; the App
 * Router destroys the old tree on `router.push`, so there is never anything to
 * cross-dissolve with. Copying 700ms twice would have made every navigation
 * 1.4s. The curve is the character worth keeping; the tempo is ours.
 */
const EXIT_SCALE = 0.94;
const ENTER_SCALE = 1.06;
const EXIT_S = 0.38;
/** Longer than the exit: leaving is dead time, arriving is the payoff. */
const ENTER_S = 0.55;
/** If the route stalls, the page comes back rather than staying blank. */
const MAX_WAIT_MS = 1600;

const CLEAR = "transform,transformOrigin,opacity,willChange,pointerEvents";

/**
 * The element that carries the motion: `<main>` and the footer, but not the
 * nav. Found by attribute rather than by ref so `app/layout.tsx` can render a
 * plain server-side <div> instead of another client component.
 */
const stage = () =>
  typeof document === "undefined"
    ? null
    : document.querySelector<HTMLElement>("[data-page-stage]");

/**
 * The pivot, expressed in the stage's own coordinates.
 *
 * The stage is as tall as the document, so the default `50% 50%` would pivot
 * around the middle of the *document* — at any real scroll depth the page
 * would visibly slide away as it shrank instead of receding straight back.
 * `-r.top` is exactly how far into the stage the top of the viewport currently
 * sits, which lands the pivot on what the reader is actually looking at, at
 * any depth, on any route, without reading `scrollY` at all.
 */
function centreOrigin(el: HTMLElement) {
  const r = el.getBoundingClientRect();
  return `${window.innerWidth / 2 - r.left}px ${window.innerHeight / 2 - r.top}px`;
}

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  /** True from the moment the exit starts until the arrival is dealt with. */
  const leaving = useRef(false);
  /**
   * Suppresses the arrival bloom for one navigation.
   *
   * Set at click time, not read on arrival, and that ordering is the whole
   * point: React runs effects child-first, so `CaseHero` — deep in the new
   * tree — consumes the FLIP handoff before this provider, its ancestor, ever
   * gets a chance to look for one.
   */
  const skipEnter = useRef(false);
  /**
   * The route the arrival effect last acted on.
   *
   * Tracking the path rather than just "have I mounted yet" matters, because
   * `reduced` is a dependency of that effect and `useReducedMotion` reports
   * `true` until it has read the media query — so on a normal load the effect
   * fires twice with no navigation between. A plain first-run flag would be
   * spent on the first pass and let the second one bloom the homepage on
   * arrival, which is the exact regression recorded under "hero entrance" in
   * globals.css: `opacity: 0` on the element containing the hero cost 3.0s of
   * render delay and put mobile LCP at 3.5s.
   */
  const lastPath = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const release = useCallback(() => {
    clearTimer();
    leaving.current = false;
    getLenis()?.start();
  }, [clearTimer]);

  /** The route never arrived. Put the page back rather than leave a void. */
  const recover = useCallback(() => {
    const el = stage();
    if (el) {
      gsap.to(el, {
        scale: 1,
        opacity: 1,
        duration: ENTER_S,
        ease: "through",
        clearProps: CLEAR,
      });
    }
    release();
  }, [release]);

  const navigate = useCallback(
    (href: string, mode: Mode = "zoom") => {
      // Clicking the wordmark while already home should still do something.
      if (href === pathname) {
        const lenis = getLenis();
        if (lenis) lenis.scrollTo(0, { duration: 1.1 });
        else window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const el = stage();
      if (reduced || mode === "flip" || !el || leaving.current) {
        skipEnter.current = reduced || mode === "flip";
        router.push(href, { scroll: false });
        return;
      }

      leaving.current = true;
      // `overflow: hidden` on the body does not hold this: Lenis reads wheel
      // events and drives the scroll position itself, so the page keeps moving
      // behind the animation. Same finding as Preloader.tsx — it has to be
      // stopped, not just clipped.
      getLenis()?.stop();

      gsap.set(el, {
        transformOrigin: centreOrigin(el),
        willChange: "transform, opacity",
        // It is on its way out and about to be invisible; nothing in it should
        // still be clickable.
        pointerEvents: "none",
      });
      gsap.to(el, {
        scale: EXIT_SCALE,
        opacity: 0,
        duration: EXIT_S,
        ease: "through",
        /*
         * `scroll: false` is load-bearing, not a tidy-up.
         *
         * After a push the App Router calls `scrollIntoView` on the new
         * route's root for accessibility. That runs while the *exit*
         * transform is still on the stage — `scale(0.94)` about an origin
         * computed for the old page's scroll position, which can be
         * thousands of pixels down. Against that origin the new page's top
         * renders far off-screen, so the browser dutifully scrolls down to
         * bring it into view and the reader lands mid-article. ScrollTrigger
         * then caches the bad offset on refresh and restores it twice more.
         *
         * We reset scroll ourselves in SmoothScroll, so the App Router's
         * pass was only ever redundant here.
         */
        onComplete: () => router.push(href, { scroll: false }),
      });

      timer.current = setTimeout(recover, MAX_WAIT_MS);
    },
    [pathname, reduced, router, recover]
  );

  /*
   * Arrival.
   *
   * A layout effect, not a passive one. The from-state has to be written
   * before the browser paints, or the new page shows at full size for a frame
   * and the bloom begins with a flash of the thing it is supposed to be
   * revealing.
   *
   * `SmoothScroll` resets the scroll in a layout effect of its own, and as a
   * child its effect runs before this one — so by the time `centreOrigin`
   * measures, the stage is already where the reader will see it.
   */
  useIsoLayoutEffect(() => {
    const previous = lastPath.current;
    lastPath.current = pathname;
    // Same route: a dependency changed, not the page. Nothing to play.
    if (previous === pathname) return;
    // First mount. The preloader and the hero's CSS entrance own this paint.
    if (previous === null) return;

    // Clear the stall timer on arrival, not when the bloom finishes: a slow
    // route plus a 550ms bloom can outlast MAX_WAIT_MS, and `recover` firing
    // mid-bloom would fight it.
    clearTimer();

    const el = stage();
    if (!el) return;

    // `reduced` is checked here as well as in `navigate`, and it has to be:
    // this effect runs on *every* pathname change, including browser back and
    // forward, which never pass through `navigate` and so never set the flag.
    // Without it a reader who asked for less motion would still be blooming
    // their way through history.
    if (skipEnter.current || reduced) {
      skipEnter.current = false;
      gsap.set(el, { clearProps: CLEAR });
      release();
      return;
    }

    // Drop the exit's `scale(0.94)` before measuring. `getBoundingClientRect`
    // reports the *transformed* box, so measuring through it put the pivot
    // 305px above where it belonged and the new page drifted downwards as it
    // settled. Both writes are in the same layout effect, so nothing paints in
    // between and the untransformed state is never seen.
    gsap.set(el, { clearProps: "transform,transformOrigin" });
    const origin = centreOrigin(el);

    gsap.set(el, {
      scale: ENTER_SCALE,
      opacity: 0,
      transformOrigin: origin,
      willChange: "transform, opacity",
      pointerEvents: "none",
    });
    gsap.to(el, {
      scale: 1,
      opacity: 1,
      duration: ENTER_S,
      ease: "through",
      // Not just tidiness. A transform left on the stage would keep it a
      // containing block for every `position: fixed` descendant for the rest
      // of the session.
      clearProps: CLEAR,
      onComplete: () => {
        release();
        // SmoothScroll refreshes one frame after the route change — while this
        // is still at ENTER_SCALE, which measures every trigger against a
        // scaled geometry and leaves them all wrong. Re-measure now that the
        // stage is back to its real size.
        ScrollTrigger.refresh();
      },
    });
  }, [pathname, reduced, clearTimer, release]);

  useEffect(() => clearTimer, [clearTimer]);

  return <Ctx.Provider value={{ navigate }}>{children}</Ctx.Provider>;
}
