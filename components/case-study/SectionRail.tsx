"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

interface Item {
  id: string;
  label: string;
}

/**
 * Sticky progress rail that tracks the case study's <h2>s.
 *
 * Headings are discovered from the rendered DOM rather than duplicated in a
 * prop, so the rail can never drift out of sync with the MDX. On mobile it
 * collapses to a thin top progress bar — a vertical rail would eat the
 * reading column.
 */
export function SectionRail({ containerId }: { containerId: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const headings = Array.from(container.querySelectorAll("h2"));
    const found: Item[] = headings.map((h, i) => {
      if (!h.id) h.id = `section-${i}-${(h.textContent ?? "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
      return { id: h.id, label: h.textContent ?? `Section ${i + 1}` };
    });
    setItems(found);
    if (found[0]) setActiveId(found[0].id);

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      // Band across the upper-middle of the viewport: a heading counts as
      // "current" while the text under it is what you're actually reading.
      { rootMargin: "-12% 0px -70% 0px", threshold: 0 }
    );
    headings.forEach((h) => observerRef.current?.observe(h));

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      setProgress(total <= 0 ? 1 : Math.min(1, Math.max(0, -rect.top / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [containerId]);

  if (!items.length) return null;

  return (
    <>
      {/* Mobile: top progress bar */}
      <div
        aria-hidden
        className="fixed inset-x-0 top-0 z-[55] h-[2px] bg-transparent lg:hidden"
      >
        <div
          className="h-full origin-left transition-transform duration-150"
          style={{
            background: "var(--case-accent)",
            transform: `scaleX(${progress})`,
          }}
        />
      </div>

      {/* Desktop: sticky rail */}
      <nav
        aria-label="Case study sections"
        className="sticky top-28 hidden max-h-[70vh] overflow-y-auto lg:block"
      >
        <ul className="flex flex-col gap-1 border-l border-[var(--border)]">
          {items.map((item) => {
            const active = item.id === activeId;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "mono -ml-px block border-l py-2 pl-4 transition-colors duration-200",
                    active
                      ? "text-fg"
                      : "border-transparent text-fg-subtle hover:text-fg-muted"
                  )}
                  style={active ? { borderColor: "var(--case-accent)" } : undefined}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
