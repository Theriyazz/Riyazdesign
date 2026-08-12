/**
 * Converts the source PNGs (1.6–2.4MB each) into web-ready AVIF + WebP and
 * emits a manifest of intrinsic dimensions and blur placeholders.
 *
 * We deliberately emit ONE large derivative per image rather than a full
 * width ladder: next/image already generates responsive sizes on demand, so
 * a ladder here would just duplicate that work. What this script is actually
 * for is getting the *source* off multi-megabyte PNG.
 *
 *   npm run images
 *
 * Source files stay where they are. Re-running is safe and idempotent.
 */

import { readFile, writeFile, mkdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/**
 * CareerLogica research artifacts, in the order they were made: who it is for,
 * how it is structured, then how it lays out. Numbered so the carousel order is
 * readable here as well as in the MDX.
 *
 * These are tall boards rather than single screens, so they get the same
 * one-at-a-time treatment as the shipped screens — a wireframe set squeezed
 * beside another artifact is a wireframe set nobody can read.
 */
const CAREERLOGICA_RESEARCH = [
  ["CareerLogica Images/Persona.png", "research-01-persona"],
  ["CareerLogica Images/Sitemaps.png", "research-02-sitemap"],
  // Source filename is misspelled ("Wirerfames"). Matched exactly rather than
  // corrected — the build reads this string, so it has to be what is on disk.
  ["CareerLogica Images/Wirerfames Website.png", "research-03-wireframes-web"],
  ["CareerLogica Images/Wireframes Dashboard.png", "research-04-wireframes-dashboard"],
].map(([src, name]) => [src, `work/careerlogica/${name}`]);

/**
 * CareerLogica shipped screens and the two dashboard comparison shots.
 *
 * The screens feed `<ScreenCarousel>`, which shows one at a time at ~705px
 * rather than nine at once at ~260px. That is the whole reason they are
 * separate files: a composed 3x3 board cannot be shown one screen at a time.
 *
 * Sources carry a `.avif.png` double extension — they are PNGs named after the
 * AVIF they become. Left exactly as exported rather than renamed, because this
 * string has to match what is on disk, and a rename is one more step to forget
 * on the next export.
 */
const CAREERLOGICA_WORK = [
  "student-01-dashboard",
  "student-02-counselling",
  "student-03-sessions",
  "student-04-profile",
  "student-05-admissions",
  "student-06-library",
  "student-07-payment",
  "student-08-plan",
  "student-09-active-plan",
  "counsellor-01-dashboard",
  "counsellor-02-test-codes",
  "counsellor-03-student-connect",
  "counsellor-04-appointments",
  "school-01-dashboard",
  "school-02-students",
  "school-03-test-codes",
  "school-04-add-codes",
  "admin-01-dashboard",
  "admin-02-users",
  "admin-03-verification",
  "admin-04-payments",
  // The CareerNaksha / CareerLogica pair in section 05.
  "dash-old",
  "dash-new",
  // Onboarding flow (03), the three signup paths (03), and the EN/AR pair (06).
  "02",
  "signup-flows",
  "en",
  "ar",
  // The marketing pages, full scroll (section 04). Numbered 04 in the export
  // even though it is section 04's only figure — the MDX points at this name
  // rather than the file being renamed, so the two cannot drift apart.
  "04",
].map((name) => [
  `CareerLogica Images/Work/careerlogica/${name}.avif.png`,
  `work/careerlogica/${name}`,
]);

/**
 * Every PECUC figure, exported under the name the MDX references it by.
 *
 * Sources carry the same `.avif.png` double extension as the CareerLogica
 * screens — PNGs named after the AVIF they become, left exactly as exported
 * because this string has to match what is on disk.
 *
 * `cover` and `thumbnail` are two separate crops of the same shot, not one
 * file pointed at twice: the case study hero is 2.22:1 and the homepage work
 * card crops 4:5, and neither ratio survives the other's file.
 */
const PECUC = [
  ...[
    "01",
    "sitemap-ia",
    "nav-old",
    "nav-new",
    "03",
    "layout-v1",
    "layout-v2",
    "05",
    "donation",
    "volunteer",
    "ba-01-old",
    "ba-01-new",
    "ba-02-old",
    "ba-02-new",
    "ba-03-old",
    "ba-03-new",
    "ba-04-old",
    "ba-04-new",
    "cover",
  ].map((name) => [`work/pecuc/${name}.avif.png`, `work/pecuc/${name}`]),
  // Capital T, unlike the rest of the set. Matched as it is rather than
  // renamed on disk, for the same reason as the double extension.
  ["work/pecuc/Thumbnail.avif.png", "work/pecuc/thumbnail"],
];

/**
 * ATRC, same convention as PECUC — one source per name the MDX references.
 *
 * `cover` (2.22:1) and `thumbnail` (1.33:1) are again two separate crops, so
 * the wide case study hero and the 4:5 work card each get a file that survives
 * its own aspect ratio.
 */
const ATRC = [
  ...[
    "proto-consumer",
    "proto-institutional",
    "pause",
    "still-there",
    "03",
    "cover",
  ].map((name) => [`work/atrc/${name}.avif.png`, `work/atrc/${name}`]),
  ["work/atrc/Thumbnail.avif.png", "work/atrc/thumbnail"],
  ["work/atrc/User Flow.png", "work/atrc/user-flow"],
  ["work/atrc/Iteration 3.png", "work/atrc/iteration-3"],
  // The wireframe spread, exported into the careerlogica folder by mistake.
  // Pointed at where it actually sits rather than moved, so a re-export of that
  // same file lands in the same place without a second manual step.
  ["work/careerlogica/02.avif.png", "work/atrc/01"],
];

/**
 * The Preloader's eight-image cycle. Own top-level folder, same reasoning as
 * `riyaz/` and `tools/`: these previews aren't owned by any one case study, so
 * they don't belong under `work/`.
 *
 * Ordered as a sequence rather than by source filename: three sources already
 * carry a "03"/"04"/"05" position from how they were exported, so those hold
 * their spot; the rest are placed around them — a cover and a thumbnail to
 * open, two screens and a before/after in the run, a portrait to close, the
 * same shape as the old six-image cycle.
 */
const PRELOAD = [
  ["Loading SCreen images/Cover Image ATRC.png", "preload/01"],
  ["Loading SCreen images/Thumbnail.avif.png", "preload/02"],
  ["Loading SCreen images/03.avif.png", "preload/03"],
  ["Loading SCreen images/04.avif.png", "preload/04"],
  ["Loading SCreen images/05.avif.png", "preload/05"],
  ["Loading SCreen images/counsellor-01-dashboard.avif.png", "preload/06"],
  ["Loading SCreen images/ba-01-new.avif.png", "preload/07"],
  ["Loading SCreen images/Image 3 wide.png", "preload/08"],
];

/** source (relative to repo root) -> output basename under public/ */
const JOBS = [
  // The wide (~2.2:1) case study hero.
  [
    "CareerLogica Images/Work/careerlogica/Main COver Image of CareerLogica Case Study/Main COver Image of CareerLogica Case Study.png",
    "work/careerlogica/cover",
  ],
  // The 1.33:1 crop of the same shot for the homepage work card, which crops
  // 4:5 and would lose the laptop out of the wide one. Capital C on the
  // directory is what is on disk — matched, not corrected.
  ["work/work/Careerlogica/Thumbnail.avif.png", "work/careerlogica/thumbnail"],
  ["Riyaz Images/Profile Riyaz.png", "riyaz/portrait"],
  ["Riyaz Images/Image 3 wide.png", "riyaz/wide"],
  ["Riyaz Images/Riyaz Image 2.png", "riyaz/alt-1"],
  ["Riyaz Images/Image 3.png", "riyaz/alt-2"],

  ...CAREERLOGICA_RESEARCH,
  ...CAREERLOGICA_WORK,
  ...PECUC,
  ...ATRC,
  ...PRELOAD,
];

/**
 * Tool ticker marks. Displayed at 84px (see ToolStack.tsx) and exported at 2x
 * for retina, so 168px out of a 136x136 source — a mild upscale. Doing it here
 * with lanczos3 beats leaving the browser to stretch the file at display time.
 * No placeholder: no extra detail is coming, and the file lands before a
 * placeholder could paint anyway.
 *
 * ICON_DISPLAY_PX * ICON_EXPORT_SCALE sets the exported size: scale 2 covers
 * retina at the current display size without re-running this for every future
 * size change. WebP only (AVIF measured LARGER at this size), and no manifest
 * entry, because the ticker sets width/height in markup instead.
 *
 * source (relative to repo root) -> output basename under public/
 */
const ICON_DISPLAY_PX = 84;
const ICON_EXPORT_SCALE = 2;
const ICON_JOBS = [
  ["Tools Icon/Figma.png", "tools/figma"],
  ["Tools Icon/Framer.png", "tools/framer"],
  ["Tools Icon/Miro.png", "tools/miro"],
  ["Tools Icon/Relume.png", "tools/relume"],
  ["Tools Icon/Mobin.png", "tools/mobin"],
  ["Tools Icon/Claude.png", "tools/claude"],
  ["Tools Icon/Chatgpt.png", "tools/chatgpt"],
  ["Tools Icon/Antigravity.png", "tools/antigravity"],
  ["Tools Icon/GitHub.png", "tools/github"],
];

const MAX_WIDTH = 2560;
const manifest = {};

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

async function run() {
  let sourceTotal = 0;
  let outputTotal = 0;

  for (const [src, out] of JOBS) {
    const srcPath = path.join(ROOT, src);
    if (!existsSync(srcPath)) {
      console.warn(`  skip  ${src} (not found)`);
      continue;
    }

    const outDir = path.join(ROOT, "public", path.dirname(out));
    await mkdir(outDir, { recursive: true });

    const base = path.join(ROOT, "public", out);
    const input = await readFile(srcPath);
    const pipeline = sharp(input).rotate();
    const meta = await pipeline.metadata();

    const width = Math.min(meta.width ?? MAX_WIDTH, MAX_WIDTH);
    const height = Math.round(((meta.height ?? width) * width) / (meta.width ?? width));

    await sharp(input).rotate().resize({ width, withoutEnlargement: true })
      .avif({ quality: 62, effort: 6 }).toFile(`${base}.avif`);

    await sharp(input).rotate().resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 }).toFile(`${base}.webp`);

    // 20px blur placeholder, inlined as a data URI so there is no extra request.
    const blur = await sharp(input).rotate().resize({ width: 20 })
      .webp({ quality: 45 }).toBuffer();

    manifest[`/${out}.avif`] = {
      width,
      height,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    };

    const srcSize = (await stat(srcPath)).size;
    const avifSize = (await stat(`${base}.avif`)).size;
    sourceTotal += srcSize;
    outputTotal += avifSize;

    const saved = (100 - (avifSize / srcSize) * 100).toFixed(0);
    console.log(
      `  ok    ${out}.avif  ${width}x${height}  ${kb(srcSize)} -> ${kb(avifSize)}  (-${saved}%)`
    );
  }

  for (const [src, out] of ICON_JOBS) {
    const srcPath = path.join(ROOT, src);
    if (!existsSync(srcPath)) {
      console.warn(`  skip  ${src} (not found)`);
      continue;
    }

    await mkdir(path.join(ROOT, "public", path.dirname(out)), { recursive: true });

    const input = await readFile(srcPath);
    const dest = path.join(ROOT, "public", `${out}.webp`);
    const exportPx = ICON_DISPLAY_PX * ICON_EXPORT_SCALE;
    await sharp(input)
      .resize(exportPx, exportPx, { kernel: "lanczos3" })
      .webp({ quality: 92 })
      .toFile(dest);

    const srcSize = (await stat(srcPath)).size;
    const outSize = (await stat(dest)).size;
    sourceTotal += srcSize;
    outputTotal += outSize;
    console.log(`  ok    ${out}.webp  ${kb(srcSize)} -> ${kb(outSize)}`);
  }

  await writeFile(
    path.join(ROOT, "lib", "image-manifest.json"),
    JSON.stringify(manifest, null, 2) + "\n"
  );

  if (sourceTotal > 0) {
    console.log(
      `\n  total ${kb(sourceTotal)} -> ${kb(outputTotal)}  (-${(
        100 - (outputTotal / sourceTotal) * 100
      ).toFixed(0)}%)\n`
    );
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
