"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useTransition } from "./TransitionOverlay";

type Props = ComponentProps<typeof Link>;

/**
 * A real <Link> that plays the curtain before navigating.
 *
 * It stays a genuine anchor with a genuine href, so middle-click, cmd-click,
 * "open in new tab", crawlers and the no-JS path all keep working — we only
 * intercept the plain left-click that we can actually animate.
 */
export function TransitionLink({ href, onClick, ...rest }: Props) {
  const { navigate } = useTransition();

  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;

        const target = typeof href === "string" ? href : href.pathname ?? "";
        if (!target.startsWith("/")) return;

        e.preventDefault();
        navigate(target);
      }}
      {...rest}
    />
  );
}
