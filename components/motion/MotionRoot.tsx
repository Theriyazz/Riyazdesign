"use client";

import { SmoothScroll } from "./SmoothScroll";
import { Cursor } from "./Cursor";
import { CursorTrail } from "./CursorTrail";
import { Preloader } from "./Preloader";
import { TransitionProvider } from "./TransitionOverlay";

/**
 * Every global motion system, mounted once at the layout root.
 *
 * Each child guards itself on reduced motion / pointer capability, so this
 * stays a composition point with no logic of its own.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <TransitionProvider>
      <SmoothScroll />
      <Preloader />
      <CursorTrail />
      <Cursor />
      {children}
    </TransitionProvider>
  );
}
