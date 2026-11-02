/* Cuts the illustration out of its cream ground by flood-filling from the edges,
   so inner lights (shirt, sneakers) stay solid, and bakes one tile of film grain. */
const sharp = require("sharp");
const path = require("path");
const out = path.join(__dirname, "../public/trio");

(async () => {
  const { data, info } = await sharp(path.join(__dirname, "../public/hello/illustration.webp"))
    .ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const at = (x, y) => (y * w + x) * 4;
  const seen = new Uint8Array(w * h);
  const bg = [data[0], data[1], data[2]];
  const dist = (i) => Math.hypot(data[i] - bg[0], data[i + 1] - bg[1], data[i + 2] - bg[2]);
  const stack = [];
  for (let x = 0; x < w; x++) stack.push([x, 0], [x, h - 1]);
  for (let y = 0; y < h; y++) stack.push([0, y], [w - 1, y]);
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || y < 0 || x >= w || y >= h || seen[y * w + x]) continue;
    const i = at(x, y);
    if (dist(i) > 30) continue;
    seen[y * w + x] = 1;
    data[i + 3] = 0;
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }
  // feather one pixel so the edge is not jagged on saturated grounds
  const a = Buffer.from(data);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = at(x, y);
    if (data[i + 3] === 0) continue;
    if (seen[y * w + x - 1] || seen[y * w + x + 1] || seen[(y - 1) * w + x] || seen[(y + 1) * w + x]) a[i + 3] = 150;
  }
  await sharp(a, { raw: { width: w, height: h, channels: 4 } }).webp({ quality: 95, alphaQuality: 100 }).toFile(path.join(out, "riyaz-cut.webp"));
  const box = await sharp(a, { raw: { width: w, height: h, channels: 4 } }).trim().toBuffer({ resolveWithObject: true });
  console.log("cut trim", box.info.width, box.info.height, box.info.trimOffsetLeft, box.info.trimOffsetTop, "bg", bg);

  const N = 512, n = Buffer.alloc(N * N * 4);
  for (let i = 0; i < N * N; i++) { const v = Math.random() * 255; n[i * 4] = n[i * 4 + 1] = n[i * 4 + 2] = v; n[i * 4 + 3] = 255; }
  await sharp(n, { raw: { width: N, height: N, channels: 4 } }).png().toFile(path.join(out, "grain.png"));
  // preview on a saturated ground to check the cut
  await sharp({ create: { width: w, height: h, channels: 3, background: "#ff4b1f" } })
    .composite([{ input: path.join(out, "riyaz-cut.webp") }]).jpeg().toFile(path.join(process.argv[2], "cut-check.jpg"));
})();
