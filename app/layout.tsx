import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";

import { site } from "@/lib/site";
import { MotionRoot } from "@/components/motion/MotionRoot";
import { BackdropField } from "@/components/layout/BackdropField";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";

import "./globals.css";

/*
 * Pinned weights and the latin subset only.
 *
 * The `geist` npm package ships full variable files — 68KB sans + 70KB mono.
 * With `display: swap` the real font arrives *after* first paint and re-paints
 * the hero text, which Chrome scores as a new largest paint: mobile LCP was
 * landing at 3.6s, essentially "when the fonts finished downloading".
 *
 * We only use two sans weights and one mono weight, so static instances cut
 * the payload sharply for identical rendering.
 */
const geistSans = Geist({
  subsets: ["latin"],
  // 700 is here for the hero <h1> alone. It has to be a real instance: the
  // body sets `font-synthesis-weight: none`, so asking for a weight we have
  // not loaded renders at the nearest one we have rather than faking it —
  // `font-weight: 700` would have silently drawn at 500.
  weight: ["400", "500", "700"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  // 400 for micro-labels; 600 for button text, where uppercase mono at 13px
  // needs the extra weight to hold its own against the surrounding display type.
  weight: ["400", "600"],
  variable: "--font-geist-mono",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
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
 *    and the site is dark. The session key is claimed here too, so a back-nav
 *    can never replay it.
 */
const BOOT_SCRIPT = `(function(){var d=document.documentElement;d.classList.add('js');try{d.dataset.motion=window.matchMedia('(prefers-reduced-motion: reduce)').matches?'reduced':'full';}catch(e){d.dataset.motion='reduced';}try{if(d.dataset.motion==='full'&&!sessionStorage.getItem('rm:preloaded')){sessionStorage.setItem('rm:preloaded','1');d.dataset.preload='1';}}catch(e){}})();`;

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
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <MotionRoot>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </MotionRoot>
      </body>
    </html>
  );
}
