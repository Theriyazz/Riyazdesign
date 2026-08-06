import Image from "next/image";
import { Section } from "./Section";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { RevealText, RevealGroup, DrawRule } from "@/components/motion/RevealText";
import { imageProps } from "@/lib/images";

export function About() {
  return (
    <Section
      id="about"
      eyebrow="A little about me"
      heading={
        <>
          Just a design nerd <span className="serif-em">with purpose</span>
        </>
      }
    >
      <div className="grid gap-14 lg:grid-cols-[1fr_0.72fr] lg:items-start">
        <RevealGroup
          className="flex flex-col gap-6 text-[length:var(--text-base)] leading-relaxed text-fg-muted"
          y={18}
        >
          {/* The opening line is the one that has to land, so it gets the
              word-level burst; the rest rise as blocks behind it. Bursting
              every paragraph would turn a bio into a performance. */}
          <RevealText
            as="p"
            mode="burst"
            className="text-[length:var(--text-lg)] leading-snug text-fg"
          >
            I&rsquo;m Riyaz Malek, a UX designer based in Vadodara, India.
          </RevealText>
          <p>
            I started at CareerNaksha as a graphic designer in 2023. Six months
            in, I moved into UX — and within a year I was designing multi-role
            dashboards for students, counsellors and admins on a full platform
            redesign. No design team to hide behind, which turned out to be the
            fastest way to learn.
          </p>
          <p>
            Since then I&rsquo;ve designed 20+ websites for US non-profits at
            Thatha Business Development, and gone freelance in 2025 — SaaS
            platforms, EdTech assessments, and NGO sites.
          </p>
          <p>
            I&rsquo;m self-taught. I care less about how a screen looks than
            about why it works, and why sometimes it doesn&rsquo;t.
          </p>
        </RevealGroup>

        <figure className="overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)]">
          <ClipReveal>
            <Image
              {...imageProps("/riyaz/portrait.avif")}
              alt="Riyaz Malek, lit by teal and red window light."
              sizes="(max-width: 1024px) 100vw, 460px"
              className="h-auto w-full"
            />
          </ClipReveal>
        </figure>
      </div>

      {/* The one line worth remembering from this section, so it gets to be
          the only thing on its row. The rule draws down and the quote rises
          behind it — the line reads as something being marked, not decorated.

          Deliberately *not* `RevealText`: `splitText` rebuilds from
          `textContent`, which would throw away the `serif-em` on "Figma".
          `RevealGroup` moves the paragraph as one block and leaves its markup
          alone. */}
      <blockquote className="relative mt-20 pl-7">
        <DrawRule
          className="absolute left-0 top-0 h-full w-[2px] origin-top"
          style={{ background: "var(--accent)" }}
        />
        <RevealGroup y={16}>
          <p className="max-w-[28ch] text-[length:var(--text-2xl)] leading-[1.08] tracking-[-0.03em] text-fg">
            I ask a lot of questions before I open{" "}
            <span className="serif-em">Figma</span>. That&rsquo;s where most of
            the design actually happens.
          </p>
        </RevealGroup>
      </blockquote>
    </Section>
  );
}
