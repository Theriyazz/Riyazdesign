import sharp from "sharp";
import { readdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const [src, out, portrait, manifest] = process.argv.slice(2);
const files = readdirSync(src).sort((a, b) => parseInt(a) - parseInt(b));
const rows = [];
for (const file of files) {
  const n = String(parseInt(file)).padStart(2, "0");
  // 900px is wider than any card is ever drawn; tall pages are cut to the fold.
  const meta = await sharp(path.join(src, file)).metadata();
  const width = Math.min(900, meta.width);
  const scaled = Math.round((meta.height * width) / meta.width);
  const height = Math.min(scaled, Math.round(width * 1.9));
  await sharp(path.join(src, file))
    .resize({ width })
    .extract({ left: 0, top: 0, width, height })
    .webp({ quality: 86 })
    .toFile(path.join(out, "screens", `${n}.webp`));
  rows.push(`  { file: "screens/${n}.webp", aspect: ${(width / height).toFixed(3)} },`);
  console.log(n, meta.width, meta.height, "->", width, height);
}
writeFileSync(manifest, `// Generated from the shared screen exports. aspect = width / height.\nexport const screens = [\n${rows.join("\n")}\n] as const;\n`);
await sharp(portrait).extract({ left: 500, top: 210, width: 520, height: 520 }).resize(400).webp({ quality: 88 }).toFile(path.join(out, "avatar.webp"));
