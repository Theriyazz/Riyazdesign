"use client";

/**
 * What the pointer is currently over, resolved by us rather than by the browser.
 *
 * `HoverSync` is the only writer. `Cursor` reads the mode from here instead of
 * listening for `pointerover`, because `pointerover` is exactly what stops
 * firing when Lenis scrolls the page under a pointer that has not moved.
 */

type Listener = (mode: string | null) => void;

const listeners = new Set<Listener>();
let mode: string | null = null;

/** Subscribe to `data-cursor` mode changes. Fires once immediately. */
export function onCursorMode(fn: Listener): () => void {
  listeners.add(fn);
  fn(mode);
  return () => {
    listeners.delete(fn);
  };
}

/** Writer side. No-ops when the mode has not actually changed. */
export function setCursorMode(next: string | null): void {
  if (next === mode) return;
  mode = next;
  for (const fn of listeners) fn(mode);
}

/** Current mode, for a subscriber mounting after the fact. */
export function getCursorMode(): string | null {
  return mode;
}
