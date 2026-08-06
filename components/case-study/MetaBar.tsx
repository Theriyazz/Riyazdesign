import type { CaseStudyMeta } from "@/lib/content";

/**
 * Role / Delivered / Tools / Platform / Industry / Timeline — the six facts a
 * recruiter checks first, in the order every case study source states them.
 *
 * Labels are `.label` (Geist 16px) rather than the old 12px mono: these are
 * read, not decoration, and at 12px in `--fg-subtle` they were the least
 * legible text on the page while carrying some of the most useful.
 */
export function MetaBar({ meta }: { meta: CaseStudyMeta }) {
  const rows: Array<[string, string]> = [
    ["Role", meta.role.join(", ")],
    ["Delivered", meta.delivered.join(", ")],
    ["Tools", meta.tools.join(", ")],
    ["Platform", meta.platform.join(", ")],
    ["Industry", meta.industry],
    ["Timeline", meta.timeline],
  ];

  return (
    <dl className="grid gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="bg-bg p-6">
          <dt className="label" style={{ color: "var(--case-accent)" }}>
            {label}
          </dt>
          <dd className="mt-2 text-[length:var(--text-sm)] leading-[1.6] text-fg">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
