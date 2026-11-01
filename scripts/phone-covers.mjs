/**
 * Writes a downsized, lossy `cover-phone.avif` beside each project's cover.
 *
 * The one deliberate exception to optimize-images.mjs, which keeps everything
 * lossless at native size. next.config.ts sets `images.unoptimized`, so without
 * this a phone downloads the full 3214px cover to fill a card ~400px wide. The
 * work card serves these below `md` (see WorkCard.tsx).
 *
 * 1200px covers a 400px card at 3x. Reads the lossless cover in public/, so it
 * runs after optimize-images.mjs and needs no source PNG.
 *
 *   npm run images
 */

import { readdir, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WORK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../public/work");
const WIDTH = 1200;
const QUALITY = 60;

const kb = (n) => `${(n / 1024).toFixed(0)}KB`;

for (const project of await readdir(WORK)) {
  const cover = path.join(WORK, project, "cover.avif");
  if (!existsSync(cover)) continue;

  const out = path.join(WORK, project, "cover-phone.avif");
  await sharp(cover)
    .resize({ width: WIDTH })
    .avif({ quality: QUALITY, effort: 6 })
    .toFile(out);

  console.log(
    `  ok    ${project}/cover-phone.avif  ${kb((await stat(cover)).size)} -> ${kb((await stat(out)).size)}`
  );
}
