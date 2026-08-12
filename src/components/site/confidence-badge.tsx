import { cn } from "@/lib/utils";
import type { Confidence } from "@/types/database";

const CONFIG: Record<Confidence, { label: string; className: string }> = {
  verified: {
    label: "Verified",
    className: "bg-verified/15 text-verified border-verified/30",
  },
  likely: {
    label: "Likely",
    className: "bg-signal/15 text-signal border-signal/30",
  },
  unverified: {
    label: "Unverified",
    className: "bg-muted text-muted-foreground border-border",
  },
};

/**
 * Surfaces the research-confidence trail (docs/research.md) directly in the
 * UI for anything that isn't fully verified, rather than silently presenting
 * a guess as fact.
 */
export function ConfidenceBadge({
  confidence,
  className,
}: {
  confidence: Confidence;
  className?: string;
}) {
  if (confidence === "verified") return null;
  const config = CONFIG[confidence];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
        config.className,
        className
      )}
    >
      {config.label}
    </span>
  );
}
