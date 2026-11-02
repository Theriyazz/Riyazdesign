/**
 * Cuts the silence off both ends of every clip in public/cl/vo, so a clip
 * placed at a frame starts speaking on that frame, and prints each length.
 * Run after make-vo.ps1, or after dropping in clips from another voice.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "cl", "vo");
const FLOOR = 0.012;

for (const name of readdirSync(DIR).filter((f) => f.endsWith(".wav")).sort()) {
  const file = readFileSync(join(DIR, name));
  let at = 12;
  let rate = 48000;
  let channels = 1;
  let body;
  while (at < file.length - 8) {
    const id = file.toString("ascii", at, at + 4);
    const size = file.readUInt32LE(at + 4);
    if (id === "fmt ") {
      channels = file.readUInt16LE(at + 10);
      rate = file.readUInt32LE(at + 12);
    }
    if (id === "data") {
      body = file.subarray(at + 8, Math.min(file.length, at + 8 + size));
      break;
    }
    at += 8 + size + (size % 2);
  }

  const step = channels * 2;
  const frames = Math.floor(body.length / step);
  const loud = (i) => Math.abs(body.readInt16LE(i * step)) / 32768 > FLOOR;
  let first = 0;
  let last = frames - 1;
  while (first < last && !loud(first)) first++;
  while (last > first && !loud(last)) last--;
  // Keep a breath of room so no consonant is clipped.
  first = Math.max(0, first - Math.round(rate * 0.01));
  last = Math.min(frames - 1, last + Math.round(rate * 0.04));

  const cut = body.subarray(first * step, (last + 1) * step);
  const head = Buffer.from(file.subarray(0, 44));
  head.write("RIFF", 0);
  head.writeUInt32LE(36 + cut.length, 4);
  head.write("WAVEfmt ", 8);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(channels, 22);
  head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * step, 28);
  head.writeUInt16LE(step, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36);
  head.writeUInt32LE(cut.length, 40);
  writeFileSync(join(DIR, name), Buffer.concat([head, cut]));
  console.log(`${name} ${((last - first + 1) / rate).toFixed(2)}s`);
}
