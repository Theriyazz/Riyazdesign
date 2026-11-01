/* Mixes the two soundtracks and muxes them onto the picture.
   usage: node scripts/film-mix.cjs <folder holding picture.mp4, sfx.wav and music.wav> */
const { execFileSync, spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const dir = process.argv[2];
const bin = path.join(__dirname, "../node_modules/@remotion/compositor-win32-x64-msvc");
const ffmpeg = path.join(bin, "ffmpeg.exe");
const p = (n) => path.join(dir, n);
const TARGET = "I=-16:TP=-1.5:LRA=11";

/** Two-pass loudness normalise, the accurate way for a short file. */
const measure = (input) => {
  const r = spawnSync(ffmpeg, ["-hide_banner", "-i", input, "-af", `loudnorm=${TARGET}:print_format=json`, "-f", "null", "-"], { encoding: "utf8" });
  const text = r.stderr;
  return JSON.parse(text.slice(text.lastIndexOf("{"), text.lastIndexOf("}") + 1));
};
const normalise = (input, output) => {
  const m = measure(input);
  const af = `loudnorm=${TARGET}:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;
  execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", input, "-af", `${af},aresample=48000`, output]);
  const after = measure(output);
  console.log(path.basename(output).padEnd(22), "in", m.input_i, "LUFS  out", after.input_i, "LUFS  true peak", after.input_tp, "dBTP");
};

// The music sits under the effects, so a hit still reads as a hit.
execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", p("sfx.wav"), "-i", p("music.wav"), "-filter_complex", "[1:a]volume=0.62[m];[0:a]volume=0.85[s];[m][s]amix=inputs=2:normalize=0:duration=first[out]", "-map", "[out]", p("mix-raw.wav")]);
normalise(p("sfx.wav"), p("audio-sfx.wav"));
normalise(p("mix-raw.wav"), p("audio-music-sfx.wav"));
fs.unlinkSync(p("mix-raw.wav"));

const mux = (audio, master, web) => {
  execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", p("picture.mp4"), "-i", p(audio), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", p(master)]);
  execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", p("picture.mp4"), "-i", p(audio), "-map", "0:v:0", "-map", "1:a:0", "-c:v", "libx264", "-preset", "slow", "-crf", "31", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-shortest", "-movflags", "+faststart", p(web)]);
};
mux("audio-sfx.wav", "riyaz-intro-sfx.mp4", "riyaz-intro-sfx-web.mp4");
mux("audio-music-sfx.wav", "riyaz-intro-music-sfx.mp4", "riyaz-intro-music-sfx-web.mp4");
execFileSync(ffmpeg, ["-y", "-hide_banner", "-loglevel", "error", "-i", p("picture.mp4"), "-frames:v", "1", "-q:v", "2", p("poster.jpg")]);
for (const f of fs.readdirSync(dir)) console.log(f.padEnd(34), (fs.statSync(p(f)).size / 1048576).toFixed(2), "MB");
