// Renders chosen frames of Hello-16x9 as PNGs, bundling once.
//   node scripts/hello-stills.mjs <outDir> <frame> [frame...]   (COMP=Hello2-16x9 for the kinetic cut)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [outDir, ...frames] = process.argv.slice(2);
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
const composition = await selectComposition({ serveUrl, id: process.env.COMP || "Hello-16x9" });
console.log("frames:", composition.durationInFrames);
for (const frame of frames.map(Number)) {
  const output = path.join(outDir, `f${String(frame).padStart(4, "0")}.png`);
  await renderStill({ serveUrl, composition, frame, output, scale: 0.5 });
  console.log(output);
}
