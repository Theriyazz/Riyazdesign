"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/cn";

/**
 * The dotted wave behind the hero: a grid of points driven by two sine waves.
 *
 * Three.js is loaded with a dynamic `import()` inside the effect rather than a
 * top-level one. The hero headline is the LCP element, and a static import
 * would put the whole of three into the chunk that has to parse before the
 * hero can hydrate — for a decoration that half the visitors never see. This
 * way the library is fetched only once the guards below have already passed.
 *
 * Those guards are inherited wholesale from the line field this replaces, and
 * they are not optional garnish:
 *  - desktop only. A continuous RAF redraw was the single most expensive thing
 *    on the page; on a throttled phone it pushed mobile TBT from 110ms to
 *    1130ms, to render something mostly hidden behind the hero text anyway.
 *  - skipped entirely under reduced motion.
 *  - paused when the tab is hidden or the hero has scrolled away.
 *  - device pixel ratio capped at 2; past that the fill cost doubles for no
 *    visible gain, and phones happily report 3.
 */

const SEPARATION = 150;
const AMOUNT_X = 40;
const AMOUNT_Y = 60;

/**
 * Depth-of-field, faked in four bands.
 *
 * A real per-point blur is not something PointsMaterial can do — one material
 * means one uniform blur for every dot it draws. So the grid is split by depth
 * into four slabs, each drawn with its own pre-blurred sprite: the furthest
 * slab fully soft, the nearest perfectly sharp. Four draw calls instead of
 * one, which is nothing next to a post-process pass.
 *
 * `scale` compensates for perspective: `sizeAttenuation` already shrinks
 * distant points, and a blurred sprite that has been shrunk to three pixels
 * reads as a smudge rather than as a dot that happens to be out of focus. The
 * far slabs are drawn larger so the softness is legible at all.
 *
 * Ordered far -> near. Row 0 sits at z = -4500 with the camera at z = 1220,
 * so a low `iy` is a distant row.
 */
const BANDS = [
  { blur: 1, scale: 2.6 },
  { blur: 0.75, scale: 2 },
  { blur: 0.5, scale: 1.5 },
  { blur: 0, scale: 1 },
];

const MAX_BLUR_PX = 9;

/** A soft round dot, blurred by `amount` (0..1) of MAX_BLUR_PX. */
function makeDotTexture(amount: number) {
  const S = 64;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  // Blur bleeds outward, so the disc is drawn well inside the bitmap — at the
  // full radius the falloff would clip against the edges and square off.
  ctx.filter = amount > 0 ? `blur(${(amount * MAX_BLUR_PX).toFixed(2)}px)` : "none";
  ctx.fillStyle = "#fff";
  ctx.beginPath();
  ctx.arc(S / 2, S / 2, S * 0.22, 0, Math.PI * 2);
  ctx.fill();
  return canvas;
}

/**
 * Is there a GPU worth handing 2,400 points to?
 *
 * A context alone is not the question — Chrome will happily hand back a
 * SwiftShader one and rasterise every frame on the CPU. That pins the renderer
 * thread hard enough that the page stops settling at all, which is exactly the
 * cost the mobile gate above exists to avoid. Software WebGL turns up on
 * headless machines, VMs and remote-desktop sessions, so treat it the same way
 * as a phone: skip the decoration, keep the page.
 */
function hasHardwareWebGL() {
  try {
    const canvas = document.createElement("canvas");
    const gl = (canvas.getContext("webgl2") ||
      canvas.getContext("webgl")) as WebGLRenderingContext | null;
    if (!gl) return false;

    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const renderer = info
      ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL))
      : "";
    // Free the probe context immediately; browsers cap how many can be live.
    gl.getExtension("WEBGL_lose_context")?.loseContext();

    // An empty string means the extension was blocked, not that it is slow —
    // give those the benefit of the doubt rather than penalising privacy.
    return !/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
  } catch {
    return false;
  }
}

export function DottedSurface({
  className,
  size = 6,
  opacity = 0.5,
}: {
  className?: string;
  size?: number;
  opacity?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reduced) return;
    const mql = window.matchMedia("(min-width: 768px)");
    // Probed once, not per resize: creating a GL context is not free.
    const gpu = hasHardwareWebGL();
    const apply = () => setEnabled(mql.matches && gpu);
    apply();
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [reduced]);

  useEffect(() => {
    if (reduced || !enabled) return;
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let teardown = () => {};

    (async () => {
      const THREE = await import("three");
      if (disposed || !containerRef.current) return;

      const rect = container.getBoundingClientRect();
      let w = rect.width;
      let h = rect.height;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, w / h, 1, 10000);
      camera.position.set(0, 355, 1220);

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
      // Transparent: the section's own background shows through, so the dots
      // sit on the page rather than on a black rectangle of their own.
      renderer.setClearColor(0x000000, 0);
      container.appendChild(renderer.domElement);

      // --fg-muted (168,168,164) normalised. Three reads vertex colours as
      // 0..1, so pushing 8-bit values here clamps every dot to pure white and
      // the field blows out against a near-black canvas.
      const [r, g, b] = [168 / 255, 168 / 255, 164 / 255];

      const rowsPerBand = AMOUNT_Y / BANDS.length;
      const slabs = BANDS.map(() => ({
        positions: [] as number[],
        colors: [] as number[],
        ix: [] as number[],
        iy: [] as number[],
      }));

      for (let ix = 0; ix < AMOUNT_X; ix++) {
        for (let iy = 0; iy < AMOUNT_Y; iy++) {
          const slab = slabs[Math.min(BANDS.length - 1, Math.floor(iy / rowsPerBand))];
          slab.positions.push(
            ix * SEPARATION - (AMOUNT_X * SEPARATION) / 2,
            0,
            iy * SEPARATION - (AMOUNT_Y * SEPARATION) / 2
          );
          slab.colors.push(r, g, b);
          slab.ix.push(ix);
          slab.iy.push(iy);
        }
      }

      const layers = slabs.map((slab, i) => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          "position",
          new THREE.Float32BufferAttribute(slab.positions, 3)
        );
        geometry.setAttribute("color", new THREE.Float32BufferAttribute(slab.colors, 3));

        const texture = new THREE.CanvasTexture(makeDotTexture(BANDS[i].blur));
        texture.colorSpace = THREE.SRGBColorSpace;

        const material = new THREE.PointsMaterial({
          size: size * BANDS[i].scale,
          map: texture,
          vertexColors: true,
          transparent: true,
          opacity,
          sizeAttenuation: true,
          // Soft sprites overlap constantly; writing depth would let whichever
          // drew first punch a hard hole in the one behind it.
          depthWrite: false,
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);
        return { geometry, material, texture, ix: slab.ix, iy: slab.iy };
      });

      let raf = 0;
      let count = 0;
      let running = true;

      const draw = () => {
        if (!running) return;

        for (const layer of layers) {
          const attr = layer.geometry.attributes.position;
          const arr = attr.array as Float32Array;
          for (let k = 0; k < layer.ix.length; k++) {
            arr[k * 3 + 1] =
              Math.sin((layer.ix[k] + count) * 0.3) * 50 +
              Math.sin((layer.iy[k] + count) * 0.5) * 50;
          }
          attr.needsUpdate = true;
        }

        renderer.render(scene, camera);
        // 0.05, half the original 0.1: the wave is the only thing moving on a
        // still page, and at the old rate it read as activity rather than as
        // atmosphere.
        count += 0.05;
        raf = requestAnimationFrame(draw);
      };

      const resize = () => {
        const next = container.getBoundingClientRect();
        w = next.width;
        h = next.height;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };

      // Sized from the container, not the window: this sits inside the hero
      // section, so window height would over-render past the fold.
      const ro = new ResizeObserver(resize);
      ro.observe(container);

      const setRunning = (next: boolean) => {
        if (next === running) return;
        running = next;
        if (next) raf = requestAnimationFrame(draw);
        else cancelAnimationFrame(raf);
      };

      const io = new IntersectionObserver(
        ([entry]) => setRunning(entry.isIntersecting && !document.hidden),
        { threshold: 0 }
      );
      io.observe(container);

      const onVisibility = () => setRunning(!document.hidden);
      document.addEventListener("visibilitychange", onVisibility);

      draw();

      teardown = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        for (const layer of layers) {
          layer.geometry.dispose();
          layer.material.dispose();
          layer.texture.dispose();
        }
        renderer.dispose();
        // The canvas holds a GPU context until it leaves the DOM.
        renderer.domElement.remove();
      };
    })();

    return () => {
      disposed = true;
      teardown();
    };
  }, [reduced, enabled, size, opacity]);

  if (!enabled) return null;

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={cn(
        "motion-only pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
    />
  );
}

export default DottedSurface;
