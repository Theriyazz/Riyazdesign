import puppeteer from "puppeteer-core";
import { mkdirSync } from "node:fs";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
// Point at a running server: `npm run build && npm start`, then `npm run verify`.
// Override with BASE=http://localhost:3001 npm run verify
const BASE = process.env.BASE || "http://localhost:3000";
const OUT = process.env.OUT || ".";
mkdirSync(OUT, { recursive: true });

let failures = 0;
const check = (label, cond, detail = "") => {
  if (!cond) failures++;
  console.log(`  [${cond ? "PASS" : "FAIL"}] ${label}${detail ? " — " + detail : ""}`);
};

/**
 * Block until the first-visit intro has released the page.
 *
 * The preloader deliberately locks scroll — it stops Lenis and holds
 * `overflow: hidden` — for as long as it runs, which on a throttled headless
 * profile is around five seconds. Any test that clicks or scrolls before that
 * is measuring a page that is *designed* not to move, and the failure it
 * reports is the harness's, not the site's.
 *
 * Keyed off `data-preload`, which the boot script sets before first paint and
 * the preloader deletes on completion.
 */
const waitForIntro = async (p, timeout = 12000) => {
  await p
    .waitForFunction(() => !document.documentElement.dataset.preload, {
      timeout,
      polling: 100,
    })
    .catch(() => {});
  // One extra beat for the curtain's exit tween to finish unwinding.
  await new Promise((r) => setTimeout(r, 400));
};

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--font-render-hinting=none"],
});

console.log("\n== SCREENSHOTS ==");
for (const [name, w, h, path, full] of [
  ["home-1440", 1440, 900, "/", false],
  ["home-full", 1440, 900, "/", true],
  ["home-375", 375, 812, "/", false],
  ["case-1440", 1440, 900, "/work/careerlogica", false],
]) {
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h });
  await p.goto(BASE + path, { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2200));
  if (full) {
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 400) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 55));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 1400));
  }
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: !!full });
  console.log(`  wrote ${name}.png`);
  await p.close();
}

console.log("\n== RESPONSIVE ==");
{
  const p = await browser.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1800));
  for (const w of [375, 414, 768, 1024, 1440]) {
    await p.setViewport({ width: w, height: 900 });
    await new Promise((r) => setTimeout(r, 350));
    const o = await p.evaluate(() => ({
      doc: document.documentElement.scrollWidth,
      win: window.innerWidth,
    }));
    check(`no horizontal overflow at ${w}px`, o.doc <= o.win, `${o.doc} vs ${o.win}`);
  }
  await p.close();
}

console.log("\n== ANCHOR NAV ==");
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "networkidle0" });
  await waitForIntro(p);
  await new Promise((r) => setTimeout(r, 600));

  for (const label of ["Work", "About", "Contact"]) {
    await p.evaluate((l) => {
      const a = Array.from(document.querySelectorAll("header a")).find(
        (x) => x.textContent.trim() === l
      );
      a?.click();
    }, label);
    await new Promise((r) => setTimeout(r, 1800));
    const r = await p.evaluate((l) => {
      const el = document.getElementById(l.toLowerCase());
      return {
        exists: !!el,
        top: el ? Math.round(el.getBoundingClientRect().top) : null,
        hash: location.hash,
        stillHome: location.pathname === "/",
      };
    }, label);
    check(
      `${label} scrolls to #${label.toLowerCase()} without routing`,
      r.exists && r.stillHome && Math.abs(r.top) < 140,
      `top=${r.top} hash=${r.hash}`
    );
  }
  await p.close();
}

console.log("\n== CROSS-PAGE ANCHOR ==");
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/work/pecuc", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  await p.evaluate(() => {
    const a = Array.from(document.querySelectorAll("header a")).find(
      (x) => x.textContent.trim() === "About"
    );
    a?.click();
  });
  await new Promise((r) => setTimeout(r, 2800));
  const r = await p.evaluate(() => {
    const el = document.getElementById("about");
    return {
      path: location.pathname,
      top: el ? Math.round(el.getBoundingClientRect().top) : null,
    };
  });
  check(
    "case study -> /#about lands on the About section",
    r.path === "/" && r.top !== null && Math.abs(r.top) < 280,
    `path=${r.path} top=${r.top}`
  );
  await p.close();
}

console.log("\n== WORK CARD ==");
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2200));

  // The hover detail paragraph was removed: a card is now index, title,
  // subtitle, chips and cover, with nothing readable gated behind a pointer.
  const card = await p.evaluate(() => {
    const c = document.querySelector(".work-card");
    return {
      staleDetail: !!document.querySelector(".work-card-detail"),
      title: !!c.querySelector("h3")?.textContent.trim(),
      subtitle: !!c.querySelector("h3 + p")?.textContent.trim(),
      chips: c.querySelectorAll("h3 ~ div span").length,
      cta: /read case study/i.test(c.textContent),
    };
  });
  check("no leftover hover detail", !card.staleDetail);
  check("title, subtitle and chips still present", card.title && card.subtitle && card.chips > 0);
  check("read case study cue still present", card.cta);

  await p.hover(".work-card");
  await new Promise((r) => setTimeout(r, 900));
  // Tailwind v4 emits the standalone `scale` property rather than a `transform`
  // matrix, so read both — checking only `transform` reports "none" on a card
  // that is in fact scaling.
  const cover = await p.evaluate(() => {
    const s = getComputedStyle(document.querySelector(".work-card img"));
    return { transform: s.transform, scale: s.scale };
  });
  const coverScale = Math.max(
    Number(cover.transform.match(/matrix\(([\d.]+)/)?.[1] ?? 0),
    Number(String(cover.scale).split(" ")[0]) || 0
  );
  check("cover still scales on hover", coverScale > 1.01, `scale=${cover.scale}`);

  await p.evaluate(() => {
    document.querySelector(".work-card").dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, button: 0 })
    );
  });
  await new Promise((r) => setTimeout(r, 1800));
  check("card click opens the case study", /\/work\/[a-z]+$/.test(p.url()), p.url());
  await p.close();
}

console.log("\n== REDUCED MOTION ==");
{
  const p = await browser.newPage();
  await p.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  const s = await p.evaluate(() => ({
    motion: document.documentElement.dataset.motion,
    // Presence is no longer the question. The curtain is server-rendered so it
    // occupies the first painted frame on a first visit, and CSS decides
    // whether it is ever shown — under reduced motion the boot script never
    // sets `data-preload`, so it stays `display: none`. Asserting it is absent
    // from the DOM would fail on a page that is behaving correctly; assert it
    // cannot be seen instead.
    preloader: (() => {
      const el = document.querySelector(".preloader");
      return el ? getComputedStyle(el).display !== "none" : false;
    })(),
    cursor: !!document.querySelector(".cursor-ring"),
    lenis: document.documentElement.classList.contains("lenis"),
    dimmed: Array.from(document.querySelectorAll(".reveal-word")).filter(
      (w) => parseFloat(getComputedStyle(w).opacity) < 0.95
    ).length,
    hiddenKids: Array.from(document.querySelectorAll("[data-reveal-group] > *")).filter(
      (e) => parseFloat(getComputedStyle(e).opacity) < 0.95
    ).length,
  }));
  check("data-motion is 'reduced'", s.motion === "reduced");
  check("preloader never shown", !s.preloader);
  check("no custom cursor", !s.cursor);
  check("no Lenis", !s.lenis);
  check("no dimmed reveal words", s.dimmed === 0, `${s.dimmed}`);
  check("no hidden group children", s.hiddenKids === 0, `${s.hiddenKids}`);
  await p.close();
}

console.log("\n== NO JAVASCRIPT ==");
{
  const p = await browser.newPage();
  await p.setJavaScriptEnabled(false);
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "load" });
  const home = await p.evaluate(() => {
    const t = document.body.innerText.toLowerCase();
    return {
      hero: t.includes("think, design, ship"),
      work: t.includes("careerlogica") && t.includes("pecuc"),
      about: t.includes("vadodara"),
      quotes: t.includes("ranjan kumar mohanty"),
      anchors: document.querySelectorAll('a[href^="/#"]').length,
    };
  });
  check("hero present", home.hero);
  check("work cards present", home.work);
  check("about present", home.about);
  check("testimonials present", home.quotes);
  check("anchor links have real hrefs", home.anchors >= 3, `${home.anchors}`);

  await p.goto(BASE + "/work/pecuc", { waitUntil: "load" });
  // Structure, not a phrase. This used to grep for "design decisions", a
  // heading that existed only in the original skeleton copy — so the check
  // went red the moment the real case study was written, while the page was
  // perfectly fine. What actually matters without JS is that the MDX body
  // server-rendered: a real container, real headings, real prose.
  const cs = await p.evaluate(() => {
    const body = document.getElementById("case-body");
    return {
      hasBody: !!body,
      headings: body ? body.querySelectorAll("h2").length : 0,
      chars: body ? body.innerText.trim().length : 0,
    };
  });
  check(
    "case study prose present",
    cs.hasBody && cs.headings >= 3 && cs.chars > 2000,
    `h2=${cs.headings} chars=${cs.chars}`
  );
  await p.close();
}

console.log("\n== KEYBOARD ==");
{
  const p = await browser.newPage();
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2200));
  const stops = [];
  let noOutline = 0;
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press("Tab");
    const info = await p.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      return {
        label: (el.innerText || el.getAttribute("aria-label") || el.tagName)
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 30),
        outline: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0,
      };
    });
    if (!info) break;
    stops.push(info);
    if (!info.outline) noOutline++;
  }
  check("multiple focus stops", stops.length >= 8, `${stops.length}`);
  check("every stop has a visible outline", noOutline === 0, `${noOutline} without`);
  console.log("    order: " + stops.slice(0, 8).map((s) => s.label).join(" > "));
  await p.close();
}

console.log("\n== CONSOLE ==");
{
  const p = await browser.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await p.setViewport({ width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 2200));
  await p.goto(BASE + "/work/atrc", { waitUntil: "networkidle0" });
  await new Promise((r) => setTimeout(r, 1500));
  check("no console/page errors", errors.length === 0, errors.slice(0, 2).join(" | "));
  await p.close();
}

await browser.close();
console.log(`\n== ${failures === 0 ? "ALL CHECKS PASSED" : failures + " CHECK(S) FAILED"} ==`);
process.exit(failures === 0 ? 0 : 1);
