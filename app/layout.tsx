import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import { site } from "@/lib/site";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { BackdropField } from "@/components/layout/BackdropField";
import { TrackClicks } from "@/components/layout/TrackClicks";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

import "./globals.css";

/*
 * Self-hosted, latin subset only: the same files Google Fonts serves for these
 * families, kept in app/fonts so the build never downloads them.
 *
 * `next/font/google` fetches at build time, and Next 16.3's Turbopack fails to
 * resolve the files it fetched ("next/font/google queries have exactly one
 * entry"). On Netlify that failed every deploy from Sep 22 on.
 *
 * Each family is one variable file. The weight ranges cover what the site uses:
 * 400 and 500 for text, 700 for the hero <h1> (the body sets
 * `font-synthesis-weight: none`, so it has to be real), and 400 and 600 for
 * mono labels and button text.
 */
const geistSans = localFont({
  src: "./fonts/geist-latin.woff2",
  weight: "400 700",
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = localFont({
  src: "./fonts/geist-mono-latin.woff2",
  weight: "400 600",
  variable: "--font-geist-mono",
  display: "swap",
});

const instrumentSerif = localFont({
  src: "./fonts/instrument-serif-italic-latin.woff2",
  weight: "400",
  style: "italic",
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.positioning,
  openGraph: {
    type: "website",
    siteName: site.wordmark,
    title: `${site.name} — ${site.role}`,
    description: site.positioning,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08080A",
  colorScheme: "dark",
};

/**
 * Runs before first paint.
 *  - `js` gates the CSS that hides GSAP-animated elements, so a no-JS visitor
 *    never gets a blank page.
 *  - `data-motion` is set here rather than in React so the very first frame
 *    already respects the preference.
 *  - `data-preload` decides the intro *before* anything paints. Deciding it in
 *    React instead meant the site painted first and the curtain dropped on top
 *    of it a beat later — backwards, and very visible now the curtain is light
 *    and the site is dark. It plays on every full page load (first visit,
 *    reload, new tab) for full-motion visitors. Moving between pages inside
 *    the site is client-side, so it never replays mid-visit.
 *  - Comments and bare text in <head> are removed. Netlify injects a newline
 *    and a "This site is hosted on Netlify" comment after the charset meta on
 *    every page it serves. React renders neither, so hydration failed
 *    (minified error #418) and the whole tree was rebuilt on the client. That
 *    rebuild also strips the attributes this script puts on <html>, so
 *    `data-preload` vanished and the intro was cut off mid-draw or skipped.
 *    This script runs after the injection has been parsed and before React
 *    hydrates. The newline matters as much as the comment: removing only the
 *    comment left a stray text node that failed hydration just the same.
 */
const BOOT_SCRIPT = `(function(){var d=document.documentElement;for(var n=document.head&&document.head.firstChild;n;){var x=n.nextSibling;if(n.nodeType===8||(n.nodeType===3&&!/\\S/.test(n.nodeValue)))n.parentNode.removeChild(n);n=x;}d.classList.add('js');try{d.dataset.motion=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full';}catch(e){d.dataset.motion='reduced';}if(d.dataset.motion==='full')d.dataset.preload='1';})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>
        {/* First child, so it is the first thing painted and the last thing
            anything else has to think about. It is fixed and `z-index: -1`, so
            its position in the tree is about reading order, not stacking. */}
        <BackdropField />
        <TrackClicks />
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <MotionRoot>
          <Nav />
          {/* The page transition scales and fades this on the way out and back
              in on arrival, so it has to hold everything that belongs to the
              page — the footer included, or a case study would sail away and
              leave its own footer standing.

              The nav is deliberately outside it. A transformed ancestor turns
              `position: fixed` into `position: absolute`, so wrapping the nav
              would drop it from the top of the viewport to the top of the
              document the instant a transition began. Chrome that holds still
              while the content passes through also just reads better. */}
          <div data-page-stage>
            <main id="main">{children}</main>
            <Footer />
          </div>
        </MotionRoot>
      </body>
    </html>
  );
}
