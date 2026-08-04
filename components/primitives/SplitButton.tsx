"use client";

import type { ReactNode } from "react";
import { TransitionLink } from "@/components/motion/TransitionLink";
import { scrollToSection } from "@/components/layout/AnchorLink";
import { cn } from "@/lib/cn";

interface Props {
  children: ReactNode;
  href: string;
  className?: string;
  /** Fills the label half with the accent instead of the arrow chip. */
  emphasis?: boolean;
  /** "lg" for the hero pair, where the label sits under display-scale type. */
  size?: "md" | "lg";
  /**
   * Serve the href as a file instead of navigating to it.
   *
   * Needed because the resume is a same-origin path: without this it matches
   * the internal-route branch below and gets handed to TransitionLink, which
   * would try to client-side navigate to a PDF.
   */
  download?: boolean;
}

/**
 * The signature component: a pill label and a *separate* round arrow chip.
 *
 * The two halves never merge — on hover the gap widens, both halves shift to
 * their hover colour, and the arrow leaves.
 *
 * The arrow is two arrows. On hover the first exits along its own diagonal and
 * a second enters from the opposite corner to take its place, so the mark
 * appears to travel through the chip rather than nudge and settle. Both are
 * stacked in one grid cell rather than absolutely positioned, which keeps the
 * chip sized by its own box instead of by whichever glyph happens to be in it.
 *
 * Everything is one <a>: a single tab stop with one accessible name.
 */
function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={cn("col-start-1 row-start-1", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      aria-hidden
    >
      <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SplitButton({
  children,
  href,
  className,
  emphasis,
  size = "md",
  download,
}: Props) {
  const lg = size === "lg";
  const external = !href.startsWith("/");

  // Both halves travel together: whichever one carries the accent moves to
  // --accent-hover, the dark one to --btn-label-bg-hover. Same two colours the
  // button already used, now applied to the chip as well as the label.
  const accentSkin =
    "bg-[var(--btn-chip-bg)] text-[var(--btn-chip-fg)] group-hover:bg-[var(--accent-hover)]";
  const darkSkin =
    "bg-[var(--btn-label-bg)] text-[var(--btn-label-fg)] group-hover:bg-[var(--btn-label-bg-hover)]";

  const inner = (
    <>
      <span
        className={cn(
          "grid place-items-center rounded-full transition-colors duration-300 ease-[var(--ease-out)]",
          lg ? "px-7" : "px-6 py-2.5",
          emphasis ? accentSkin : darkSkin
        )}
      >
        <span className={cn("mono ctl-text leading-none", lg && "font-semibold")}>
          {children}
        </span>
      </span>

      <span
        aria-hidden
        className={cn(
          // `overflow-hidden` is what makes the swap read as travel rather than
          // as two arrows fading past each other.
          "relative grid shrink-0 place-items-center overflow-hidden rounded-full transition-colors duration-300 ease-[var(--ease-out)]",
          // 50px at both sizes. The chip sets the button's height (the label
          // half stretches to it), so a 42px `md` meant two buttons on the
          // same page standing at different heights for no reason a reader
          // could see. `lg` now differs by padding and weight only.
          "h-[50px] w-[50px]",
          emphasis ? darkSkin : accentSkin
        )}
      >
        <ArrowUpRight
          className={cn(
            "transition-transform duration-500 ease-[var(--ease-out)]",
            "group-hover:translate-x-[160%] group-hover:-translate-y-[160%]",
            lg ? "h-[18px] w-[18px]" : "h-4 w-4"
          )}
        />
        <ArrowUpRight
          className={cn(
            "-translate-x-[160%] translate-y-[160%] transition-transform duration-500 ease-[var(--ease-out)]",
            "group-hover:translate-x-0 group-hover:translate-y-0",
            lg ? "h-[18px] w-[18px]" : "h-4 w-4"
          )}
        />
      </span>
    </>
  );

  const classes = cn(
    "group inline-flex w-fit items-stretch",
    // The gap is the whole idea — it opens on hover.
    "gap-[var(--btn-gap)] hover:gap-[var(--btn-gap-hover)]",
    "transition-[gap] duration-300 ease-[var(--ease-out)]",
    className
  );

  // Checked before the route branches: a download is a plain <a>, never a
  // client-side navigation.
  if (download) {
    return (
      <a href={href} download className={classes} data-cursor="hide">
        {inner}
      </a>
    );
  }

  // In-page anchor: hand the scroll to Lenis so it doesn't fight smooth scroll.
  if (href.startsWith("#")) {
    return (
      <a
        href={href}
        className={classes}
        data-cursor="hide"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
          e.preventDefault();
          scrollToSection(href.slice(1));
          history.replaceState(null, "", href);
        }}
      >
        {inner}
      </a>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        data-cursor="hide"
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noreferrer noopener" }
          : {})}
      >
        {inner}
      </a>
    );
  }

  return (
    <TransitionLink href={href} className={classes} data-cursor="hide">
      {inner}
    </TransitionLink>
  );
}
