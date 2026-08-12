/**
 * Fills its parent's sized box with a labelled dashed placeholder naming the
 * file that hasn't been generated yet. Shared by every image slot — case
 * study body figures, the hero, the work card, the next-project handoff — so
 * "not yet added" always looks the same and always says which file to add.
 */
export function MissingImage({ src, className = "" }: { src: string; className?: string }) {
  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-[var(--border-strong)] p-8 text-center ${className}`}
    >
      <span className="label">Image not yet added</span>
      <code
        className="text-[length:var(--text-label)] text-fg-muted"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {src}
      </code>
    </div>
  );
}
