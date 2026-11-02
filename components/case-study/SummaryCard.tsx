import type { CaseStudyMeta } from "@/lib/content";
import { MicroLabel } from "@/components/primitives/MicroLabel";

/**
 * The 30-second version, straight under the hook: the problem, who did what,
 * how long it took, the decision that shaped it, and what came of it. A
 * reader who stops here still leaves with the case. It also replaces the old
 * facts table and Deliverables chips, which repeated these same facts.
 */
export function SummaryCard({ meta }: { meta: CaseStudyMeta }) {
  const { summary } = meta;
  const rows: Array<[string, React.ReactNode]> = [
    ["Problem", summary.problem],
    ["My role", meta.role.join(", ")],
    ["Timeline", meta.timeline],
    ["Key decision", summary.decision],
    [
      "Outcomes",
      <ul key="o" className="flex flex-col gap-2">
        {summary.outcomes.map((o) => (
          <li key={o} className="flex gap-3">
            <span aria-hidden className="mt-[0.6em] h-[6px] w-[6px] shrink-0" style={{ background: "var(--case-accent)" }} />
            <span>{o}</span>
          </li>
        ))}
      </ul>,
    ],
  ];

  return (
    <section aria-label="Case study summary" className="mx-auto mt-14 max-w-[820px]">
      <MicroLabel>In 30 seconds</MicroLabel>
      <dl className="mt-5 grid gap-px border border-[var(--border)] bg-[var(--border)]">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-2 bg-bg p-6 md:grid-cols-[160px_1fr] md:gap-8">
            <dt className="label" style={{ color: "var(--case-accent)" }}>
              {label}
            </dt>
            <dd className="text-[length:var(--text-sm)] leading-[1.6] text-fg">{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
