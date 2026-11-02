/**
 * Analytics hook with no provider attached yet.
 *
 * Elements opt in with a `data-track="event-name"` attribute and one delegated
 * listener (components/layout/TrackClicks.tsx) reports the click here. Today
 * that goes nowhere. When a provider is added, its script defines one of the
 * globals below and every tracked click starts flowing without touching a
 * component.
 *
 * Events in use: lets-talk-nav, email, resume.
 */
type Props = Record<string, string | number | boolean>;

declare global {
  interface Window {
    gtag?: (command: "event", name: string, params?: Props) => void;
    plausible?: (name: string, options?: { props?: Props }) => void;
  }
}

export function track(event: string, props: Props = {}) {
  if (typeof window === "undefined") return;
  window.gtag?.("event", event, props);
  window.plausible?.(event, { props });
}
