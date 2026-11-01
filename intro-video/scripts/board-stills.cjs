/* Renders the positioning storyboard: every frame in every palette, plus one review sheet per palette.
   usage: node scripts/board-stills.cjs <outDir> <sheetDir> [themes, comma separated] [ids, comma separated] */
const { bundle } = require("@remotion/bundler");
const { openBrowser, renderStill, selectComposition } = require("@remotion/renderer");
const fs = require("fs");
const path = require("path");
const sharp = require(path.join(__dirname, "../../node_modules/sharp"));

const [out, sheets, themeArg, idArg] = process.argv.slice(2);
const ALL = ["1C", "2A", "3D", "3E", "3F", "4D", "4E", "4F", "5A", "6C-pecuc", "6C-careerlogica", "6C-atrc", "7A", "8A", "9C"];
const THEMES = ["lime-dark", "lime-light", "cobalt-dark", "cobalt-light", "clay-dark", "clay-light"];
const themes = themeArg ? themeArg.split(",") : THEMES;
const ids = idArg ? idArg.split(",") : ALL;

(async () => {
  const serveUrl = await bundle({ entryPoint: path.join(__dirname, "../src/index.ts") });
  const puppeteerInstance = await openBrowser("chrome");
  for (const theme of themes) {
    const dir = path.join(out, theme);
    fs.mkdirSync(dir, { recursive: true });
    for (const id of ids) {
      const inputProps = { id, theme };
      const composition = await selectComposition({ serveUrl, id: "PositioningBoard", inputProps, puppeteerInstance });
      await renderStill({ serveUrl, composition, inputProps, frame: 0, output: path.join(dir, `${id}.jpg`), imageFormat: "jpeg", jpegQuality: 86, scale: 0.625, puppeteerInstance });
    }
    const have = ALL.filter((id) => fs.existsSync(path.join(dir, `${id}.jpg`)));
    const W = 660, H = 371, cols = 3;
    const comp = [];
    for (let i = 0; i < have.length; i++) comp.push({ input: await sharp(path.join(dir, `${have[i]}.jpg`)).resize(W, H).toBuffer(), left: (i % cols) * (W + 6), top: Math.floor(i / cols) * (H + 6) });
    await sharp({ create: { width: cols * (W + 6), height: Math.ceil(have.length / cols) * (H + 6), channels: 3, background: "#777" } }).composite(comp).jpeg({ quality: 82 }).toFile(path.join(sheets, `${theme}.jpg`));
    console.log(theme, "done");
  }
  await puppeteerInstance.close({ silent: true });
})().catch((e) => { console.error(e); process.exit(1); });
