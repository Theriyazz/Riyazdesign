import { RevealGroup } from "@/components/motion/RevealText";
import { Section } from "./Section";

/**
 * The "good investment" case for a hiring manager, written as facts. Each
 * claim carries the project that proves it, so nothing here is an adjective
 * the reader has to take on trust.
 */
const POINTS = [
  {
    claim: "I start with the business problem.",
    proof:
      "At CareerLogica I argued for free access before the paywall, against every competitor, because trust drives the school sale.",
  },
  {
    claim: "I can own a product area on my own.",
    proof: "I was the only designer on 5 user roles and 140+ screens, from research to handoff.",
  },
  {
    claim: "I make complex things simple.",
    proof: "PECUC's navigation went from 37 items to 7, and content from 4 clicks to 2.",
  },
  {
    claim: "I build systems, not one-off screens.",
    proof: "One component library runs 4 dashboards.",
  },
];

export function WhatIBring() {
  return (
    <Section
      eyebrow="What I bring to a team"
      heading={
        <>
          Judgment you don&rsquo;t have to <span className="serif-em">supervise</span>
        </>
      }
    >
      <RevealGroup className="grid grid-cols-1 border-l border-t border-[var(--border)] md:grid-cols-2">
        {POINTS.map((p) => (
          <div key={p.claim} className="hover-row border-b border-r border-[var(--border)] p-7 md:p-9">
            <h3 className="text-[length:var(--text-lg)] leading-tight text-fg">{p.claim}</h3>
            <p className="mt-4 max-w-[52ch] text-[length:var(--text-sm)] leading-relaxed text-fg-muted">{p.proof}</p>
          </div>
        ))}
      </RevealGroup>
      <p className="mt-10 text-[length:var(--text-base)] text-fg-muted">
        I use AI to explore and test ideas faster. The judgment stays mine.
      </p>
    </Section>
  );
}
