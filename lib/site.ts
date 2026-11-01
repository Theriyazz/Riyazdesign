/**
 * Single source of truth for identity, contact, and navigation.
 *
 * The site is one page plus three case studies. Nav entries are anchors into
 * the homepage, not routes — see components/layout/AnchorLink.tsx.
 */

export const site = {
  name: "Riyaz Malek",
  wordmark: "Riyaz Malek",
  role: "Product Designer",
  /** The specialty that sits beside the title wherever there is room for it. */
  specialty: "AI-native products, EdTech & SaaS",
  positioning:
    "Product designer with 3+ years of experience in EdTech, SaaS and AI-native products. Sole designer on a 140+ screen platform and a 25-question STEM assessment for Abu Dhabi's ATRC.",
  location: "Vadodara, India",
  timezone: "Asia/Kolkata",
  available: true,
  availableLabel: "Open to product design roles",

  email: "malekriyaz606@gmail.com",
  url: "https://riyazdesigns.netlify.app",
  resume: "/riyaz-malek-resume.pdf",

  socials: [
    { label: "Email", href: "mailto:malekriyaz606@gmail.com" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/riyaz-malek-a283751b2/" },
    { label: "Instagram", href: "https://instagram.com/riyaz.designs" },
  ],

  /** In-page anchors. Case study cards are the only outbound links. */
  nav: [
    { label: "Work", hash: "work" },
    { label: "About", hash: "about" },
    { label: "Experience", hash: "experience" },
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
