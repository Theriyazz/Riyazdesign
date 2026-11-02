import { site } from "@/lib/site";
import { Section } from "./Section";
import { RevealGroup } from "@/components/motion/RevealText";

/**
 * One line for the team that is hiring, then the giant email address as the
 * action. A real mailto beats a contact form here: no backend, no spam trap,
 * and it lands in a thread the sender already controls.
 */
export function ContactCTA() {
  return (
    <Section id="contact" eyebrow={site.availableLabel} heading="Let's talk">
      <RevealGroup y={18} className="max-w-[46ch]">
        <p className="text-[length:var(--text-lg)] leading-snug text-fg-muted">
          <span className="text-fg">Hiring a product designer?</span> I&rsquo;m looking for a team where I can own a
          product area.{" "}
          <a href={site.resume} download data-track="resume" className="link-sweep text-fg">
            Here&rsquo;s my resume.
          </a>
        </p>
      </RevealGroup>

      {/* Rises as one block rather than word by word. At this size the address
          wraps mid-token on a narrow screen, and a per-word split would give
          each fragment of the address its own entrance. */}
      <RevealGroup y={24} className="mt-14">
        <a
          href={`mailto:${site.email}`}
          data-cursor="text"
          data-track="email"
          className="block min-h-11 w-full break-all py-2 font-medium leading-[1.02] tracking-[-0.04em] text-fg transition-colors duration-300 hover:text-[var(--accent)]"
          style={{ fontSize: "var(--text-email)" }}
        >
          {site.email}
        </a>
      </RevealGroup>

      {/* Email is filtered out rather than removed from `site.socials`: the
          giant mailto above is the same link at 20x the size, and a second
          "Email" three rows under it reads as a different destination. Every
          link is at least 44px tall, so the row works as tap targets. */}
      <ul className="mt-12 flex flex-wrap gap-x-7">
        {site.socials
          .filter((s) => s.label !== "Email")
          .map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                className="link-sweep mono inline-flex min-h-11 items-center text-fg-muted transition-colors duration-200 hover:text-fg"
                {...(s.href.startsWith("http") ? { target: "_blank", rel: "noreferrer noopener" } : {})}
              >
                {s.label}
              </a>
            </li>
          ))}
        <li>
          <a
            href={site.resume}
            download
            data-track="resume"
            className="link-sweep mono inline-flex min-h-11 items-center text-fg-muted transition-colors duration-200 hover:text-fg"
          >
            Resume
          </a>
        </li>
      </ul>
    </Section>
  );
}
