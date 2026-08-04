import Image from "next/image";
import { Section } from "./Section";
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
        <div className="flex flex-col gap-6 text-[length:var(--text-base)] leading-relaxed text-fg-muted">
          <p className="text-[length:var(--text-lg)] leading-snug text-fg">
            I&rsquo;m Riyaz Malek, a UX designer based in Vadodara, India.
          </p>
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
        </div>

        <figure className="overflow-hidden rounded-[var(--radius-squircle)] border border-[var(--border)]">
          <Image
            {...imageProps("/riyaz/portrait.avif")}
            alt="Riyaz Malek, lit by teal and red window light."
            sizes="(max-width: 1024px) 100vw, 460px"
            className="h-auto w-full"
          />
        </figure>
      </div>

      {/* The one line worth remembering from this section, so it gets to be
          the only thing on its row. */}
      <blockquote className="mt-20 border-l-2 pl-7" style={{ borderColor: "var(--accent)" }}>
        <p className="max-w-[28ch] text-[length:var(--text-2xl)] leading-[1.08] tracking-[-0.03em] text-fg">
          I ask a lot of questions before I open{" "}
          <span className="serif-em">Figma</span>. That&rsquo;s where most of
          the design actually happens.
        </p>
      </blockquote>
    </Section>
  );
}
