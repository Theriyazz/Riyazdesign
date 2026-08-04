import manifest from "./image-manifest.json";

export interface ImageMeta {
  width: number;
  height: number;
  blurDataURL: string;
}

const map = manifest as Record<string, ImageMeta>;

/**
 * Intrinsic dimensions + blur placeholder for an optimized asset, produced by
 * `npm run images`.
 *
 * Returning real width/height is what keeps CLS at zero: the browser reserves
 * the box before the bytes arrive.
 */
export function imageMeta(src: string): ImageMeta | undefined {
  return map[src];
}

/** Props ready to spread onto next/image for a manifest-known asset. */
export function imageProps(src: string) {
  const meta = imageMeta(src);
  if (!meta) {
    // Unknown asset: fall back to fill layout rather than guessing a ratio.
    return { src, fill: true as const };
  }
  return {
    src,
    width: meta.width,
    height: meta.height,
    placeholder: "blur" as const,
    blurDataURL: meta.blurDataURL,
  };
}
