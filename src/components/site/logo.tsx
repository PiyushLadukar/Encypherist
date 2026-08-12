import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Original wordmark — no verified forum logo exists (see docs/research.md
 * §2/§5), so this mark was designed from the forum's real identity: the
 * cipher pun in its own name, rendered as a bracketed hex byte.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md", className)}>
      <Image
        src="/logo.png"
        alt="Encypherist logo"
        fill
        sizes="(min-width: 640px) 320px, 240px"
        className="object-contain"
        priority
      />
    </div>
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
