/**
 * Single source of truth for identity, contact, and navigation.
 *
 * The site is one page plus three case studies. Nav entries are anchors into
 * the homepage, not routes — see components/layout/AnchorLink.tsx.
 */

export const site = {
  name: "Riyaz Malek",
  wordmark: "Riyazdesigns.",
  role: "UX Designer",
  positioning:
    "UX designer with 3+ years across SaaS platforms, EdTech, career assessment tools, and non-profit websites.",
  location: "Vadodara, India",
  timezone: "Asia/Kolkata",
  available: true,
  availableLabel: "Open to full-time UX roles",

  email: "malekriyaz606@gmail.com",
  url: "https://riyazdesigns.com",
  // TODO(riyaz): drop the PDF at public/riyaz-malek-resume.pdf
  resume: "/riyaz-malek-resume.pdf",

  socials: [
    { label: "Email", href: "mailto:malekriyaz606@gmail.com" },
    { label: "LinkedIn", href: "https://linkedin.com/in/riyazmalek" },
    { label: "Instagram", href: "https://instagram.com/riyazdesigns" },
  ],

  /** In-page anchors. Case study cards are the only outbound links. */
  nav: [
    { label: "Work", hash: "work" },
    { label: "About", hash: "about" },
    { label: "Contact", hash: "contact" },
  ],

  /** Rotating subject in the hero's second line. */
  rotating: [
    "Web Experiences",
    "Mobile Experiences",
    "SaaS Dashboards",
    "Design Systems",
  ],
} as const;

export type Site = typeof site;
