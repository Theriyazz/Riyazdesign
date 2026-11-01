import Image from "next/image";
import { Section } from "./Section";
import { ClipReveal } from "@/components/motion/ClipReveal";
import { RevealText, RevealGroup } from "@/components/motion/RevealText";
import { imageProps } from "@/lib/images";
import { site } from "@/lib/site";

const instagram = site.socials.find((s) => s.label === "Instagram")?.href ?? site.url;

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
            I&rsquo;m Riyaz Malek, a product designer in Vadodara, working with teams in India and the UAE.
          </RevealText>
          <p>
            I started in graphic design, moved into UX within six months, and have since designed EdTech platforms, SaaS
            dashboards and 20+ non-profit websites.
          </p>
          <p>
            I care less about how a screen looks than why it works, and I&rsquo;ll say so when it doesn&rsquo;t. I also
            teach early designers on{" "}
            <a href={instagram} target="_blank" rel="noreferrer noopener" className="link-sweep text-fg">
              Instagram
            </a>
            .
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
    </Section>
  );
}
