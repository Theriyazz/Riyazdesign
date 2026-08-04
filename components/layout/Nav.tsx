"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { AnchorLink } from "./AnchorLink";
import { site } from "@/lib/site";
import { cn } from "@/lib/cn";

export function Nav() {
  const pathname = usePathname();
  const onHome = pathname === "/";

  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>("");
  const lastY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Hide on scroll down, reveal on scroll up. Reading the work is the point of
  // the page; the nav shouldn't sit on top of it.
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > 120 && y > lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Which section is currently being read. Only meaningful on the homepage.
  useEffect(() => {
    if (!onHome) {
      setActive("");
      return;
    }
    const sections = site.nav
      .map((n) => document.getElementById(n.hash))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [onHome]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a")?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab") return;
      const items = panelRef.current?.querySelectorAll<HTMLElement>("a, button");
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const resumeIcon = (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 2v8M4.5 7l3.5 3 3.5-3M2.5 13h11" />
    </svg>
  );

  return (
    <>
      {/*
        Sibling of <header>, not a child: <header> carries a transform for the
        hide-on-scroll slide, and a transformed ancestor becomes the containing
        block for `position: fixed`. Nested inside, this panel sized against a
        ~70px header instead of the viewport.
      */}
      <div
        ref={panelRef}
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-0 z-[59] flex flex-col justify-center bg-bg px-[var(--gutter)] md:hidden"
      >
        <ul className="flex flex-col gap-2">
          {site.nav.map((item) => (
            <li key={item.hash}>
              <AnchorLink
                hash={item.hash}
                onNavigate={() => setOpen(false)}
                className="block py-3 text-[length:var(--text-2xl)] leading-none tracking-[-0.03em] text-fg-muted transition-colors duration-200 hover:text-fg"
              >
                {item.label}
              </AnchorLink>
            </li>
          ))}
        </ul>

        <a
          href={site.resume}
          download
          className="mono ctl-text mt-12 inline-flex w-fit items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--border)] px-3.5 py-2 text-fg-muted"
        >
          {resumeIcon} Resume
        </a>
        <a
          href={`mailto:${site.email}`}
          className="mono ctl-text mt-4 text-fg-subtle underline-offset-4 hover:text-fg hover:underline"
        >
          {site.email}
        </a>
      </div>

      <header
        className={cn(
          "fixed inset-x-0 top-0 z-[60] transition-transform duration-500 ease-[var(--ease-out)]",
          hidden && !open ? "-translate-y-full" : "translate-y-0"
        )}
      >
        <nav
          aria-label="Primary"
          className="shell relative flex items-center justify-between gap-4 py-5"
        >
          <Link href="/" className="shrink-0 text-[length:var(--text-base)] font-medium tracking-[-0.02em] text-fg">
            {site.wordmark}
          </Link>

          {/* Below `md` these three labels plus the resume button crowd a 375px
              bar, so they move into a panel. */}
          <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-[var(--border)] bg-[color-mix(in_srgb,var(--bg-raised)_82%,transparent)] px-2 py-1.5 backdrop-blur-md md:flex">
            {site.nav.map((item) => {
              const isActive = active === item.hash;
              return (
                <li key={item.hash}>
                  <AnchorLink
                    hash={item.hash}
                    className={cn(
                      "mono ctl-text relative inline-flex items-center rounded-full px-3 py-1 transition-colors duration-200",
                      isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                    )}
                  >
                    {item.label}
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-px"
                        style={{ background: "var(--accent)" }}
                      />
                    ) : null}
                  </AnchorLink>
                </li>
              );
            })}
          </ul>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={site.resume}
              download
              className="mono ctl-text hidden items-center gap-2 rounded-full border border-[var(--border)] px-3.5 py-1.5 text-fg-muted transition-colors duration-200 hover:border-[var(--border-strong)] hover:text-fg md:inline-flex"
            >
              {resumeIcon} Resume
            </a>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="mono ctl-text inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3.5 py-1.5 text-fg-muted transition-colors duration-200 hover:text-fg md:hidden"
            >
              <span
                aria-hidden
                className="inline-block h-[6px] w-[6px]"
                style={{ background: open ? "var(--accent)" : "var(--fg-subtle)" }}
              />
              {open ? "Close" : "Menu"}
            </button>
          </div>
        </nav>
      </header>
    </>
  );
}
