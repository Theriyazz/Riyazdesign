import type { CaseStudyMeta } from "@/lib/content";

/** Role / Timeline / Team / Platform / Tools — the facts a recruiter checks first. */
export function MetaBar({ meta }: { meta: CaseStudyMeta }) {
  const rows: Array<[string, string]> = [
    ["Role", meta.role.join(", ")],
    ["Timeline", meta.timeline],
    ["Team", meta.team],
    ["Platform", meta.platform.join(", ")],
    ["Tools", meta.tools.join(", ")],
  ];

  return (
    <dl className="grid grid-cols-2 border-l border-t border-[var(--border)] sm:grid-cols-3 lg:grid-cols-5">
      {rows.map(([label, value]) => (
        <div key={label} className="border-b border-r border-[var(--border)] p-5">
          <dt className="mono text-fg-subtle">{label}</dt>
          <dd className="mt-2 text-[length:var(--text-sm)] leading-snug text-fg">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Large figures, rendered only when the frontmatter actually carries them.
 * The schema makes `metrics` optional precisely so an absent number stays
 * absent rather than becoming a plausible-looking invention.
 */
export function MetricsBand({ meta }: { meta: CaseStudyMeta }) {
  if (!meta.metrics?.length) return null;

  return (
    <div className="my-16 grid gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
      {meta.metrics.map((m) => (
        <div key={m.label} className="bg-bg p-7">
          <span
            className="block font-medium leading-none tracking-[-0.04em]"
            style={{ fontSize: "var(--text-metric)", color: "var(--case-accent)" }}
          >
            {m.value}
          </span>
          <span className="mono mt-3 block text-fg-muted">{m.label}</span>
        </div>
      ))}
    </div>
  );
}
