"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";

import { ClipReveal } from "@/components/motion/ClipReveal";
import { imageProps } from "@/lib/images";
import { setHandoff } from "@/lib/flipHandoff";

export interface WorkCardData {
  slug: string;
  title: string;
  /** The eyebrow. Short and categorical — "EdTech", not the subtitle. */
  industry: string;
  year: string;
  cover: string;
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
 * clickable with intent: what field it is in, what it is called, when it was.
 * The subtitle and the role chips live on the case study page, which is one
 * click away and has room for them.
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
  const router = useRouter();

  return (
    <Link
      href={`/work/${data.slug}`}
      className="work-card group block"
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (!coverRef.current) return;
        e.preventDefault();
        setHandoff(data.slug, coverRef.current);
        router.push(`/work/${data.slug}`);
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
        className="relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised"
      >
        <ClipReveal className="absolute inset-0">
          <Image
            {...imageProps(data.cover)}
            alt=""
            priority={priority}
            // Three up on a 1280px column, two at tablet, one on a phone —
            // but these are not the frame's widths. The frame is 4:5 and the
            // covers are landscape, so `object-cover` scales each image to
            // match the frame's *height* and lets the sides overflow: a 411px
            // frame renders a 685px-wide image. Describing the frame instead
            // (33vw) under-requested by a quarter and the browser upscaled the
            // variant it got.
            //
            // Sized against the widest cover (PECUC at 1.33:1) rather than the
            // average: the two 1.16:1 covers then over-request by a few KB,
            // which is the cheap direction to be wrong in. Under-requesting
            // shows up as softness; over-requesting shows up as nothing.
            sizes="(max-width: 767px) 150vw, (max-width: 1023px) 71vw, 48vw"
            // Scale lives in globals.css next to the title and arrow rules
            // rather than as a `group-hover:` utility, so all three hover
            // responses are one block that `[data-hovered]` can drive together.
            className="work-card-cover h-full w-full object-cover"
          />
        </ClipReveal>

        {/*
          Inset from the card edge rather than flush to it, so the cover reads
          as a photograph the panel is resting on instead of a block the panel
          is cropping.
        */}
        <div className="work-card-panel absolute inset-x-4 bottom-4 flex items-center gap-4 rounded-[var(--radius-squircle)] p-5">
          <div className="min-w-0 flex-1">
            <span data-card-row className="label block truncate text-fg-muted">
              {data.industry}
            </span>

            {/* Wraps to two lines rather than truncating. "ATRC STEM Career
                Test" does not fit one line beside the arrow at any column
                width this grid produces, and a project's name is the one
                thing on the card that must never be shown clipped. */}
            <h3
              data-card-row
              className="work-card-title mt-1.5 text-balance text-[length:var(--text-xl)] leading-tight text-fg transition-colors duration-300 ease-[var(--ease-out)]"
            >
              {data.title}
            </h3>

            <span
              data-card-row
              className="mono mt-3 inline-flex items-center rounded-[var(--radius-chip)] border border-[var(--border-strong)] px-2.5 py-1 text-fg-muted"
            >
              {data.year}
            </span>
          </div>

          <span
            aria-hidden
            className="work-card-arrow grid h-14 w-14 shrink-0 place-items-center rounded-[var(--radius-squircle)] border border-[var(--border-strong)] text-fg-muted transition-colors duration-300 ease-[var(--ease-out)]"
          >
            <svg
              viewBox="0 0 16 16"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4.5 11.5 11.5 4.5M5.5 4.5h6v6" />
            </svg>
          </span>
        </div>
      </div>
    </Link>
  );
}
