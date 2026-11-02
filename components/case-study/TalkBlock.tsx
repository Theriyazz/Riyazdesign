import { site } from "@/lib/site";
import { SplitButton } from "@/components/primitives/SplitButton";

/**
 * The end of a case study is where interest peaks, so it asks once, plainly,
 * before handing off to the next study.
 */
export function TalkBlock() {
  return (
    <section aria-label="Get in touch" className="shell mt-[var(--section-y)]">
      <div className="mx-auto max-w-[820px] border-t border-[var(--border)] pt-14">
        <h2 className="text-[length:var(--text-2xl)] max-md:leading-[1.125]">
          Want to talk about a problem <span className="serif-em">like this?</span>
        </h2>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <SplitButton href={`mailto:${site.email}`} emphasis track="email">
            Email me
          </SplitButton>
          <a
            href={site.resume}
            download
            data-track="resume"
            className="link-sweep mono inline-flex min-h-11 items-center text-fg-muted transition-colors duration-200 hover:text-fg"
          >
            Download resume (PDF)
          </a>
        </div>
      </div>
    </section>
  );
}
