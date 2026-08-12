import { cn } from "@/lib/utils";

/**
 * A decorative "system status" readout — explicitly decorative, never bound
 * to real live metrics (see docs/cidc-analysis.md §6). Reused wherever we
 * want the "this is an active system" beat without scattering fake
 * telemetry across the whole site.
 */
export function SystemStatusCard({
  title = "SYSTEM STATUS",
  lines,
  className,
}: {
  title?: string;
  lines: string[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border border-primary/30 bg-primary/[0.06] p-6 font-mono text-xs text-foreground/90",
        className
      )}
    >
      <p className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-primary">
        <span className="status-dot" />
        {title}
      </p>
      <ul className="mt-4 space-y-1.5">
        {lines.map((line) => (
          <li key={line} className="text-muted-foreground">
            <span className="text-primary">{">"}</span> {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
