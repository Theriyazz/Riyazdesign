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

/** source (relative to repo root) -> output basename under public/ */
const JOBS = [
  ["Case Study Section Images/Cover Image ATRC.png", "work/atrc/cover"],
  ["Case Study Section Images/Cover Image CareerLogica.png", "work/careerlogica/cover"],
  ["Case Study Section Images/Cover Image Pecuc.png", "work/pecuc/cover"],
  ["Riyaz Images/Profile Riyaz.png", "riyaz/portrait"],
  ["Riyaz Images/Image 3 wide.png", "riyaz/wide"],
  ["Riyaz Images/Riyaz Image 2.png", "riyaz/alt-1"],
  ["Riyaz Images/Image 3.png", "riyaz/alt-2"],
];

/**
 * Tool ticker marks. Displayed at 84px (see ToolStack.tsx), well past the
 * 36x36 native size of the source PNGs — so unlike the photography above,
 * this job is an upscale, not a resize-down. There's no point pretending
 * otherwise with a placeholder (no extra detail is coming, and the file lands
 * before a placeholder could paint anyway); the honest move is to do the
 * upscale once, here, with a real resampler, instead of leaving the browser
 * to stretch a 36px file at display time.
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
