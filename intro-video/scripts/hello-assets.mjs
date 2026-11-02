// Crops the portfolio's composed screenshots down to the bare screen so they
// can sit inside drawn device frames. Run from intro-video/:
//   node scripts/hello-assets.mjs
import { createRequire } from "node:module";
import { mkdirSync } from "node:fs";
import path from "node:path";

const root = path.resolve("..");
const sharp = createRequire(path.join(root, "package.json"))("sharp");
const out = path.resolve("public/hello");
mkdirSync(out, { recursive: true });

const cl = (f) => path.join(root, "CareerLogica Images/Work/careerlogica", f);
const work = (f) => path.join(root, "public/work", f);
const shot = (f) => path.resolve("public/screens", f);

// [source, crop rect or null, output name, output width]
// CareerLogica dashboards share one board layout: the browser window starts at
// x=194 and its chrome ends at y=142, so the crop drops the fake browser bar.
const jobs = [
  [path.join(root, "Riyaz Images/Riyaz Image 2.png"), { left: 463, top: 40, width: 560, height: 560 }, "portrait", 560],
  [cl("student-01-dashboard.avif.png"), { left: 196, top: 144, width: 1656, height: 1035 }, "cl-student", 1600],
  [cl("counsellor-01-dashboard.avif.png"), { left: 196, top: 144, width: 1656, height: 1035 }, "cl-counsellor", 1600],
  [cl("school-01-dashboard.avif.png"), { left: 196, top: 144, width: 1656, height: 1035 }, "cl-school", 1600],
  [cl("admin-01-dashboard.avif.png"), { left: 196, top: 144, width: 1656, height: 1035 }, "cl-admin", 1600],
  [shot("01.webp"), null, "cl-mobile", 880],
  // PECUC before/after: the top 16:10 of each homepage window, inset past the rounded corners.
  [work("pecuc/ba-01-old.webp"), { left: 108, top: 90, width: 1370, height: 856 }, "pecuc-old", 1600],
  [work("pecuc/ba-01-new.webp"), { left: 118, top: 88, width: 1280, height: 800 }, "pecuc-new", 1600],
  [shot("13.webp"), null, "atrc-landing", 900],
  [shot("14.webp"), null, "atrc-question", 900],
  [work("atrc/pause.webp"), { left: 132, top: 44, width: 728, height: 520 }, "atrc-pause", 900],
  [work("atrc/still-there.webp"), { left: 132, top: 44, width: 728, height: 520 }, "atrc-still", 900],
  [shot("15.webp"), null, "atrc-result", 900],
  [shot("17.webp"), null, "atrc-mobile", 804],
  // Storyboard v2: extra screens for the wall, the bilingual flip, PECUC tiles and ATRC prototypes.
  ...["student-02-counselling", "student-03-sessions", "student-04-profile", "student-05-admissions", "student-06-library", "student-07-payment", "student-08-plan", "counsellor-02-test-codes", "counsellor-03-student-connect", "counsellor-04-appointments", "school-02-students", "school-03-test-codes", "admin-02-users", "admin-03-verification", "admin-04-payments"].map((n) => [cl(`${n}.avif.png`), { left: 196, top: 144, width: 1656, height: 1035 }, `wall-${n}`, 960]),
  [work("careerlogica/en.webp"), { left: 102, top: 30, width: 796, height: 558 }, "cl-arabic", 796],
  [work("careerlogica/ar.webp"), { left: 102, top: 30, width: 796, height: 558 }, "cl-english", 796],
  [work("pecuc/donation.webp"), { left: 118, top: 88, width: 1280, height: 800 }, "pecuc-donate", 1280],
  ...["ba-02-old", "ba-03-old", "ba-04-old"].map((n) => [work(`pecuc/${n}.webp`), { left: 108, top: 90, width: 1370, height: 856 }, `pecuc-${n}`, 960]),
  ...["ba-02-new", "ba-03-new", "ba-04-new"].map((n) => [work(`pecuc/${n}.webp`), { left: 118, top: 88, width: 1280, height: 800 }, `pecuc-${n}`, 960]),
  [work("atrc/proto-consumer.webp"), { left: 50, top: 84, width: 900, height: 456 }, "atrc-proto-a", 900],
  [work("atrc/proto-institutional.webp"), { left: 50, top: 84, width: 900, height: 456 }, "atrc-proto-b", 900],
];


for (const [src, rect, name, width] of jobs) {
  let img = sharp(src);
  if (rect) img = img.extract(rect);
  const file = path.join(out, `${name}.webp`);
  const info = await img.resize({ width, withoutEnlargement: true }).webp({ quality: 90 }).toFile(file);
  console.log(name, `${info.width}x${info.height}`, (info.width / info.height).toFixed(3));
}
