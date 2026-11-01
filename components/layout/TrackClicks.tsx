"use client";

import { useEffect } from "react";
import { track } from "@/lib/track";

/**
 * One listener for the whole document, so tracked links can stay in server
 * components: anything with `data-track` reports its click to lib/track.ts,
 * along with the page it happened on. Renders nothing.
 */
export function TrackClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("[data-track]");
      const name = el?.dataset.track;
      if (name) track(name, { path: location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
