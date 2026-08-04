"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * The single reduced-motion source for client components.
 *
 * Starts `true` so that on the very first client render nothing has yet been
 * granted permission to animate. The effect corrects it synchronously on
 * mount. Defaulting the other way would let a frame of motion escape before
 * we knew the user's preference.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(true);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const apply = () => {
      setReduced(mql.matches);
      document.documentElement.dataset.motion = mql.matches ? "reduced" : "full";
    };
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, []);

  return reduced;
}

/** Non-reactive read, for imperative code that runs once (e.g. the preloader). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia(QUERY).matches;
}
