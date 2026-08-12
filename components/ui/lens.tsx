"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { AnimatePresence, motion, useMotionTemplate } from "motion/react"

/*
 * Magic UI `Lens`, installed from https://magicui.design/r/lens.json
 *
 * Kept as close to upstream as it can be so a re-`add` diffs cleanly. Every
 * departure is fenced in a `LOCAL PATCH` comment saying what and why. If you
 * pull a new version, these are the four things to re-apply.
 */

interface Position {
  /** The x coordinate of the lens */
  x: number
  /** The y coordinate of the lens */
  y: number
}

interface LensProps {
  /** The children of the lens */
  children: React.ReactNode
  /** The zoom factor of the lens */
  zoomFactor?: number
  /** The size of the lens */
  lensSize?: number
  /** The position of the lens */
  position?: Position
  /** The default position of the lens */
  defaultPosition?: Position
  /** Whether the lens is static */
  isStatic?: boolean
  /** The duration of the animation */
  duration?: number
  /** The color of the lens */
  lensColor?: string
  /** The aria label of the lens */
  ariaLabel?: string
  /**
   * LOCAL PATCH 1 — container classes.
   *
   * Upstream hardcodes `rounded-xl`. Every call site here already sits inside
   * a frame that draws its own `--radius-squircle` corner and border, so the
   * two roundings disagreed by 2px and left a sliver of the frame's background
   * showing at each corner.
   */
  className?: string
}

export function Lens({
  children,
  zoomFactor = 1.3,
  lensSize = 170,
  isStatic = false,
  position = { x: 0, y: 0 },
  defaultPosition,
  duration = 0.1,
  lensColor = "black",
  ariaLabel = "Zoom Area",
  className = "rounded-xl",
}: LensProps) {
  if (zoomFactor < 1) {
    throw new Error("zoomFactor must be greater than 1")
  }
  if (lensSize < 0) {
    throw new Error("lensSize must be greater than 0")
  }

  const [isHovering, setIsHovering] = useState(false)
  const [mousePosition, setMousePosition] = useState<Position>(position)
  const containerRef = useRef<HTMLDivElement>(null)

  /*
   * LOCAL PATCH 2 — pointer capability.
   *
   * A magnifier that follows a cursor is meaningless without a cursor, and
   * upstream mounts its handlers regardless. Starts `false` so the server and
   * the first client render agree, then turns on once the media query has been
   * read. On a touch device the image renders bare, with no wrapper at all.
   */
  const [finePointer, setFinePointer] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const apply = () => setFinePointer(mq.matches)
    apply()
    mq.addEventListener("change", apply)
    return () => mq.removeEventListener("change", apply)
  }, [])

  /*
   * LOCAL PATCH 3 — keep the lens under the pointer while the page scrolls.
   *
   * Upstream derives the lens position from `mousemove` alone. This site runs
   * Lenis, which cancels the wheel event and drives scroll from a RAF loop, so
   * scrolling with the pointer held still fires no `mousemove` at all: the
   * lens froze at a stale coordinate and the image slid out from under it, and
   * `mouseleave` never fired either so it stayed stuck on.
   *
   * The last *viewport* coordinate is remembered instead, and the position is
   * re-derived from a fresh rect whenever the page scrolls. A plain `scroll`
   * listener is enough and keeps this component free of any import from the
   * app — Lenis moves the real document, so native scroll events still fire.
   */
  const lastClient = useRef<Position | null>(null)

  useEffect(() => {
    if (!finePointer) return

    const sync = () => {
      const el = containerRef.current
      const c = lastClient.current
      if (!el || !c) return

      const rect = el.getBoundingClientRect()
      const inside =
        c.x >= rect.left &&
        c.x <= rect.right &&
        c.y >= rect.top &&
        c.y <= rect.bottom

      setIsHovering(inside)
      if (inside) setMousePosition({ x: c.x - rect.left, y: c.y - rect.top })
    }

    window.addEventListener("scroll", sync, { passive: true })
    return () => window.removeEventListener("scroll", sync)
  }, [finePointer])

  const currentPosition = useMemo(() => {
    if (isStatic) return position
    if (defaultPosition && !isHovering) return defaultPosition
    return mousePosition
  }, [isStatic, position, defaultPosition, isHovering, mousePosition])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    // Patch 3: remembered in viewport space, so a later scroll can re-derive
    // the offset against a rect that has moved.
    lastClient.current = { x: e.clientX, y: e.clientY }
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
  }, [])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") setIsHovering(false)
  }, [])

  const maskImage = useMotionTemplate`radial-gradient(circle ${
    lensSize / 2
  }px at ${currentPosition.x}px ${
    currentPosition.y
  }px, ${lensColor} 100%, transparent 100%)`

  const LensContent = useMemo(() => {
    const { x, y } = currentPosition

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.58 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration }}
        className="absolute inset-0 overflow-hidden"
        style={{
          maskImage,
          WebkitMaskImage: maskImage,
          transformOrigin: `${x}px ${y}px`,
          zIndex: 50,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            transform: `scale(${zoomFactor})`,
            transformOrigin: `${x}px ${y}px`,
          }}
        >
          {children}
        </div>
      </motion.div>
    )
  }, [currentPosition, maskImage, zoomFactor, children, duration])

  // Patch 2: nothing to enhance without a fine pointer. No wrapper, no
  // handlers, no second copy of the image.
  if (!finePointer) return <>{children}</>

  return (
    <div
      ref={containerRef}
      /*
       * LOCAL PATCH 4 — no `tabIndex={0}` and no `role="region"`.
       *
       * Upstream makes every lens a tab stop announced as a labelled region.
       * A case study carries around ten figures, so that is ten stops that do
       * nothing when you land on them: the lens only ever responds to a mouse,
       * and there is no key that moves it. The `Escape` handler stays, since it
       * still fires while the pointer is over the image. The picture inside
       * already carries its own `alt`, which is the accessible content here.
       */
      className={`relative z-20 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false)
        lastClient.current = null
      }}
      onMouseMove={handleMouseMove}
      onKeyDown={handleKeyDown}
      aria-label={ariaLabel}
    >
      {children}
      {isStatic || defaultPosition ? (
        LensContent
      ) : (
        <AnimatePresence mode="popLayout">
          {isHovering && LensContent}
        </AnimatePresence>
      )}
    </div>
  )
}
