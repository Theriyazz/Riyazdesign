import { MicroLabel } from "@/components/primitives/MicroLabel";
import { SplitButton } from "@/components/primitives/SplitButton";

export default function NotFound() {
  return (
    <div className="shell flex min-h-[70svh] flex-col justify-center pt-[calc(var(--space-32)+40px)]">
      <MicroLabel>404</MicroLabel>
      <h1 className="mt-8 max-w-[16ch] text-[length:var(--text-3xl)]">
        This page doesn&rsquo;t exist.
      </h1>
      <p className="mt-6 max-w-[46ch] text-[length:var(--text-lg)] leading-snug text-fg-muted">
        Which is itself a small design failure. Here&rsquo;s the way back.
      </p>
      <div className="mt-12 flex flex-wrap gap-4">
        <SplitButton href="/" emphasis>Home</SplitButton>
        <SplitButton href="/#work">Selected work</SplitButton>
      </div>
    </div>
  );
}
