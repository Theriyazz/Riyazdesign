/* Renders review stills for the trio films into one contact sheet per film.
   usage: node scripts/trio-stills.cjs <outDir> [Why,Cut,File] [seconds,comma,list] */
const { bundle } = require("@remotion/bundler");
const { renderStill, selectComposition } = require("@remotion/renderer");
const path = require("path");
const fs = require("fs");
const sharp = require(path.join(__dirname, "../../node_modules/sharp"));

const out = process.argv[2];
const films = (process.argv[3] || "Why,Cut,File").split(",");
const times = (process.argv[4] || "0,0.8,1.5,1.9,2.2,2.7,3.4,4.6,6,7,8.5,10,11.5,13.5,15,16.5,18,20,21,23,25,26.5,28,29.5,31,32.5,33.5,35.5,37,37.98").split(",").map(Number);

(async () => {
  const serveUrl = await bundle({ entryPoint: path.join(__dirname, "../src/index.ts") });
  for (const film of films) {
    const id = `Trio-${film}`;
    const composition = await selectComposition({ serveUrl, id });
    const dir = path.join(out, film);
    fs.mkdirSync(dir, { recursive: true });
    const files = [];
    for (const t of times) {
      const file = path.join(dir, `t${t}.jpg`);
      await renderStill({ serveUrl, composition, frame: Math.min(composition.durationInFrames - 1, Math.round(t * 60)), output: file, imageFormat: "jpeg", jpegQuality: 75, scale: 0.34 });
      files.push(file);
    }
    const W = Math.round(1920 * 0.34), H = Math.round(1080 * 0.34), cols = 5;
    const comp = files.map((input, i) => ({ input, left: (i % cols) * (W + 6), top: Math.floor(i / cols) * (H + 6) }));
    await sharp({ create: { width: cols * (W + 6), height: Math.ceil(files.length / cols) * (H + 6), channels: 3, background: "#777" } })
      .composite(comp).jpeg({ quality: 82 }).toFile(path.join(out, `${film}.jpg`));
    console.log(film, "done");
  }
})().catch((e) => { console.error(e); process.exit(1); });
