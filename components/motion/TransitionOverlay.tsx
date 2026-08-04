"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useReducedMotion";

interface TransitionApi {
  navigate: (href: string) => void;
}

const Ctx = createContext<TransitionApi>({ navigate: () => {} });
export const useTransition = () => useContext(Ctx);

const IN_MS = 0.42;
/** Exit is faster than entry so back/forward always feels snappy. */
const OUT_MS = 0.36;
/** If the destination stalls, the curtain lifts anyway rather than trapping the page. */
const MAX_WAIT_MS = 1600;

export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const reduced = useReducedMotion();

  // `covering` must be a ref, not state: the pathname effect below reads it
  // during a render pass that state wouldn't have settled for yet.
  const covering = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [, force] = useState(0);

  const lift = useCallback(() => {
    const el = overlayRef.current;
    if (!el || !covering.current) return;
    covering.current = false;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    gsap.to(el, {
      yPercent: -100,
      duration: OUT_MS,
      ease: "power2.inOut",
      onComplete: () => {
        gsap.set(el, { yPercent: 100, visibility: "hidden" });
        document.body.style.overflow = "";
      },
    });
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname) return;

      if (reduced || !overlayRef.current) {
        router.push(href);
        return;
      }

      const el = overlayRef.current;
      covering.current = true;
      force((n) => n + 1);
      document.body.style.overflow = "hidden";

      gsap.set(el, { visibility: "visible", yPercent: 100 });
      gsap.to(el, {
        yPercent: 0,
        duration: IN_MS,
        ease: "power2.inOut",
        onComplete: () => router.push(href),
      });

      // Safety net: never let a slow route hold the curtain down.
      timeoutRef.current = setTimeout(lift, MAX_WAIT_MS);
    },
    [pathname, reduced, router, lift]
  );

  // The new route has painted — lift.
  useEffect(() => {
    if (!covering.current) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(lift));
    return () => cancelAnimationFrame(id);
  }, [pathname, lift]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.body.style.overflow = "";
    },
    []
  );

  return (
    <Ctx.Provider value={{ navigate }}>
      {children}
      <div
        ref={overlayRef}
        aria-hidden
        className="motion-only fixed inset-0 z-[95] bg-bg-inset"
        style={{ visibility: "hidden", transform: "translateY(100%)" }}
      />
    </Ctx.Provider>
  );
}
