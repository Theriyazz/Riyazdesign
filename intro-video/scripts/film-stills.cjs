/* Renders review stills of one film at given seconds into a contact sheet.
   usage: node scripts/film-stills.cjs <compId> <sheet.jpg> <seconds, comma separated> [columns] */
const { bundle } = require("@remotion/bundler");
const { openBrowser, renderStill, selectComposition } = require("@remotion/renderer");
const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require(path.join(__dirname, "../../node_modules/sharp"));

const [id, sheet, list, colsArg] = process.argv.slice(2);
const times = list.split(",").map(Number);
const cols = Number(colsArg || 5);

(async () => {
  const serveUrl = await bundle({ entryPoint: path.join(__dirname, "../src/index.ts") });
  const puppeteerInstance = await openBrowser("chrome");
  const composition = await selectComposition({ serveUrl, id, puppeteerInstance });
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "stills-"));
  const comp = [];
  const W = Math.round(1920 * 0.3), H = Math.round(1080 * 0.3);
  for (let i = 0; i < times.length; i++) {
    const file = path.join(dir, `${i}.jpg`);
    await renderStill({ serveUrl, composition, frame: Math.min(composition.durationInFrames - 1, Math.round(times[i] * 60)), output: file, imageFormat: "jpeg", jpegQuality: 78, scale: 0.3, puppeteerInstance });
    comp.push({ input: file, left: (i % cols) * (W + 5), top: Math.floor(i / cols) * (H + 5) });
  }
  await sharp({ create: { width: cols * (W + 5), height: Math.ceil(times.length / cols) * (H + 5), channels: 3, background: "#666" } }).composite(comp).jpeg({ quality: 82 }).toFile(sheet);
  await puppeteerInstance.close({ silent: true });
  console.log("done", times.length);
})().catch((e) => { console.error(e); process.exit(1); });
