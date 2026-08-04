import { site } from "@/lib/site";
import { Section } from "./Section";

/**
 * The giant email address as the closing CTA. A real mailto beats a contact
 * form here: no backend, no spam trap, and it lands in a thread the sender
 * already controls.
 */
export function ContactCTA() {
  return (
    <Section id="contact" eyebrow={site.availableLabel} heading="Let's talk">
      <p className="max-w-[46ch] text-[length:var(--text-lg)] leading-snug text-fg-muted">
        Have a role, a project, or a problem worth solving? Send it over — I
        reply within a day.
      </p>

      <a
        href={`mailto:${site.email}`}
        data-cursor="text"
        className="mt-12 block w-full break-all font-medium leading-[1.02] tracking-[-0.04em] text-fg transition-colors duration-300 hover:text-[var(--accent)]"
        style={{ fontSize: "var(--text-email)" }}
      >
        {site.email}
      </a>

      <ul className="mt-14 flex flex-wrap gap-x-7 gap-y-3">
        {site.socials.map((s) => (
          <li key={s.label}>
            <a
              href={s.href}
              className="mono text-fg-muted underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline hover:decoration-[var(--accent)]"
              {...(s.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer noopener" }
                : {})}
            >
              {s.label}
            </a>
          </li>
        ))}
        <li>
          <a
            href={site.resume}
            download
            className="mono text-fg-muted underline-offset-4 transition-colors duration-200 hover:text-fg hover:underline hover:decoration-[var(--accent)]"
          >
            Resume
          </a>
        </li>
      </ul>
    </Section>
  );
}
