"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Flip } from "gsap/Flip";
import { useGSAP } from "@gsap/react";

// Registered once, at module scope, so no component has to think about it.
// `useGSAP` is registered too, which is what gives us automatic timeline
// cleanup on unmount.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, Flip, useGSAP);

  // We only ever animate transform/opacity, so force3D is safe and keeps
  // work on the compositor.
  gsap.defaults({ ease: "power2.out", duration: 0.6, force3D: true });
}

export { gsap, ScrollTrigger, Flip, useGSAP };
