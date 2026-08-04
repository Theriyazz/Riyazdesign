"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { getLenis } from "@/components/motion/SmoothScroll";

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
  const router = useRouter();
  const onHome = pathname === "/";

  return (
    <Link
      href={`/#${hash}`}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate?.();

        if (!onHome) {
          router.push(`/#${hash}`);
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

export function scrollToSection(hash: string) {
  const el = document.getElementById(hash);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -12, duration: 1.1 });
  else el.scrollIntoView({ behavior: "auto", block: "start" });
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
      requestAnimationFrame(() => scrollToSection(hash))
    );
    return () => cancelAnimationFrame(id);
  }, [ready, pathname]);

  return null;
}
