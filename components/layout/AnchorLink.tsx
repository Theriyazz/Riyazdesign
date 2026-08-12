"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { getLenis } from "@/components/motion/SmoothScroll";
import { useTransition } from "@/components/motion/PageTransition";

/**
 * Nav link to a homepage section.
 *
 * On the homepage it scrolls; from a case study it navigates to `/#hash` and
 * the effect below completes the scroll once home has mounted. Either way the
 * rendered element is a real `<a href="/#hash">`, so middle-click, copy-link,
 * and no-JS all behave.
 */
export function AnchorLink({
  hash,
  children,
  className,
  onNavigate,
}: {
  hash: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { navigate } = useTransition();
  const onHome = pathname === "/";

  return (
    <Link
      href={`/#${hash}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate?.();

        if (!onHome) {
          // Through the page transition, like every other route change. Left
          // as a bare push this was the one nav control that jumped, which
          // stood out badly next to the wordmark beside it.
          navigate(`/#${hash}`);
          return;
        }
        scrollToSection(hash);
        // Keep the URL honest without adding a history entry per nav click.
        history.replaceState(null, "", `/#${hash}`);
      }}
      className={className}
    >
      {children}
    </Link>
  );
}

/**
 * `immediate` is for the cross-page case: the reader asked to land at a
 * section, and the page transition is already the motion of getting there, so
 * a second 1.1s glide underneath it is one movement too many.
 *
 * `force` because the page transition stops Lenis for its duration, and a
 * `scrollTo` on a stopped instance is otherwise silently dropped.
 */
export function scrollToSection(hash: string, immediate = false) {
  const el = document.getElementById(hash);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) {
    lenis.scrollTo(el, {
      offset: -12,
      duration: immediate ? 0 : 1.1,
      immediate,
      force: true,
    });
  } else el.scrollIntoView({ behavior: "auto", block: "start" });
}

/**
 * Completes a cross-page anchor: arriving at `/#work` from a case study, the
 * section exists only after the homepage mounts, so the scroll runs here.
 */
export function HashScroller() {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    if (!ready || pathname !== "/") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => scrollToSection(hash, true))
    );
    return () => cancelAnimationFrame(id);
  }, [ready, pathname]);

  return null;
}
