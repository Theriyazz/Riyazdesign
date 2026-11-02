/**
 * Converts the source PNGs into AVIF + WebP at their native size and emits a
 * manifest of intrinsic dimensions and blur placeholders.
 *
 * Each file is compressed by at most half against its lossless encode: the
 * lowest quality whose size is still at least 50% of lossless, and never below
 * MIN_QUALITY. Nothing is resized, so nothing loses resolution. next.config.ts
 * sets `images.unoptimized`, so these files are what the browser receives.
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

/** A file never drops below this share of its lossless size. */
const MIN_SHARE = 0.5;
const MIN_QUALITY = 70;
const MAX_QUALITY = 100;
const JOBS_AT_ONCE = 3;

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
  // Onboarding flow (03) and the three signup paths (03).
  "02",
  "signup-flows",
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
  ["work/atrc/Milestone Toast.png", "work/atrc/milestone-toast"],
  // The wireframe spread, exported into the careerlogica folder by mistake.
  // Pointed at where it actually sits rather than moved, so a re-export of that
  // same file lands in the same place without a second manual step.
  ["work/careerlogica/02.avif.png", "work/atrc/01"],
];

/* The Preloader used to cycle eight dedicated crops out of a `preload/` folder
   here. The intro is typographic now — a counter set large on three odometer
   columns, no imagery — so the job is gone and the sources under
   `Loading SCreen images/` are left unused rather than deleted. */

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
  // The still in the hero card. Remotion renders it as a JPEG, which also sits
  // in public/ as-is as riyaz-intro-poster.jpg.
  ["intro-video/brag-output/poster.jpg", "riyaz-intro-poster"],

  ...CAREERLOGICA_RESEARCH,
  ...CAREERLOGICA_WORK,
  ...PECUC,
  ...ATRC,
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

const manifest = {};

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

/**
 * The lowest quality at or above MIN_QUALITY whose output is still at least
 * MIN_SHARE of `lossless` bytes. A flat image can come in under that even at
 * full quality, and then full quality is what it gets.
 */
async function compress(input, encode, lossless) {
  const floor = lossless.length * MIN_SHARE;
  let low = MIN_QUALITY;
  let high = MAX_QUALITY;
  let best = await encode(sharp(input).rotate(), MAX_QUALITY);
  let quality = MAX_QUALITY;
  while (high - low > 2) {
    const mid = Math.round((low + high) / 2);
    const attempt = await encode(sharp(input).rotate(), mid);
    if (attempt.length >= floor) {
      best = attempt;
      quality = mid;
      high = mid;
    } else {
      low = mid;
    }
  }
  return { best, quality };
}

const avif = (image, quality) =>
  image.avif({ quality, effort: 4, chromaSubsampling: "4:4:4" }).toBuffer();
const webp = (image, quality) =>
  image.webp({ quality, effort: 4, smartSubsample: true }).toBuffer();

async function runJob([src, out], previous) {
  const srcPath = path.join(ROOT, src);
  if (!existsSync(srcPath)) {
    console.warn(`  skip  ${src} (not found)`);
    // Keep the built file working when its source is not on this machine.
    return previous ? { entry: previous, sourceSize: 0, outputSize: 0 } : null;
  }

  await mkdir(path.join(ROOT, "public", path.dirname(out)), { recursive: true });

  const base = path.join(ROOT, "public", out);
  const input = await readFile(srcPath);
  const meta = await sharp(input).rotate().metadata();

  const losslessAvif = await sharp(input).rotate()
    .avif({ lossless: true, effort: 4 }).toBuffer();
  const losslessWebp = await sharp(input).rotate()
    .webp({ lossless: true, effort: 4 }).toBuffer();

  const a = await compress(input, avif, losslessAvif);
  const w = await compress(input, webp, losslessWebp);
  await writeFile(`${base}.avif`, a.best);
  await writeFile(`${base}.webp`, w.best);

  // 20px blur placeholder, inlined as a data URI so there is no extra request.
  const blur = await sharp(input).rotate().resize({ width: 20 })
    .webp({ quality: 45 }).toBuffer();

  const saved = (100 - (a.best.length / losslessAvif.length) * 100).toFixed(0);
  console.log(
    `  ok    ${out}.avif  ${meta.width}x${meta.height}  q${a.quality}  ${kb(losslessAvif.length)} -> ${kb(a.best.length)}  (-${saved}%)`
  );

  return {
    entry: {
      width: meta.width,
      height: meta.height,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    },
    sourceSize: losslessAvif.length,
    outputSize: a.best.length,
  };
}

async function run() {
  let sourceTotal = 0;
  let outputTotal = 0;

  const manifestPath = path.join(ROOT, "lib", "image-manifest.json");
  const previous = existsSync(manifestPath)
    ? JSON.parse(await readFile(manifestPath, "utf8"))
    : {};

  const results = new Array(JOBS.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: JOBS_AT_ONCE }, async () => {
      while (next < JOBS.length) {
        const i = next++;
        results[i] = await runJob(JOBS[i], previous[`/${JOBS[i][1]}.avif`]);
      }
    })
  );

  // Filled in job order, so the manifest diff stays readable between runs.
  JOBS.forEach(([, out], i) => {
    const result = results[i];
    if (!result) return;
    manifest[`/${out}.avif`] = result.entry;
    sourceTotal += result.sourceSize;
    outputTotal += result.outputSize;
  });

  for (const [src, out] of ICON_JOBS) {
    const srcPath = path.join(ROOT, src);
    if (!existsSync(srcPath)) {
      console.warn(`  skip  ${src} (not found)`);
      continue;
    }

    await mkdir(path.join(ROOT, "public", path.dirname(out)), { recursive: true });

    const input = await readFile(srcPath);
    const dest = path.join(ROOT, "public", `${out}.webp`);
    // Native pixels, lossless. The old path resampled 136px up to 168px, which
    // adds no detail; the browser scales the true source instead.
    await sharp(input).webp({ lossless: true }).toFile(dest);

    const srcSize = (await stat(srcPath)).size;
    const outSize = (await stat(dest)).size;
    sourceTotal += srcSize;
    outputTotal += outSize;
    console.log(`  ok    ${out}.webp  ${kb(srcSize)} -> ${kb(outSize)}`);
  }

  await writeFile(
    manifestPath,
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
