/* Turns the Figma exports into web-weight stills: every screen to webp, and PECUC's
   long pages into 16:10 tiles for the horizontal rows. Blank-looking tiles are dropped. */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "../public/film");
(async () => {
  for (const client of ["careerlogica", "pecuc", "atrc"]) {
    const dir = path.join(root, client);
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".png"))) {
      const src = path.join(dir, f);
      if (client === "pecuc") {
        const m = await sharp(src).metadata();
        const h = Math.round(m.width / 1.6);
        let kept = 0;
        for (let i = 0; (i + 1) * h <= m.height; i++) {
          const buf = await sharp(src).extract({ left: 0, top: i * h, width: m.width, height: h }).resize({ width: 960 }).toBuffer();
          const { channels } = await sharp(buf).stats();
          const sd = channels.slice(0, 3).reduce((a, c) => a + c.stdev, 0) / 3;
          if (sd < 26) continue;
          await sharp(buf).webp({ quality: 80 }).toFile(path.join(dir, `${f.replace(".png", "")}-${String(i).padStart(2, "0")}.webp`));
          kept++;
        }
        console.log(f, m.width, m.height, "tiles", kept);
      } else {
        await sharp(src).webp({ quality: 82 }).toFile(src.replace(".png", ".webp"));
        const m = await sharp(src).metadata();
        console.log(client, f, m.width, m.height);
      }
    }
  }
})();
