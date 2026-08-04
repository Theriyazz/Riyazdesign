import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${site.name} — ${site.role}`;

/**
 * The card that appears when a recruiter pastes the link into Slack. It does
 * real work, so it gets the same treatment as the site: near-black, one accent
 * mark, and the positioning line rather than a generic tagline.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#08080A",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 12, height: 12, background: "#FF4D2E" }} />
          <div
            style={{
              color: "#A8A8A4",
              fontSize: 22,
              letterSpacing: 4,
              textTransform: "uppercase",
            }}
          >
            {site.role}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              color: "#F4F3F0",
              fontSize: 92,
              lineHeight: 1,
              letterSpacing: -3,
            }}
          >
            {site.name}
          </div>
          <div
            style={{
              color: "#A8A8A4",
              fontSize: 34,
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            {site.positioning}
          </div>
        </div>

        <div style={{ display: "flex", color: "#6E6E72", fontSize: 22 }}>
          {site.url.replace(/^https?:\/\//, "")}
        </div>
      </div>
    ),
    size
  );
}
