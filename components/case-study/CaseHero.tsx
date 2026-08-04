"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";
import { imageProps } from "@/lib/images";
import { takeHandoff } from "@/lib/flipHandoff";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * The case study cover. If the visitor arrived by clicking this project's row,
 * the image morphs from where that row's cover was sitting. On a direct URL
 * load there is no handoff, so it simply renders — the animation is an
 * enhancement, never a prerequisite for seeing the page.
 */
export function CaseHero({
  slug,
  cover,
  title,
}: {
  slug: string;
  cover: string;
  title: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;

    const from = takeHandoff(slug);
    if (!from) return;

    const to = el.getBoundingClientRect();
    if (!to.width || !to.height) return;

    // Invert: place the destination exactly over the source's old box...
    const dx = from.left - to.left;
    const dy = from.top - to.top;
    const sx = from.width / to.width;
    const sy = from.height / to.height;

    // ...then play forward to its natural position.
    const tween = gsap.fromTo(
      el,
      { x: dx, y: dy, scaleX: sx, scaleY: sy, transformOrigin: "top left" },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.72, ease: "expo.inOut" }
    );

    return () => {
      tween.kill();
      gsap.set(el, { clearProps: "transform" });
    };
  }, [slug, reduced]);

  return (
    // Explicit height rather than aspect-ratio + max-height: capping the
    // height of an aspect-ratio box makes it give up width to keep the ratio,
    // which pulled the hero in from full-bleed to ~920px. A clamped height
    // with w-full keeps it edge-to-edge and still leaves the meta bar and
    // outcome line above the fold.
    <div
      ref={ref}
      className="mt-14 h-[clamp(220px,42vw,580px)] w-full overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)] bg-bg-raised"
    >
      <Image
        {...imageProps(cover)}
        alt={`${title} — project cover`}
        priority
        sizes="(max-width: 1440px) 100vw, 1440px"
        className="h-full w-full object-cover"
      />
    </div>
  );
}
