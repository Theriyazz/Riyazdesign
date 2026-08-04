"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

/**
 * Live local time, per the Harry George footer.
 *
 * Renders nothing on the server: a timestamp is by definition different
 * between server and client, and hydrating a mismatch is worse than a beat
 * of empty space in a footer.
 */
export function LocalTime() {
  const [now, setNow] = useState<string | null>(null);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
      timeZone: site.timezone,
    });
    const tick = () => setNow(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="mono tabular-nums text-fg-muted">
      {now ? `(Online) Now, ${now} IST` : " "}
    </span>
  );
}
