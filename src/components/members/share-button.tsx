"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/**
 * Native share sheet where available (mobile browsers, some desktop ones);
 * falls back to copying the current URL to the clipboard everywhere else.
 * Reads `window.location.href` at click-time rather than taking a URL prop
 * so it's always exactly the page being viewed, with no risk of drifting
 * from a server-computed canonical URL.
 */
export function ShareButton({
  title,
  text,
  className,
}: {
  title: string;
  text?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // AbortError when the user dismisses the share sheet — not an error.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link");
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-3.5 py-2 font-mono text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary",
        className
      )}
    >
      {copied ? <Check className="size-3.5 text-primary" /> : <Share2 className="size-3.5" />}
      {copied ? "Copied" : "Share"}
    </button>
  );
}
