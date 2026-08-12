import { cn } from "@/lib/utils";

/**
 * Original wordmark — no verified forum logo exists (see docs/research.md
 * §2/§5), so this mark was designed from the forum's real identity: the
 * cipher pun in its own name, rendered as a bracketed hex byte.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <rect x="1" y="1" width="30" height="30" rx="7" className="fill-card stroke-border" />
      <path
        d="M11 10 L6 16 L11 22"
        stroke="var(--primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M21 10 L26 16 L21 22"
        stroke="var(--primary)"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="16" cy="16" r="1.6" className="fill-primary" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark className="h-8 w-8" />
      <span className="flex flex-col leading-none">
        <span className="font-heading text-base font-semibold tracking-tight text-foreground">
          ENCYPHERIST
        </span>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          JIT · CSE FORUM
        </span>
      </span>
    </span>
  );
}
