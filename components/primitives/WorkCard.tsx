"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, type CSSProperties } from "react";

import { ClipReveal } from "@/components/motion/ClipReveal";
import { imageMeta, imageProps } from "@/lib/images";
import { MissingImage } from "@/components/primitives/MissingImage";
import { ArrowUpRight } from "@/components/primitives/SplitButton";
import { setHandoff } from "@/lib/flipHandoff";
import { useTransition } from "@/components/motion/PageTransition";

export interface WorkCardData {
  slug: string;
  title: string;
  /** The eyebrow. Short and categorical — "EdTech", not the subtitle. */
  industry: string;
  year: string;
  /** The wide cover, shown whole at every width. */
  cover: string;
  /** A lighter copy of the cover, served below `md`. */
  coverPhone?: string;
  /** One result line: scope or a number the work can defend. */
  outcome: string;
  /** The card's ground, matched to the cover's background. */
  color: string;
  /** `light` lifts the panel's secondary text, for a bright ground. */
  theme: "dark" | "light";
}

/**
 * A work card: the cover, with a glass panel floating over its lower edge.
 *
 * The card was a full-width row — index, title, subtitle, role chips, a pill,
 * and the cover stacked underneath. Three of those rows said things the case
 * study says again on its own first screen, and at full width only one card
 * was ever on screen at once. This shows all three at a glance and lets the
 * cover do the arguing.
 *
 * What the panel carries is deliberately the minimum that makes a card
 * clickable with intent: what field it is in, what it is called, the one
 * result that matters, and when it was. The subtitle and the role chips live
 * on the case study page, which is one click away and has room for them.
 *
 * Everything is one <Link> — a single tab stop with one accessible name. The
 * arrow is decoration, not a second control.
 */
export function WorkCard({
  data,
  priority,
}: {
  data: WorkCardData;
  priority?: boolean;
}) {
  const coverRef = useRef<HTMLDivElement>(null);
  const { navigate } = useTransition();

  return (
    <Link
      href={`/work/${data.slug}`}
      className="work-card group block"
      data-card-theme={data.theme}
      style={{ "--card-color": data.color } as CSSProperties}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!coverRef.current) return;
        e.preventDefault();
        setHandoff(data.slug, coverRef.current);
        // `"flip"` navigates immediately and suppresses the page transition:
        // this cover is about to morph into the case study hero, and a
        // page-wide scale would carry it away from the rect `setHandoff` just
        // measured. One motion per navigation, chosen by what it means.
        navigate(`/work/${data.slug}`, "flip");
      }}
    >
      {/*
        `coverRef` is on this frame and nothing inside it is ever transformed
        by the entrance — ClipReveal animates its own inner wrapper. The FLIP
        handoff into the case study hero measures this box, so a transform
        here would hand the hero a rect that was never on screen.
      */}
      <div
        ref={coverRef}
        data-cursor="view"
        className="relative flex w-full flex-col items-start justify-end overflow-hidden rounded-[var(--radius-squircle)] bg-[var(--card-color)] pt-[40.5%] md:aspect-[1280/712] md:items-center md:pt-0"
      >
        {/*
          One card per row, 1280x712 at the full column width. The wide cover
          (2.22:1) is shorter than the card, so it sits uncropped against the
          top edge with its last stretch running under the panel, and the
          card's own fill carries the rest.

          Below `md` the card hugs its content, since the outcome wraps. The
          top padding is a percentage of the width, so the panel always starts
          the same way down the cover however wide the phone is.

          Positioned from a wrapper: ClipReveal is always `relative`, which
          outranks an `absolute` passed in, and in flow here it would be
          squeezed by the panel instead of running underneath it.
        */}
        {imageMeta(data.cover) ? (
          <div className="absolute inset-x-0 top-0">
            <ClipReveal>
              {/* A <source> rather than `sizes`: images are unoptimized, so
                  there is no srcset for `sizes` to choose from. Same ratio as
                  the cover, so the reserved box and placeholder still fit. */}
              <picture className="block">
                {data.coverPhone ? (
                  <source media="(max-width: 767px)" srcSet={data.coverPhone} />
                ) : null}
                <Image
                  {...imageProps(data.cover)}
                  alt=""
                  priority={priority}
                  sizes="(max-width: 1440px) 100vw, 1280px"
                  // Scale lives in globals.css next to the title and arrow rules
                  // rather than as a `group-hover:` utility, so all three hover
                  // responses are one block that `[data-hovered]` can drive
                  // together.
                  className="work-card-cover block h-auto w-full"
                />
              </picture>
            </ClipReveal>
          </div>
        ) : (
          <MissingImage src={data.cover} className="absolute inset-0" />
        )}

        {/* Flush to the card's lower edge and as wide as the card; the card's
            own rounded corners and overflow clip it. */}
        <div className="work-card-panel relative w-full p-5">
          <span data-card-row className="label block truncate text-fg-muted max-md:pr-20 max-md:text-[14px]!">
            {data.industry}
          </span>

          {/* Wraps rather than truncating — a project's name is the one thing
              on the card that must never be shown clipped. Greedy wrap
              (`text-wrap:wrap`), not `text-balance`: balance evens both lines
              even when the panel has room to fit more on the first one, which
              is what kept "ATRC STEM Career Test" splitting near the middle
              after the arrow's width gave the title the full panel to work
              with. */}
          <h3
            data-card-row
            className="work-card-title mt-1.5 [text-wrap:wrap] text-[length:var(--text-xl)] leading-tight text-fg transition-colors duration-300 ease-[var(--ease-out)] max-md:text-[26px]"
          >
            {data.title}
          </h3>

          <p data-card-row className="mt-2 text-[length:var(--text-sm)] leading-snug text-fg-muted max-md:hidden">
            {data.outcome}
          </p>

          <span
            data-card-row
            className="mono mt-2 inline-flex items-center rounded-[var(--radius-chip)] bg-white/10 px-2.5 py-1 text-fg-muted max-md:absolute max-md:right-5 max-md:top-5 max-md:mt-0"
          >
            {data.year}
          </span>

          {/* Looks like SplitButton but is not one: the whole card is already
              the link, and that component renders an <a> of its own. */}
          <span
            data-card-row
            className="mt-4 flex w-fit items-center justify-center gap-2 rounded-full bg-white py-0.5 pl-3 pr-0.5 md:hidden"
          >
            <span className="mono font-semibold! tracking-[0.06em]! text-[#0e0e11]">See the work</span>
            <span
              aria-hidden
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0e0e11] text-[var(--signal-500)]"
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
