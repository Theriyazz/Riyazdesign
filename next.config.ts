import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  // Pin the workspace root. Without this, Turbopack walks up and finds a
  // stray package-lock.json in the home directory.
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // Matches the widths emitted by scripts/optimize-images.mjs
    deviceSizes: [640, 828, 1080, 1280, 1920, 2560],
  },
  experimental: {
    optimizePackageImports: ["gsap"],
  },
};

export default nextConfig;
