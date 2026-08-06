"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useRouter } from "next/navigation";

import { Tag } from "./MicroLabel";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { gsap, useGSAP } from "@/lib/gsap";
import { imageProps } from "@/lib/images";
import { setHandoff } from "@/lib/flipHandoff";
import { useReducedMotion } from "@/lib/useReducedMotion";

export interface WorkCardData {
  index: string;
  slug: string;
  title: string;
  subtitle: string;
  tags: readonly string[];
  cover: string;
}

/**
 * A work card: index, title, one-line subtitle, role chips, cover.
 *
 * The card used to expand a detail paragraph on hover. That is gone — the row
 * now says only as much as it can say at a glance, and the case study itself
 * carries the rest. What hover still does is the cover scale and the index
 * colour, which are affordances rather than content, so nothing readable is
 * behind a pointer any more.
 *
 * On scroll the text column rises, the index counts up to its real number, and
 * the cover wipes in beside them.
 */
export function WorkCard({
  data,
  priority,
}: {
  data: WorkCardData;
  priority?: boolean;
}) {
  const coverRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root || reduced) return;

      const rows = Array.from(root.querySelectorAll<HTMLElement>("[data-card-row]"));
      const indexEl = root.querySelector<HTMLElement>("[data-card-index]");
      if (!rows.length) return;

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top 85%", once: true },
      });

      tl.fromTo(
        rows,
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.07,
          // Nothing downstream should ever measure a transformed row.
          clearProps: "transform",
        },
        0
      );

      if (indexEl) {
        // Counts to the card's real index. Parsed rather than assumed: the
        // value is a zero-padded string in the frontmatter and the padding has
        // to survive, or the digits change width mid-count.
        const target = Number(data.index);
        if (Number.isFinite(target)) {
          const counter = { value: 0 };
          const pad = data.index.length;
          tl.to(
            counter,
            {
              value: target,
              duration: 0.9,
              ease: "power2.out",
              // The global default writes a translate3d to whatever it
              // touches; on a plain object that is a warning per tween.
              force3D: false,
              onUpdate: () => {
                indexEl.textContent = `(${String(Math.round(counter.value)).padStart(pad, "0")})`;
              },
            },
            0
          );
        }
      }

      return () => {
        tl.scrollTrigger?.kill();
        tl.kill();
      };
    },
    { scope: rootRef, dependencies: [reduced, data.index] }
  );

  return (
    <div ref={rootRef}>
      <Link
        href={`/work/${data.slug}`}
        className="work-card group block border-t border-[var(--row-rule)] pt-6"
        onClick={(e) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
          if (!coverRef.current) return;
          e.preventDefault();
          setHandoff(data.slug, coverRef.current);
          router.push(`/work/${data.slug}`);
        }}
      >
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-5">
          <div className="max-w-[64ch]">
            <span
              data-card-row
              data-card-index
              className="mono block text-[var(--row-index-fg)] transition-colors duration-300 group-hover:text-[var(--row-index-fg-hover)]"
            >
              ({data.index})
            </span>

            <h3 data-card-row className="mt-3 text-[length:var(--text-xl)]">
              {data.title}
            </h3>

            <p data-card-row className="mt-2 text-[length:var(--text-base)] text-fg-muted">
              {data.subtitle}
            </p>

            <div data-card-row className="mt-5 flex flex-wrap gap-1.5">
              {data.tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
            </div>
          </div>

          <span
            data-card-row
            aria-hidden
            className="mono inline-flex shrink-0 items-center gap-2 rounded-[var(--radius-chip)] border border-[var(--border)] px-3 py-2 text-fg-muted transition-colors duration-300 group-hover:border-[var(--border-strong)] group-hover:text-fg"
          >
            Read case study <span>→</span>
          </span>
        </div>

        {/*
          Cropped to 16:10 rather than shown at its native ~1:1. The source
          mockups are near-square with a lot of empty space above and below the
          device; at full height each card ran past a full viewport, which
          defeats the fast scan the page is built for.

          `coverRef` stays on the bordered box, not on ClipReveal's inner
          wrapper: that box is what the FLIP handoff measures, and it is the
          one element in here that is never transformed.
        */}
        <div
          ref={coverRef}
          data-cursor="view"
          className="mt-7 overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised"
        >
          <ClipReveal parallax delay={0.1}>
            <Image
              {...imageProps(data.cover)}
              alt=""
              priority={priority}
              sizes="(max-width: 900px) 100vw, 1200px"
              className="aspect-[16/10] w-full scale-100 object-cover transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
            />
          </ClipReveal>
        </div>
      </Link>
    </div>
  );
}
