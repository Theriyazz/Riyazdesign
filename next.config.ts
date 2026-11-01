import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up and finds a
  // stray package-lock.json in the home directory.
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  // Lets a phone on the same Wi-Fi load the dev server by LAN address; Next 16
  // blocks dev-only requests (HMR, client chunks) from unlisted origins.
  allowedDevOrigins: ["10.253.20.133"],
  images: {
    // Serve the files in /public exactly as `npm run images` wrote them.
    // Next's optimizer re-encodes every request lossy (default quality 75) and
    // resizes to a device width, which is the opposite of "original quality".
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
