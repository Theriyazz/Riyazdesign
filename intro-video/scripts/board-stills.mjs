// Renders every storyboard variation as a JPEG, bundling once.
//   node scripts/board-stills.mjs <outDir> [id...]
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { mkdirSync } from "node:fs";
import path from "node:path";

const [outDir, ...only] = process.argv.slice(2);
const ids = only.length ? only : [1, 2, 3, 4, 5, 6, 7, 8].flatMap((n) => ["A", "B", "C"].map((v) => `${n}${v}`));
mkdirSync(outDir, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const id of ids) {
  const composition = await selectComposition({ serveUrl, id: "Board", inputProps: { id } });
  const output = path.join(outDir, `${id}.jpg`);
  await renderStill({ serveUrl, composition, frame: 0, output, inputProps: { id }, imageFormat: "jpeg", jpegQuality: 88 });
  console.log(output);
}
