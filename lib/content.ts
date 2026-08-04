import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

const WORK_DIR = path.join(process.cwd(), "content", "work");

/**
 * Frontmatter contract for a case study.
 *
 * This is strict on purpose. A missing `outcome` or a malformed `metrics`
 * entry fails the build rather than quietly rendering an empty band — a
 * half-populated case study is worse than a loud error at build time.
 */
export const caseStudySchema = z.object({
  slug: z.string().min(1),
  index: z.string().regex(/^\d{3}$/, "index must be a 3-digit string, e.g. '001'"),
  title: z.string().min(1),
  /** One line, always visible on the work card. */
  subtitle: z.string().min(1),
  /** The paragraph the work card reveals on hover/focus. */
  detail: z.string().min(1),
  role: z.array(z.string()).min(1),
  timeline: z.string().min(1),
  team: z.string().min(1),
  platform: z.array(z.string()).min(1),
  tools: z.array(z.string()).min(1),
  cover: z.string().startsWith("/"),
  /** Client brand color, scoped to this case study only. */
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  outcome: z.string().min(1),
  /** Omit entirely when there are no real numbers. Never invent them. */
  metrics: z
    .array(z.object({ value: z.string().min(1), label: z.string().min(1) }))
    .min(2)
    .max(4)
    .optional(),
  collaborator: z.string().optional(),
  year: z.string().min(4),
  featured: z.boolean().default(false),
  order: z.number().int().default(99),
  draft: z.boolean().default(false),
});

export type CaseStudyMeta = z.infer<typeof caseStudySchema>;
export interface CaseStudy {
  meta: CaseStudyMeta;
  body: string;
}

async function readOne(file: string): Promise<CaseStudy> {
  const raw = await readFile(path.join(WORK_DIR, file), "utf8");
  const { data, content } = matter(raw);

  const parsed = caseStudySchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid frontmatter in content/work/${file}:\n` +
        parsed.error.issues
          .map((i) => `  · ${i.path.join(".") || "(root)"}: ${i.message}`)
          .join("\n")
    );
  }

  const expected = file.replace(/\.mdx$/, "");
  if (parsed.data.slug !== expected) {
    throw new Error(
      `Slug mismatch in content/work/${file}: frontmatter says "${parsed.data.slug}" but the filename says "${expected}".`
    );
  }

  return { meta: parsed.data, body: content };
}

export async function getAllCaseStudies(): Promise<CaseStudy[]> {
  const files = (await readdir(WORK_DIR)).filter((f) => f.endsWith(".mdx"));
  const all = await Promise.all(files.map(readOne));
  return all
    .filter((c) => !c.meta.draft || process.env.NODE_ENV === "development")
    .sort((a, b) => a.meta.order - b.meta.order);
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  const all = await getAllCaseStudies();
  return all.find((c) => c.meta.slug === slug) ?? null;
}

/** The case study that follows `slug`, wrapping at the end. */
export async function getNextCaseStudy(slug: string): Promise<CaseStudyMeta | null> {
  const all = await getAllCaseStudies();
  if (all.length < 2) return null;
  const i = all.findIndex((c) => c.meta.slug === slug);
  if (i === -1) return null;
  return all[(i + 1) % all.length].meta;
}
